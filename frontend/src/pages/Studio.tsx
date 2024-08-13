import VideoUpload from "@/components/Studio/VideoUpload";
import { CardTitle } from "@/components/ui/card";

function Studio() {
  return (
    <div className="w-full h-full p-10">
      <CardTitle>Studio</CardTitle>
      <div className="mt-12 h-[80%]">
        <VideoUpload />
      </div>
    </div>
  );
}

export default Studio;
