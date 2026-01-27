import { DataTypes, Model, type Sequelize } from "sequelize";

class Order extends Model {
  public id!: string;
  public userId!: string;
  public orderNumber!: string;
  public status!: string;
  public totalAmount!: number;
  public shippingAddress!: any;
  public paymentMethod!: string;
  public paymentStatus!: string;
  public email!: string;
  public phone?: string;
  public notes?: string;

  // Return flags
  public isReturnRequested?: boolean;
  public isReturnApproved?: boolean;

  // Cancellation request fields (KEEP)
  public cancellationRequestedAt?: Date | null;
  public cancellationReviewedBy?: string | null;
  public cancellationReviewedAt?: Date | null;
  public cancellationRejectionReason?: string | null;

  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Order.init(
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
        orderNumber: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            "pending",
            "confirmed",
            "processing",
            "ready_to_ship",
            "shipped",
            "delivered",
            "cancelled"
          ),
          allowNull: false,
          defaultValue: "pending",
        },
        totalAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        shippingAddress: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        paymentMethod: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        paymentStatus: {
          type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
          allowNull: false,
          defaultValue: "pending",
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        // Return flags
        isReturnRequested: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isReturnApproved: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        // Cancellation request fields (KEEP)
        cancellationRequestedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        cancellationReviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "users", key: "id" },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        cancellationReviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        cancellationRejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "order",
        tableName: "orders",
        timestamps: true,
      }
    );
  }
}

export default Order;
