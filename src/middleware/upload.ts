import multer from "multer";
import { Request, type RequestHandler } from "express";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow images and common document types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (file.mimetype.startsWith("image/") || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Please upload an image or document (PDF, Word, Excel).") as any);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string = "image"): RequestHandler => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string = "images", maxCount: number = 10): RequestHandler => {
  return upload.array(fieldName, maxCount);
};

// Multiple fields upload middleware
export const uploadFields = (fields: multer.Field[]): RequestHandler => {
  return upload.fields(fields);
};

