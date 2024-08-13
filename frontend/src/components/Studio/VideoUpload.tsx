import { useRef, useState } from "react";
import { Card, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

function VideoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File>();
  const { toast } = useToast();

  function chooseFileHandler() {
    inputRef.current?.click();
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0]);
  }

  function handleTitleKeyUp(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!file || !title) {
      toast({
        description: "Both fields are mandatory",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    console.log(file);
    console.log(title);
  }

  return (
    <form className="h-[100%]" onSubmit={handleSubmit}>
      <Input type="text" placeholder="Video Title" onChange={handleTitleKeyUp} />
      <Card className="h-[70%] mt-6 mb-6 flex items-center justify-center">
        <CardDescription className="text-lg">
          {!file ? (
            <>
              <strong className="cursor-pointer hover:underline" onClick={chooseFileHandler}>
                Choose a file
              </strong>{" "}
              or drag it here
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleFileInputChange}
              />
            </>
          ) : (
            file?.name
          )}
        </CardDescription>
      </Card>
      <Button className="w-full">Upload</Button>
    </form>
  );
}

export default VideoUpload;
