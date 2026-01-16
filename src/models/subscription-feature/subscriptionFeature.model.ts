import { DataTypes, Model, type Sequelize } from "sequelize";

class SubscriptionFeature extends Model {
  public id!: string;
  public subscriptionPlanId!: string;
  public featureId!: string;
  public isIncluded!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    SubscriptionFeature.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        subscriptionPlanId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "subscription_plans",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        featureId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "features",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        isIncluded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "subscriptionFeature",
        tableName: "subscription_features",
        timestamps: true,
      }
    );
  }
}

export default SubscriptionFeature;
