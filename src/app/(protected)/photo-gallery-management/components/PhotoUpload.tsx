import React, { useState, useRef } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import Image from "next/image";

interface WorkItem {
  id: string | number;
  name: string;
  description?: string;
  unit?: string;
  location?: string;
  total_quantity?: number;
  completed_quantity?: number;
  progress_percentage?: number;
  status?: "not_started" | "in_progress" | "completed" | "on_hold" | "blocked";
}

interface SelectOption {
  value: string;
  label: string;
}

interface FileData {
  id: number;
  file: File;
  preview: string;
  description: string;
  workItem: string;
  orientation: "landscape" | "portrait" | "square";
  tags: string[];
}

interface UploadProgressStatus {
  status: "uploading" | "completed" | "failed";
  progress: number;
}

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileData[]) => Promise<void>;
  projectId?: string | number;
  workItems?: WorkItem[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  isOpen,
  onClose,
  onUpload,
  projectId,
  workItems = [],
}) => {
  const [uploadFiles, setUploadFiles] = useState<FileData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Record<number, UploadProgressStatus>
  >({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workItemOptions: SelectOption[] = [
    { value: "", label: "Select work item (optional)" },
    ...workItems.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  const orientationOptions: SelectOption[] = [
    { value: "landscape", label: "Landscape" },
    { value: "portrait", label: "Portrait" },
    { value: "square", label: "Square" },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newFiles: FileData[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      description: "",
      workItem: "",
      orientation: "landscape",
      tags: [],
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileUpdate = (fileId: number, updates: Partial<FileData>) => {
    setUploadFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    );
  };

  const handleRemoveFile = (fileId: number) => {
    setUploadFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const fileData of uploadFiles) {
        setUploadProgress((prev) => ({
          ...prev,
          [fileData.id]: { status: "uploading", progress: 0 },
        }));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress((prev) => ({
            ...prev,
            [fileData.id]: { status: "uploading", progress },
          }));
        }

        // Mock successful upload
        setUploadProgress((prev) => ({
          ...prev,
          [fileData.id]: { status: "completed", progress: 100 },
        }));
      }

      // Call parent upload handler
      await onUpload(uploadFiles);

      // Clean up and close
      uploadFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      setUploadFiles([]);
      setUploadProgress({});
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      // Mark failed uploads
      uploadFiles.forEach((file) => {
        setUploadProgress((prev) => ({
          ...prev,
          [file.id]: { status: "failed", progress: 0 },
        }));
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length > 0) {
      const newFiles: FileData[] = files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        description: "",
        workItem: "",
        orientation: "landscape",
        tags: [],
      }));

      setUploadFiles((prev) => [...prev, ...newFiles]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-3">
            <Icon name="Upload" size={24} color="var(--color-primary)" />
            <div>
              <h2 className="text-text-primary text-xl font-semibold">
                Upload Photos
              </h2>
              <p className="text-text-secondary text-sm">
                Add construction progress photos with metadata
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" iconName="X" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Upload Area */}
          {uploadFiles.length === 0 && (
            <div
              className="border-border hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon
                name="Upload"
                size={48}
                color="var(--color-text-secondary)"
                className="mx-auto mb-4"
              />
              <h3 className="text-text-primary mb-2 text-lg font-medium">
                Drop photos here or click to browse
              </h3>
              <p className="text-text-secondary mb-4">
                Support for JPG, PNG, WebP files up to 10MB each
              </p>
              <Button variant="outline" iconName="FolderOpen">
                Browse Files
              </Button>
            </div>
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-medium">
                  Selected Photos ({uploadFiles.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Plus"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add More
                </Button>
              </div>

              {uploadFiles.map((fileData) => (
                <div key={fileData.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* Preview */}
                    <div className="bg-background h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={fileData.preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        width={400}
                        height={400}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-text-primary font-medium">
                            {fileData.file.name}
                          </h4>
                          <p className="text-text-secondary text-sm">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Trash2"
                          onClick={() => handleRemoveFile(fileData.id)}
                          className="text-error hover:text-error"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-text-primary mb-2 block text-sm font-medium">
                            Description
                          </label>
                          <Input
                            placeholder="Describe what this photo shows..."
                            value={fileData.description}
                            onChange={(e) =>
                              handleFileUpdate(fileData.id, {
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-text-primary mb-2 block text-sm font-medium">
                            Work Item
                          </label>
                          <Select
                            options={workItemOptions}
                            value={fileData.workItem}
                            onChange={(value) =>
                              handleFileUpdate(fileData.id, { workItem: value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-text-primary mb-2 block text-sm font-medium">
                            Orientation
                          </label>
                          <Select
                            options={orientationOptions}
                            value={fileData.orientation}
                            onChange={(value) =>
                              handleFileUpdate(fileData.id, {
                                orientation: value as
                                  | "landscape"
                                  | "portrait"
                                  | "square",
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-text-primary mb-2 block text-sm font-medium">
                            Tags (comma separated)
                          </label>
                          <Input
                            placeholder="glazing, exterior, progress..."
                            value={fileData.tags.join(", ")}
                            onChange={(e) =>
                              handleFileUpdate(fileData.id, {
                                tags: e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {uploadProgress[fileData.id] && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">
                              {uploadProgress[fileData.id]?.status ===
                                "uploading" && "Uploading..."}
                              {uploadProgress[fileData.id]?.status ===
                                "completed" && "Upload Complete"}
                              {uploadProgress[fileData.id]?.status ===
                                "failed" && "Upload Failed"}
                            </span>
                            <span className="text-text-secondary">
                              {uploadProgress[fileData.id]?.progress}%
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                uploadProgress[fileData.id]?.status ===
                                "completed"
                                  ? "bg-success"
                                  : uploadProgress[fileData.id]?.status ===
                                      "failed"
                                    ? "bg-error"
                                    : "bg-primary"
                              }`}
                              style={{
                                width: `${uploadProgress[fileData.id]?.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadFiles.length > 0 && (
          <div className="border-border flex items-center justify-between border-t p-6">
            <p className="text-text-secondary text-sm">
              {uploadFiles.length} photo{uploadFiles.length !== 1 ? "s" : ""}{" "}
              ready to upload
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Upload"
                onClick={handleUpload}
                loading={isUploading}
                disabled={uploadFiles.length === 0}
              >
                Upload Photos
              </Button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUpload;
