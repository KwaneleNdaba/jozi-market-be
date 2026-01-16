import { DataTypes, Model, type Sequelize } from "sequelize";
import {
  SubscriptionTransactionStatus,
  SubscriptionTransactionType,
} from "@/types/subscription.types";

class SubscriptionTransaction extends Model {
  public id!: string;
  public userId!: string;
  public subscriptionPlanId!: string;
  public userSubscriptionId!: string | null;

  public amount!: number;
  public currency!: string;

  public transactionType!: string;
  public status!: string;

  public paymentProvider!: string | null;
  public providerReference!: string | null;

  public startedAt!: Date;
  public endedAt!: Date | null;

  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    SubscriptionTransaction.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },

        subscriptionPlanId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "subscription_plans", key: "id" },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },

        userSubscriptionId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "user_subscriptions", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },

        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },

        currency: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "ZAR",
        },

        transactionType: {
          type: DataTypes.ENUM(
            SubscriptionTransactionType.TRIAL,
            SubscriptionTransactionType.NEW,
            SubscriptionTransactionType.RENEWAL,
            SubscriptionTransactionType.UPGRADE,
            SubscriptionTransactionType.DOWNGRADE,
            SubscriptionTransactionType.CANCEL,
            SubscriptionTransactionType.REFUND
          ),
          allowNull: false,
        },

        status: {
          type: DataTypes.ENUM(
            SubscriptionTransactionStatus.PENDING,
            SubscriptionTransactionStatus.SUCCESS,
            SubscriptionTransactionStatus.FAILED
          ),
          allowNull: false,
          defaultValue: SubscriptionTransactionStatus.PENDING,
        },

        paymentProvider: {
          type: DataTypes.STRING,
          allowNull: true, // PayFast, Stripe, Peach, etc.
        },

        providerReference: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        startedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },

        endedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "subscriptionTransaction",
        tableName: "subscription_transactions",
        timestamps: true,
      }
    );
  }
}

export default SubscriptionTransaction;
