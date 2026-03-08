import { DataTypes, Model, type Sequelize } from "sequelize";

class FreeProductCampaign extends Model {
  public id!: string;
  public vendorId!: string;
  public productId!: string;
  public variantId?: string | null;
  public quantity!: number;
  public pointsRequired!: number;
  public isApproved!: boolean;
  public isVisible!: boolean;
  public expiryDate?: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    FreeProductCampaign.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        vendorId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users",
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
        variantId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: { min: 1 },
        },
        pointsRequired: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        isApproved: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isVisible: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        expiryDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "free_product_campaign",
        tableName: "free_product_campaigns",
        timestamps: true,
        indexes: [
          { fields: ["vendorId"] },
          { fields: ["productId"] },
          { fields: ["isApproved"] },
          { fields: ["isVisible"] },
          { fields: ["expiryDate"] },
        ],
      }
    );
  }
}

export default FreeProductCampaign;
