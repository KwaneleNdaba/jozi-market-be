import { DataTypes, Model, type Sequelize } from "sequelize";
import { AttributeType } from "@/types/attribute.types";

class Attribute extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public type!: string;
  public unit?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Attribute.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        type: {
          type: DataTypes.ENUM(
            AttributeType.TEXT,
            AttributeType.NUMBER,
            AttributeType.SELECT,
            AttributeType.BOOLEAN,
            AttributeType.TEXTAREA
          ),
          allowNull: false,
        },
        unit: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "attribute",
        tableName: "attributes",
        timestamps: true,
      }
    );
  }
}

export default Attribute;
