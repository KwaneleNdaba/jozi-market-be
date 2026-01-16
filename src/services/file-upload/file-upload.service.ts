import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  FILE_UPLOAD_SERVICE_TOKEN,
  type IFileUploadService,
} from "@/interfaces/file-upload/file-upload.service.interface";
import {
  deleteFileFromS3,
  getDownloadSignedUrl,
  getUploadSignedUrl,
  uploadFileToS3,
} from "@/utils/s3";

@Service({ id: FILE_UPLOAD_SERVICE_TOKEN })
export class FileUploadService implements IFileUploadService {
  public async uploadFileToS3(
    filePath: string,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    try {
      const uploadedFile = await uploadFileToS3(filePath, fileName, mimeType);
      return uploadedFile;
    } catch (error: any) {
      throw new HttpException(400, error.message || "Failed to upload file");
    }
  }

  public async deleteFileFromS3(fileName: string): Promise<void> {
    try {
      await deleteFileFromS3(fileName);
    } catch (error: any) {
      throw new HttpException(400, error.message || "Failed to delete file");
    }
  }

  public async getUploadSignedUrl(
    fileName: string,
    fileType: string,
    userId?: number | string,
    expiresIn?: number
  ): Promise<{ url: string; key: string }> {
    try {
      return await getUploadSignedUrl(fileName, fileType, userId, expiresIn);
    } catch (error: any) {
      throw new HttpException(400, error.message || "Failed to generate upload URL");
    }
  }

  public async getDownloadSignedUrl(
    fileName: string,
    userId?: number | string,
    expiresIn?: number
  ): Promise<string> {
    try {
      return await getDownloadSignedUrl(fileName, userId, expiresIn);
    } catch (error: any) {
      throw new HttpException(400, error.message || "Failed to generate download URL");
    }
  }
}
