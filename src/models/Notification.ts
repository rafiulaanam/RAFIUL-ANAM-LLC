import { Schema, model, models, Model } from 'mongoose';

export interface INotification {
  type: 'VENDOR_REQUEST' | 'NEW_ORDER' | 'ORDER_STATUS' | 'PRODUCT' | 'OTHER';
  title: string;
  message: string;
  isRead: boolean;
  recipientRole: 'ADMIN' | 'VENDOR' | 'USER';
  recipientId?: string; // For vendor-specific notifications
  relatedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    required: true,
    enum: ['VENDOR_REQUEST', 'NEW_ORDER', 'ORDER_STATUS', 'PRODUCT', 'OTHER']
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  recipientRole: {
    type: String,
    required: true,
    enum: ['ADMIN', 'VENDOR', 'USER']
  },
  recipientId: {
    type: String
  },
  relatedId: { 
    type: String 
  }
}, {
  timestamps: true
});

const Notification = models.Notification || model('Notification', notificationSchema);

export default Notification as Model<INotification>; 