/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import { useProjectStore } from "@/store/project.store";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";

const formSchema = z.object({
  description: z.string(),
  photos: z.array(z.instanceof(File)),
});

const ProgressReport = ({
  itemIndex,
  itemName,
}: {
  itemIndex: number;
  itemName: string;
}) => {
  const selectedProject = useProjectStore.getState().getProject();
  const { pushToProgressPhotos, deleteProgressPhotos, getProgressPhotos } =
    useProjectStore.getState();
  const progressPhotos = getProgressPhotos(itemIndex);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      description: "",
      photos: [],
    },
  });

  useEffect(() => {
    form.reset({
      description: "",
      photos: [],
    });
  }, [itemIndex, form]);

  const [isAddingProgressReport, setIsAddingProgressReport] = useState(false);

  const { mutateAsync: getSignedUrl } = api.AWSs3.getSignedUrl.useMutation({
    onSuccess: (data) => {
      toast.success("Signed URL fetched successfully");
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function handleAddProgressReport(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // save the files to AWS S3
      const result = await getSignedUrl({
        files: values.photos.map((file) => ({
          filename: file.name,
          contentType: file.type,
          folderName: "blockage-photos",
        })),
      });

      await Promise.all(
        values.photos.map((file, i) =>
          fetch(result[i]!.uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          }),
        ),
      );

      // TODO: Change this to the actual current sheet 1 item index
      pushToProgressPhotos(itemIndex, {
        // @ts-ignore
        description: values.description,
        photos: result.map((file, index) => ({
          s3Key: file.s3Key,
          fileName: values.photos[index]?.name ?? "",
          fileType: values.photos[index]?.type ?? "",
          url: "",
        })),
      });

      setIsLoading(false);
      form.reset();
      // setUploadProgress({});
      setIsAddingProgressReport(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to save progress report. Check that all required fields are filled correctly and try again. If the problem continues, contact support.");
      setIsLoading(false);
    }
  }

  const handleRemoveProgressReport = (id: number) => {
    // TODO: Change this to the actual current sheet 1 item index
    deleteProgressPhotos(1, id);
    toast.success(`Progress Photo ${id} removed successfully`);
  };

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const allowedFileTypes = {
    images: [".jpg", ".jpeg", ".png", ".gif"],
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Watch the current files
  const currentFiles = form.watch("photos") ?? [];

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

    if (e.dataTransfer?.files?.[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];

    Array.from(files)
      .slice(0, 1)
      .forEach((file) => {
        if (validateFile(file)) {
          validFiles.push(file);
          simulateUpload(file);
        }
      });

    if (validFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...validFiles];
      form.setValue("photos", updatedFiles);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const allAllowedTypes = [...allowedFileTypes.images];

    if (!fileExtension || !allAllowedTypes.includes(fileExtension)) {
      alert(`File type ${fileExtension} is not allowed.`);
      return false;
    }

    return true;
  };

  const simulateUpload = (file: File) => {
    const fileKey = `${file.name}-${file.size}`;

    // Start upload simulation
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[fileKey] ?? 0;
        const newProgress = currentProgress + Math.random() * 30;

        if (newProgress >= 100) {
          clearInterval(interval);

          // Remove from progress
          setTimeout(() => {
            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[fileKey];
              return updated;
            });
          }, 500);

          return { ...prev, [fileKey]: 100 };
        }

        return { ...prev, [fileKey]: newProgress };
      });
    }, 200);
  };

  const getFileType = (fileName: string): "image" | "other" => {
    const extension = "." + fileName.split(".").pop()?.toLowerCase();

    if (allowedFileTypes.images.includes(extension)) return "image";

    return "other";
  };

  const getFileIcon = (type: string): "Image" | "File" => {
    switch (type) {
      case "image":
        return "Image";
      default:
        return "File";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (fileIndex: number) => {
    const updatedFiles = currentFiles.filter(
      (_: File, index: number) => index !== fileIndex,
    );
    form.setValue("photos", updatedFiles);
  };

  if (!selectedProject) {
    return (
      <div className="p-6 text-center">
        <Icon name="AlertCircle" size={48} color="var(--color-error)" />
        <p className="text-text-secondary mt-4">No project selected</p>
      </div>
    );
  }

  return (
    <div className="border-border mt-6 rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-text-primary mb-2 text-2xl font-bold">
          Progress Photos
        </h2>
        <p className="text-text-secondary mb-4">
          Report any progress of project regarding item{" "}
          <span className="text-xl font-bold">{itemName}</span> Main Task
        </p>

        {/* <div className="bg-info/10 border-info/20 rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-info)" />
            <p className="text-info text-sm">
              <span className="font-medium">Project:</span>{" "}
              {selectedProject.latestProjectVersion?.projectName} -{" "}
              {selectedProject.latestProjectVersion?.client?.clientName}
            </p>
          </div>
        </div> */}
      </div>

      {/* Add New Blockage Button */}
      {!isAddingProgressReport && (
        <div className="mb-6">
          <Button
            variant="default"
            onClick={() => {
              form.setValue("photos", []);
              setUploadProgress({});
              form.reset();
              setIsAddingProgressReport(true);
            }}
            iconName="Plus"
            iconPosition="left"
          >
            Report New Progress
          </Button>
        </div>
      )}

      {/* Add Blockage Form */}
      {isAddingProgressReport && (
        <div className="bg-surface border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Report New Progress
          </h3>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleAddProgressReport)}
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary text-sm font-medium">
                      Description <span className="text-error">*</span>
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="Describe the progress in detail..."
                        rows={4}
                        className="border-border focus:ring-primary/20 focus:border-primary transition-smooth w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                        required
                      />
                    </FormControl>
                    <p className="text-text-secondary mt-1 text-xs">
                      Be specific so reviewers understand what was done.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                        {/* Upload Zone */}
                        <div
                          className={`transition-smooth rounded-lg border-2 border-dashed p-6 text-center ${
                            dragActive
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <Icon
                            name="CloudUpload"
                            size={48}
                            color="var(--color-text-secondary)"
                            className="mx-auto mb-3"
                          />
                          <h4 className="text-text-primary mb-2 text-lg font-medium">
                            Drop Single file here or click to browse
                          </h4>
                          <p className="text-text-secondary mb-4 text-sm">
                            Support for Images files up to 10MB
                          </p>

                          <input
                            type="file"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                            id={`file-upload-1-${progressPhotos?.length}`}
                            accept=".jpg,.jpeg,.png,.gif"
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Plus"
                            type="button"
                            iconPosition="left"
                            onClick={() =>
                              document
                                .getElementById(
                                  `file-upload-1-${progressPhotos?.length}`,
                                )
                                ?.click()
                            }
                          >
                            Select Files
                          </Button>
                        </div>

                        {/* Upload Progress */}
                        {Object.keys(uploadProgress).length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-text-primary text-sm font-semibold">
                              Uploading...
                            </h4>
                            {Object.entries(uploadProgress).map(
                              ([fileKey, progress]) => (
                                <div
                                  key={fileKey}
                                  className="bg-muted rounded-md p-3"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-text-primary text-sm">
                                      Uploading {fileKey.split("-")[0]}...
                                    </span>
                                    <span className="text-text-secondary text-sm">
                                      {Math.round(progress)}%
                                    </span>
                                  </div>
                                  <div className="bg-border h-2 w-full rounded-full">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {/* Uploaded Files */}
                        {currentFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-text-primary text-sm font-semibold">
                              Uploaded Files ({currentFiles.length})
                            </h4>

                            {currentFiles.map((file: File, index: number) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="bg-muted flex items-center space-x-3 rounded-md p-3"
                              >
                                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                                  <Icon
                                    name={getFileIcon(getFileType(file.name))}
                                    size={16}
                                    color="var(--color-primary)"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="text-text-primary truncate text-sm font-medium">
                                    {file.name}
                                  </div>
                                  <div className="text-text-secondary text-xs">
                                    {formatFileSize(file.size)} • Uploaded{" "}
                                    {new Date().toLocaleTimeString()}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    iconName="Eye"
                                    type="button"
                                    onClick={() => {
                                      const url = URL.createObjectURL(file);
                                      window.open(url, "_blank");
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    iconName="Trash2"
                                    onClick={() => removeFile(index)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="default"
                  type="submit"
                  disabled={!form.watch("description")?.trim()}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Progress
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingProgressReport(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Existing Blockages */}
      {progressPhotos?.length && progressPhotos?.length > 0 ? (
        <div className="bg-surface border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Reported Progress ({progressPhotos?.length})
          </h3>

          <div className="space-y-4">
            {progressPhotos?.map((progressPhoto, index) => (
              <div key={index} className="border-border rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="text-text-primary font-medium">
                        {progressPhoto.description
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      <div className="text-text-secondary flex items-center space-x-2 text-sm">
                        {progressPhoto.photos.length} photo(s) attached
                      </div>
                    </div>
                  </div>
                  {/* <button
                    onClick={() => handleRemoveProgressReport(index)}
                    className="text-text-secondary hover:text-error transition-smooth"
                  >
                    <Icon name="Trash2" size={16} />
                  </button> */}
                </div>

                <p className="text-text-secondary mb-3">
                  {progressPhoto.description}
                </p>

                {progressPhoto.photos && progressPhoto.photos.length > 0 && (
                  <div className="mb-2 flex items-center space-x-2">
                    <Icon
                      name="Camera"
                      size={14}
                      color="var(--color-text-secondary)"
                    />
                    <span className="text-text-secondary text-sm">
                      {progressPhoto.photos.length} photo(s) attached
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* No Blockages Message */}
      {progressPhotos?.length === 0 && !isAddingProgressReport && (
        <div className="py-8 text-center">
          <div className="bg-success/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <Icon name="CheckCircle" size={32} color="var(--color-success)" />
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            No Progress Photos Reported
          </h3>
        </div>
      )}

      {/* Action Buttons */}
      {/* <div className="border-border mt-8 flex justify-between border-t pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Progress Documentation
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Final Review
        </Button>
      </div> */}
    </div>
  );
};

export default ProgressReport;
