import { DataTypes, Model, type Sequelize } from "sequelize";

class AbuseFlag extends Model {
  public id!: string;
  public userId!: string;
  public flagType!: string;
  public severity!: string;
  public status!: string;
  public entityType?: string | null;
  public entityId?: string | null;
  public detectionMethod!: string;
  public flagDetails!: any;
  public ipAddress?: string | null;
  public deviceFingerprint?: string | null;
  public reviewedBy?: string | null;
  public reviewedAt?: Date | null;
  public reviewNotes?: string | null;
  public actionTaken?: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    AbuseFlag.init(
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
        flagType: {
          type: DataTypes.ENUM(
            "suspicious_referral",
            "velocity_abuse",
            "redemption_abuse",
            "review_abuse",
            "device_fraud",
            "other"
          ),
          allowNull: false,
        },
        severity: {
          type: DataTypes.ENUM("low", "medium", "high", "critical"),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            "pending",
            "under_review",
            "resolved_valid",
            "resolved_invalid",
            "dismissed"
          ),
          allowNull: false,
          defaultValue: "pending",
        },
        entityType: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        entityId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        detectionMethod: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        flagDetails: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        ipAddress: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        deviceFingerprint: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        reviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reviewNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        actionTaken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "abuse_flag",
        timestamps: true,
        indexes: [
          {
            fields: ["userId"],
          },
          {
            fields: ["flagType"],
          },
          {
            fields: ["severity"],
          },
          {
            fields: ["status"],
          },
          {
            fields: ["createdAt"],
          },
          {
            fields: ["ipAddress"],
          },
          {
            fields: ["deviceFingerprint"],
          },
        ],
      }
    );
  }
}

export default AbuseFlag;
