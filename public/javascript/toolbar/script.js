
// // const button = document.querySelector(".toolbar-btn");
// // console.log(button);
// const toolbar = document.querySelector(".toolbar");
// console.log(toolbar);

// const { setMonthWithOptions } = require("date-fns/fp");

// // const boldBtn = document.getElementById("bold-btn");

// // console.log(boldBtn);

// const textarea = document.getElementById("content");
// console.log(textarea);

// // textarea.innerHTML= "<h1> Hello world</h1>"


// const symbols = {
//     "bold-btn": {"start": "**", "end": "**"},
//     "italic-btn": {"start": "*", "end": "*"},
//     "heading-btn": {"start": "# ", "end": ""},
//     "link-btn": {"start": "[", "end": "](url)"},
//     "image-btn": {"start": "![", "end": "](image.jpg)"},
//     "code-btn": {"start": "```", "end": "```"},
//     "quote-btn": {"start": "> ", "end": ""},
//     "unordered-list-btn": {"start": "- ", "end": ""},
//     "ordered-list-btn": {"start": "1. ", "end": ""},
//      "strikethrough-btn": {"start": "~~", "end": "~~"},
//      "underline-btn": {"start": "<u>", "end": "</u>"}


// }



// if(toolbar){
    
// toolbar.addEventListener("click", (event)=>{
//     // event.preventDefault();
    

//     const button = event.target.closest(".toolbar-btn");
    

//     console.log(button);
//     console.log(button.getAttribute("id"));
//     for (const key in symbols) {
//         if (key === button.getAttribute("id")) {
//             const symbol = symbols[key];
//             console.log(symbol);
//             const start = textarea.selectionStart;
//             const end = textarea.selectionEnd;

//             console.log("start", start);
//             console.log("End", end);
            
//             const selectedText = textarea.value.substring(start, end);
//             console.log("Selected Text", selectedText);
//             const newText = symbol.start + selectedText + symbol.end;
//             console.log("New Text", newText);

//             textarea.setRangeText(newText, start, end, "end");

//             textarea.focus();

//             if (selectedText.length === 0) {
//                 const cursorPosition = start + symbol.start.length;
//                 textarea.setSelectionRange(cursorPosition, cursorPosition);
//             }else{
//                 const newEnd = start + newText.length;
//                 textarea.setSelectionRange(newEnd, newEnd);
//             }

            
            
          


//         }
//     }
//     if (!button) return; // Click was outside a button  




const toolbarOption =  [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'hr'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean'] // removes formatting
            ]



var quill = "Hello world"

document.addEventListener("DOMContentLoaded", function() {

    quill = new Quill("#quill-contianer", {
        theme:"snow",
        placeholder:"Write you thought here...",
        modules:{
            toolbar: toolbarOption,
        }
    })
});  


const submit_button = document.getElementById("submit-button")
let hidden_content = document.getElementById("hidden-content");
        console.log("hidden_content", hidden_content);
// console.log("hidden_content);
// console.log(submit_button);

if(submit_button){
    submit_button.addEventListener("click", function(event){
        
        const content = quill.root.innerHTML;
        // console.log("content", content);
        hidden_content.value = content;
        console.log("hidden_content", hidden_content);

    })
}


// var form = document.querySelector('form'); 
    
//     form.onsubmit = function() {
//         // Grab the raw HTML from the Quill editor
//         var htmlContent = document.querySelector('#quill-contianer').innerHTML;
        
//         // Inject that HTML into the hidden input right before the form sends
//         document.getElementById('hidden-content').value = htmlContent;
        
//         // The form now continues submitting normally to action="/blog/new"
//     };
 
   

 
            
// })

// }

