import { Card, CardDescription, CardTitle } from "@/components/ui/card";

function Studio() {
  return (
    <div className="w-full h-full p-10">
      <CardTitle>Studio</CardTitle>
      <Card className="mt-20 h-[70%] flex items-center justify-center">
        <CardDescription className="text-lg">
          <strong className="cursor-pointer hover:underline">Choose a file</strong> or drag it here
        </CardDescription>
      </Card>
    </div>
  );
}

export default Studio;
