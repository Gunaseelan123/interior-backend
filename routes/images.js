// import express from 'express'
// import Image from '../models/Image.js'
// import Category from '../models/Category.js'
// import { protect } from '../middleware/auth.js'
// import cloudinary from '../config/cloudinary.js'
// import { upload } from '../config/multer.js'

// const router = express.Router()

// /* ================= UPLOAD IMAGES ================= */

// router.post('/', protect, upload.array('image', 20), async (req, res) => {
//   try {
//     const { categoryId } = req.body

//     if (!categoryId) {
//       return res.status(400).json({ message: 'Category ID is required' })
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'At least one image is required' })
//     }

//     const category = await Category.findById(categoryId)
//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' })
//     }

//     /* 🔹 Upload to Cloudinary */
//     const imagesToInsert = []

//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(
//         `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
//         {
//           folder: `interior/${category.idPrefix}`,
//           resource_type: 'image',
//         }
//       )

//       imagesToInsert.push({
//         categoryId,
//         imageUrl: result.secure_url,
//         publicId: result.public_id,
//         name: file.originalname,
//       })
//     }

//     await Image.insertMany(imagesToInsert)

//     /* 🔁 Re-number displayId (YOUR OLD LOGIC PRESERVED) */
//     const allImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
//     const prefix = category.idPrefix || 'IMG'

//     const bulkOps = allImages.map((img, index) => ({
//       updateOne: {
//         filter: { _id: img._id },
//         update: {
//           displayId: `${prefix}-${String(index + 1).padStart(2, '0')}`,
//         },
//       },
//     }))

//     if (bulkOps.length > 0) {
//       await Image.bulkWrite(bulkOps)
//     }

//     const updatedImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
//     res.status(201).json(updatedImages)
//   } catch (error) {
//     console.error('Upload Error:', error)
//     res.status(500).json({ message: error.message })
//   }
// })

// /* ================= DELETE IMAGE ================= */

// router.delete('/:id', protect, async (req, res) => {
//   try {
//     const image = await Image.findById(req.params.id)
//     if (!image) {
//       return res.status(404).json({ message: 'Image not found' })
//     }

//     const categoryId = image.categoryId

//     /* 🔥 Delete from Cloudinary */
//     if (image.publicId) {
//       await cloudinary.uploader.destroy(image.publicId)
//     }

//     /* 🔥 Delete from MongoDB */
//     await Image.findByIdAndDelete(req.params.id)

//     /* 🔁 Re-number remaining images */
//     const remainingImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
//     const category = await Category.findById(categoryId)

//     if (category) {
//       const bulkOps = remainingImages.map((img, index) => ({
//         updateOne: {
//           filter: { _id: img._id },
//           update: {
//             displayId: `${category.idPrefix}-${String(index + 1).padStart(2, '0')}`,
//           },
//         },
//       }))

//       if (bulkOps.length > 0) {
//         await Image.bulkWrite(bulkOps)
//       }
//     }

//     res.json({ message: 'Image deleted and IDs updated' })
//   } catch (error) {
//     console.error('Delete Image Error:', error)
//     res.status(500).json({ message: error.message })
//   }
// })

// export default router












import express from 'express'
import Image from '../models/Image.js'
import Category from '../models/Category.js'
import { protect } from '../middleware/auth.js'
import cloudinary from '../config/cloudinary.js'
import { upload } from '../config/multer.js'

const router = express.Router()

/* ================= UPLOAD IMAGES ================= */

router.post('/', protect, upload.array('image', 20), async (req, res) => {
  try {
    const { categoryId } = req.body

    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    /* 🔹 Upload to Cloudinary (ENHANCED – LOGIC UNCHANGED) */
    const imagesToInsert = []

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `interior/${category.idPrefix}`,
          resource_type: 'image',

          // 🔥 IMAGE ENHANCEMENT (ONLY ADDITION)
          quality: 'auto:best',
          fetch_format: 'auto',
          transformation: [
            { width: 2000, height: 2000, crop: 'limit' },
            { effect: 'improve' },
            { effect: 'auto_color' },
            { effect: 'auto_brightness' },
            { effect: 'sharpen:120' },
            { effect: 'auto_saturation' },


          ],
        }
      )

      imagesToInsert.push({
        categoryId,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        name: file.originalname,
      })
    }

    await Image.insertMany(imagesToInsert)

    /* 🔁 Re-number displayId (UNCHANGED) */
    const allImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
    const prefix = category.idPrefix || 'IMG'

    const bulkOps = allImages.map((img, index) => ({
      updateOne: {
        filter: { _id: img._id },
        update: {
          displayId: `${prefix}-${String(index + 1).padStart(2, '0')}`,
        },
      },
    }))

    if (bulkOps.length > 0) {
      await Image.bulkWrite(bulkOps)
    }

    const updatedImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
    res.status(201).json(updatedImages)
  } catch (error) {
    console.error('Upload Error:', error)
    res.status(500).json({ message: error.message })
  }
})

/* ================= DELETE IMAGE ================= */

router.delete('/:id', protect, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }

    const categoryId = image.categoryId

    /* 🔥 Delete from Cloudinary */
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId, {
        resource_type: 'image',
      })
    }

    /* 🔥 Delete from MongoDB */
    await Image.findByIdAndDelete(req.params.id)

    /* 🔁 Re-number remaining images (UNCHANGED) */
    const remainingImages = await Image.find({ categoryId }).sort({ createdAt: 1 })
    const category = await Category.findById(categoryId)

    if (category) {
      const bulkOps = remainingImages.map((img, index) => ({
        updateOne: {
          filter: { _id: img._id },
          update: {
            displayId: `${category.idPrefix}-${String(index + 1).padStart(2, '0')}`,
          },
        },
      }))

      if (bulkOps.length > 0) {
        await Image.bulkWrite(bulkOps)
      }
    }

    res.json({ message: 'Image deleted and IDs updated' })
  } catch (error) {
    console.error('Delete Image Error:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router
