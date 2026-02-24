import { DataTypes, Model, type Sequelize } from "sequelize";

class ReferralRewardConfig extends Model {
  public id!: string;
  public enabled!: boolean;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public signupPoints!: number;
  public firstPurchasePoints!: number;
  public minPurchaseAmount!: number;
  public oneRewardPerReferredUser!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    ReferralRewardConfig.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        signupPoints: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        firstPurchasePoints: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        minPurchaseAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
          },
        },
        oneRewardPerReferredUser: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "referral_reward_config",
        timestamps: true,
        indexes: [
          {
            fields: ["enabled"],
          },
        ],
      }
    );
  }
}

export default ReferralRewardConfig;
