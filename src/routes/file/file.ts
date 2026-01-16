import { Router } from "express";
import { FileController } from "@/controllers/file/file.controller";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import multerMiddleware from "@/middlewares/MulterMiddleware";
import type { Routes } from "@/types/routes.interface";

export class FileRoute implements Routes {
  public path = "/files";
  public router = Router();
  public file = new FileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Upload file using multipart/form-data
    this.router.post(`${this.path}/uploadFile`, multerMiddleware, this.file.uploadMediaToS3);

    // Get signed URL for direct S3 upload
    this.router.post(`${this.path}/upload-signed-url`, this.file.getUploadSignedUrl);

    // Get signed URL for downloading/viewing files
    this.router.post(`${this.path}/download-signed-url`, this.file.getDownloadSignedUrl);
  }
}
