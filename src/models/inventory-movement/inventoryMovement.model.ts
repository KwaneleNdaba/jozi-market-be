import { DataTypes, Model, type Sequelize } from "sequelize";

class InventoryMovement extends Model {
  public id!: string;
  public productVariantId!: string | null;
  public productId!: string | null;
  public type!: string; // IN | OUT | ADJUSTMENT | RETURN
  public quantity!: number;
  public reason!: string;
  public referenceId?: string | null;
  public referenceType?: string | null; // e.g. "order", "order_item", "cart", "restock", "refund"

  public createdAt?: Date;

  public static initialize(sequelize: Sequelize) {
    InventoryMovement.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
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
        productId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "products",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        type: {
          type: DataTypes.ENUM("IN", "OUT", "ADJUSTMENT", "RETURN"),
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: "Positive for IN/RETURN, negative for OUT (or always positive with type direction)",
        },
        reason: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        referenceId: {
          type: DataTypes.UUID,
          allowNull: true,
          comment: "orderId, orderItemId, cartItemId, restockId, etc.",
        },
        referenceType: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "inventoryMovement",
        tableName: "inventory_movements",
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}

export default InventoryMovement;
