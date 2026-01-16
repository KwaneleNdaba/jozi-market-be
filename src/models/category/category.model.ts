import { DataTypes, Model, type Sequelize } from "sequelize";
import { CategoryStatus } from "@/types/category.types";

class Category extends Model {
  public id!: string;
  public categoryId!: string | null; // Parent category ID
  public name!: string;
  public description!: string;
  public status!: string;
  public icon?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Category.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        categoryId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(CategoryStatus.ACTIVE, CategoryStatus.INACTIVE),
          allowNull: false,
          defaultValue: CategoryStatus.ACTIVE,
        },
        icon: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "category",
        tableName: "categories",
        timestamps: true,
      }
    );
  }
}

export default Category;
