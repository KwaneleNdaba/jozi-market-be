import { DataTypes, Model, type Sequelize } from "sequelize";

class Cart extends Model {
  public id!: string;
  public userId!: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    Cart.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
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
      },
      {
        sequelize,
        modelName: "cart",
        tableName: "carts",
        timestamps: true,
      }
    );
  }
}

export default Cart;
