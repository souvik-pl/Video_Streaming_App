import { VideoFile } from "@/common/common";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { CardDescription } from "../ui/card";

export type VideoPlayerProps = {
  video: VideoFile | null;
  closeVideoPlayer: () => void;
};

function VideoPlayer(props: VideoPlayerProps) {
  const { video, closeVideoPlayer } = props;
  return (
    <div className="w-full h-full">
      <div>
        <Button onClick={closeVideoPlayer} type="button" variant="outline" className="flex gap-2">
          <ChevronLeft />
          Back
        </Button>
      </div>
      <div className="w-full h-[75%] bg-white mt-5 mb-5 rounded"></div>
      <CardDescription className="text-xl">{video?.title}</CardDescription>
    </div>
  );
}

export default VideoPlayer;
