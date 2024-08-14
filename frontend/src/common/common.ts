export const FE_ROUTES = {
  home: "/",
  studio: "/studio",
};

export const BE_ROUTES = {
  uploadURL: "http://localhost:3000/upload",
  videosURL: "http://localhost:3000/videos",
};

export const FORM_FIELD_KEY = "videofile";

export type VideoFile = {
  id: string;
  title: string;
  url: string;
  thumbail: string;
};
