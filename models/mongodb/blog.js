
const mongoose = require("mongoose");
const {Schema} = mongoose;


const blogSchema = Schema({
    title:{
        type:String,
        required:true, 
    },
    content:{ 
        type:String,
        required:true,
    },
    path:{
        type:String,
        required:false,
    }, 
    coverImage:{
        type:String,
        required:false,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },
},
{timestamps:true}
)
    
// const Blog = mongoose.model("Blog", blogSchema);

// module.exports = Blog;

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
