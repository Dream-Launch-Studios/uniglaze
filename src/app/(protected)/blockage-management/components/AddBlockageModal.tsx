import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface PhotoData {
  id: number;
  file: File;
  url: string;
  description: string;
  timestamp: Date;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  severity: string;
  project: string;
  location: string;
  assignedTo: string;
  expectedResolution: string;
  clientVisible: boolean;
  priority: boolean;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  project?: string;
  location?: string;
  assignedTo?: string;
}

interface BlockageData extends FormData {
  id: string;
  status: string;
  createdAt: Date;
  photos: PhotoData[];
  commentsCount: number;
  timeline: Array<{
    action: string;
    description: string;
    timestamp: Date;
  }>;
}

interface AddBlockageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlockageData) => void;
}

const AddBlockageModal: React.FC<AddBlockageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    severity: "",
    project: "",
    location: "",
    assignedTo: "",
    expectedResolution: "",
    clientVisible: false,
    priority: false,
  });

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  const categoryOptions = [
    { value: "client", label: "Client-side Issues" },
    { value: "internal", label: "Internal Issues" },
    { value: "supplier", label: "Supplier Issues" },
    { value: "weather", label: "Weather Related" },
  ];

  const severityOptions = [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const projectOptions = [
    { value: "project-1", label: "Prestige Tech Park - Phase 2" },
    { value: "project-2", label: "Brigade Gateway Mall" },
    { value: "project-3", label: "Embassy Manyata" },
    { value: "project-4", label: "RMZ Ecospace" },
  ];

  const assigneeOptions = [
    { value: "rajesh-kumar", label: "Rajesh Kumar (PM)" },
    { value: "suresh-reddy", label: "Suresh Reddy (Site Engineer)" },
    { value: "priya-sharma", label: "Priya Sharma (Quality Inspector)" },
    { value: "amit-patel", label: "Amit Patel (Supervisor)" },
  ];

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) newErrors.title = "Blockage title is required. Enter a brief title describing the blockage (e.g. Material Delivery Delay, Weather Issue).";
    if (!formData.description.trim())
      newErrors.description = "Blockage description is required. Explain what the blockage is and how it affects the project.";
    if (!formData.category) newErrors.category = "Category is required. Select the type of blockage (e.g. Material Delivery Delay, Weather Issue).";
    if (!formData.severity) newErrors.severity = "Severity level is required. Select how critical this blockage is (Low, Medium, or High).";
    if (!formData.project) newErrors.project = "Project is required. Select which project this blockage affects.";
    if (!formData.location.trim()) newErrors.location = "Location is required. Enter where this blockage is occurring (e.g. Building A - Floor 5, Site Entrance).";
    if (!formData.assignedTo) newErrors.assignedTo = "Assignee is required. Select who is responsible for resolving this blockage.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      const blockageData: BlockageData = {
        ...formData,
        id: Date.now().toString(),
        status: "open",
        createdAt: new Date(),
        photos: photos,
        commentsCount: 0,
        timeline: [
          {
            action: "Blockage Reported",
            description: "New blockage reported and assigned",
            timestamp: new Date(),
          },
        ],
      };

      onSubmit(blockageData);
      handleReset();
      onClose();
    }
  };

  const handleReset = (): void => {
    setFormData({
      title: "",
      description: "",
      category: "",
      severity: "",
      project: "",
      location: "",
      assignedTo: "",
      expectedResolution: "",
      clientVisible: false,
      priority: false,
    });
    setPhotos([]);
    setErrors({});
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const files = Array.from(event.target.files ?? []);
    const newPhotos: PhotoData[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      file: file,
      url: URL.createObjectURL(file),
      description: "",
      timestamp: new Date(),
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId: number): void => {
    setPhotos(photos.filter((photo) => photo.id !== photoId));
  };

  const updatePhotoDescription = (
    photoId: number,
    description: string,
  ): void => {
    setPhotos(
      photos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface elevation-3 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-error/10 text-error rounded-lg p-2">
              <Icon name="AlertTriangle" size={20} />
            </div>
            <div>
              <h2 className="text-text-primary text-xl font-semibold">
                Report New Blockage
              </h2>
              <p className="text-text-secondary text-sm">
                Document and assign project obstacles
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconSize={20}
            onClick={onClose}
          />
        </div>

        {/* Form Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Blockage Title <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  error={errors.title}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Project <span className="text-error">*</span>
                </label>
                <Select
                  options={projectOptions}
                  value={formData.project}
                  onChange={(value) =>
                    setFormData({ ...formData, project: value })
                  }
                  error={errors.project}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Location <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="Specific location within project"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  error={errors.location}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Category <span className="text-error">*</span>
                </label>
                <Select
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  error={errors.category}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Severity <span className="text-error">*</span>
                </label>
                <Select
                  options={severityOptions}
                  value={formData.severity}
                  onChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                  error={errors.severity}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Detailed Description <span className="text-error">*</span>
              </label>
              <Textarea
                placeholder="Provide detailed information about the blockage, its impact, and any immediate actions taken..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className={errors.description ? "border-error" : ""}
              />
              {errors.description && (
                <p className="text-error mt-1 text-xs font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Assign To <span className="text-error">*</span>
                </label>
                <Select
                  options={assigneeOptions}
                  value={formData.assignedTo}
                  onChange={(value) =>
                    setFormData({ ...formData, assignedTo: value })
                  }
                  error={errors.assignedTo}
                />
              </div>

              <div>
                <label className="text-text-primary mb-2 block text-sm font-medium">
                  Expected Resolution Date
                </label>
                <Input
                  type="date"
                  value={formData.expectedResolution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedResolution: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Photo Documentation
              </label>
              <div className="border-border rounded-lg border-2 border-dashed p-6 text-center">
                <Icon
                  name="Camera"
                  size={32}
                  className="text-text-secondary mx-auto mb-2"
                />
                <p className="text-text-secondary mb-4">
                  Upload photos to document the blockage
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Upload"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                >
                  Choose Photos
                </Button>
              </div>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="mt-4 space-y-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="bg-muted flex items-center space-x-3 rounded-lg p-3"
                    >
                      <Image
                        src={photo.url}
                        alt="Preview"
                        className="h-16 w-16 rounded object-cover"
                        width={440}
                        height={440}
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Photo description (optional)"
                          value={photo.description}
                          onChange={(e) =>
                            updatePhotoDescription(photo.id, e.target.value)
                          }
                          size="sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        iconSize={16}
                        onClick={() => removePhoto(photo.id)}
                        className="text-error hover:text-error"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="border-border space-y-3 border-t pt-4">
              <Checkbox
                label="High Priority"
                description="Mark this blockage as high priority for immediate attention"
                checked={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.checked })
                }
              />

              <Checkbox
                label="Client Visible"
                description="This blockage will be visible in client reports and communications"
                checked={formData.clientVisible}
                onChange={(e) =>
                  setFormData({ ...formData, clientVisible: e.target.checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-end space-x-3 border-t p-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="default"
            iconName="AlertTriangle"
            iconPosition="left"
            iconSize={16}
            onClick={handleSubmit}
          >
            Report Blockage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBlockageModal;
