// import React, { useState } from "react";
// import Icon from "@/components/rocket/components/AppIcon";
// import Button from "@/components/rocket/components/ui/Button";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import type { UseFormReturn } from "react-hook-form";
// import type { FormData } from "./ItemForm";

// interface DocumentUploadProps {
//   form: UseFormReturn<FormData>;
// }

// const DocumentUpload: React.FC<DocumentUploadProps> = ({ form }) => {
//   const [dragActive, setDragActive] = useState<boolean>(false);
//   const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
//     {},
//   );

//   const allowedFileTypes = {
//     documents: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
//     images: [".jpg", ".jpeg", ".png", ".gif"],
//     drawings: [".dwg", ".dxf", ".pdf"],
//   };

//   const maxFileSize = 10 * 1024 * 1024; // 10MB

//   // Watch the current files
//   const currentFiles = form.watch("progressDocuments") ?? [];

//   const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer?.files?.[0]) {
//       handleFiles(e.dataTransfer.files);
//     }
//   };

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       handleFiles(e.target.files);
//     }
//   };

//   const handleFiles = (files: FileList) => {
//     const validFiles: File[] = [];

//     Array.from(files).forEach((file) => {
//       if (validateFile(file)) {
//         validFiles.push(file);
//         simulateUpload(file);
//       }
//     });

//     if (validFiles.length > 0) {
//       const updatedFiles = [...currentFiles, ...validFiles];
//       form.setValue("progressDocuments", updatedFiles);
//     }
//   };

//   const validateFile = (file: File): boolean => {
//     // Check file size
//     if (file.size > maxFileSize) {
//       alert(`File ${file.name} is too large. Maximum size is 10MB.`);
//       return false;
//     }

//     // Check file type
//     const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
//     const allAllowedTypes = [
//       ...allowedFileTypes.documents,
//       ...allowedFileTypes.images,
//       ...allowedFileTypes.drawings,
//     ];

//     if (!fileExtension || !allAllowedTypes.includes(fileExtension)) {
//       alert(`File type ${fileExtension} is not allowed.`);
//       return false;
//     }

//     return true;
//   };

//   const simulateUpload = (file: File) => {
//     const fileKey = `${file.name}-${file.size}`;

//     // Start upload simulation
//     setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

//     const interval = setInterval(() => {
//       setUploadProgress((prev) => {
//         const currentProgress = prev[fileKey] ?? 0;
//         const newProgress = currentProgress + Math.random() * 30;

//         if (newProgress >= 100) {
//           clearInterval(interval);

//           // Remove from progress
//           setUploadProgress((prev) => {
//             const updated = { ...prev };
//             delete updated[fileKey];
//             return updated;
//           });

//           return { ...prev, [fileKey]: 100 };
//         }

//         return { ...prev, [fileKey]: newProgress };
//       });
//     }, 200);
//   };

//   const getFileType = (
//     fileName: string,
//   ): "document" | "image" | "drawing" | "other" => {
//     const extension = "." + fileName.split(".").pop()?.toLowerCase();

//     if (allowedFileTypes.documents.includes(extension)) return "document";
//     if (allowedFileTypes.images.includes(extension)) return "image";
//     if (allowedFileTypes.drawings.includes(extension)) return "drawing";

//     return "other";
//   };

//   const getFileIcon = (
//     type: string,
//   ): "FileText" | "Image" | "FileImage" | "File" => {
//     switch (type) {
//       case "document":
//         return "FileText";
//       case "image":
//         return "Image";
//       case "drawing":
//         return "FileImage";
//       default:
//         return "File";
//     }
//   };

//   const formatFileSize = (bytes: number): string => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const removeFile = (fileIndex: number) => {
//     const updatedFiles = currentFiles.filter(
//       (_: File, index: number) => index !== fileIndex,
//     );
//     form.setValue("progressDocuments", updatedFiles);
//   };

//   return (
//     <div className="bg-surface border-border rounded-lg border p-4">
//       <div className="mb-4 flex items-center space-x-3">
//         <Icon name="Upload" size={20} color="var(--color-primary)" />
//         <h3 className="text-text-primary text-lg font-semibold">
//           Progress Documents
//         </h3>
//       </div>

//       <FormField
//         control={form.control}
//         name="progressDocuments"
//         render={({ field }) => (
//           <FormItem>
//             <FormControl>
//               <div>
//                 {/* Upload Zone */}
//                 <div
//                   className={`transition-smooth rounded-lg border-2 border-dashed p-6 text-center ${
//                     dragActive
//                       ? "border-primary bg-primary/5"
//                       : "border-border hover:border-primary/50"
//                   }`}
//                   onDragEnter={handleDrag}
//                   onDragLeave={handleDrag}
//                   onDragOver={handleDrag}
//                   onDrop={handleDrop}
//                 >
//                   <Icon
//                     name="CloudUpload"
//                     size={48}
//                     color="var(--color-text-secondary)"
//                     className="mx-auto mb-3"
//                   />
//                   <h4 className="text-text-primary mb-2 text-lg font-medium">
//                     Drop files here or click to browse
//                   </h4>
//                   <p className="text-text-secondary mb-4 text-sm">
//                     Support for PDF, DOC, XLS, Images files up to 10MB
//                   </p>

//                   <input
//                     type="file"
//                     multiple
//                     onChange={handleFileInput}
//                     className="hidden"
//                     id={`file-upload-${form.watch("itemIndex")}`}
//                     accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
//                   />

//                   <Button
//                     variant="outline"
//                     size="sm"
//                     iconName="Plus"
//                     type="button"
//                     iconPosition="left"
//                     onClick={() =>
//                       document
//                         .getElementById(
//                           `file-upload-${form.watch("itemIndex")}`,
//                         )
//                         ?.click()
//                     }
//                   >
//                     Select Files
//                   </Button>
//                 </div>

//                 {/* Upload Progress */}
//                 {Object.keys(uploadProgress).length > 0 && (
//                   <div className="mt-4 space-y-2">
//                     <h4 className="text-text-primary text-sm font-semibold">
//                       Uploading...
//                     </h4>
//                     {Object.entries(uploadProgress).map(
//                       ([fileKey, progress]) => (
//                         <div key={fileKey} className="bg-muted rounded-md p-3">
//                           <div className="mb-2 flex items-center justify-between">
//                             <span className="text-text-primary text-sm">
//                               Uploading {fileKey.split("-")[0]}...
//                             </span>
//                             <span className="text-text-secondary text-sm">
//                               {Math.round(progress)}%
//                             </span>
//                           </div>
//                           <div className="bg-border h-2 w-full rounded-full">
//                             <div
//                               className="bg-primary h-2 rounded-full transition-all duration-300"
//                               style={{ width: `${progress}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       ),
//                     )}
//                   </div>
//                 )}

//                 {/* Uploaded Files */}
//                 {currentFiles.length > 0 && (
//                   <div className="mt-4 space-y-2">
//                     <h4 className="text-text-primary text-sm font-semibold">
//                       Uploaded Files ({currentFiles.length})
//                     </h4>

//                     {currentFiles.map((file: File, index: number) => (
//                       <div
//                         key={`${file.name}-${index}`}
//                         className="bg-muted flex items-center space-x-3 rounded-md p-3"
//                       >
//                         <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
//                           <Icon
//                             name={getFileIcon(getFileType(file.name))}
//                             size={16}
//                             color="var(--color-primary)"
//                           />
//                         </div>

//                         <div className="min-w-0 flex-1">
//                           <div className="text-text-primary truncate text-sm font-medium">
//                             {file.name}
//                           </div>
//                           <div className="text-text-secondary text-xs">
//                             {formatFileSize(file.size)} • Uploaded{" "}
//                             {new Date().toLocaleTimeString()}
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             iconName="Eye"
//                             type="button"
//                             onClick={() => {
//                               const url = URL.createObjectURL(file);
//                               window.open(url, "_blank");
//                             }}
//                           />
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             iconName="Trash2"
//                             onClick={() => removeFile(index)}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//   );
// };

// export default DocumentUpload;
