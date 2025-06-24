import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const uploadedResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        }
        )
        console.log("file uploaded on cloudinary", uploadedResult.url);
        console.log("RRRRRRRRRR", uploadedResult)
        fs.unlinkSync(localFilePath);
        return uploadedResult;
    }
    catch (error) {
        fs.unlinkSync(localFilePath); // removing the locally saved file from server as the upload on cloudinary got failed.
        return null;
    }
}

export { uploadOnCloudinary };