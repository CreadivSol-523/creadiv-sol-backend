import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactUsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    services: {
      type: [String],
      default: [],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^\+?[0-9]{7,15}$/,
        "Phone number must be valid (7–15 digits)",
      ],
    },
    description: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [250, "Message cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

const ContactUsModel = mongoose.model("contacts", ContactUsSchema);
export default ContactUsModel;
