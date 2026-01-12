/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Select from "@/components/rocket/components/ui/Select";
import Icon, { type IconName } from "@/components/rocket/components/AppIcon";
import { useProjectStore } from "@/store/project.store";
import { Input } from "@/components/ui/input";
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
import { BlockageType } from "@/validators/prisma-schmea.validator";
import { BlockageSeverity } from "@/validators/prisma-schmea.validator";
import { BlockageStatus } from "@/validators/prisma-schmea.validator";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  type: z.enum(BlockageType),
  category: z.string(),
  severity: z.enum(BlockageSeverity),
  status: z.enum(BlockageStatus),
  description: z.string(),
  weatherReport: z.string(),
  openDate: z.date(),
  // estimatedCloseDate: z.date(),
  photos: z.array(z.instanceof(File)),
});

const BlockageReportingStep = ({
  itemIndex,
  itemName,
}: {
  itemIndex: number;
  itemName: string;
}) => {
  const selectedProject = useProjectStore.getState().getProject();
  const {
    pushToBlockages,
    deleteBlockage,
    getSheet1Blockages,
    setBlockageResolved,
  } = useProjectStore.getState();

  const [triggerstate, setTriggerState] = useState(0);
  const blockages = getSheet1Blockages(itemIndex);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      type: "CLIENT",
      category: "",
      description: "",
      severity: "MEDIUM",
      status: "OPEN",
      weatherReport: "",
      openDate: new Date(),
      // estimatedCloseDate: new Date(),
      photos: [],
    },
  });

  useEffect(() => {
    form.reset({
      type: "CLIENT",
      category: "",
      description: "",
      severity: "MEDIUM",
      status: "OPEN",
      weatherReport: "",
      openDate: new Date(),
      // estimatedCloseDate: new Date(),
      photos: [],
    });
  }, [itemIndex, form]);

  const [isAddingBlockage, setIsAddingBlockage] = useState(false);

  const blockageTypes = [
    { value: "CLIENT", label: "Client-Side Issue" },
    { value: "INTERNAL", label: "Team-Side Issue" },
  ];

  const severityOptions = [
    { value: "LOW", label: "Low - Minor delay expected" },
    { value: "MEDIUM", label: "Medium - Moderate impact" },
    { value: "HIGH", label: "High - Critical issue" },
  ];

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

  async function handleAddBlockage(values: z.infer<typeof formSchema>) {
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
      pushToBlockages(itemIndex, {
        // @ts-ignore
        type: values.type,
        category: values.category,
        severity: values.severity,
        status: "OPEN",
        description: values.description,
        weatherReport: values.weatherReport,
        manPower: 0,
        blockageStartTime: values.openDate,
        blockagePhotos: result.map((file, index) => ({
          s3Key: file.s3Key,
          fileName: values.photos[index]?.name ?? "",
          fileType: values.photos[index]?.type ?? "",
          url: "",
        })),
      });

      setIsLoading(false);
      form.reset();
      // setUploadProgress({});
      setIsAddingBlockage(false);
    } catch (error) {
      console.error("Error creating project:", error);
      setIsLoading(false);
    }
  }

  const handleRemoveBlockage = (id: number) => {
    // TODO: Change this to the actual current sheet 1 item index
    deleteBlockage(1, id);
    toast.success(`Blockage ${id} removed successfully`);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "muted";
    }
  };

  const getTypeIcon = (type: string): IconName => {
    return type === "CLIENT" ? "Users" : "Wrench";
  };

  const getTypeColor = (type: string): string => {
    return type === "CLIENT" ? "info" : "accent";
  };

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const allowedFileTypes = {
    documents: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
    images: [".jpg", ".jpeg", ".png", ".gif"],
    drawings: [".dwg", ".dxf", ".pdf"],
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
    const allAllowedTypes = [
      ...allowedFileTypes.documents,
      ...allowedFileTypes.images,
      ...allowedFileTypes.drawings,
    ];

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

  const getFileType = (
    fileName: string,
  ): "document" | "image" | "drawing" | "other" => {
    const extension = "." + fileName.split(".").pop()?.toLowerCase();

    if (allowedFileTypes.documents.includes(extension)) return "document";
    if (allowedFileTypes.images.includes(extension)) return "image";
    if (allowedFileTypes.drawings.includes(extension)) return "drawing";

    return "other";
  };

  const getFileIcon = (
    type: string,
  ): "FileText" | "Image" | "FileImage" | "File" => {
    switch (type) {
      case "document":
        return "FileText";
      case "image":
        return "Image";
      case "drawing":
        return "FileImage";
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
          Blockage Reporting
        </h2>
        <p className="text-text-secondary mb-4">
          Report any client-side or team-side issues that may impact project
          regarding item <span className="text-xl font-bold">{itemName}</span>{" "}
          progress
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
      {!isAddingBlockage && (
        <div className="mb-6">
          <Button
            variant="default"
            onClick={() => {
              form.setValue("photos", []);
              setUploadProgress({});
              form.reset();
              setIsAddingBlockage(true);
            }}
            iconName="Plus"
            iconPosition="left"
          >
            Report New Blockage
          </Button>
        </div>
      )}

      {/* Add Blockage Form */}
      {isAddingBlockage && (
        <div className="bg-surface border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Report New Blockage
          </h3>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleAddBlockage)}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary text-sm font-medium">
                        Blockage Type <span className="text-error">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={blockageTypes}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            form.setValue("category", "");
                          }}
                          placeholder="Select type..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary text-sm font-medium">
                        Category <span className="text-error">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Category ex: Material Delivery Delay"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary text-sm font-medium">
                      Severity <span className="text-error">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        options={severityOptions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="openDate"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-text-primary block text-sm font-medium">
                        Open Date
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          className="border-border focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="estimatedCloseDate"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-text-primary block text-sm font-medium">
                        Estimated Close Date
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          className="border-border focus:ring-primary focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

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
                        placeholder="Describe the blockage in detail..."
                        rows={4}
                        className="border-border focus:ring-primary/20 focus:border-primary transition-smooth w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weatherReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary text-sm font-medium">
                      Weather Report <span className="text-error">*</span>
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="Describe the weather conditions in detail..."
                        rows={4}
                        className="border-border focus:ring-primary/20 focus:border-primary transition-smooth w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                        required
                      />
                    </FormControl>
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
                            id={`file-upload-1-${blockages?.length}`}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
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
                                  `file-upload-1-${blockages?.length}`,
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
                  disabled={
                    !form.watch("type") ||
                    !form.watch("category") ||
                    !form.watch("description")?.trim()
                  }
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Blockage
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingBlockage(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Existing Blockages */}
      {blockages?.filter((blockage) => blockage.status === "OPEN").length &&
      blockages?.filter((blockage) => blockage.status === "OPEN").length >
        0 ? (
        <div className="bg-surface border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text-primary mb-4 text-lg font-semibold">
            Reported Blockages (
            {
              blockages?.filter((blockage) => blockage.status === "OPEN")
                .length
            }
            )
          </h3>

          <div className="space-y-4">
            {blockages?.map((blockage, index) => (
              <div
                key={index}
                className={cn(
                  "border-border rounded-lg border p-4",
                  blockage.status === "CLOSED" && "hidden",
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-10 w-10 rounded-full bg-${getTypeColor(blockage.type)}/10 flex items-center justify-center`}
                    >
                      <Icon
                        name={blockage.type === "CLIENT" ? "User" : "Wrench"}
                        size={20}
                        color={`var(--color-${blockage.type === "CLIENT" ? "primary" : "secondary"})`}
                      />
                    </div>
                    <div>
                      <h4 className="text-text-primary font-medium">
                        {blockage.category
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      <div className="text-text-secondary flex items-center space-x-2 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs bg-${getTypeColor(blockage.type)}/10 text-${getTypeColor(blockage.type)}`}
                        >
                          {blockage.type
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs bg-${getSeverityColor(blockage.severity)}/10 text-${getSeverityColor(blockage.severity)}`}
                        >
                          {blockage.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setBlockageResolved(itemIndex, index);
                        setTriggerState((prev) => prev + 1);
                      }}
                      className="text-text-secondary hover:text-error transition-smooth"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveBlockage(index)}
                      className="text-text-secondary hover:text-error transition-smooth"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-text-secondary mb-3">
                  {blockage.description}
                </p>

                {blockage.blockagePhotos &&
                  blockage.blockagePhotos.length > 0 && (
                    <div className="mb-2 flex items-center space-x-2">
                      <Icon
                        name="Camera"
                        size={14}
                        color="var(--color-text-secondary)"
                      />
                      <span className="text-text-secondary text-sm">
                        {blockage.blockagePhotos.length} photo(s) attached
                      </span>
                    </div>
                  )}

                <div className="text-text-secondary flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>
                      Reported:{" "}
                      {new Date(blockage.blockageStartTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="AlertCircle" size={12} />
                    <span>Status: {blockage.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* No Blockages Message */}
      {blockages?.filter((blockage) => blockage.status === "OPEN").length ===
        0 &&
        !isAddingBlockage && (
          <div className="py-8 text-center">
            <div className="bg-success/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <Icon name="CheckCircle" size={32} color="var(--color-success)" />
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-semibold">
              No Blockages Reported
            </h3>
            <p className="text-text-secondary">
              Great! No issues are blocking project progress at this time.
            </p>
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

export default BlockageReportingStep;
