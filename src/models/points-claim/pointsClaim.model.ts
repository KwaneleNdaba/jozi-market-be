import { DataTypes, Model, type Sequelize } from "sequelize";

class PointsClaim extends Model {
  public id!: string;
  public userId!: string;
  public pointsClaimed!: number;
  public sourceType!: string; // 'purchase', 'referral', 'engagement', 'gift'
  public sourceId?: string | null; // ID of the source record (orderId, referralId, etc.)
  public expiryRuleId!: string; // Links to which expiry rule applies
  public earnedAt!: Date; // When the points were originally earned
  public claimedAt!: Date; // When the user claimed these points
  public expiresAt!: Date; // Calculated: earnedAt + expiryDays from ExpiryRule
  public expiredAt?: Date | null; // Set when points expire
  public isExpired!: boolean;
  public pointsHistoryId?: string | null; // Link to the PointsHistory transaction
  public metadata?: any | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    PointsClaim.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        pointsClaimed: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        sourceType: {
          type: DataTypes.ENUM("purchase", "referral", "engagement", "gift"),
          allowNull: false,
        },
        sourceId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        expiryRuleId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        earnedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        claimedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        expiredAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        isExpired: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        pointsHistoryId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "points_claim",
        tableName: "points_claims",
        timestamps: true,
        indexes: [
          { fields: ["userId"] },
          { fields: ["sourceType"] },
          { fields: ["expiryRuleId"] },
          { fields: ["expiresAt"] },
          { fields: ["isExpired"] },
          { fields: ["claimedAt"] },
          { 
            fields: ["expiresAt", "isExpired"],
            name: "idx_expiry_check"
          },
        ],
      }
    );
  }
}

export default PointsClaim;
