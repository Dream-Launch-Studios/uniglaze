import React from "react";
import Icon from "@/components/rocket/components/AppIcon";
// import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
// import Button from "@/components/rocket/components/ui/Button";

interface PhotoLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface Photo {
  id: number | string;
  thumbnail: string;
  // fullSize?: string;
  description?: string;
  workItem?: string;
  // captureDate: Date | string;
  uploadedBy: string;
  // status: "uploaded" | "uploading" | "failed";
  // orientation?: string;
  location?: PhotoLocation;
  tags?: string[];
  // fileSize?: number;
  // lastModified?: Date | string;
}

interface PhotoCardProps {
  photo: Photo;
  // isSelected: boolean;
  onSelect?: (id: number | string) => void;
  onView?: (photo: Photo) => void;
  onEdit?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  showActions?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  // isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const getStatusColor = (status: Photo["status"]): string => {
  //   switch (status) {
  //     case "uploaded":
  //       return "text-success";
  //     case "uploading":
  //       return "text-warning";
  //     case "failed":
  //       return "text-error";
  //     default:
  //       return "text-text-secondary";
  //   }
  // };

  // const getStatusIcon = (status: Photo["status"]): IconName => {
  //   switch (status) {
  //     case "uploaded":
  //       return "CheckCircle";
  //     case "uploading":
  //       return "Clock";
  //     case "failed":
  //       return "AlertCircle";
  //     default:
  //       return "Image";
  //   }
  // };

  return (
    // <div
    //   className={`bg-card border-border hover:elevation-2 overflow-hidden rounded-lg border transition-all duration-200 ${
    //     isSelected ? "ring-primary ring-2" : ""
    //   }`}
    // >
    <div
      className={`bg-card border-border hover:elevation-2 overflow-hidden rounded-lg border transition-all duration-200`}
    >
      {/* Image Container */}
      <div className="bg-muted relative aspect-square">
        <Image
          src={photo.thumbnail}
          alt={photo.description ?? "Construction progress photo"}
          className="h-full w-full object-cover"
          fill={true}
        />

        {/* Loading Overlay - removed since AppImage doesn't support onLoad */}

        {/* Selection Checkbox */}
        {/* <div className="absolute top-2 left-2">
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onSelect(photo.id);
            }}
            className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-all ${
              isSelected
                ? "bg-primary border-primary"
                : "border-white/80 bg-white/80 hover:bg-white"
            }`}
          >
            {isSelected && <Icon name="Check" size={14} color="white" />}
          </button>
        </div> */}

        {/* Status Indicator */}
        {/* <div className="absolute top-2 right-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/90 ${getStatusColor(photo.status)}`}
          >
            <Icon name={getStatusIcon(photo.status)} size={14} />
          </div>
        </div> */}

        {/* Quick Actions Overlay */}
        {/* {showActions && (
          <div className="absolute inset-0 flex items-center justify-center space-x-2 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              iconName="Eye"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onView(photo);
              }}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onEdit(photo);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              iconName="Trash2"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onDelete(photo);
              }}
            >
              Delete
            </Button>
          </div>
        )} */}
      </div>

      {/* Photo Info */}
      <div className="p-3">
        <div className="mb-2 flex items-start justify-between">
          <h4 className="text-text-primary mr-2 flex-1 truncate text-sm font-medium">
            {photo.workItem ?? "General Progress"}
          </h4>
          {/* <span className={`text-xs ${getStatusColor(photo.status)}`}>
            {photo.status}
          </span> */}
        </div>

        <p className="text-text-secondary mb-2 line-clamp-2 text-xs">
          {photo.description ?? "No description available"}
        </p>

        <div className="text-text-secondary flex items-center justify-between text-xs">
          {/* <span className="flex items-center">
            <Icon name="Calendar" size={12} className="mr-1" />
            {formatDate(photo.captureDate)}
          </span> */}
          <span className="flex items-center">
            <Icon name="User" size={12} className="mr-1" />
            {photo.uploadedBy}
          </span>
        </div>

        {photo.location && (
          <div className="text-text-secondary mt-2 flex items-center text-xs">
            <Icon name="MapPin" size={12} className="mr-1" />
            <span className="truncate">
              {photo.location.lat.toFixed(4)}, {photo.location.lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
