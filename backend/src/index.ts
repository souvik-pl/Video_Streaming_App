import express, { Request, Response } from "express";
import cors from "cors";
import multer, { StorageEngine } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const PORT = 3000;
const FORM_FIELD_KEY = "videofile";
const pipelineAsync = promisify(pipeline);

// Use import.meta.url to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUCKET_DIR = path.join(__dirname, "../video-bucket");
const CHUNK_DIR = BUCKET_DIR + "/chunks";

fs.mkdir(BUCKET_DIR, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating directory:" + BUCKET_DIR);
  }
});
fs.mkdir(CHUNK_DIR, { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating directory:" + CHUNK_DIR);
  }
});

const app = express();

const storage: StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, BUCKET_DIR);
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, file.originalname.split(".")[0] + "-" + uuidv4() + path.extname(file.originalname));
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
app.use("/bucket", express.static(BUCKET_DIR));

// API endpoints
app.post("/upload", multerUpload.single(FORM_FIELD_KEY), function (req: Request, res: Response) {
  const file: Express.Multer.File = req.file;
  const totalChunks: number = Number(req.body.totalChunks);
  const currentChunk: number = Number(req.body.currentChunk);
  const chunkFilePath: string = getChunkFilePath(CHUNK_DIR, file.originalname, currentChunk);
  fs.rename(file.path, chunkFilePath, async (error) => {
    if (error) {
      res.status(500).send("Error uploading file");
    }

    if (currentChunk === totalChunks) {
      try {
        await assembleChunks(file.originalname, totalChunks);
        res.status(200).send("File uploaded successfully");
      } catch (err) {
        res.status(500).send("Error uploading file assemble");
      }
    } else {
      res.status(200).send("Chunk uploaded successfully");
    }
  });
});

// Utility function
async function assembleChunks(originalFilename: string, totalChunks: number) {
  const finalFilePath = `${BUCKET_DIR}/${originalFilename}`;
  for (let i = 1; i <= totalChunks; i++) {
    const chunkPath = getChunkFilePath(CHUNK_DIR, originalFilename, i);
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

function getChunkFilePath(
  chunkDir: string,
  originalFilename: string,
  currentChunk: number
): string {
  return `${chunkDir}/${originalFilename}.${currentChunk}`;
}

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
