import { DataTypes, Model, type Sequelize } from "sequelize";

class PointsHistory extends Model {
  public id!: string;
  public userId!: string;
  public transactionType!: string;
  public pointsChange!: number;
  public pointsBalanceAfter!: number;
  public sourceType!: string;
  public sourceId?: string | null;
  public earningRuleId?: string | null;
  public expiresAt?: Date | null;
  public expiredAt?: Date | null;
  public redemptionValue?: number | null;
  public description?: string | null;
  public metadata?: any | null;
  public adminAdjusted!: boolean;
  public adminUserId?: string | null;
  public adminNotes?: string | null;
  public createdAt!: Date;

  public static initialize(sequelize: Sequelize) {
    PointsHistory.init(
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
        transactionType: {
          type: DataTypes.ENUM(
            "earn",
            "redeem",
            "expire",
            "adjust",
            "gift_sent",
            "gift_received",
            "refund"
          ),
          allowNull: false,
        },
        pointsChange: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        pointsBalanceAfter: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        sourceType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sourceId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        earningRuleId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        expiredAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        redemptionValue: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        adminAdjusted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        adminUserId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        adminNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
  
      },
      {
        sequelize,
        modelName: "points_history",
        timestamps: true,
        indexes: [
          { fields: ["userId"] },
          { fields: ["transactionType"] },
          { fields: ["expiresAt"] },
          { fields: ["earningRuleId"] },
        ],
      }
    );
  }
}

export default PointsHistory;
