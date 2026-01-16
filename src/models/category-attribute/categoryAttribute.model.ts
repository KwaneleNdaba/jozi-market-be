import { DataTypes, Model, type Sequelize } from "sequelize";

class CategoryAttribute extends Model {
  public id!: string;
  public categoryId!: string;
  public attributeId!: string;
  public isRequired!: boolean;
  public options?: string[];
  public displayOrder!: number;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    CategoryAttribute.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        categoryId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "categories",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        attributeId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "attributes",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        isRequired: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        options: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        displayOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: "categoryAttribute",
        tableName: "category_attributes",
        timestamps: true,
      }
    );
  }
}

export default CategoryAttribute;
