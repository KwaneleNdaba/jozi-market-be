import { DataTypes, Model, type Sequelize } from "sequelize";

class Inventory extends Model {
  public id!: string;
  public productVariantId!: string | null;
  public productId!: string | null;
  public quantityAvailable!: number;
  public quantityReserved!: number;
  public reorderLevel!: number;
  public warehouseLocation?: string | null;

  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Inventory.init(
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
        quantityAvailable: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        quantityReserved: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        reorderLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        warehouseLocation: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "inventory",
        tableName: "inventories",
        timestamps: true,
      }
    );
  }
}

export default Inventory;
