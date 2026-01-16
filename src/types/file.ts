import type { Request } from "express";

export type IFIleURL = {
  url: string;
  publicId: string;
};

export interface RequestWithFile extends Request {
  file: Express.Multer.File;
}
