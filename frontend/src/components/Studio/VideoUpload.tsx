import { useRef, useState } from "react";
import { Card, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { BE_ROUTES, FORM_FIELD_KEY } from "@/common/common";

function VideoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
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

    startVideoUpload();
  }

  function startVideoUpload() {
    setIsUploading(true);
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
    const totalChunks = Math.ceil(file!.size / CHUNK_SIZE);
    const reader = new FileReader();

    reader.onload = async () => {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file!.size, start + CHUNK_SIZE);
        const chunk = file!.slice(start, end);

        try {
          const response = await uploadVideoChunk(chunk, i + 1, totalChunks);
          const data = await response.json();
          if (response.ok) {
            setUploadPercentage(Math.floor(((i + 1) / totalChunks) * 100));
            if (data.isUploadComplete) {
              toast({
                description: data.message,
                variant: "default",
                duration: 3000,
              });
              setIsUploading(false);
              setTitle("");
              setFile(undefined);
              setUploadPercentage(0);
            }
          } else {
            toast({
              description: data.message,
              variant: "destructive",
              duration: 3000,
            });
          }
        } catch (error) {
          if (error instanceof Error) {
            toast({
              description: error.message,
              variant: "destructive",
              duration: 3000,
            });
          } else {
            toast({
              description: "Something went wrong",
              variant: "destructive",
              duration: 3000,
            });
          }
        }
      }
    };

    reader.readAsArrayBuffer(file!);
  }

  async function uploadVideoChunk(fileChunk: Blob, currentChunk: number, totalChunks: number) {
    const formData = new FormData();
    formData.append(FORM_FIELD_KEY, fileChunk, file!.name);
    formData.append("title", title);
    formData.append("totalChunks", String(totalChunks));
    formData.append("currentChunk", String(currentChunk));

    return fetch(BE_ROUTES.uploadURL, {
      method: "POST",
      body: formData,
    });
  }

  return (
    <form className="h-[100%]" onSubmit={handleSubmit}>
      <Input type="text" placeholder="Video Title" value={title} onChange={handleTitleKeyUp} />
      <Card className="h-[70%] mt-6 mb-6 flex items-center justify-center">
        <CardDescription className="text-lg">
          {!file ? (
            <>
              <strong className="cursor-pointer hover:underline" onClick={chooseFileHandler}>
                Choose a file
              </strong>
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
      <Button className="w-full" disabled={isUploading}>
        {isUploading ? `Uploading ${uploadPercentage}%` : "Upload"}
      </Button>
    </form>
  );
}

export default VideoUpload;
