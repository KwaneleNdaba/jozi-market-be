import { DataTypes, Model, type Sequelize } from "sequelize";

export type ClaimStatus = "pending" | "fulfilled" | "cancelled" | "awaiting_fulfillment";

class CampaignClaim extends Model {
  public id!: string;
  public campaignId!: string;
  public userId!: string;
  public status!: ClaimStatus;
  public claimedAt!: Date;
  public fulfilledAt?: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    CampaignClaim.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        campaignId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "free_product_campaigns",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
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
        status: {
          type: DataTypes.ENUM("pending", "fulfilled", "cancelled","awaiting_fulfillment"),
          allowNull: false,
          defaultValue: "pending",
        },
        // pointsDeducted removed; use pointsRequired from FreeProductCampaign
        claimedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        fulfilledAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "campaign_claim",
        tableName: "campaign_claims",
        timestamps: true,
        indexes: [
          { fields: ["campaignId"] },
          { fields: ["userId"] },
          { fields: ["status"] },
          { unique: true, fields: ["campaignId", "userId"] },
        ],
      }
    );
  }
}

export default CampaignClaim;
