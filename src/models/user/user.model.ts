import { DataTypes, Model, type Sequelize } from "sequelize";

class User extends Model {
  public id!: string;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public role!: string;
  public isAccountBlocked!: boolean;
  public canReview!: boolean;
  public provider_user_id: string;
  public provider_type: string;
  public otp?: string;
  public phone: string;
  public isPhoneConfirmed: boolean;
  public isEmailConfirmed: boolean;
  public profileUrl: string;
  public address: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        fullName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        provider_user_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        provider_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        profileUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isAccountBlocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        canReview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isPhoneConfirmed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isEmailConfirmed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "customer",
        },

        otp: { type: DataTypes.STRING },
      },
      {
        sequelize,
        modelName: "user",
        timestamps: true,
      }
    );
  }
}

export default User;
