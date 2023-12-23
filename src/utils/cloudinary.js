/* their are two steps upload file 
 1 - to take file (image, svg) from the user and upload it to our own server
 2 - then from our server upload it to the cloudinary 

 why to use this method ?
 -> because in case of any failure while uploading to the cloudinary, we have a backup of the file, and we can try again (to ask again the user for file comes under bad user experience)
-> after successful uploading of file to cloudinary, we can remove the file from our own server
 */

import { v2 as cloudinary } from "cloudinary";

// node file sysyem handler
import fs from "fs";

// is function is copy?past from cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file to cloudinary
    const resposne = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("file us uploaded on cloudinary", resposne.url);
    return resposne;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed
    // this method is syncronous in nature
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
