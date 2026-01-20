import { DataTypes, Model, type Sequelize } from "sequelize";

class CartItem extends Model {
  public id!: string;
  public cartId!: string;
  public productId!: string;
  public productVariantId?: string | null;
  public quantity!: number;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    CartItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        cartId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "carts",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
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
        productVariantId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "product_variants",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: 1,
          },
        },
      },
      {
        sequelize,
        modelName: "cartItem",
        tableName: "cart_items",
        timestamps: true,
      }
    );
  }
}

export default CartItem;
