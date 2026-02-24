import { DataTypes, Model, type Sequelize } from "sequelize";

class Tier extends Model {
  public id!: string;
  public name!: string;
  public tierLevel!: number;
  public color?: string | null;
  public minPoints!: number;
  public multiplier!: number;
  public canGiftPoints!: boolean;
  public maxGiftPerMonth!: number;
  public expiryOverrideDays?: number | null;
  public downgradeType!: string;
  public downgradeDays!: number;
  public evaluationWindowDays!: number;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    Tier.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tierLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        color: {
          type: DataTypes.STRING(7),
          allowNull: true,
        },
        minPoints: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        multiplier: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 1.0,
          validate: {
            min: 1.0,
          },
        },
        canGiftPoints: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        maxGiftPerMonth: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        expiryOverrideDays: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        downgradeType: {
          type: DataTypes.ENUM("after_inactive_days", "after_downgrade_threshold"),
          allowNull: false,
          defaultValue: "after_inactive_days",
        },
        downgradeDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 365,
          validate: {
            min: 0,
          },
        },
        evaluationWindowDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 365,
          validate: {
            min: 0,
          },
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "tier",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["tierLevel"],
            name: "unique_tier_level_per_config",
          },
          {
            fields: [ "minPoints"],
          },
          {
            fields: ["active"],
          },
        ],
      }
    );
  }
}

export default Tier;
