import { Schema, model, models, Document, Types } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  description?: string;
  logo?: string;
  user: Types.ObjectId;
  contactEmail: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
  rating: number;
  totalProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalProducts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
vendorSchema.index({ name: 'text', description: 'text' });

// Update total products when products are added/removed
vendorSchema.methods.updateTotalProducts = async function() {
  const Product = models.Product;
  const count = await Product.countDocuments({ vendor: this._id, isActive: true });
  this.totalProducts = count;
  await this.save();
};

const Vendor = models.Vendor || model<IVendor>('Vendor', vendorSchema);

export default Vendor; 