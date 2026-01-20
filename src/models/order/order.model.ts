import { DataTypes, Model, type Sequelize } from "sequelize";

class Order extends Model {
  public id!: string;
  public userId!: string;
  public orderNumber!: string;
  public status!: string;
  public totalAmount!: number;
  public shippingAddress!: any; // JSON field
  public paymentMethod!: string;
  public paymentStatus!: string;
  public email!: string;
  public phone?: string;
  public notes?: string;
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
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        orderNumber: {
          type: DataTypes.STRING(255),
          allowNull: false,
          // Note: unique constraint removed to avoid MySQL 64-key limit
          // Uniqueness is enforced at the application/service layer
        },
        status: {
          type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
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
