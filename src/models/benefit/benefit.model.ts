import { DataTypes, Model, type Sequelize } from "sequelize";

class Benefit extends Model {
  public id!: string;
  public name!: string;
  public description?: string | null;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    Benefit.init(
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
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "benefit",
        timestamps: true,
        indexes: [
          {
            fields: ["active"],
          },
        ],
      }
    );
  }
}

export default Benefit;
