
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

interface PlayerImageUploadProps {
  imageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

const PlayerImageUpload = ({ imageUrl, onImageChange }: PlayerImageUploadProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Label htmlFor="image">Image</Label>
      <Input
        type="file"
        id="image"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <div className="relative">
        <Button variant="outline" asChild>
          <label htmlFor="image" className="cursor-pointer flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            {imageUrl ? "Change Image" : "Upload Image"}
          </label>
        </Button>
        {imageUrl && (
          <div className="absolute top-0 left-0 w-full h-full rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt="Player"
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerImageUpload;
