import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Icon from "@/components/rocket/components/AppIcon";
import Image from "next/image";

// Type definitions
interface ProjectItem {
  id: string;
  name: string;
  description: string;
  totalQuantity: number;
  unit: string;
  currentSupplied: number;
  currentInstalled: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: string;
  progress: number;
  items: ProjectItem[];
}

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface PhotoData {
  id: number;
  file: File;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  gpsCoordinates: GPSCoordinates;
  locationName: string;
  description: string;
  itemId: string;
  itemName: string;
  thumbnail: string;
}

interface UploadingPhoto {
  id: number;
  file: File;
  name: string;
  size: number;
  progress: number;
}

interface PhotoDocumentationStepProps {
  selectedProject: Project | null;
  currentItemIndex: number;
  photos: Record<string, PhotoData[]>;
  onPhotoUpdate: (photos: Record<string, PhotoData[]>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PhotoDocumentationStep: React.FC<PhotoDocumentationStepProps> = ({
  selectedProject,
  currentItemIndex,
  photos,
  onPhotoUpdate,
  onNext,
  onPrevious,
}) => {
  const [currentPhotos, setCurrentPhotos] = useState<PhotoData[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItem = selectedProject?.items?.[currentItemIndex];

  React.useEffect(() => {
    const itemPhotos = photos[currentItem?.id ?? ""] ?? [];
    setCurrentPhotos(itemPhotos);
  }, [photos, currentItem?.id]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadingPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
      })),
    ]);

    // Simulate photo upload with GPS tagging
    for (const file of files) {
      try {
        // Get GPS coordinates (mock implementation)
        const gpsCoords = await getCurrentLocation();

        // Create photo object
        const photoData: PhotoData = {
          id: Date.now() + Math.random(),
          file,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          gpsCoordinates: gpsCoords,
          locationName: locationName || "Unknown Location",
          description: description || "",
          itemId: currentItem?.id ?? "",
          itemName: currentItem?.name ?? "",
          thumbnail: URL.createObjectURL(file),
        };

        // Update photos
        const updatedPhotos = {
          ...photos,
          [currentItem?.id ?? ""]: [
            ...(photos[currentItem?.id ?? ""] ?? []),
            photoData,
          ],
        };
        onPhotoUpdate(updatedPhotos);

        // Remove from uploading state
        setUploadingPhotos((prev) => prev.filter((p) => p.file !== file));
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast.error(`Failed to upload photo "${file.name}". Check your internet connection and file size (max 10MB). Try again.`);
        setUploadingPhotos((prev) => prev.filter((p) => p.file !== file));
      }
    }

    // Clear form
    setLocationName("");
    setDescription("");
    event.target.value = "";
  };

  const getCurrentLocation = (): Promise<GPSCoordinates> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          () => {
            // Fallback to mock coordinates
            resolve({
              latitude: 12.9716,
              longitude: 77.5946,
              accuracy: 10,
            });
          },
        );
      } else {
        resolve({
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 10,
        });
      }
    });
  };

  const handleDeletePhoto = (photoId: number) => {
    const updatedPhotos = {
      ...photos,
      [currentItem?.id ?? ""]: (photos[currentItem?.id ?? ""] ?? []).filter(
        (photo) => photo.id !== photoId,
      ),
    };
    onPhotoUpdate(updatedPhotos);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatGPSCoordinates = (coords: GPSCoordinates | null): string => {
    if (!coords) return "Location not available";
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  const totalPhotosCount = Object.values(photos).reduce(
    (total, itemPhotos) => total + itemPhotos.length,
    0,
  );

  if (!selectedProject || !currentItem) {
    return (
      <div className="p-6 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" />
        <p className="text-text-secondary mt-4">No project or item selected</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Photo Documentation
        </h2>
        <p className="text-text-secondary mb-4">
          Upload progress photos with location details and descriptions
        </p>

        {/* Current Item Info */}
        <div className="bg-info/10 border-info/20 mb-4 rounded-lg border p-4">
          <div className="mb-2 flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-info)" />
            <p className="text-info text-sm font-medium">
              Current Item: {currentItem.name}
            </p>
          </div>
          <p className="text-info/80 ml-6 text-xs">{currentItem.description}</p>
        </div>

        {/* Progress Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">
              Total Photos Uploaded
            </span>
            <span className="text-text-primary text-sm font-medium">
              {totalPhotosCount} photos
            </span>
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="bg-surface border-border mb-6 rounded-lg border p-6">
        <h3 className="text-text-primary mb-4 text-lg font-semibold">
          Upload New Photos
        </h3>

        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Location Name
              </label>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Building A - North Face"
              />
              <p className="text-text-secondary mt-1 text-xs">
                Specific location where photos were taken
              </p>
            </div>

            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Glass installation progress"
              />
              <p className="text-text-secondary mt-1 text-xs">
                Brief description of what the photos show
              </p>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="border-border rounded-lg border-2 border-dashed p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mb-4">
            <Icon name="Upload" size={48} color="var(--color-text-secondary)" />
          </div>

          <h4 className="text-text-primary mb-2 text-lg font-medium">
            Upload Photos
          </h4>
          <p className="text-text-secondary mb-4">
            Select multiple photos to upload with GPS tagging
          </p>

          <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              iconName="Camera"
              iconPosition="left"
            >
              Choose Photos
            </Button>
            <span className="text-text-secondary text-sm">
              or drag and drop files here
            </span>
          </div>

          <p className="text-text-secondary mt-2 text-xs">
            Supports JPEG, PNG files up to 10MB each
          </p>
        </div>

        {/* Uploading Photos */}
        {uploadingPhotos.length > 0 && (
          <div className="mt-4">
            <h4 className="text-text-primary mb-2 font-medium">Uploading...</h4>
            <div className="space-y-2">
              {uploadingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-muted/50 flex items-center space-x-3 rounded p-2"
                >
                  <Icon name="Upload" size={16} color="var(--color-primary)" />
                  <span className="text-text-primary flex-1 text-sm">
                    {photo.name}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {formatFileSize(photo.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Existing Photos */}
      {currentPhotos.length > 0 && (
        <div className="bg-surface border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Uploaded Photos ({currentPhotos.length})
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="border-border overflow-hidden rounded-lg border"
              >
                <div className="bg-muted relative aspect-video">
                  <Image
                    src={photo.thumbnail}
                    alt={photo.description || "Progress photo"}
                    className="h-full w-full object-cover"
                    width={500}
                    height={500}
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-error hover:bg-error/80 transition-smooth absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-white"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>

                <div className="p-3">
                  <h4 className="text-text-primary mb-1 text-sm font-medium">
                    {photo.locationName}
                  </h4>
                  {photo.description && (
                    <p className="text-text-secondary mb-2 line-clamp-2 text-xs">
                      {photo.description}
                    </p>
                  )}
                  <div className="text-text-secondary space-y-1 text-xs">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={12} />
                      <span>{formatGPSCoordinates(photo.gpsCoordinates)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{new Date(photo.uploadedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="FileText" size={12} />
                      <span>{formatFileSize(photo.fileSize)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-border mt-8 flex justify-between border-t pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Yesterday&apos;s Progress
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Blockage Reporting
        </Button>
      </div>
    </div>
  );
};

export default PhotoDocumentationStep;
