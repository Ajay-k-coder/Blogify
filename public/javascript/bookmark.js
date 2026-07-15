
const bookmarkButton = document.getElementById('bookmark-button');

const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");
console.log("like-button", likeButton);
console.log("bookmark button", bookmarkButton);

if(likeButton){
    likeButton.addEventListener("click", async function(){
        const blogid = this.getAttribute("data-blog-id");
        const icon = this.querySelector("i");
        console.log("blogid", blogid);
        console.log("icon", icon);
        try{
            const response = await fetch(`/blog/like/${blogid}`, {
                method:"post",
                headers:{
                    "content-type": "application/json"
                }
            })

            console.log("response", response);

            const data = await response.json();
            console.log("response status", response.status)

            console.log(data, "data");

            if(response.status === 401){
                alert("Please log in to save this post!");

                window.location.href="/user/login";
                return;
            }

            if(response.ok){
                console.log("data status", data.status);
                if(data.status === "saved"){
                    console.log("icon in data.status = save", icon)
                    console.log("like count ", likeCount.innerHTML);
                    const value = likeCount.innerHTML;
                    const newValue= Number(value) + 1;

                    likeCount.innerHTML = newValue;

                    
                    icon.classList.add("fa-solid")
                    icon.classList.remove("fa-regular")
                    console.log("icon in data.status = save", icon)
                }else if(data.status === "unsaved"){
                    icon.classList.add("fa-regular");
                    icon.classList.remove("fa-solid");

                    const value = likeCount.innerHTML;
                    const newValue= Number(value) -  1;

                    likeCount.innerHTML = newValue;
                       console.log("icon in data.status = unsave", icon)
                }
            }else{
                console.log("error");
            }
        }catch(error){
            console.error("error", error);
        }
        })
}

if(bookmarkButton){
    bookmarkButton.addEventListener("click", async function(){
        const blogid = this.getAttribute("data-blog-id");
        const icon = this.querySelector("i");

        try{
            const response = await fetch(`/blog/bookmark/${blogid}`, {
                method:'post',
                headers:{
                   "content-type":"application/json"
                }
                
                
            });

            if(response.status === 401){
                alert("Please log in to save this post!");

                window.location.href="/user/login";
                return;
            }

            const data = await response.json();
            // console.log("RESPONSE, ", response);
            // console.log("DATA" , data);

            if(response.ok){
                if(data.status === "saved"){
                    icon.classList.remove('fa-regular');
                    icon.classList.add("fa-solid");
                }else if(data.status === "unsaved"){
                    icon.classList.remove("fa-solid");
                    icon.classList.add("fa-regular");

                }

            }else{
                console.error("failed to upate bookmark status")
            }



            
        }catch(error){
            console.error("Error communicating with the server:", error);
            // console.log("RESPONSE: ");

        }

     

    }
    )

   
}
