import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import { Container } from "typedi";
import { promisify } from "util";
import { FILE_UPLOAD_SERVICE_TOKEN } from "@/interfaces/file-upload/file-upload.service.interface";
import type { IFIleURL, RequestWithFile } from "@/types/file";
import type { CustomResponse } from "@/types/response.interface";

export class FileController {
  private fileUploadService;

  constructor() {
    this.fileUploadService = Container.get(FILE_UPLOAD_SERVICE_TOKEN);
  }

  public uploadMediaToS3 = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const unlinkAsync = promisify(fs.unlink);
    try {
      const files = req.files as Express.Multer.File[];
      const createMediaArray: IFIleURL[] = [];
      const uploadedFiles: string[] = [];
      let errorOccurred = false;

      for (const file of files) {
        try {
          const s3Result = await this.fileUploadService.uploadFileToS3(
            file.path,
            file.filename,
            file.mimetype
          );

          if (s3Result) {
            createMediaArray.push({
              publicId: `jozi-makert-files/${file.filename}`,
              url: s3Result,
            });
            uploadedFiles.push(file.path);
          }
          // File is already deleted by uploadFileToS3 after successful upload
        } catch (uploadError) {
          errorOccurred = true;
          console.error(`Error uploading file ${file.filename}:`, uploadError);
          // Clean up local file if upload failed (uploadFileToS3 may have already deleted it)
          if (fs.existsSync(file.path)) {
            try {
              await unlinkAsync(file.path);
            } catch (cleanupError) {
              console.error(`Error deleting local file ${file.path}:`, cleanupError);
            }
          }
        }
      }

      // Clean up any remaining files that weren't uploaded successfully
      for (const file of files) {
        if (fs.existsSync(file.path) && !uploadedFiles.includes(file.path)) {
          try {
            await unlinkAsync(file.path);
          } catch (cleanupError) {
            console.error(`Error deleting local file ${file.path}:`, cleanupError);
          }
        }
      }

      if (createMediaArray.length === 0) {
        return next(new Error("No files were uploaded successfully"));
      }
      const statusCode = errorOccurred ? 207 : 201;
      const message = errorOccurred
        ? "Partial upload completed, but some files failed to upload"
        : `${createMediaArray.length} media files uploaded successfully`;

      const response: CustomResponse<any> = {
        data: createMediaArray,
        message: message,
        error: errorOccurred,
      };

      return res.status(statusCode).json(response);
    } catch (error) {
      if (req.files) {
        const files = req.files as Express.Multer.File[];
        await Promise.all(
          files.map((file) =>
            unlinkAsync(file.path).catch((cleanupError) =>
              console.error(`Error deleting local file ${file.path}:`, cleanupError)
            )
          )
        );
      }
      next(error);
    }
  };

  public getUploadSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileName, fileType, userId } = req.body;

      if (!fileName || !fileType) {
        return next(new Error("fileName and fileType are required"));
      }

      const { url, key } = await this.fileUploadService.getUploadSignedUrl(
        fileName,
        fileType,
        userId,
        60 // 60 seconds expiration
      );

      const response: CustomResponse<{ url: string; key: string }> = {
        data: { url, key },
        message: "Upload signed URL generated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getDownloadSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileName, userId } = req.body;

      if (!fileName) {
        return next(new Error("fileName is required"));
      }

      const url = await this.fileUploadService.getDownloadSignedUrl(
        fileName,
        userId,
        3600 // 1 hour expiration
      );

      const response: CustomResponse<{ url: string }> = {
        data: { url },
        message: "Download signed URL generated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
