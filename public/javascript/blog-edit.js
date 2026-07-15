const edit_blog_image = document.getElementById("edit-blog-image");
const image_input = document.getElementById("image-input");

if (image_input) {
    image_input.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const objectURL = URL.createObjectURL(file);
            edit_blog_image.src = objectURL;
            edit_blog_image.classList.add("edit-blog-image");
            edit_blog_image.classList.add("class_block");
        }
        edit_blog_image;
    });
}
