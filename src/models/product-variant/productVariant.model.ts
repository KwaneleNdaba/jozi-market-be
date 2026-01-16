import { DataTypes, Model, type Sequelize } from "sequelize";

class ProductVariant extends Model {
  public id!: string;
  public productId!: string;
  public name!: string;
  public sku!: string;
  public price!: number;
  public discountPrice?: number;
  public stock!: number;
  public status!: string;
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
          unique: true,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        discountPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
