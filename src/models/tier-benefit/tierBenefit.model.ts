import { DataTypes, Model, type Sequelize } from "sequelize";

class TierBenefit extends Model {
  public id!: string;
  public tierId!: string;
  public benefitId!: string;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    TierBenefit.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tierId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "tiers", key: "id" },
        },
        benefitId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "benefits", key: "id" },
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "tier_benefit",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["tierId", "benefitId"],
            name: "unique_benefit_per_tier",
          },
          {
            fields: ["tierId"],
          },
          {
            fields: ["active"],
          },
        ],
      }
    );
  }
}

export default TierBenefit;
