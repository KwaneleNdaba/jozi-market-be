import { DataTypes, Model, type Sequelize } from "sequelize";

class RefreshToken extends Model {
  public id!: number;
  public token!: string;
  public userId!: string;
  public expiresAt!: Date;

  static initialize(sequelize: Sequelize) {
    RefreshToken.init(
      {
        token: { type: DataTypes.STRING, primaryKey: true },
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
        expiresAt: { type: DataTypes.DATE },
      },
      { sequelize, modelName: "RefreshToken", tableName: "refresh_tokens" }
    );
  }
}

export default RefreshToken;
