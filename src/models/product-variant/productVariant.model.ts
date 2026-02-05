import { DataTypes, Model, type Sequelize } from "sequelize";

class ProductVariant extends Model {
  public id!: string;
  public productId!: string;
  public name!: string;
  public sku!: string;
  public price?: number; // Optional: Uses product regularPrice if not set
  public discountPrice?: number;
  public costPrice?: number;
  public stock!: number;
  public status!: string;
  public barcode?: string | null;
  public weight?: number | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    ProductVariant.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
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
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        sku: {
          type: DataTypes.STRING(255),
          allowNull: false,
          // Note: unique constraint removed to avoid MySQL 64-key limit
          // Uniqueness is enforced at the application/service layer
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          comment: "Optional: Uses product regularPrice if not set",
        },
        discountPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        costPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: "Denormalized from Inventory.quantityAvailable for backward compat",
        },
        barcode: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        weight: {
          type: DataTypes.DECIMAL(10, 3),
          allowNull: true,
          comment: "Weight in kg",
        },
        status: {
          type: DataTypes.ENUM("Active", "Inactive"),
          allowNull: false,
          defaultValue: "Active",
        },
      },
      {
        sequelize,
        modelName: "productVariant",
        tableName: "product_variants",
        timestamps: true,
      }
    );
  }
}

export default ProductVariant;
