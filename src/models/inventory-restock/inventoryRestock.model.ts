import { DataTypes, Model, type Sequelize } from "sequelize";

class InventoryRestock extends Model {
  public id!: string;
  public productVariantId!: string | null;
  public productId!: string | null;
  public quantityAdded!: number;
  public costPerUnit!: number;
  public supplierName!: string;
  public restockDate!: Date;

  public createdAt?: Date;

  public static initialize(sequelize: Sequelize) {
    InventoryRestock.init(
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
        quantityAdded: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 1 },
        },
        costPerUnit: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        supplierName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        restockDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: "inventoryRestock",
        tableName: "inventory_restocks",
        timestamps: true,
        updatedAt: false,
      }
    );
  }
}

export default InventoryRestock;
