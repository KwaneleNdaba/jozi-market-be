import { DataTypes, Model, type Sequelize } from "sequelize";
import { UserSubscriptionStatus } from "@/types/subscription.types";

class UserSubscription extends Model {
  public id!: string;
  public userId!: string;
  public subscriptionPlanId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    UserSubscription.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        subscriptionPlanId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "subscription_plans",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            UserSubscriptionStatus.ACTIVE,
            UserSubscriptionStatus.EXPIRED,
            UserSubscriptionStatus.CANCELLED
          ),
          allowNull: false,
          defaultValue: UserSubscriptionStatus.ACTIVE,
        },
      },
      {
        sequelize,
        modelName: "userSubscription",
        tableName: "user_subscriptions",
        timestamps: true,
      }
    );
  }
}

export default UserSubscription;
