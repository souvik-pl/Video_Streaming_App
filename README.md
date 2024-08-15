# VidFlix (Video Streaming App)

VidFlix is a video streaming application that allows users to upload, list, and play videos. The application is built using Node.js for the backend and React.js for the frontend.

## Features

### Backend (Node.js)

The backend of VidFlix provides two main API endpoints:

1. **`/upload`**
   This endpoint handles the upload of video files in multiple chunks. It processes each chunk, assembles them into a complete video file, generates a thumbnail and segments the video for HTTP Live Streaming (HLS) using `ffmpeg`.

2. **`/videos`**
   This endpoint provides a list of all uploaded videos.

### Frontend (React.js)

The frontend of VidFlix provides the following features:

1. **Upload Video**
   Allows users to upload video files to the server. The video is uploaded in chunks to handle large files effectively.

2. **List and Play Videos**
   Displays a list of all uploaded videos and allows users to play them using the [Video.js](https://videojs.com/) library.
