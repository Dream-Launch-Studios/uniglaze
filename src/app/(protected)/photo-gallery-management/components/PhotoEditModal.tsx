import React, { useState, useEffect } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import type { SelectOption } from "@/components/rocket/components/ui/Select";
import Image from "next/image";
import { toast } from "sonner";

// Types
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

interface WorkItem {
  id: string | number;
  name: string;
}

interface FormData {
  description: string;
  workItem: string;
  orientation: string;
  tags: string[];
}

interface PhotoEditModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoId: number | string, formData: FormData) => Promise<void>;
  workItems?: WorkItem[];
}

const PhotoEditModal: React.FC<PhotoEditModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave,
  workItems = [],
}) => {
  const [formData, setFormData] = useState<FormData>({
    description: "",
    workItem: "",
    orientation: "landscape",
    tags: [],
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (photo && isOpen) {
      setFormData({
        description: photo.description ?? "",
        workItem: photo.workItem ?? "",
        orientation: photo.orientation ?? "landscape",
        tags: photo.tags ?? [],
      });
    }
  }, [photo, isOpen]);

  const workItemOptions: SelectOption[] = [
    { value: "", label: "No work item assigned" },
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag: string) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleSave = async () => {
    if (!photo) return;

    setIsSaving(true);
    try {
      await onSave(photo.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save photo metadata:", error);
      toast.error("Failed to save photo details. Check your internet connection and try again. If the problem continues, contact support.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !photo) return null;

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-3">
            <Icon name="Edit" size={24} color="var(--color-primary)" />
            <div>
              <h2 className="text-text-primary text-xl font-semibold">
                Edit Photo
              </h2>
              <p className="text-text-secondary text-sm">
                Update photo metadata and details
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" iconName="X" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Photo Preview */}
            <div className="space-y-4">
              <div className="bg-muted aspect-square overflow-hidden rounded-lg">
                <Image
                  src={photo.thumbnail}
                  alt={photo.description ?? "Construction progress photo"}
                  className="h-full w-full object-cover"
                  width={500}
                  height={500}
                />
              </div>

              {/* Photo Info */}
              <div className="space-y-2 text-sm">
                <div className="text-text-secondary flex items-center">
                  <Icon name="Calendar" size={14} className="mr-2" />
                  {formatDate(photo.captureDate)}
                </div>
                <div className="text-text-secondary flex items-center">
                  <Icon name="User" size={14} className="mr-2" />
                  {photo.uploadedBy}
                </div>
                <div className="text-text-secondary flex items-center">
                  <Icon name="FileImage" size={14} className="mr-2" />
                  {photo.fileSize
                    ? `${(photo.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : "Unknown size"}
                </div>
                {photo.location && (
                  <div className="text-text-secondary flex items-center">
                    <Icon name="MapPin" size={14} className="mr-2" />
                    {photo.location.lat.toFixed(4)},{" "}
                    {photo.location.lng.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Description
                </label>
                <Input
                  placeholder="Describe what this photo shows..."
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                />
                <p className="text-text-secondary mt-1 text-xs">
                  Provide a clear description of the construction progress shown
                </p>
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Work Item
                </label>
                <Select
                  options={workItemOptions}
                  value={formData.workItem}
                  onChange={(value: string) =>
                    handleInputChange("workItem", value)
                  }
                />
                <p className="text-text-secondary mt-1 text-xs">
                  Associate this photo with a specific work item
                </p>
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Orientation
                </label>
                <Select
                  options={orientationOptions}
                  value={formData.orientation}
                  onChange={(value: string) =>
                    handleInputChange("orientation", value)
                  }
                />
                <p className="text-text-secondary mt-1 text-xs">
                  Photo orientation for better organization
                </p>
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Tags
                </label>
                <Input
                  placeholder="glazing, exterior, progress, inspection..."
                  value={formData.tags.join(", ")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleTagsChange(e.target.value)
                  }
                />
                <p className="text-text-secondary mt-1 text-xs">
                  Comma-separated tags for easier searching and filtering
                </p>
              </div>

              {/* Current Tags Display */}
              {formData.tags.length > 0 && (
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Current Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-muted text-text-primary rounded-md px-2 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Info (Read-only) */}
              {photo.location && (
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Location (GPS Coordinates)
                  </label>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-text-secondary flex items-center text-sm">
                      <Icon name="MapPin" size={14} className="mr-2" />
                      Latitude: {photo.location.lat.toFixed(6)}
                    </div>
                    <div className="text-text-secondary mt-1 flex items-center text-sm">
                      <Icon name="MapPin" size={14} className="mr-2" />
                      Longitude: {photo.location.lng.toFixed(6)}
                    </div>
                    {photo.location.address && (
                      <div className="text-text-secondary mt-2 flex items-start text-sm">
                        <Icon name="Map" size={14} className="mt-0.5 mr-2" />
                        <span>{photo.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t p-6">
          <div className="text-text-secondary text-sm">
            Last modified: {formatDate(photo.lastModified ?? photo.captureDate)}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="default"
              iconName="Save"
              onClick={handleSave}
              loading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditModal;
