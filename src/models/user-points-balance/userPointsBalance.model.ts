import { DataTypes, Model, type Sequelize } from "sequelize";

class UserPointsBalance extends Model {
  public userId!: string;
  public availablePoints!: number;
  public pendingPoints!: number;
  public lifetimeEarned!: number;
  public lifetimeRedeemed!: number;
  public currentTierId?: string | null;
  public lastTransactionAt?: Date | null;
  public updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    UserPointsBalance.init(
      {
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        availablePoints: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        pendingPoints: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        lifetimeEarned: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        lifetimeRedeemed: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: { min: 0 },
        },
        currentTierId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        lastTransactionAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "user_points_balance",
        timestamps: false,
        updatedAt: "updatedAt",
        indexes: [
          { fields: ["currentTierId"] },
          { fields: ["availablePoints"] },
        ],
      }
    );
  }
}

export default UserPointsBalance;
