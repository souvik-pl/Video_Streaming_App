import { VideoFile } from "@/common/common";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { CardDescription } from "../ui/card";
import VideoPlayer from "./VideoPlayer";
import Player from "video.js/dist/types/player";
import { useRef } from "react";
// import videojs from "video.js";

export type VideoPlayerContainerProps = {
  video: VideoFile | null;
  closeVideoPlayer: () => void;
};

function VideoPlayerContainer(props: VideoPlayerContainerProps) {
  const { video, closeVideoPlayer } = props;
  const playerRef = useRef<Player | null>(null);

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: video?.url,
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player: Player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      // videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      // videojs.log("player will dispose");
    });
  };

  return (
    <div className="w-full h-full">
      <div>
        <Button onClick={closeVideoPlayer} type="button" variant="outline" className="flex gap-2">
          <ChevronLeft />
          Back
        </Button>
      </div>
      <div className="w-full h-[75%] mt-5 mb-5 rounded">
        <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
      </div>
      <CardDescription className="text-xl">{video?.title}</CardDescription>
    </div>
  );
}

export default VideoPlayerContainer;
