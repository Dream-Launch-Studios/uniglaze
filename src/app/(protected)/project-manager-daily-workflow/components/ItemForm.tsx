/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useProjectStore } from "@/store/project.store";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import Icon from "@/components/rocket/components/AppIcon";
import Button from "@/components/rocket/components/ui/Button";
import BlockageReportingStep from "./BlockageReportingStep";
import ProgressReport from "./ProgressReport";

const ItemForm = ({
  itemIndex,
  setItemIndex,
  onNext,
  onPrevious,
}: {
  itemIndex: number;
  setItemIndex: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const {
    setYesterdayProgressReportOfSubItem,
    getSheet1,
    getSheet2,
    getSheet1Length,
  } = useProjectStore.getState();

  const sheet1 = getSheet1();
  const sheet2 = getSheet2(itemIndex);
  // const totalNumOfSubItemsInSheet1 = getTotalNumOfSubItemsInSheet1(itemIndex);

  const formSchema = z.object(
    Object.fromEntries(
      (sheet2 ?? []).flatMap((subItem, i) => {
        const totalQuantity = subItem.totalQuantity ?? 0;
        const currentSupplied = subItem.totalSupplied ?? 0;
        const currentInstalled = subItem.totalInstalled ?? 0;

        const remainingSupply = Math.max(0, totalQuantity - currentSupplied);
        const remainingInstall = Math.max(0, totalQuantity - currentInstalled);

        return [
          [
            `suppliedYesterday${i}`,
            z.coerce
              .number()
              .min(0, "Supplied yesterday cannot be negative")
              .max(
                remainingSupply,
                `Supplied yesterday + current supplied cannot exceed total (${remainingSupply} remaining)`,
              ),
          ],
          [
            `installedYesterday${i}`,
            z.coerce
              .number()
              .min(0, "Installed yesterday cannot be negative")
              .max(
                remainingInstall,
                `Installed yesterday + current installed cannot exceed total (${remainingInstall} remaining)`,
    ),
          ],
        ];
      }),
    ) as Record<string, z.ZodTypeAny>,
  );

  const getDefaultValuesForItem = (itemIndex: number) => ({
    ...Object.fromEntries(
      Array.from({ length: sheet2?.length ?? 0 }, (_, i) => [
        [`suppliedYesterday${i}`, 0],
        [`installedYesterday${i}`, 0],
      ]).flat(),
    ),
  });

  type ItemFormData = z.infer<typeof formSchema>;

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: getDefaultValuesForItem(itemIndex),
  });

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

  async function onSubmit(values: ItemFormData) {
    try {
      setIsLoading(true);

      for (let i = 0; i < sheet2.length; i++) {
        setYesterdayProgressReportOfSubItem(itemIndex, i, {
          yesterdaySupplied: +(values as any)[`suppliedYesterday${i}`],
          yesterdayInstalled: +(values as any)[`installedYesterday${i}`],
        });
      }

      toast.success("Yesterday's progress saved locally");

      setIsLoading(false);

      if (itemIndex + 1 < getSheet1Length()) {
        setItemIndex(itemIndex + 1);
        form.reset(getDefaultValuesForItem(itemIndex + 1));
      }

      if (itemIndex + 1 === getSheet1Length()) {
        onNext();
      }
      form.reset();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to save progress. Please try again.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    form.reset(getDefaultValuesForItem(itemIndex));
  }, [itemIndex, form]);

  return (
    <div className="bg-surface relative h-full pb-26">
      <div className="mb-4">
        <h3 className="text-text-primary mb-2 text-xl font-semibold">
          {sheet1?.[itemIndex]?.itemName}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-text-secondary">Total Quantity:</span>
            <p className="text-text-primary font-medium">
              {sheet1?.[itemIndex]?.totalQuantity?.toLocaleString()}{" "}
              {sheet1?.[itemIndex]?.unit}
            </p>
          </div>
          <div>
            <span className="text-text-secondary">Current Supplied:</span>
            <p className="text-text-primary font-medium">
              {sheet1?.[itemIndex]?.totalSupplied?.toLocaleString() ?? 0}{" "}
              {sheet1?.[itemIndex]?.unit}
            </p>
          </div>
          <div>
            <span className="text-text-secondary">Current Installed:</span>
            <p className="text-text-primary font-medium">
              {sheet1?.[itemIndex]?.totalInstalled?.toLocaleString() ?? 0}{" "}
              {sheet1?.[itemIndex]?.unit}
            </p>
          </div>
          <div>
            <span className="text-text-secondary">Unit:</span>
            <p className="text-text-primary font-medium">
              {sheet1?.[itemIndex]?.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Input Fields */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Validation errors:", errors);
          })}
          key={itemIndex}
        >
          <div className="">
            <div className="grid grid-cols-1 gap-y-6">
              {sheet2?.map((subItem, index) => (
                <div
                  key={index}
                  className="border-border rounded-xl border p-6"
                >
                  <p className="text-text-primary mb-2 text-lg font-bold">
                    {subItem?.subItemName}
                  </p>
                  <div className="mb-2 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-text-secondary">
                        Total Quantity:
                      </span>
                      <p className="text-text-primary font-medium">
                        {subItem?.totalQuantity?.toLocaleString()}{" "}
                        {subItem?.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">
                        Current Supplied:
                      </span>
                      <p className="text-text-primary font-medium">
                        {subItem?.totalSupplied?.toLocaleString() ?? 0}{" "}
                        {subItem?.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">
                        Current Installed:
                      </span>
                      <p className="text-text-primary font-medium">
                        {subItem?.totalInstalled?.toLocaleString() ?? 0}{" "}
                        {subItem?.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Unit:</span>
                      <p className="text-text-primary font-medium">
                        {subItem?.unit}
                      </p>
                    </div>
                  </div>
                  <p className="text-text-secondary mb-2 text-xs">
                    Whole numbers only. Cannot exceed total quantity for this item.
                  </p>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`suppliedYesterday${index}` as any}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-text-primary block text-sm font-medium">
                            Supplied Yesterday ({subItem?.unit})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter quantity supplied yesterday"
                              {...(field as any)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`installedYesterday${index}` as any}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-text-primary block text-sm font-medium">
                            Installed Yesterday ({subItem?.unit})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Enter quantity installed yesterday"
                              {...(field as any)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="border-border mt-6 rounded-xl border p-6">
            <h3 className="text-text-primary mb-2 text-xl font-bold">
              Progress Photos Upload for &quot;
              {sheet1?.[itemIndex]?.itemName}&quot;
            </h3>
            <FormField
              control={form.control}
              name="progressDescription"
              render={({ field }) => (
                <FormItem className="mb-6 space-y-2">
                  <FormLabel className="text-text-primary block text-sm font-medium">
                    Progress Description
                    <span className="ml-1 text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description of the progress"
                      {...(field as any)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DocumentUpload form={form} />
          </div> */}

          {/* Action Buttons */}
          <div className="absolute right-0 bottom-0 left-0">
            {itemIndex + 1 === getSheet1Length() ? (
              <div className="border-border mt-8 flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onPrevious}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Back to Project Selection
                </Button>

                <div className="flex space-x-3">
                  <Button
                    variant="default"
                    size="lg"
                    type="submit"
                    iconName="ArrowRight"
                    iconPosition="right"
                    loading={isLoading}
                  >
                    Continue to Final Preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-border mt-8 flex justify-end border-t pt-6">
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  iconName="ArrowRight"
                  iconPosition="right"
                  loading={isLoading}
                >
                  Continue to Next Item
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>

      <ProgressReport
        itemIndex={itemIndex}
        itemName={sheet1?.[itemIndex]?.itemName ?? ""}
      />

      <BlockageReportingStep
        itemIndex={itemIndex}
        itemName={sheet1?.[itemIndex]?.itemName ?? ""}
      />
    </div>
  );
};

const DocumentUpload = ({ form }: { form: any }) => {
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
  const currentFiles = (form.watch("progressDocuments") ?? []) as File[];

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

    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
        simulateUpload(file);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...currentFiles, ...validFiles];
      form.setValue("progressDocuments", updatedFiles);
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
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[fileKey];
            return updated;
          });

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
    form.setValue("progressDocuments", updatedFiles);
  };

  return (
    <div className="bg-surface border-border rounded-lg border p-4">
      <div className="mb-4 flex items-center space-x-3">
        <Icon name="Upload" size={20} color="var(--color-primary)" />
        <h3 className="text-text-primary text-lg font-semibold">
          Progress Documents
        </h3>
      </div>

      <FormField
        control={form.control}
        name={"progressDocuments" as any}
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
                    Drop files here or click to browse
                  </h4>
                  <p className="text-text-secondary mb-4 text-sm">
                    Support for PDF, DOC, XLS, Images files up to 10MB
                  </p>

                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id={`file-upload-${form.watch("itemIndex") ?? 0}`}
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
                          `file-upload-${form.watch("itemIndex") ?? 0}`,
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
                        <div key={fileKey} className="bg-muted rounded-md p-3">
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
    </div>
  );
};

export default ItemForm;
