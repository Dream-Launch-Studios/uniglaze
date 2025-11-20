import React, { useState, useEffect } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "@/components/rocket/components/AppImage";
import Button from "@/components/rocket/components/ui/Button";

interface PhotoLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface Photo {
  id: number | string;
  thumbnail: string;
  fullSize?: string;
  description?: string;
  workItem?: string;
  captureDate: Date | string;
  uploadedBy: string;
  status: "uploaded" | "uploading" | "failed";
  orientation?: string;
  location?: PhotoLocation;
  tags?: string[];
  fileSize?: number;
  lastModified?: Date | string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onEdit: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onEdit,
  onDelete,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setZoomLevel(1);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "+":
        case "=":
          setZoomLevel((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!isOpen || !currentPhoto) return null;

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleString();
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/90">
      {/* Header Controls */}
      <div className="absolute top-0 right-0 left-0 z-510 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-white">
              {currentPhoto.workItem ?? "Construction Progress"}
            </h3>
            <span className="text-sm text-white/70">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <Button
              variant="ghost"
              size="sm"
              iconName="ZoomOut"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="text-white hover:bg-white/10"
            />
            <span className="min-w-[60px] text-center text-sm text-white">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              iconName="ZoomIn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="text-white hover:bg-white/10"
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="RotateCcw"
              onClick={handleZoomReset}
              className="text-white hover:bg-white/10"
            />

            {/* Metadata Toggle */}
            <Button
              variant="ghost"
              size="sm"
              iconName="Info"
              onClick={() => setShowMetadata(!showMetadata)}
              className={`text-white hover:bg-white/10 ${showMetadata ? "bg-white/20" : ""}`}
            />

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              iconName="Edit"
              onClick={() => onEdit(currentPhoto)}
              className="text-white hover:bg-white/10"
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              onClick={() => onDelete(currentPhoto)}
              className="text-white hover:bg-white/10"
            />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            iconName="ChevronLeft"
            onClick={onPrevious}
            className="absolute top-1/2 left-4 z-510 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/10"
            disabled={currentIndex === 0}
          />
          <Button
            variant="ghost"
            size="lg"
            iconName="ChevronRight"
            onClick={onNext}
            className="absolute top-1/2 right-4 z-510 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/10"
            disabled={currentIndex === photos.length - 1}
          />
        </>
      )}

      {/* Main Image */}
      <div className="flex flex-1 items-center justify-center p-16">
        <div
          className="max-h-full max-w-full overflow-auto"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src={currentPhoto.fullSize ?? currentPhoto.thumbnail}
            alt={currentPhoto.description ?? "Construction progress photo"}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="absolute right-0 bottom-0 left-0 z-510 bg-black/50 backdrop-blur-sm">
          <div className="p-6 text-white">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="mb-2 font-medium">Photo Details</h4>
                <div className="space-y-1 text-sm text-white/80">
                  <div className="flex items-center">
                    <Icon name="Calendar" size={14} className="mr-2" />
                    {formatDate(currentPhoto.captureDate)}
                  </div>
                  <div className="flex items-center">
                    <Icon name="User" size={14} className="mr-2" />
                    {currentPhoto.uploadedBy}
                  </div>
                  <div className="flex items-center">
                    <Icon name="Camera" size={14} className="mr-2" />
                    {currentPhoto.orientation ?? "Standard"}
                  </div>
                </div>
              </div>

              {currentPhoto.location && (
                <div>
                  <h4 className="mb-2 font-medium">Location</h4>
                  <div className="space-y-1 text-sm text-white/80">
                    <div className="flex items-center">
                      <Icon name="MapPin" size={14} className="mr-2" />
                      {currentPhoto.location.lat.toFixed(6)},{" "}
                      {currentPhoto.location.lng.toFixed(6)}
                    </div>
                    {currentPhoto.location.address && (
                      <div className="flex items-start">
                        <Icon name="Map" size={14} className="mt-0.5 mr-2" />
                        <span>{currentPhoto.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="text-sm text-white/80">
                  {currentPhoto.description ?? "No description provided"}
                </p>
                {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {currentPhoto.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="rounded bg-white/20 px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      <div className="absolute inset-0 z-400" onClick={onClose} />
    </div>
  );
};

export default PhotoLightbox;
