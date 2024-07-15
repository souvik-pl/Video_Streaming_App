import express, { Request, Response } from "express";
import cors from "cors";
import multer, { StorageEngine } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { exec } from "child_process";

const PORT = 3000;
const FORM_FIELD_KEY = "videofile";
const pipelineAsync = promisify(pipeline);

// Use import.meta.url to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUCKET_DIR_NAME = "video-bucket";
const CHUNK_DIR_NAME = "chunks";
const SEGMENT_DIR_NAME = "segments";
const BUCKET_DIR_PATH = path.join(__dirname, `../${BUCKET_DIR_NAME}`);
const CHUNK_DIR_PATH = BUCKET_DIR_PATH + `/${CHUNK_DIR_NAME}`;
const SEGMENT_DIR_PATH = BUCKET_DIR_PATH + `/${SEGMENT_DIR_NAME}`;

fs.mkdir(BUCKET_DIR_PATH, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating directory: " + BUCKET_DIR_PATH);
  }
});
fs.mkdir(CHUNK_DIR_PATH, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating directory: " + CHUNK_DIR_PATH);
  }
});

const app = express();

const storage: StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, BUCKET_DIR_PATH);
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const fileExt = path.extname(file.originalname);
    const fileName = removeWhitespaces(
      path.basename(file.originalname, path.extname(file.originalname))
    );

    cb(null, fileName + "-" + uuidv4() + fileExt);
  },
});

const multerUpload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/bucket", express.static(BUCKET_DIR_PATH));

// API endpoints
app.post("/upload", multerUpload.single(FORM_FIELD_KEY), function (req: Request, res: Response) {
  const file: Express.Multer.File = req.file;
  const fileTitle = req.body.title;
  const totalChunks: number = Number(req.body.totalChunks);
  const currentChunk: number = Number(req.body.currentChunk);
  const chunkFilePath: string = getChunkFilePath(CHUNK_DIR_PATH, file.originalname, currentChunk);

  fs.rename(file.path, chunkFilePath, async (error) => {
    if (error) {
      res.status(500).send("Error uploading file");
    }

    if (currentChunk === totalChunks) {
      try {
        await assembleChunks(file.originalname, totalChunks);
        segmentFile(file.originalname, fileTitle);
        res.status(200).send("File uploaded successfully");
      } catch (err) {
        res.status(500).send("Error uploading file assemble");
      }
    } else {
      res.status(200).send("Chunk uploaded successfully");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Utility function
async function assembleChunks(originalFilename: string, totalChunks: number) {
  const finalFilePath = `${BUCKET_DIR_PATH}/${removeWhitespaces(originalFilename)}`;
  for (let i = 1; i <= totalChunks; i++) {
    const chunkPath = getChunkFilePath(CHUNK_DIR_PATH, originalFilename, i);
    // Open a writable stream for each chunk and append data to the final file
    const writer = fs.createWriteStream(finalFilePath, { flags: "a" });
    await pipelineAsync(fs.createReadStream(chunkPath), writer);
    fs.unlink(chunkPath, (err) => {
      if (err) {
        console.error("Error deleting chunk file:", err);
      }
    });
    writer.end();
  }
}

function removeWhitespaces(input: string): string {
  return input.replace(/\s+/g, "");
}

function getChunkFilePath(
  chunkDir: string,
  originalFilename: string,
  currentChunk: number
): string {
  return `${chunkDir}/${originalFilename}.${currentChunk}`;
}

function segmentFile(assembledFilename: string, fileTitle: string) {
  const fileId = uuidv4();
  const outputPath = `${SEGMENT_DIR_PATH}/${fileId}`;
  const hlsPath = `${outputPath}/index.m3u8`;
  const assembledFilePath = `${BUCKET_DIR_PATH}/${removeWhitespaces(assembledFilename)}`;

  fs.mkdir(outputPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating directory: " + outputPath);
    } else {
      const ffmpegCommand = `ffmpeg -i ${assembledFilePath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

      exec(ffmpegCommand, (error) => {
        if (error) {
          console.log(`ffmpeg exec error: ${error}`);
        } else {
          const fileObject = {
            id: fileId,
            title: fileTitle,
            url: `http://localhost:${PORT}/bucket/${SEGMENT_DIR_NAME}/${fileId}/index.m3u8`,
          };

          console.log(fileObject);

          fs.unlink(assembledFilePath, (err) => {
            if (err) {
              console.error("Error deleting chunk file:", err);
            }
          });
        }
      });
    }
  });
}
