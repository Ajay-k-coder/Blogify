const edit_blog_image = document.getElementById("edit-blog-image");
const image_input = document.getElementById("image-input");
// const imageInput = image_input[0];

// console.log("edit_blog_image ",edit_blog_image[0]);
// console.log("image_input", imageInput);

if (image_input) {
    console.log("inside if scope");

    image_input.addEventListener("change", function (event) {
        const file = event.target.files[0];
        console.log("value ", file);
        if (file) {
            const objectURL = URL.createObjectURL(file);
            console.log("objectURL ", objectURL);
            edit_blog_image.src = objectURL;
            console.log("edit_blog_image", edit_blog_image);
            edit_blog_image.classList.add("edit-blog-image");
            edit_blog_image.classList.add("class_block");
        }
        edit_blog_image;
    });
}
