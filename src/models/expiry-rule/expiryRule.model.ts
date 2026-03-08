import { DataTypes, Model, type Sequelize } from "sequelize";

class ExpiryRule extends Model {
  public id!: string;
  public expiryType!: string;
  public expiryDays!: number;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    ExpiryRule.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        expiryType: {
          type: DataTypes.ENUM("purchase", "referral", "engagement", "gift"),
          allowNull: false,
        },
        expiryDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "expiry_rule",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["expiryType"],
            name: "unique_expiry_type",
          },
          {
            fields: ["active"],
          },
        ],
      }
    );
  }
}

export default ExpiryRule;
