import express from 'express'
import multer from 'multer'
import Settings from '../models/Settings.js'
import { protect } from '../middleware/auth.js'
import cloudinary from '../config/cloudinary.js'

const router = express.Router()

// Multer for simple in-memory image uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

// GET /api/settings/:key  -> fetch a single setting
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key })
    if (!setting) {
      return res.json({ key: req.params.key, value: '' })
    }
    res.json(setting)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/settings  -> fetch all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/settings  -> create or update a simple key/value
router.post('/', protect, async (req, res) => {
  try {
    const { key, value } = req.body

    if (!key) {
      return res.status(400).json({ message: 'Key is required' })
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true, runValidators: true }
    )

    res.json(setting)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/settings/hero-images/upload  -> upload hero slider images to Cloudinary
router.post(
  '/hero-images/upload',
  protect,
  upload.array('images', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' })
      }

      const uploadedImages = []

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: 'interior/hero',
            resource_type: 'image',
            quality: 'auto:best',
            fetch_format: 'auto',
          }
        )

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }

      // Load any existing hero images (old data may be strings, new data objects)
      const existingSetting = await Settings.findOne({ key: 'heroImages' })
      let existingImages = []

      if (existingSetting && existingSetting.value) {
        try {
          const parsed = Array.isArray(existingSetting.value)
            ? existingSetting.value
            : JSON.parse(existingSetting.value || '[]')

          existingImages = parsed.map((img) =>
            typeof img === 'string' ? { url: img, publicId: null } : img
          )
        } catch {
          existingImages = []
        }
      }

      const allImages = [...existingImages, ...uploadedImages]

      const setting = await Settings.findOneAndUpdate(
        { key: 'heroImages' },
        { value: JSON.stringify(allImages) },
        { upsert: true, new: true }
      )

      res.json({
        message: 'Images uploaded successfully',
        images: allImages,
        setting,
      })
    } catch (error) {
      console.error('Upload Hero Images Error:', error)
      res.status(500).json({ message: error.message })
    }
  }
)

// DELETE /api/settings/hero-images/:index  -> delete a hero image and remove from Cloudinary
router.delete('/hero-images/:index', protect, async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10)
    if (Number.isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Invalid image index' })
    }

    const setting = await Settings.findOne({ key: 'heroImages' })
    if (!setting || !setting.value) {
      return res.status(404).json({ message: 'Hero images not found' })
    }

    let images = []
    try {
      const parsed = Array.isArray(setting.value)
        ? setting.value
        : JSON.parse(setting.value || '[]')

      images = parsed.map((img) =>
        typeof img === 'string' ? { url: img, publicId: null } : img
      )
    } catch {
      return res.status(500).json({ message: 'Failed to parse images' })
    }

    if (index >= images.length) {
      return res.status(404).json({ message: 'Image not found' })
    }

    if (images.length === 1) {
      return res.status(400).json({ message: 'At least one image is required' })
    }

    const imageToDelete = images[index]

    // Try to delete from Cloudinary if we have a publicId
    if (imageToDelete.publicId) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.publicId, {
          resource_type: 'image',
        })
        console.log('Deleted hero image from Cloudinary:', imageToDelete.publicId)
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError)
        // Continue even if Cloudinary delete fails
      }
    }

    images.splice(index, 1)

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: 'heroImages' },
      { value: JSON.stringify(images) },
      { new: true }
    )

    res.json({
      message: 'Image deleted successfully',
      images,
      setting: updatedSetting,
    })
  } catch (error) {
    console.error('Delete Hero Image Error:', error)
    res.status(500).json({ message: error.message })
  }
})

export default router



