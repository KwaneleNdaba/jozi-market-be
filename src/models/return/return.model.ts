import { DataTypes, Model, type Sequelize } from "sequelize";

class Return extends Model {
  public id!: string;
  public orderId!: string;
  public userId!: string;
  public status!: string;
  public reason!: string;
  public requestedAt!: Date;
  public reviewedBy?: string | null;
  public reviewedAt?: Date | null;
  public rejectionReason?: string | null;
  public refundAmount?: number | null;
  public refundStatus?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Return.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        orderId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "orders",
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
          type: DataTypes.ENUM(
            "requested",
            "approved",
            "rejected",
            "in_transit",
            "received",
            "refund_pending",
            "refunded",
            "cancelled"
          ),
          allowNull: false,
          defaultValue: "requested",
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        requestedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        reviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        rejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        refundAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        refundStatus: {
          type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "return",
        tableName: "returns",
        timestamps: true,
      }
    );
  }
}

export default Return;
