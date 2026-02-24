import { DataTypes, Model, type Sequelize } from "sequelize";

class PointsConfig extends Model {
  public id!: string;
  public version!: number;
  public isActive!: boolean;
  public pointsEnabled!: boolean;
  public redemptionEnabled!: boolean;
  public allowStackWithDiscounts!: boolean;
  public createdBy?: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
  public activatedAt?: Date | null;
  public deactivatedAt?: Date | null;

  public static initialize(sequelize: Sequelize) {
    PointsConfig.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        pointsEnabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        redemptionEnabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        allowStackWithDiscounts: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        activatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        deactivatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "points_config",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["version"],
            where: { isActive: true },
            name: "unique_active_version",
          },
          {
            fields: ["isActive"],
          },
        ],
      }
    );
  }
}

export default PointsConfig;
