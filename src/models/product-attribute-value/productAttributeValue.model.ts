import { DataTypes, Model, type Sequelize } from "sequelize";

class ProductAttributeValue extends Model {
  public id!: string;
  public productId!: string;
  public attributeId!: string;
  public value!: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    ProductAttributeValue.init(
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
        value: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "productAttributeValue",
        tableName: "product_attribute_values",
        timestamps: true,
      }
    );
  }
}

export default ProductAttributeValue;
