import { DataTypes, Model, type Sequelize } from "sequelize";

class EarningRule extends Model {
  public id!: string;
  public ruleName!: string;
  public sourceType!: string;
  public enabled!: boolean;
  public pointsAwarded!: number;
  public expiryRuleId!: string;
  public description?: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    EarningRule.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        ruleName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sourceType: {
          type: DataTypes.ENUM(
            "purchase",
            "referral",
            "review",
            "engagement",
            "signup",
            "campaign",
            "bonus"
          ),
          allowNull: false,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        pointsAwarded: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        expiryRuleId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "expiry_rules",
            key: "id",
          }
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "earning_rule",
        timestamps: true,
        indexes: [
          {
            fields: ["sourceType"],
          },
          {
            fields: ["enabled"],
          },
          {
            fields: ["expiryRuleId"],
          },
        ],
      }
    );
  }
}

export default EarningRule;
