import type { Routes } from "@/types/routes.interface";
import { PointsConfigRoute } from "./pointsConfig.route";

export class PointsRoutes implements Routes {
  public path = "/points";
  public router = PointsConfigRoute.prototype.router;

  constructor() {
    const pointsConfigRoute = new PointsConfigRoute();
    this.router = pointsConfigRoute.router;
  }
}
