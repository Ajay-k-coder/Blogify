
const avatar_preview = document.getElementById("avatar-preview");
const avatar = document.getElementById("avatar");

console.log("avatar preview", avatar_preview);
console.log("avatar", avatar);

avatar.addEventListener("change" , function(event){

    const file = event.target.files[0];
    console.log("file", file)
    if(file){
        const objectURL= URL.createObjectURL(file);
        avatar_preview.src = objectURL;
        
    }


    avatar_preview
})