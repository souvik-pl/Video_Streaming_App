export type VideoFile = {
  id: string;
  title: string;
  url: string;
};

export type APIResponse = {
  message: string;
};

export type FileUploadResponse = APIResponse & {
  isUploadComplete: boolean;
};
