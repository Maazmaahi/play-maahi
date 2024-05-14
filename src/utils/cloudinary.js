import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("File is uploaded on cloudinary ", response.url);
    // console.log("File is uploaded on cloudinary response ", response);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localfilepath);
    return null;
  }
};

const deleteOnCloudinary = async (url, resource_type) => {
  try {
    await cloudinary.api
      .delete_resources([url], { type: "upload", resource_type: resource_type })
      .then(console.log);
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
