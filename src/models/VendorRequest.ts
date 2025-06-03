import { Schema, model, models, Model } from 'mongoose';

export interface IVendorRequest {
  userId: string;
  storeName: string;
  storeDescription: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

const vendorRequestSchema = new Schema<IVendorRequest>({
  userId: { type: String, required: true },
  storeName: { type: String, required: true },
  storeDescription: { type: String, required: true },
  logo: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  notes: { type: String },
}, {
  timestamps: true
});

const VendorRequest = models.VendorRequest || model('VendorRequest', vendorRequestSchema);

export default VendorRequest as Model<IVendorRequest>; 