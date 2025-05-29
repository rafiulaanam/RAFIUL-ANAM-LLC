import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  user: Types.ObjectId;
  products: Array<{
    product: Types.ObjectId;
    vendor: Types.ObjectId;
    quantity: number;
    price: number;
    vendorEarnings: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  vendorTotals: Array<{
    vendor: Types.ObjectId;
    total: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    products: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required'],
      },
      vendor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vendor is required'],
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
      },
      price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
      },
      vendorEarnings: {
        type: Number,
        required: [true, 'Vendor earnings is required'],
        min: [0, 'Vendor earnings cannot be negative'],
      },
    }],
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentIntentId: String,
    vendorTotals: [{
      vendor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Vendor total cannot be negative'],
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate vendor totals before saving
orderSchema.pre('save', function(next) {
  const vendorTotalsMap = new Map();
  
  this.products.forEach(item => {
    const vendorId = item.vendor.toString();
    const currentTotal = vendorTotalsMap.get(vendorId) || 0;
    vendorTotalsMap.set(vendorId, currentTotal + item.vendorEarnings);
  });
  
  this.vendorTotals = Array.from(vendorTotalsMap).map(([vendor, total]) => ({
    vendor,
    total,
  }));
  
  next();
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'products.vendor': 1 }); // Index for vendor queries

const Order = models.Order || model<IOrder>('Order', orderSchema);

export default Order; 