import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // 🔑 needed for Cloudinary delete
    },
    name: {
      type: String,
      trim: true,
    },
    displayId: {
      type: String,
      default: '1',
    },
  },
  { timestamps: true }
)

const Image = mongoose.model('Image', imageSchema)
export default Image
