const option_button = document.getElementsByClassName("user_options");
const published_post = document.getElementsByClassName("published_post");
const like_post = document.getElementsByClassName("like_post");
const save_post = document.getElementsByClassName("save_post");
const public = document.getElementsByClassName("public");
const save = document.getElementsByClassName("save");
const like = document.getElementsByClassName("like");

if (option_button) {
    for (let button of option_button) {
        button.addEventListener("click", async (event) => {
            const btn = event.target.classList;
            if (btn[0] === "save") {
                try {
                    const response = await fetch("/blog/api/bookmark");
                    const datas = await response.json();

                    save_post[0].classList.add("class_block");
                    save_post[0].classList.remove("class_none");
                    save[0].classList.add("active");

                    published_post[0].classList.add("class_none");
                    published_post[0].classList.remove("class_block");
                    public[0].classList.remove("active");

                    like_post[0].classList.add("class_none");
                    like_post[0].classList.remove("class_block");
                    like[0].classList.remove("active");
                    save_post[0].innerHTML = "";

                    if (datas.saveBlogs.length > 0) {
                        const parentCard = document.createElement("div");
                        parentCard.classList.add("user-blogs-list");
                        datas.saveBlogs.forEach((blog) => {
                            const card = document.createElement("div");
                            card.classList.add("one-blog-container");
                            card.innerHTML = `
                             <a href="/blog/${blog._id}" class="home-card-anchor">   
                                <div class="parent blog">
                                    <div class="child1 grid-child">
                                        <img
                                            src="${blog.path}"
                                            alt="image"
                                            class="home_card_image"
                                        />
                                    </div>
                                    <div class="child2 grid-child name-and-date ">   &nbsp; by: ${blog.author}</div>
                                    <div class="child3 grid-child name-and-date ">    ${blog.createdAt}</div>
                                    <div class="child4 grid-child">
                                        <h1 class="title"> ${blog.title}</h1>
                                    </div>
                                    <div class="child5 grid-child">
                                        <p>${blog.content}...</p> 

                                    </div>
                                </div>
                        </a>
                                    `;
                            parentCard.appendChild(card);
                        });

                        save_post[0].appendChild(parentCard);
                    } else {
                        save_post[0].innerHTML =
                            "<p>You have not saved any posts yet.</p>";
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (btn[0] === "public") {
                published_post[0].classList.add("class_block");
                published_post[0].classList.remove("class_none");
                public[0].classList.add("active");

                save_post[0].classList.add("class_none");
                save_post[0].classList.remove("class_block");
                save[0].classList.remove("active");

                like_post[0].classList.add("class_none");
                like_post[0].classList.remove("class_block");
                like[0].classList.remove("active");
            } else if (btn[0] === "like") {
                try {
                    published_post[0].classList.add("class_none");
                    published_post[0].classList.remove("class_block");
                    public[0].classList.remove("active");

                    save_post[0].classList.add("class_none");
                    save_post[0].classList.remove("class_block");
                    save[0].classList.remove("active");

                    like_post[0].classList.add("class_block");
                    like_post[0].classList.remove("class_none");
                    like[0].classList.add("active");

                    const response = await fetch("/blog/api/like");
                    const datas = await response.json();

                    like_post[0].innerHTML = " ";

                    if (datas.likeblogs.length > 0) {
                        const parentCard = document.createElement("div");
                        parentCard.classList.add("user-blogs-list");

                        datas.likeblogs.forEach((blog) => {
                            // <div class="one-blog-container">
                            const card = document.createElement("div");
                            card.classList.add("one-blog-container");

                            card.innerHTML = `
                            <a href="/blog/${blog._id}" class="home-card-anchor">   
                                <div class="parent blog">
                                    <div class="child1 grid-child">
                                        <img
                                            src="${blog.path}"
                                            alt="image"
                                            class="home_card_image"
                                        />
                                    </div>
                                    <div class="child2 grid-child name-and-date ">   &nbsp; by: ${blog.author}</div>
                                    <div class="child3 grid-child name-and-date ">    ${blog.createdAt}</div>
                                    <div class="child4 grid-child">
                                        <h1 class="title"> ${blog.title}</h1>
                                    </div>
                                    <div class="child5 grid-child">
                                        <p>${blog.content}...</p> 

                                    </div>
                                </div>
                    
    
                            </a>
                                    `;
                            parentCard.appendChild(card);
                        });

                        like_post[0].appendChild(parentCard);
                    } else {
                        like_post[0].innerHTML =
                            "<p>You have not liked any posts yet.</p>";
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }
}
// }

// get more user

let currentUserPage = 1;
const hasMoreUsers = true;
const more_user_loader = document.getElementById("more_user_loader");
const more_user = document.getElementsByClassName("more_user");
const author_contianer = document.getElementById("author_contianer");

const observer = new IntersectionObserver((entery) => {
    if (entery[0].isIntersecting && hasMoreUsers) {
        loadMoreUser();
    }
});

observer.observe(more_user_loader);

async function loadMoreUser() {
    currentUserPage++;
    const response = await fetch(
        `/profile/api/more-user?page=${currentUserPage}`,
    );
    const moreUser = await response.json();
    console.log("newData ", moreUser.moreUser);
    const newData = moreUser.moreUser;
    if (newData.length === 0) {
        more_user_loader.innerHTML = "You've reached the end!";
        return;
    }

    newData.forEach((author) => {
        console.log("author ", author);

        try {
            const card = document.createElement("div");
            card.className = "author-card";
            console.log("card ", card);

            card.innerHTML = `
             <div class="author-info">
                    <img 
                        src="${author.profile_image_url ? author.profile_image_url : "/images/default-avatar.png"}" 
                        alt="${author.full_name}" 
                        class="author-avatar"
                    >
                    <div class="author-details">
                      <a class="author_detail_anchor" href="/profile/${author.id}"> <h3>${author.full_name}</h3></a> 
 
                    </div>  
                </div> 
                
                
                ${
                    author.isFollowing
                        ? ` <button type="submit" class="btn-following follow_button" data-user-id="${author.id}">Following</button>`
                        : `<button type="submit" class="btn-follow follow_button" data-user-id="${author.id}">Follow</button>`
                }
             
      

            `;

            author_contianer.appendChild(card);
            console.log(card);
        } catch (error) {
            console.log("error", error);
        }
    });
}

//  suggested user javascript

// const follow_button = document.getElementsByClassName("follow_button");

// console.log("follow_button ", follow_button);

// if (follow_button) {
//     console.log("follow_button ", follow_button);
//     for (let follow_btn of follow_button) {
//         console.log("follow_btn", follow_btn);
//         follow_btn.addEventListener("click", async function () {
//             const userid = event.target.getAttribute("data-user-id");
//             const button = event.target;

//             try {
//                 const response = await fetch(`/profile/follow/${userid}`, {
//                     method: "post",
//                     headers: {
//                         "content-type": "application/json",
//                     },
//                 });
//                 console.log("response ", response.ok);

//                 if (response.ok) {
//                     const data = await response.json();
//                     console.log("data ", data);
//                     console.log("data.status ", data.status);

//                     if (data.status === "saved") {
//                         button.classList.remove("btn-follow");
//                         button.classList.add("btn-following");
//                         button.innerHTML = "Following";
//                     }
//                     if (data.status === "unsaved") {
//                         button.classList.add("btn-follow");
//                         button.classList.remove("btn-following");
//                         button.innerHTML = "Follow";
//                     }
//                 }
//             } catch (error) {
//                 console.log(error);
//             }
//             console.log("userid ", userid);
//             console.log("button ", button);
//         });
//     }
// }

const follow_button = document.getElementsByClassName("follow_button");

console.log("follow_button ", follow_button);

if (author_contianer) {
    // console.log("follow_button ", follow_button);
    // for (let follow_btn of follow_button) {
    // console.log("follow_btn", follow_btn);
    console.log("author_contianer ", author_contianer);
    author_contianer.addEventListener("click", async (e) => {
        if (e.target.classList.contains("follow_button")) {
            // console.log();
            const userid = e.target.dataset.userId;
            const button = event.target;
            console.log(" button ", button);
            console.log(" userid ", userid);
            try {
                const response = await fetch(`/profile/follow/${userid}`, {
                    method: "post",
                    headers: {
                        "content-type": "application/json",
                    },
                });
                console.log("response ", response.ok);

                if (response.ok) {
                    const data = await response.json();
                    console.log("data ", data);
                    console.log("data.status ", data.status);

                    if (data.status === "saved") {
                        button.classList.remove("btn-follow");
                        button.classList.add("btn-following");
                        button.innerHTML = "Following";
                    }
                    if (data.status === "unsaved") {
                        button.classList.add("btn-follow");
                        button.classList.remove("btn-following");
                        button.innerHTML = "Follow";
                    }
                }
            } catch (error) {
                console.log(error);
            }
            console.log("userid ", userid);
            console.log("button ", button);
        }
    });
}
// });
//         follow_btn.addEventListener("click", async function () {

//
//         });
//     }
// }
