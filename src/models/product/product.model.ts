import { DataTypes, Model, type Sequelize } from "sequelize";

class Product extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public sku!: string;
  public status!: string;
  public artisanNotes!: any; // JSON field
  public categoryId!: string;
  public subcategoryId?: string;
  public regularPrice!: number;
  public discountPrice?: number;
  public careGuidelines!: string;
  public packagingNarrative!: string;
  public images!: any; // JSON field
  public video?: any; // JSON field (optional)
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        sku: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        status: {
          type: DataTypes.ENUM("Active", "Inactive"),
          allowNull: false,
          defaultValue: "Active",
        },
        artisanNotes: {
          type: DataTypes.JSON,
          allowNull: false,
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
        categoryId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        },
        subcategoryId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        regularPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        discountPrice: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        careGuidelines: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        packagingNarrative: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        images: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        video: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "product",
        tableName: "products",
        timestamps: true,
      }
    );
  }
}

export default Product;
