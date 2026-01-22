import { DataTypes, Model, type Sequelize } from "sequelize";

class OrderItem extends Model {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public productVariantId?: string | null;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  // Return request fields
  public returnRequestStatus?: string | null;
  public returnRequestedAt?: Date | null;
  public returnQuantity?: number | null; // Quantity to return (can be less than total)
  public returnReason?: string | null;
  public returnReviewedBy?: string | null;
  public returnReviewedAt?: Date | null;
  public returnRejectionReason?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    OrderItem.init(
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
        productId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "products",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        productVariantId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "product_variants",
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
        unitPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        totalPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        // Return request fields
        returnRequestStatus: {
          type: DataTypes.ENUM("pending", "approved", "rejected"),
          allowNull: true,
          defaultValue: null,
        },
        returnRequestedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        returnQuantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 1,
          },
        },
        returnReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        returnReviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        returnReviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        returnRejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "orderItem",
        tableName: "order_items",
        timestamps: true,
      }
    );
  }
}

export default OrderItem;
