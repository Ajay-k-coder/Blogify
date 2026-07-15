const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("multer");

const { eventNames } = require('../models/mongodb/blog');

cloudinary.config({  
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
  

const storage = new CloudinaryStorage({ 
    cloudinary: cloudinary,
    params:{  
        folder:"blogify_avatar",
        allowed_formats:["jpg", "png", "jpeg"],
        transformation:[{width:900, height:500, crop:'pad', background:"#0f172a"}]
    }
});

const upload = multer({storage:storage});

module.exports = upload; 