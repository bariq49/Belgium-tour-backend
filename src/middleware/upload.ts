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
  // Accept only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
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

