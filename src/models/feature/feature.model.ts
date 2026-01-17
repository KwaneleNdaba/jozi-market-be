import { DataTypes, Model, type Sequelize } from "sequelize";

class Feature extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public slug!: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Feature.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: false,
          // Unique constraint removed to avoid MySQL 64-key limit
          // Uniqueness is enforced at application level in FeatureService
        },
      },
      {
        sequelize,
        modelName: "feature",
        tableName: "features",
        timestamps: true,
      }
    );
  }
}

export default Feature;
