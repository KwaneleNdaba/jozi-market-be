import { DataTypes, Model, type Sequelize } from "sequelize";
import { VendorApplicationStatus, VendorType } from "@/types/vendor.types";

class VendorApplication extends Model {
  public id!: string;
  public userId!: string | null;
  public status!: string;
  public submittedAt!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  public vendorType!: string;
  public legalName!: string;
  public shopName!: string;
  public contactPerson!: string;
  public email!: string;
  public phone!: string;

  public description!: string;
  public website?: string;
  public tagline?: string;

  public cipcNumber?: string | null;
  public vatNumber!: string;
  public productCount!: string;
  public fulfillment!: string;
  public address!: {
    street: string;
    city: string;
    postal: string;
    country: string;
  };
  public deliveryRegions!: string[];

  public files!: {
    logoUrl?: string;
    bannerUrl?: string;
    idDocUrl?: string;
    bankProofUrl?: string;
    addressProofUrl?: string;
    cipcDocUrl?: string;
  };

  public agreements!: {
    terms: boolean;
    privacy: boolean;
    popia: boolean;
    policies: boolean;
  };

  public reviewedBy?: string | null;
  public reviewedAt?: Date | null;
  public rejectionReason?: string | null;

  public static initialize(sequelize: Sequelize) {
    VendorApplication.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        status: {
          type: DataTypes.ENUM(
            VendorApplicationStatus.PENDING,
            VendorApplicationStatus.APPROVED,
            VendorApplicationStatus.REJECTED
          ),
          allowNull: false,
          defaultValue: VendorApplicationStatus.PENDING,
        },
        submittedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        vendorType: {
          type: DataTypes.ENUM(VendorType.INDIVIDUAL, VendorType.BUSINESS),
          allowNull: false,
        },
        legalName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        shopName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        contactPerson: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        website: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        tagline: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        cipcNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        vatNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        productCount: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fulfillment: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        deliveryRegions: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        files: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {},
        },
        agreements: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        reviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        rejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "vendorApplication",
        tableName: "vendor_applications",
        timestamps: true,
      }
    );
  }
}

export default VendorApplication;
