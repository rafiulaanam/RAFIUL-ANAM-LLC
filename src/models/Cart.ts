import { Schema, model, models, Document, Model } from 'mongoose';

// Interface for cart item
interface ICartItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

// Interface for cart document
export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for cart item
const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

// Schema for cart
const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    items: [CartItemSchema]
  },
  {
    timestamps: true
  }
);

// Virtual for total
CartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Create or get the model
const Cart: Model<ICart> = models.Cart || model<ICart>('Cart', CartSchema);

export default Cart; 