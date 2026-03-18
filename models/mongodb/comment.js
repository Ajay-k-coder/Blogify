const mongoose = require("mongoose");
const {Schema} = mongoose;

const commentSchema = Schema({
    comment:{
        type:String,
        required:true,
    },
    commitedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    commitedIn:{
        type:Schema.Types.ObjectId,
        ref:"blog",
    }
    },
    {timestamps:true}
)


const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;