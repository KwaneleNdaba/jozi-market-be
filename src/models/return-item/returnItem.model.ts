import { DataTypes, Model, type Sequelize } from "sequelize";

class ReturnItem extends Model {
  public id!: string;
  public returnId!: string;
  public orderItemId!: string;
  public quantity!: number;
  public reason?: string | null;
  public status!: string;
  public requestedAt!: Date;
  public reviewedBy?: string | null;
  public reviewedAt?: Date | null;
  public rejectionReason?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    ReturnItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        returnId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "returns",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        orderItemId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "order_items",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: true,
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
      },
      {
        sequelize,
        modelName: "returnItem",
        tableName: "return_items",
        timestamps: true,
      }
    );
  }
}

export default ReturnItem;
