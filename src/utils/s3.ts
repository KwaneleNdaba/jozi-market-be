import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectVersionsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY } from "@/config";
import { HttpException } from "@/exceptions/HttpException";
import { logger } from "./logger";

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<string> => {
  try {
    // Verify file exists before attempting upload
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file stats to ensure it's not empty
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error(`File is empty: ${filePath}`);
    }

    logger.info(`Uploading file: ${fileName}, size: ${stats.size} bytes, type: ${mimeType}`);

    // Read file as buffer instead of stream for better error handling
    const fileBuffer = fs.readFileSync(filePath);

    const uploadParams = {
      Bucket: AWS_S3_BUCKET_NAME!,
      Key: `jozi-makert-files/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
      // Add these parameters to ensure proper handling
      ContentLength: stats.size,
      // Optional: Add cache control and metadata
      CacheControl: "max-age=31536000", // 1 year cache
      Metadata: {
        "original-name": fileName,
        "upload-timestamp": new Date().toISOString(),
      },
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    const result = await s3.send(uploadCommand);

    logger.info(`Successfully uploaded ${fileName} to S3. ETag: ${result.ETag}`);

    // Clean up local file only after successful upload
    fs.unlinkSync(filePath);

    // Return the correct S3 URL
    return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/jozi-makert-files/${fileName}`;
  } catch (error) {
    logger.error(`Error uploading file ${fileName}:`, error);

    // Clean up local file even if upload fails
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        logger.error(`Error cleaning up local file ${filePath}:`, unlinkError);
      }
    }

    throw new HttpException(
      500,
      `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const deleteFileFromS3 = async (fileName: string): Promise<void> => {
  try {
    const bucketName = AWS_S3_BUCKET_NAME!; // Use consistent bucket name variable
    const objectKey = `jozi-makert-files/${fileName}`; // Include the full path to match upload

    // First try to delete the current version
    try {
      const deleteParams = {
        Bucket: bucketName,
        Key: objectKey,
      };
      await s3.send(new DeleteObjectCommand(deleteParams));
      logger.info(`Deleted current version of ${fileName}`);
    } catch (error) {
      logger.warn(`Could not delete current version of ${fileName}:`, error);
    }

    // Then handle versioned objects if versioning is enabled
    try {
      const { Versions } = await s3.send(
        new ListObjectVersionsCommand({
          Bucket: bucketName,
          Prefix: objectKey,
        })
      );

      if (Versions && Versions.length > 0) {
        for (const version of Versions) {
          if (version.Key === objectKey) {
            // Ensure exact match
            const deleteParams = {
              Bucket: bucketName,
              Key: objectKey,
              VersionId: version.VersionId,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }
        }
        logger.info(`Deleted all versions of ${fileName}`);
      }
    } catch (versionError) {
      // Versioning might not be enabled, which is fine
      logger.info(`Versioning not enabled or no versions found for ${fileName}`);
    }
  } catch (error) {
    logger.error("Error deleting file from S3:", error);
    throw new HttpException(
      500,
      `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Get a signed URL for uploading a file to S3
 * @param fileName - Name of the file to upload
 * @param fileType - MIME type of the file
 * @param userId - Optional user ID to organize files by user
 * @param expiresIn - URL expiration time in seconds (default: 60)
 * @returns Object containing the signed URL and the S3 key
 */
export const getUploadSignedUrl = async (
  fileName: string,
  fileType: string,
  userId?: number | string,
  expiresIn: number = 60
): Promise<{ url: string; key: string }> => {
  try {
    const folder = userId
      ? `jozi-makert-files/${userId}/${fileName}`
      : `jozi-makert-files/${fileName}`;

    const key = folder;

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn });

    logger.info(`Generated upload signed URL for ${key}, expires in ${expiresIn} seconds`);

    return { url, key };
  } catch (error) {
    logger.error("Error generating upload signed URL:", error);
    throw new HttpException(
      500,
      `Failed to generate upload URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

/**
 * Get a signed URL for downloading/viewing an already uploaded file from S3
 * @param fileName - Name of the file (can include path)
 * @param userId - Optional user ID if file is organized by user
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL for downloading/viewing the file
 */
export const getDownloadSignedUrl = async (
  fileName: string,
  userId?: number | string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    // If fileName already includes the full path, use it as is
    // Otherwise, construct the path
    const key = fileName.startsWith("jozi-makert-files/")
      ? fileName
      : userId
        ? `jozi-makert-files/${userId}/${fileName}`
        : `jozi-makert-files/${fileName}`;

    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn });

    logger.info(`Generated download signed URL for ${key}, expires in ${expiresIn} seconds`);

    return url;
  } catch (error) {
    logger.error("Error generating download signed URL:", error);
    throw new HttpException(
      500,
      `Failed to generate download URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
