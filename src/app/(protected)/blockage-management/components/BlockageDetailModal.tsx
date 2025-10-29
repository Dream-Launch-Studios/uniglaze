import React, { useState } from "react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import Input from "@/components/rocket/components/ui/Input";
import Select from "@/components/rocket/components/ui/Select";
import { Checkbox } from "@/components/rocket/components/ui/Checkbox";
import Image from "@/components/rocket/components/AppImage";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Type definitions
interface BlockagePhoto {
  url: string;
  description?: string;
  timestamp: Date;
}

interface BlockageTimelineEvent {
  action: string;
  description: string;
  timestamp: Date;
}

interface BlockageComment {
  id: number;
  author: string;
  customRole: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
}

interface BlockageData {
  id?: string;
  title: string;
  description: string;
  status: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  project: string;
  location: string;
  assignedTo: string;
  expectedResolution?: string;
  clientVisible?: boolean;
  createdAt: Date;
  photos?: BlockagePhoto[];
  timeline?: BlockageTimelineEvent[];
}

interface BlockageDetailModalProps {
  blockage: BlockageData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: BlockageData) => void;
}

type TabType = "details" | "photos" | "timeline" | "comments";

interface SelectOption {
  value: string;
  label: string;
}

const BlockageDetailModal: React.FC<BlockageDetailModalProps> = ({
  blockage,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<BlockageData>(
    blockage ?? ({} as BlockageData),
  );
  const [newComment, setNewComment] = useState<string>("");

  if (!isOpen || !blockage) return null;

  const statusOptions: SelectOption[] = [
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "pending-approval", label: "Pending Approval" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const severityOptions: SelectOption[] = [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const categoryOptions: SelectOption[] = [
    { value: "client", label: "Client-side Issues" },
    { value: "internal", label: "Internal Issues" },
    { value: "supplier", label: "Supplier Issues" },
    { value: "weather", label: "Weather Related" },
  ];

  const mockComments: BlockageComment[] = [
    {
      id: 1,
      author: "Rajesh Kumar",
      customRole: "Project Manager",
      content:
        "Initial assessment completed. Waiting for client approval to proceed with alternative solution.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isInternal: false,
    },
    {
      id: 2,
      author: "Vamsi Reddy",
      customRole: "Head Of Planning",
      content:
        "Internal note: Consider escalating to MD if client doesn't respond by tomorrow.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isInternal: true,
    },
  ];

  const handleSave = (): void => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleAddComment = (): void => {
    if (newComment.trim()) {
      // In real app, this would make an API call
      // console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "text-error bg-error/10 border-error/20";
      case "high":
        return "text-warning bg-warning/10 border-warning/20";
      case "medium":
        return "text-accent bg-accent/10 border-accent/20";
      case "low":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-text-secondary bg-muted border-border";
    }
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface elevation-3 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-lg p-2 ${getSeverityColor(blockage.severity)}`}
            >
              <Icon name="AlertTriangle" size={20} />
            </div>
            <div>
              <h2 className="text-text-primary text-xl font-semibold">
                {isEditing ? "Edit Blockage" : blockage.title}
              </h2>
              <p className="text-text-secondary text-sm">
                {blockage.project} • {blockage.location}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                iconSize={16}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconSize={20}
              onClick={onClose}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border flex border-b">
          {(["details", "photos", "timeline", "comments"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-smooth px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? "text-primary border-primary bg-primary/5 border-b-2"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === "details" && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label className="mb-2">Title</Label>
                    <Input
                      value={editData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Status</Label>
                    <Select
                      options={statusOptions}
                      value={editData.status}
                      onChange={(value: string) =>
                        setEditData({ ...editData, status: value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Severity</Label>
                    <Select
                      options={severityOptions}
                      value={editData.severity}
                      onChange={(value: string) =>
                        setEditData({
                          ...editData,
                          severity: value as BlockageData["severity"],
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Category</Label>
                    <Select
                      options={categoryOptions}
                      value={editData.category}
                      onChange={(value: string) =>
                        setEditData({ ...editData, category: value })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="mb-2">Description</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Assigned To</Label>
                    <Input
                      value={editData.assignedTo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditData({ ...editData, assignedTo: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Expected Resolution Date</Label>
                    <Input
                      type="date"
                      value={editData.expectedResolution ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditData({
                          ...editData,
                          expectedResolution: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Checkbox
                      label="Client Visible"
                      description="This blockage will be visible in client reports"
                      checked={editData.clientVisible ?? false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditData({
                          ...editData,
                          clientVisible: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Description
                    </h3>
                    <p className="text-text-primary">{blockage.description}</p>
                  </div>

                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Status
                    </h3>
                    <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-sm font-medium">
                      {blockage.status
                        .replace("-", " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Severity
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(blockage.severity)}`}
                    >
                      {blockage.severity.charAt(0).toUpperCase() +
                        blockage.severity.slice(1)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Category
                    </h3>
                    <p className="text-text-primary">{blockage.category}</p>
                  </div>

                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Assigned To
                    </h3>
                    <p className="text-text-primary">{blockage.assignedTo}</p>
                  </div>

                  <div>
                    <h3 className="text-text-secondary mb-2 text-sm font-medium">
                      Created Date
                    </h3>
                    <p className="text-text-primary">
                      {formatTimestamp(blockage.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-text-primary text-lg font-medium">
                  Photo Documentation
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Camera"
                  iconPosition="left"
                  iconSize={16}
                >
                  Add Photos
                </Button>
              </div>

              {blockage.photos && blockage.photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {blockage.photos.map(
                    (photo: BlockagePhoto, index: number) => (
                      <div
                        key={index}
                        className="bg-card border-border overflow-hidden rounded-lg border"
                      >
                        <div className="aspect-video">
                          <Image
                            src={photo.url}
                            alt={photo.description ?? `Photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-text-primary mb-1 text-sm">
                            {photo.description}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {formatTimestamp(photo.timestamp)}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Icon
                    name="Camera"
                    size={48}
                    className="text-text-secondary mx-auto mb-4"
                  />
                  <p className="text-text-secondary">No photos uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h3 className="text-text-primary text-lg font-medium">
                Resolution Timeline
              </h3>

              <div className="space-y-4">
                {blockage.timeline?.map(
                  (event: BlockageTimelineEvent, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <Icon name="Clock" size={16} color="white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-text-primary font-medium">
                          {event.action}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {event.description}
                        </p>
                        <p className="text-text-secondary mt-1 text-xs">
                          {formatTimestamp(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ),
                ) ?? (
                  <p className="text-text-secondary">
                    No timeline events recorded
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <h3 className="text-text-primary text-lg font-medium">
                Communication Thread
              </h3>

              {/* Add Comment */}
              <div className="bg-muted rounded-lg p-4">
                <Label className="mb-2">Add Comment</Label>
                <Textarea
                  placeholder="Type your comment here..."
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewComment(e.target.value)
                  }
                  rows={3}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <Checkbox
                    label="Internal comment (not visible to client)"
                    onChange={() => {
                      // Handle internal comment toggle
                    }}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Send"
                    iconPosition="left"
                    iconSize={16}
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map((comment: BlockageComment) => (
                  <div
                    key={comment.id}
                    className="bg-card border-border rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                          <Icon name="User" size={16} color="white" />
                        </div>
                        <div>
                          <p className="text-text-primary font-medium">
                            {comment.author}
                          </p>
                          <p className="text-text-secondary text-xs">
                            {comment.customRole}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {comment.isInternal && (
                          <span className="bg-warning/10 text-warning rounded-full px-2 py-1 text-xs font-medium">
                            Internal
                          </span>
                        )}
                        <span className="text-text-secondary text-xs">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-primary">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="border-border flex items-center justify-end space-x-3 border-t p-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockageDetailModal;
