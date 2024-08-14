export type VideoFile = {
  id: string;
  title: string;
  url: string;
  thumbail: string;
};

export type APIResponse = {
  message: string;
};

export type FileUploadResponse = APIResponse & {
  isUploadComplete: boolean;
};

export type VideoResponse = APIResponse & {
  videoList: VideoFile[];
};
