const toolbarOption = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "hr"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"], // removes formatting
];

var quill = "Hello world";

document.addEventListener("DOMContentLoaded", function () {
    quill = new Quill("#quill-contianer", {
        theme: "snow",
        placeholder: "Write you thought here...",
        modules: {
            toolbar: toolbarOption,
        },
    });
});

const submit_button = document.getElementById("submit-button");
let hidden_content = document.getElementById("hidden-content");

if (submit_button) {
    submit_button.addEventListener("click", function (event) {
        const content = quill.root.innerHTML;
        hidden_content.value = content;
    });
}
