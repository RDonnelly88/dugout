
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Avatar icons from Lucide React
const avatarIcons = [
  "User", "UserRound", "UserCircle", "Ghost", "Smile", "Robot", 
  "PersonStanding", "UserCheck", "UserCog", "UserPlus", "Medal", 
  "Trophy", "Crown", "Star", "Heart", "CircleUser"
];

interface PlayerImageUploadProps {
  imageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

const PlayerImageUpload = ({ imageUrl, onImageChange }: PlayerImageUploadProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if imageUrl is a data URL (old uploaded image) or an icon name
  const isDataUrl = imageUrl?.startsWith('data:');
  const selectedIcon = !isDataUrl && imageUrl ? imageUrl : null;

  const handleSelectAvatar = (iconName: string) => {
    onImageChange(`icon:${iconName}`);
    setIsMenuOpen(false);
  };

  const handleRemoveAvatar = () => {
    onImageChange(null);
  };

  // Render the selected avatar or uploaded image
  const renderSelectedAvatar = () => {
    if (!imageUrl) return null;

    if (isDataUrl) {
      // Render uploaded image
      return (
        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border">
          <img src={imageUrl} alt="Player avatar" className="object-cover w-full h-full" />
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute top-0 right-0 h-6 w-6 rounded-full" 
            onClick={handleRemoveAvatar}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (selectedIcon) {
      // Extract icon name from the format "icon:IconName"
      const iconName = selectedIcon.replace('icon:', '');
      const IconComponent = (LucideIcons as any)[iconName];
      
      return (
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border">
          {IconComponent && <IconComponent className="h-8 w-8" />}
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute top-0 right-0 h-6 w-6 rounded-full" 
            onClick={handleRemoveAvatar}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <Label htmlFor="avatar">Avatar</Label>
      <div className="flex items-center gap-4 mt-2">
        {renderSelectedAvatar()}
        
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4" />
              {imageUrl ? "Change Avatar" : "Select Avatar"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2">
            <div className="grid grid-cols-4 gap-2">
              {avatarIcons.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                return (
                  <Button
                    key={iconName}
                    variant={selectedIcon === `icon:${iconName}` ? "secondary" : "ghost"}
                    className="h-12 w-12 p-0 rounded-full flex items-center justify-center"
                    onClick={() => handleSelectAvatar(iconName)}
                  >
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                  </Button>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PlayerImageUpload;
