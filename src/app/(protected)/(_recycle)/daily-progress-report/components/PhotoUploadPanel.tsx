import React, { useState, useRef } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import Image from "@/components/rocket/components/AppImage";

interface OrientationOption {
  value: string;
  label: string;
}

interface PhotoData {
  id: number;
  file: File;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
  orientation: string;
  location: string;
  description: string;
}

interface WorkItem {
  name: string;
  id?: string | number;
}

type PhotoMetadata = Record<
  number,
  {
    orientation?: string;
    description?: string;
  }
>;

type UploadProgress = Record<number, number>;

interface PhotoUploadPanelProps {
  selectedWorkItem?: WorkItem;
  onPhotoUpload: (photoData: PhotoData) => void;
  onPhotoDelete: (photoId: number) => void;
  existingPhotos?: PhotoData[];
}

const PhotoUploadPanel: React.FC<PhotoUploadPanelProps> = ({
  selectedWorkItem,
  onPhotoUpload,
  onPhotoDelete,
  existingPhotos = [],
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [photoMetadata, setPhotoMetadata] = useState<PhotoMetadata>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orientationOptions: OrientationOption[] = [
    { value: "before", label: "Before Work" },
    { value: "during", label: "During Work" },
    { value: "after", label: "After Work" },
    { value: "overview", label: "Overview" },
  ];

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/") && existingPhotos.length + index < 4) {
        void uploadPhoto(file);
      }
    });
  };

  const uploadPhoto = async (file: File): Promise<void> => {
    const photoId = Date.now() + Math.random();

    // Simulate upload progress
    setUploadProgress((prev) => ({ ...prev, [photoId]: 0 }));

    // Compress image (mock implementation)
    const compressedFile = await compressImage(file);

    // Simulate AWS S3 upload with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress((prev) => ({ ...prev, [photoId]: progress }));
    }

    // Create photo object
    const photoData: PhotoData = {
      id: photoId,
      file: compressedFile,
      url: URL.createObjectURL(compressedFile),
      name: file.name,
      size: compressedFile.size,
      uploadedAt: new Date().toISOString(),
      orientation: "during",
      location: "Auto-detected location",
      description: "",
    };

    onPhotoUpload(photoData);
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[photoId];
      return newProgress;
    });
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new HTMLImageElement();

      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          0.8,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const updatePhotoMetadata = (
    photoId: number,
    field: string,
    value: string,
  ) => {
    setPhotoMetadata((prev) => ({
      ...prev,
      [photoId]: { ...prev[photoId], [field]: value },
    }));
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-surface border-border rounded-lg border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-semibold">
            Photo Documentation
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Upload up to 4 photos for{" "}
            {selectedWorkItem?.name ?? "selected work item"}
          </p>
        </div>
        <div className="text-text-secondary text-sm">
          {existingPhotos.length}/4 photos
        </div>
      </div>

      {/* Upload Zone */}
      {existingPhotos.length < 4 && (
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />

          <div className="space-y-4">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Icon
                name="Camera"
                size={24}
                color="var(--color-text-secondary)"
              />
            </div>

            <div>
              <p className="text-text-primary mb-2 text-lg font-medium">
                Drop photos here or click to upload
              </p>
              <p className="text-text-secondary text-sm">
                Supports JPG, PNG up to 10MB each
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                iconName="Upload"
                iconPosition="left"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>

              <Button
                variant="outline"
                iconName="Camera"
                iconPosition="left"
                onClick={handleCameraCapture}
              >
                Take Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([photoId, progress]) => (
            <div key={photoId} className="bg-muted rounded-lg p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-text-primary text-sm font-medium">
                  Uploading...
                </span>
                <span className="text-text-secondary text-sm">{progress}%</span>
              </div>
              <div className="bg-background h-2 w-full rounded-full">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-text-primary text-lg font-medium">
            Uploaded Photos
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="bg-muted rounded-lg p-4">
                <div className="relative mb-3">
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    className="h-48 w-full rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="Trash2"
                    iconSize={16}
                    onClick={() => onPhotoDelete(photo.id)}
                    className="absolute top-2 right-2"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-text-primary mb-1 block text-sm font-medium">
                      Orientation
                    </label>
                    <Select
                      options={orientationOptions}
                      value={
                        photoMetadata[photo.id]?.orientation ??
                        photo.orientation
                      }
                      onChange={(value) =>
                        updatePhotoMetadata(photo.id, "orientation", value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-text-primary mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <Input
                      type="text"
                      placeholder="Add photo description..."
                      value={
                        photoMetadata[photo.id]?.description ??
                        photo.description
                      }
                      onChange={(e) =>
                        updatePhotoMetadata(
                          photo.id,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="text-text-secondary space-y-1 text-xs">
                    <div>Size: {(photo.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div>Location: {photo.location}</div>
                    <div>
                      Uploaded: {new Date(photo.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Guidelines */}
      <div className="bg-muted/50 mt-6 rounded-lg p-4">
        <h4 className="text-text-primary mb-2 text-sm font-medium">
          Photo Guidelines
        </h4>
        <ul className="text-text-secondary space-y-1 text-xs">
          <li>• Take clear, well-lit photos showing work progress</li>
          <li>• Include before, during, and after shots when possible</li>
          <li>• Ensure photos show the work area and quality clearly</li>
          <li>• Add descriptions to provide context for reviewers</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploadPanel;
