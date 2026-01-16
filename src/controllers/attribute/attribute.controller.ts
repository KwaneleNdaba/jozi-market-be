import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ATTRIBUTE_SERVICE_TOKEN } from "@/interfaces/attribute/IAttributeService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IAttribute } from "@/types/attribute.types";

export class AttributeController {
  private readonly attributeService: any;

  constructor() {
    this.attributeService = Container.get(ATTRIBUTE_SERVICE_TOKEN);
  }

  public createAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attributeData = req.body;
      const createdAttribute = await this.attributeService.createAttribute(attributeData);

      const response: CustomResponse<IAttribute> = {
        data: createdAttribute,
        message: "Attribute created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAttributeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const attribute = await this.attributeService.getAttributeById(id);

      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      const response: CustomResponse<IAttribute> = {
        data: attribute,
        message: "Attribute retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAttributeBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const attribute = await this.attributeService.getAttributeBySlug(slug);

      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      const response: CustomResponse<IAttribute> = {
        data: attribute,
        message: "Attribute retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllAttributes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attributes = await this.attributeService.getAllAttributes();

      const response: CustomResponse<IAttribute[]> = {
        data: attributes,
        message: "Attributes retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedAttribute = await this.attributeService.updateAttribute(updateData);

      const response: CustomResponse<IAttribute> = {
        data: updatedAttribute,
        message: "Attribute updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.attributeService.deleteAttribute(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Attribute deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
