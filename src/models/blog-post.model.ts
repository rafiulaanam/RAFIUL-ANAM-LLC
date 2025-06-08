import { Schema, model, models } from 'mongoose';

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot be longer than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot be longer than 500 characters']
  },
  coverImage: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Cover image must be a valid URL'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    id: { type: String, required: true },
    name: String,
    email: String,
    image: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    content: {
      type: String,
      required: true
    },
    author: {
      id: { type: String, required: true },
      name: String,
      email: String,
      image: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index for better search performance
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Add hooks for updating timestamps
blogPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
export const BlogPost = models.BlogPost || model('BlogPost', blogPostSchema); 