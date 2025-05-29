import mongoose, { Schema, model, models } from 'mongoose';
import { IProduct } from '@/types/types';

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for this product.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for this product.'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price for this product.'],
      min: [0, 'Price cannot be negative.'],
    },
    images: [
      {
        type: String,
        required: [true, 'At least one image is required'],
      }
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor is required'],
    },
    brand: {
      type: String,
      required: [true, 'Please specify a brand for this product.'],
    },
    inventory: {
      quantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock quantity cannot be negative'],
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        required: [true, 'Low stock threshold is required'],
        min: [1, 'Low stock threshold must be at least 1'],
        default: 5,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Stock status
productSchema.virtual('stockStatus').get(function () {
  const quantity = this.inventory.quantity;
  const threshold = this.inventory.lowStockThreshold;

  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Compile model
const Product = models.Product || model<IProduct>('Product', productSchema);
export default Product;
