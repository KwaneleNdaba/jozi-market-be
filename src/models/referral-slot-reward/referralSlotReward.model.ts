import { DataTypes, Model, type Sequelize } from "sequelize";

class ReferralSlotReward extends Model {
  public id!: string;
  public rewardConfigId!: string;
  public slotNumber!: number;
  public title!: string;
  public description?: string | null;
  public fileUrl?: string | null;
  public quantity!: number;
  public valuePoints!: number;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    ReferralSlotReward.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        rewardConfigId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "referral_reward_configs", key: "id" },
        },
        slotNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        fileUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        valuePoints: {
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
        modelName: "referral_slot_reward",
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ["rewardConfigId", "slotNumber"],
            name: "unique_config_slot_number",
          },
          {
            fields: ["rewardConfigId"],
          },
          {
            fields: ["active"],
          },
        ],
      }
    );
  }
}


export default ReferralSlotReward;
