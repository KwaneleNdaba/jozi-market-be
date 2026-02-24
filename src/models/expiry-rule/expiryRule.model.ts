import { DataTypes, Model, type Sequelize } from "sequelize";

class ExpiryRule extends Model {
  public id!: string;
  public expiryType!: string;
  public expiryDays!: number;
  public expiryMode!: string;
  public fixedDayOfMonth?: number | null;
  public gracePeriodDays!: number;
  public warningDaysBefore!: number;
  public sendExpiryNotifications!: boolean;
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
          type: DataTypes.ENUM("purchase", "referral", "engagement"),
          allowNull: false,
        },
        expiryDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        expiryMode: {
          type: DataTypes.ENUM("rolling", "fixed_monthly"),
          allowNull: false,
          defaultValue: "rolling",
        },
        fixedDayOfMonth: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 1,
            max: 31,
          },
        },
        gracePeriodDays: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        warningDaysBefore: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 7,
          validate: {
            min: 0,
          },
        },
        sendExpiryNotifications: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
