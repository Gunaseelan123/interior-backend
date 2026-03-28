import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import connectDB from '../config/database.js'

dotenv.config()

const createAdmin = async () => {
  try {
    await connectDB()
    
    const email = process.argv[2] || 'admin@example.com'
    const password = process.argv[3] || 'admin123'

    // Check if admin already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('Admin user already exists!')
      process.exit(0)
    }

    // Create admin user
    const admin = new User({
      email,
      password,
    })

    await admin.save()
    console.log(`Admin user created successfully!`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\nPlease change the password after first login!')
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()







