// import mongoose from 'mongoose'
// import dotenv from 'dotenv'

// dotenv.config()

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interior-woodworks', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     console.log(`MongoDB Connected: ${conn.connection.host}`)
//   } catch (error) {
//     console.error(`Error: ${error.message}`)
//     process.exit(1)
//   }
// }

// export default connectDB






import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing DB connection")
    return
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    isConnected = conn.connections[0].readyState
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`)
    // ❌ DO NOT use process.exit in Vercel
  }
}

export default connectDB


