import React, { useState } from "react";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import Image from "next/image";

// Type definitions
// interface GPSCoordinates {
//   latitude: number;
//   longitude: number;
// }

interface Photo {
  id: string;
  thumbnail: string;
  description?: string;
  // locationName: string;
  // gpsCoordinates?: GPSCoordinates;
  uploadedAt: string | Date;
  // fileSize: number;
  itemId: string;
  itemName?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  client?: string;
  items?: ProjectItem[];
}

interface WorkflowData {
  photos?: Record<string, Photo[]>;
  selectedProject?: Project;
}

interface Visibility {
  selectedForExternal?: string[];
}

interface PhotosPreviewProps {
  workflowData: WorkflowData;
  visibility: Visibility;
  onVisibilityChange: (settings: Partial<Visibility>) => void;
}

const PhotosPreview: React.FC<PhotosPreviewProps> = ({
  workflowData,
  visibility,
  onVisibilityChange,
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    visibility.selectedForExternal ?? [],
  );
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  const allPhotos: Photo[] = Object.values(workflowData.photos ?? {}).flat();

  const handlePhotoSelection = (photoId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedPhotos, photoId]
      : selectedPhotos.filter((id) => id !== photoId);

    setSelectedPhotos(updated);
    onVisibilityChange({ selectedForExternal: updated });
  };

  const handleSelectAll = (checked: boolean) => {
    const updated = checked ? allPhotos.map((photo) => photo.id) : [];
    setSelectedPhotos(updated);
    onVisibilityChange({ selectedForExternal: updated });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // const formatGPSCoordinates = (coords?: GPSCoordinates): string => {
  //   if (!coords) return "Location not available";
  //   return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  // };

  const getPhotosByItem = (): Record<string, Photo[]> => {
    const photosByItem: Record<string, Photo[]> = {};
    allPhotos.forEach((photo) => {
      photosByItem[photo.itemId] ??= [];
      photosByItem[photo.itemId]!.push(photo);
    });
    return photosByItem;
  };

  const photosByItem = getPhotosByItem();

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="border-border border-b pb-6 text-center">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Photo Documentation Report
        </h2>
        <p className="text-text-secondary">
          Progress photos with location and timestamp data
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-primary/10 rounded-lg px-4 py-2">
            <p className="text-primary text-sm font-medium">
              Report Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {allPhotos.length === 0 ? (
        /* No Photos */
        <div className="py-8 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <Icon name="Camera" size={32} color="var(--color-text-secondary)" />
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            No Photos Uploaded
          </h3>
          <p className="text-text-secondary">
            No progress photos have been uploaded for this report period.
          </p>
        </div>
      ) : (
        <>
          {/* Photo Summary and Controls */}
          <div className="bg-surface border-border rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text-primary font-semibold">
                Photo Selection for External Reports
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary text-sm">
                  {selectedPhotos.length} of {allPhotos.length} selected
                </span>
                <Checkbox
                  label="Select All"
                  checked={selectedPhotos.length === allPhotos.length}
                  onChange={(e) =>
                    handleSelectAll((e.target as HTMLInputElement).checked)
                  }
                  className="text-sm"
                />
              </div>
            </div>

            {/* <div className="bg-info/10 border-info/20 rounded border p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} color="var(--color-info)" />
                <p className="text-info text-sm">
                  Select which photos to include in external client reports. All
                  photos will be included in internal reports by default.
                </p>
              </div>
            </div> */}
          </div>

          {/* Photo Statistics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-primary text-2xl font-bold">
                {allPhotos.length}
              </p>
              <p className="text-text-secondary text-xs">Total Photos</p>
            </div>
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-success text-2xl font-bold">
                {Object.keys(photosByItem).length}
              </p>
              <p className="text-text-secondary text-xs">Items Documented</p>
            </div>
            <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-info text-2xl font-bold">
                {selectedPhotos.length}
              </p>
              <p className="text-text-secondary text-xs">For External Report</p>
            </div>
            {/* <div className="bg-surface border-border rounded-lg border p-4 text-center">
              <p className="text-accent text-2xl font-bold">
                {Math.round(
                  allPhotos.reduce((sum, photo) => sum + photo.fileSize, 0) /
                    1024 /
                    1024,
                )}
                MB
              </p>
              <p className="text-text-secondary text-xs">Total Size</p>
            </div> */}
          </div>

          {/* Photos by Item */}
          <div className="space-y-6">
            {Object.entries(photosByItem).map(([itemId, photos]) => {
              const item = workflowData.selectedProject?.items?.find(
                (item) => item.id === itemId,
              );
              return (
                <div
                  key={itemId}
                  className="bg-surface border-border overflow-hidden rounded-lg border"
                >
                  <div className="bg-muted/20 border-border border-b p-4">
                    <h3 className="text-text-primary font-semibold">
                      {item?.name ?? `Item ${itemId}`}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {photos.length} photo{photos.length !== 1 ? "s" : ""} •{" "}
                      {item?.description}
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="border-border overflow-hidden rounded-lg border"
                        >
                          <div className="bg-muted group relative aspect-video cursor-pointer">
                            <Image
                              src={photo.thumbnail}
                              alt={photo.description ?? "Progress photo"}
                              className="h-full w-full object-cover"
                              onClick={() => setLightboxPhoto(photo)}
                              width={400}
                              height={400}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                              <Icon name="ZoomIn" size={24} color="white" />
                            </div>

                            {/* Selection Checkbox */}
                            <div className="absolute top-2 left-2">
                              <Checkbox
                                checked={selectedPhotos.includes(photo.id)}
                                onChange={(e) =>
                                  handlePhotoSelection(
                                    photo.id,
                                    (e.target as HTMLInputElement).checked,
                                  )
                                }
                                className="rounded bg-white/90"
                              />
                            </div>
                          </div>

                          <div className="p-3">
                            {/* <h4 className="text-text-primary mb-1 text-sm font-medium">
                              {photo.locationName}
                            </h4> */}
                            {photo.description && (
                              <p className="text-text-secondary mb-2 line-clamp-2 text-xs">
                                {photo.description}
                              </p>
                            )}
                            <div className="text-text-secondary space-y-1 text-xs">
                              {/* <div className="flex items-center space-x-1">
                                <Icon name="MapPin" size={10} />
                                <span className="truncate">
                                  {formatGPSCoordinates(photo.gpsCoordinates)}
                                </span>
                              </div> */}
                              <div className="flex items-center space-x-1">
                                <Icon name="Clock" size={10} />
                                <span>
                                  {new Date(photo.uploadedAt).toLocaleString()}
                                </span>
                              </div>
                              {/* <div className="flex items-center space-x-1">
                                <Icon name="FileText" size={10} />
                                <span>{formatFileSize(photo.fileSize)}</span>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-surface max-h-full max-w-4xl overflow-hidden rounded-lg">
            <div className="border-border flex items-center justify-between border-b p-4">
              {/* <h3 className="text-text-primary font-semibold">
                {lightboxPhoto.locationName}
              </h3> */}
              <button
                onClick={() => setLightboxPhoto(null)}
                className="bg-muted hover:bg-muted/80 transition-smooth flex h-8 w-8 items-center justify-center rounded-full"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="p-4">
              <Image
                src={lightboxPhoto.thumbnail}
                alt={lightboxPhoto.description ?? "Progress photo"}
                className="mb-4 h-auto max-h-96 w-full object-contain"
                width={400}
                height={400}
              />
              <div className="space-y-2 text-sm">
                {lightboxPhoto.description && (
                  <p className="text-text-primary">
                    {lightboxPhoto.description}
                  </p>
                )}
                <div className="text-text-secondary grid grid-cols-1 gap-2 md:grid-cols-2">
                  {/* <div>
                    GPS: {formatGPSCoordinates(lightboxPhoto.gpsCoordinates)}
                  </div> */}
                  <div>
                    Uploaded:{" "}
                    {new Date(lightboxPhoto.uploadedAt).toLocaleString()}
                  </div>
                  {/* <div>Size: {formatFileSize(lightboxPhoto.fileSize)}</div> */}
                  <div>Item: {lightboxPhoto.itemName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Footer */}
      <div className="border-border border-t pt-6 text-center">
        <p className="text-text-secondary text-xs">
          Photo documentation report with GPS metadata •{" "}
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default PhotosPreview;
