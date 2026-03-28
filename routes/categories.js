import express from 'express'
import Category from '../models/Category.js'
import Image from '../models/Image.js'
import { protect } from '../middleware/auth.js'
import cloudinary from '../config/cloudinary.js'


const router = express.Router()

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create category (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, imageUrl, idPrefix } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    if (!idPrefix) {
      return res.status(400).json({ message: 'ID Prefix is required' })
    }

    const category = new Category({
      name,
      description,
      imageUrl,
      idPrefix: idPrefix.toUpperCase().trim(),
    })

    const savedCategory = await category.save()
    res.status(201).json(savedCategory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update category (protected) - Updates image IDs if prefix changes
router.put('/:id', protect, async (req, res) => {
  try {
    // Get the current category to check if idPrefix is changing
    const currentCategory = await Category.findById(req.params.id)
    if (!currentCategory) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Normalize the new idPrefix
    const newIdPrefix = req.body.idPrefix ? req.body.idPrefix.toUpperCase().trim() : currentCategory.idPrefix
    const idPrefixChanged = currentCategory.idPrefix !== newIdPrefix

    // Update the category
    const updatedData = {
      ...req.body,
      idPrefix: newIdPrefix,
    }
      
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    )

    // If idPrefix changed, update all existing images' displayIds
    if (idPrefixChanged) {
      const existingImages = await Image.find({ categoryId: req.params.id }).sort({ createdAt: 1 })
      
      // Update each image with new displayId
      await Promise.all(
        existingImages.map(async (image, index) => {
          const newDisplayId = `${newIdPrefix}-${String(index + 1).padStart(2, '0')}`
          await Image.findByIdAndUpdate(image._id, { displayId: newDisplayId })
        })
      )
    }
              
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})





  

// Delete category (protected)
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     const category = await Category.findByIdAndDelete(req.params.id)

//     if (!category) {
//       return res.status(404).json({ message: 'Category not found' })
//     }

//     // Also delete all images in this category
//     await Image.deleteMany({ categoryId: req.params.id })

//     res.json({ message: 'Category deleted successfully' })
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// })



// new delete include cloudinary

router.delete('/:id', protect, async (req, res) => {
  try {
    const categoryId = req.params.id

    // 1️⃣ Check category
    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // 2️⃣ Get all images under category
    const images = await Image.find({ categoryId })

    // 3️⃣ Delete from Cloudinary (CORRECT WAY)
    await Promise.all(
      images.map(async (img) => {
        if (!img.publicId) return

        const result = await cloudinary.uploader.destroy(img.publicId, {
          resource_type: 'image',
        })

        console.log('Cloudinary delete:', img.publicId, result)
      })
    )

    // 4️⃣ Delete images from MongoDB
    await Image.deleteMany({ categoryId })

    // 5️⃣ Delete category
    await Category.findByIdAndDelete(categoryId)

    res.json({
      message: 'Category and all images deleted successfully',
    })
  } catch (error) {
    console.error('Delete Category Error:', error)
    res.status(500).json({ message: error.message })
  }
})






// Get images for a category
router.get('/:id/images', async (req, res) => {
  try {
    const images = await Image.find({ categoryId: req.params.id }).sort({ createdAt: 1 })
    res.json(images)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all images mixed (for projects section)
router.get('/images/all', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 })
    res.json(images)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

