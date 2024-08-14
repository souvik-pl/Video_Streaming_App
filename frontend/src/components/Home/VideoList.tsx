import { BE_ROUTES, VideoFile } from "@/common/common";
import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";

export type VideoListProps = {
  openVideoPlayer: (video: VideoFile) => void;
};

function VideoList(props: VideoListProps) {
  const { openVideoPlayer } = props;
  const [videoList, setVideoList] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setIsLoading(true);
    try {
      const response = await fetch(BE_ROUTES.videosURL);
      const data = await response.json();
      if (response.ok) {
        setVideoList(data.videoList);
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="w-full h-full flex justify-center items-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="w-full h-full flex justify-center items-center">Something went wrong</div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto scrollbar grid grid-cols-3 gap-8 p-10">
      {videoList.map((video) => (
        <VideoCard key={video.id} video={video} openVideoPlayer={openVideoPlayer} />
      ))}
    </div>
  );
}

export default VideoList;
