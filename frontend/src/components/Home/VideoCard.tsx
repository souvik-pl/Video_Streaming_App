import { VideoFile } from "@/common/common";
import { Card, CardDescription } from "../ui/card";
import { Play } from "lucide-react";

export type VideoCardProps = {
  video: VideoFile;
  openVideoPlayer: (video: VideoFile) => void;
};

function VideoCard(props: VideoCardProps) {
  const { video, openVideoPlayer } = props;

  function playVideo() {
    openVideoPlayer(video);
  }

  return (
    <Card
      className="h-52 relative cursor-pointer overflow-hidden hover:scale-105"
      onClick={playVideo}
    >
      <img src={video.thumbail} className="w-full h-[75%]" />
      <CardDescription className="text-base truncate mt-2 px-2">{video.title}</CardDescription>
      <Play className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-100%]" />
    </Card>
  );
}

export default VideoCard;
