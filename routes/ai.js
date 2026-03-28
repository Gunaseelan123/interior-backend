// import express from 'express'
// import multer from 'multer'
// import path from 'path'
// import { fileURLToPath } from 'url'
// import { GoogleGenerativeAI } from '@google/generative-ai'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// const router = express.Router()

// const storage = multer.memoryStorage()
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif|webp/
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
//     const mimetype = allowedTypes.test(file.mimetype)

//     if (mimetype && extname) {
//       return cb(null, true)
//     } else {
//       cb(new Error('Only image files are allowed'))
//     }
//   },
// })

// // Generate design suggestions using Gemini AI
// router.post('/generate-design', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'Image file is required' })
//     }

//     const apiKey = process.env.GEMINI_API_KEY
//     if (!apiKey) {
//       // Fallback to sample designs if API key not configured
//       const sampleDesigns = [
//         'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
//         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
//         'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
//         'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
//       ]
//       return res.json({
//         message: 'Design suggestions generated (demo mode)',
//         designs: sampleDesigns,
//       })
//     }

//     // Initialize Gemini AI
//     const genAI = new GoogleGenerativeAI(apiKey)
//     const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

//     // Convert image to base64
//     const imageBase64 = req.file.buffer.toString('base64')
//     const mimeType = req.file.mimetype

//     // Generate design prompts
//     const prompt = `Analyze this room image and generate 4 interior design suggestions showing how this space can be transformed with wood and plywood work. 
//     Focus on:
//     1. Custom furniture designs (wardrobes, cabinets, shelves)
//     2. Wood paneling and wall treatments
//     3. Plywood partitions and room dividers
//     4. Integrated storage solutions
    
//     Provide detailed design concepts that showcase wood and plywood craftsmanship.`

//     try {
//       const result = await model.generateContent([
//         prompt,
//         {
//           inlineData: {
//             data: imageBase64,
//             mimeType: mimeType,
//           },
//         },
//       ])

//       const response = await result.response
//       const text = response.text()

//       // For now, return sample designs as Gemini Vision API may need different setup
//       // In production, you would process the response and generate actual images
//       const sampleDesigns = [
//         'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
//         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
//         'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
//         'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
//       ]

//       res.json({
//         message: 'Design suggestions generated',
//         designs: sampleDesigns,
//         aiResponse: text.substring(0, 500), // Include AI response for reference
//       })
//     } catch (aiError) {
//       console.error('Gemini API Error:', aiError)
//       // Fallback to sample designs
//       const sampleDesigns = [
//         'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
//         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
//         'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
//         'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
//       ]
//       res.json({
//         message: 'Design suggestions generated (fallback mode)',
//         designs: sampleDesigns,
//       })
//     }
//   } catch (error) {
//     console.error('Error generating design:', error)
//     res.status(500).json({ message: error.message })
//   }
// })

// export default router




    

import express from 'express'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

// Configure multer for image upload
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Initialize Gemini AI (optional, for future use)
let genAI = null
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

/* ================= GENERATE DESIGN FROM IMAGE ================= */

router.post('/generate-design', upload.single('image'), async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' })
    }

    // For now, return sample design suggestions
    // In production, you would process the image with AI and generate actual design suggestions
    const sampleDesigns = [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    ]

    // TODO: In production, use AI to analyze the uploaded image and generate design suggestions
    // Example with Gemini Vision API:
    // if (genAI) {
    //   const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
    //   const imageBase64 = req.file.buffer.toString('base64')
    //   const prompt = 'Analyze this room and suggest 4 interior design transformations with wood and plywood work...'
    //   const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: req.file.mimetype } }])
    //   // Process result and generate design images
    // }

    res.json({
      message: 'Design suggestions generated successfully',
      designs: sampleDesigns,
    })
  } catch (error) {
    console.error('Error generating design:', error)
    res.status(500).json({ message: error.message || 'Failed to generate design suggestions' })
  }
})

export default router
