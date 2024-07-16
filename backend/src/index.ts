import express, { Request, Response } from "express";
import cors from "cors";
import multer, { StorageEngine } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsPromises from "fs/promises";
import { pipeline } from "stream/promises";
import { exec } from "child_process";
import { promisify } from "util";
import {
  BUCKET_DIR_NAME,
  CHUNK_DIR_NAME,
  DB_PATH,
  FORM_FIELD_KEY,
  MANIFEST_FILE_NAME,
  PORT,
  ROUTES,
  SEGMENT_DIR_NAME,
} from "./common/constants.js";
import { getChunkFilePath, removeWhitespaces } from "./common/utils.js";
import { APIResponse, FileUploadResponse, VideoFile, VideoResponse } from "./common/common.type.js";

// Use import.meta.url to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUCKET_DIR_PATH = path.join(__dirname, `../${BUCKET_DIR_NAME}`);
const CHUNK_DIR_PATH = BUCKET_DIR_PATH + `/${CHUNK_DIR_NAME}`;
const SEGMENT_DIR_PATH = BUCKET_DIR_PATH + `/${SEGMENT_DIR_NAME}`;
const DB_FILE_PATH = path.join(__dirname, `../${DB_PATH}`);

(async () => {
  try {
    await fsPromises.mkdir(BUCKET_DIR_PATH, { recursive: true });
    await fsPromises.mkdir(CHUNK_DIR_PATH, { recursive: true });
  } catch (error) {
    console.error("Error creating bucket directory");
    process.exit(1);
  }
})();

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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(`/${ROUTES.bucket}`, express.static(BUCKET_DIR_PATH));

// API endpoints
app.get(`/${ROUTES.videos}`, async function (req: Request, res: Response) {
  try {
    const data = await fsPromises.readFile(DB_FILE_PATH, "utf-8");
    const videoList: VideoFile[] = JSON.parse(data);
    const videoResponse: VideoResponse = {
      message: "Videos fetched successfully",
      videoList: videoList,
    };
    res.status(200).json(videoResponse);
  } catch (error) {
    const errorResponse: APIResponse = {
      message: "Internal server error",
    };
    res.status(500).json(errorResponse);
  }
});

app.post(
  `/${ROUTES.upload}`,
  multerUpload.single(FORM_FIELD_KEY),
  async function (req: Request, res: Response) {
    const file: Express.Multer.File = req.file;
    const fileTitle = req.body.title;
    const totalChunks: number = Number(req.body.totalChunks);
    const currentChunk: number = Number(req.body.currentChunk);
    const chunkFilePath: string = getChunkFilePath(CHUNK_DIR_PATH, file.originalname, currentChunk);

    try {
      await fsPromises.rename(file.path, chunkFilePath);
      if (currentChunk === totalChunks) {
        await assembleChunks(file.originalname, totalChunks);
        segmentFile(file.originalname, fileTitle);
        const uploadResponse: FileUploadResponse = {
          isUploadComplete: true,
          message: "Video uploaded successfully. It will be available shortly.",
        };
        res.status(200).json(uploadResponse);
      } else {
        const uploadResponse: FileUploadResponse = {
          isUploadComplete: false,
          message: "Chunk uploaded successfully",
        };
        res.status(200).json(uploadResponse);
      }
    } catch (error) {
      const errorResponse: APIResponse = {
        message: "Error uploading file",
      };
      res.status(500).json(errorResponse);
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Helper functions
async function assembleChunks(originalFilename: string, totalChunks: number) {
  const finalFilePath = `${BUCKET_DIR_PATH}/${removeWhitespaces(originalFilename)}`;
  for (let i = 1; i <= totalChunks; i++) {
    const chunkPath = getChunkFilePath(CHUNK_DIR_PATH, originalFilename, i);
    // Open a writable stream for each chunk and append data to the final file
    const writeStream = fs.createWriteStream(finalFilePath, { flags: "a" });
    const readStream = fs.createReadStream(chunkPath);
    await pipeline(readStream, writeStream);
    try {
      fsPromises.unlink(chunkPath);
    } catch (error) {
      console.error("Error deleting chunk file: ", error);
    }
    writeStream.end();
  }
}

async function segmentFile(assembledFilename: string, fileTitle: string) {
  const fileId = uuidv4();
  const outputPath = `${SEGMENT_DIR_PATH}/${fileId}`;
  const hlsPath = `${outputPath}/${MANIFEST_FILE_NAME}`;
  const assembledFilePath = `${BUCKET_DIR_PATH}/${removeWhitespaces(assembledFilename)}`;

  try {
    await fsPromises.mkdir(outputPath, { recursive: true });
    const ffmpegCommand = `ffmpeg -i ${assembledFilePath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;
    const execPromise = promisify(exec);
    await execPromise(ffmpegCommand);
    const file: VideoFile = {
      id: fileId,
      title: fileTitle,
      url: `http://localhost:${PORT}/${ROUTES.bucket}/${SEGMENT_DIR_NAME}/${fileId}/${MANIFEST_FILE_NAME}`,
    };
    updateDB(file);
    try {
      fsPromises.unlink(assembledFilePath);
    } catch (error) {
      console.error("Error deleting file: ", error);
    }
  } catch (error) {
    console.log("Error in segmentaion", error);
  }
}

async function updateDB(file: VideoFile) {
  try {
    const data = await fsPromises.readFile(DB_FILE_PATH, "utf-8");
    const videoList: VideoFile[] = JSON.parse(data);
    videoList.push(file);
    fsPromises.writeFile(DB_FILE_PATH, JSON.stringify(videoList), "utf-8");
  } catch (error) {
    console.log("Error updating DB");
  }
}
