import { DataTypes, Model, type Sequelize } from "sequelize";
import { SubscriptionPlanStatus, SubscriptionDuration } from "@/types/subscription.types";

class SubscriptionPlan extends Model {
  public id!: string;
  public name!: string;
  public subtitle!: string;
  public description!: string;
  public price!: number;
  public duration!: string;
  public status!: string;
  public isDark!: boolean;
  public isStar!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    SubscriptionPlan.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        subtitle: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        duration: {
          type: DataTypes.ENUM(SubscriptionDuration.MONTHLY, SubscriptionDuration.YEARLY),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(SubscriptionPlanStatus.ACTIVE, SubscriptionPlanStatus.INACTIVE),
          allowNull: false,
          defaultValue: SubscriptionPlanStatus.ACTIVE,
        },
        isDark: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isStar: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: "subscriptionPlan",
        tableName: "subscription_plans",
        timestamps: true,
      }
    );
  }
}

export default SubscriptionPlan;
