import mongoose from 'mongoose'

// Generic key/value settings model.
// We keep value as Mixed so we can store simple strings OR JSON (arrays/objects).
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Settings = mongoose.model('Settings', settingsSchema)

export default Settings



