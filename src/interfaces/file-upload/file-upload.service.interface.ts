import { Token } from "typedi";

export interface IFileUploadService {
  uploadFileToS3(filePath: string, fileName: string, mimeType: string): Promise<string>;
  deleteFileFromS3(fileName: string): Promise<void>;
  getUploadSignedUrl(
    fileName: string,
    fileType: string,
    userId?: number | string,
    expiresIn?: number
  ): Promise<{ url: string; key: string }>;
  getDownloadSignedUrl(
    fileName: string,
    userId?: number | string,
    expiresIn?: number
  ): Promise<string>;
}

export const FILE_UPLOAD_SERVICE_TOKEN = new Token<IFileUploadService>("IFileUploadService");
