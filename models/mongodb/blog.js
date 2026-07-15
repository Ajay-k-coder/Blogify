const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: false,
        },
        coverImage: {
            type: String,
            required: false,
        },
        createdBy: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        tags: [
            {
                type: String,
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ["draft", "published"],
            default: "draft",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
