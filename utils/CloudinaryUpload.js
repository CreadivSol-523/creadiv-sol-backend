import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file, folder = "portfolio") => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file passed to Cloudinary upload");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image"
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(file.buffer);
  });
};
