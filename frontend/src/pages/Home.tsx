import { VideoFile } from "@/common/common";
import VideoList from "@/components/Home/VideoList";
import VideoPlayerContainer from "@/components/Home/VideoPlayerContainer";
import { useState } from "react";

function Home() {
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);

  function closeVideoPlayer() {
    setSelectedVideo(null);
    setIsVideoPlayerOpen(false);
  }

  function openVideoPlayer(video: VideoFile) {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  }

  return isVideoPlayerOpen ? (
    <VideoPlayerContainer video={selectedVideo} closeVideoPlayer={closeVideoPlayer} />
  ) : (
    <VideoList openVideoPlayer={openVideoPlayer} />
  );
}

export default Home;
