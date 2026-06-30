const image = require("../models/image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const uploadImageController = async (req, res) => 
{
  try 
  {
    //check if file is messing in req object
    if(!req.file)
      {
          return res.status(400).json(
            {
              success: false,
              message: "File is required. please upload an image",
            });
      }
    //upload to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);
    //delete the file from local storage 
    fs.unlinkSync(req.file.path);
    // store the image amd th epublic id along with the uplaoded user id in the database
      const newlyUploadedImage = new image(
        {
          url,
          publicId,
          uploadedBy: req.userinfo.userId
        });
    await newlyUploadedImage.save();
    res.status(201).json(
      {
        success: true,
        message: "Image uploaded successfully",
        image: newlyUploadedImage
      });

  } catch (error) 
  {
    console.log(error);
    res.status(500).json
    (
      { 
      success: false,
      message: "Something went wrong! Please try again.", 
      }
    );
  }

}

const fetchImagesController = async (req, res) =>
{
  try {
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  const totalImages = await image.countDocuments();
  const totalPages = Math.ceil(totalImages / limit);
  const sortObj = {};
  sortObj[sortBy] = sortOrder;
  const images = await image.find().sort(sortObj).skip(skip).limit(limit);
 
  if(images){
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: totalPages,
      totalImages: totalImages,
      data:images
    });
  }
  } catch (error) {
     console.log(error);
    res.status(500).json
    (
      { 
      success: false,
      message: "Something went wrong! Please try again.", 
      }
    );
  }
}

const deleteImageController = async (req, res) => 
{
try 
{
  const getCurrentIdOfImageToBeDeleted = req.params.id;
  const usrId = req.userinfo.userId;
  const img = await image.findById(getCurrentIdOfImageToBeDeleted);
  if(!img)
  {
    return res.status(404).json(
      {
        success: false,
        message: "Image not found",
      });
  }
//check if this image is uploaded by the current user who is trying to delete this image 
if(img.uploadedBy.toString() !== usrId)
{
  return res.status(403).json(
    {
      success: false,
      message: "You are not authorized to delete this image because you are not the uploader of this image",
    });
}
//delete the image from cloudinary storage
await cloudinary.uploader.destroy(img.publicId);
//delete the image from database
await image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);
res.status(200).json(
  {
    success: true,
    message: "Image deleted successfully",
  });

} catch (error) 
{
  console.log(error);
  res.status(500).json
  (
    { 
    success: false,
    message: "Something went wrong! Please try again.", 
    }
  );
}
}


module.exports = { uploadImageController,fetchImagesController,deleteImageController }; 