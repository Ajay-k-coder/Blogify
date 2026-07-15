// const feedbutton = document.getElementById("feed-tabs");

// const { application } = require("express");

// const { all } = require("../../routes/blog");

const button_container = document.querySelector(".feed-btn-container");
const feedbutton = document.getElementsByClassName("feed-tabs-btn");
const allBlogs = document.getElementById("allBlogs");
const followingsBlogs = document.getElementById("followingsBlogs");
const following = document.getElementById("btn-following");
const explore = document.getElementById("btn-explore");

const search_button_container = document.querySelector(".search-btn-container");
// const searchbutton = document.querySelector(".search-tabs-btn");
const searchbutton = document.getElementsByClassName("search-tabs-btn");
const authors = document.getElementById("authors");
const filter_tag = document.querySelector(".filter-banner-span");
const currentTag = document.querySelector("#currentTag");
const searchResult = document.querySelector("#searchResult");
const author = document.getElementById("search_author");
const blog = document.getElementById("search_blog");
const filter_banner = document.getElementById("filter-banner");

// console.log("outside if  filter_tag ", filter_tag);
console.log("currentTag ", currentTag);
console.log("searchResult ", searchResult);
if (currentTag) {
    button_container.classList.add("class_none");
} else if (searchResult) {
    button_container.classList.add("class_none");
    search_button_container.classList.remove("class_none");

    if (searchbutton) {
        for (let button of searchbutton) {
            button.addEventListener("click", async function (evnet) {
                const btn = event.target.classList;
                console.log("button", btn);
                if (btn[0] === "search_author") {
                    console.log(btn[0]);
                    author.classList.add("active");
                    blog.classList.remove("active");
                    allBlogs.classList.remove("class_block");
                    allBlogs.classList.add("class_none");

                    authors.classList.remove("class_none");
                    // author.classList.add("class_block");
                } else if (btn[0] === "search_blog") {
                    console.log(btn[0]);
                    blog.classList.add("active");
                    author.classList.remove("active");
                    allBlogs.classList.add("class_block");
                    allBlogs.classList.remove("class_none");
                    authors.classList.add("class_none");
                    // author.classList.remove("class_block");
                }
            });
        }
    }
} else {
    // button_container.classList.remove("class_none");
}
console.log("feedbutton", feedbutton);

console.log("feedbutton");

if (feedbutton) {
    for (let button of feedbutton) {
        console.log("button before event ", button);
        button.addEventListener("click", async function (event) {
            const btn = event.target.classList;
            console.log("button", btn);
            try {
                if (btn[0] === "following") {
                    console.log("btn[0]", btn[0]);
                    followingsBlogs.classList.remove("class_none");
                    followingsBlogs.classList.add("class_block");
                    btn - following.classList.add("active");

                    allBlogs.classList.remove("class_block");
                    allBlogs.classList.add("class_none");
                    btn - explore.classList.remove("active");

                    console.log("following", followingsBlogs);
                } else if (btn[0] === "explore") {
                    console.log("btn[0]", btn[0]);
                    allBlogs.classList.remove("class_none");
                    allBlogs.classList.add("class_block");
                    btn - explore.classList.add("active");

                    followingsBlogs.classList.remove("class_block");
                    followingsBlogs.classList.add("class_none");
                    btn - following.classList.remove("active");
                }
            } catch (error) {
                console.log(error);
            }
        });
    }
}

// load more post

const blog_container = document.getElementById("blog_container");
const following_feed = document.getElementsByClassName("following_feed");
const following_blog_container = document.getElementsByClassName(
    "following_blog_container",
);

const global_blog_container = document.getElementsByClassName(
    "global_blog_container",
);

let currentPage = 1;
let currentPage_following_feed = 1;
let isLoading = false;

let hasMorePosts = true;

const triggerElement = document.getElementById("scroll-trigger");
const scroll_trigger_following_feed = document.getElementById(
    "scroll_trigger_following_feed",
);

// let parent;
const observer1 = new IntersectionObserver(
    (enteries) => {
        if (enteries[0].isIntersecting && !isLoading && hasMorePosts) {
            currentPage++;

            loadMorePost(
                `/home/api/load-more?page=${currentPage}`,
                global_blog_container[0],
                triggerElement,
            );
        }
    },
    { rootMargin: "200px" },
);

const observer2 = new IntersectionObserver(
    (enteries) => {
        if (enteries[0].isIntersecting && !isLoading && hasMorePosts) {
            currentPage_following_feed++;
            loadMorePost(
                `/home/api/more-following-feed?page=${currentPage_following_feed}`,
                following_blog_container[0],
                scroll_trigger_following_feed,
            );
        }
    },
    { rootMargin: "200px" },
);

observer1.observe(triggerElement);
observer2.observe(scroll_trigger_following_feed);

async function loadMorePost(query, element, trigger_element) {
    try {
        console.log(
            " top of the function tringgerElement home_feed",
            triggerElement,
        );

        let response;

        response = await fetch(query);
        const newBlogs = await response.json();

        const newData = newBlogs.newBlog;

        if (newData.length === 0 || typeof newData === "undefined") {
            console.log("is working");
            trigger_element.innerHTML = "<p>You've reached the end!</p>";
            return;
        }

        if (response.ok) {
            newData.forEach((blog) => {
                const card = document.createElement("div");
                card.classList = "parent blog";
                console.log("card ", card);

                let displayTags = [];
                if (blog.tags.length === 1 && blog.tags[0].includes(",")) {
                    displayTags = blog.tags[0].split(",");
                } else {
                    displayTags = blog.tags;
                }

                card.innerHTML = `
                <div class="child1 grid-child">
                        <img
                            src=" ${blog.path}"
                            alt="image"
                            class="home_card_image"
                        />
                    </div>
                    <div class="child2 grid-child name-and-date ">   &nbsp; by:  ${blog.author} </div>
                    <div class="child3 grid-child name-and-date ">  ${blog.createdAt}</div>

                    <div class="child4 grid-child">
                       
                            ${displayTags.forEach(function (tag) {
                                `<a
                                    href="?tag=tag.trim()"
                                    class="blog-badge"
                                    style="text-decoration: none;"
                                >
                                    ${tag.trim()}
                                </a>;`;
                            })}
                        
                       
                    </div>

                    <div class="child5 grid-child ">
                        <a href="/blog/${blog._id} " class="home-card-anchor">  <h2 class="title">${blog.title}</h2></a>
                    </div>

                    <div class="child6 grid-child">
                
                    <p>${blog.content.substring(0, 80)}...</p>
                
                    </div>
                `;
                element.appendChild(card);
            });
        }
    } catch (error) {
        console.log(error);
    } finally {
        isLoading = false;
    }
}
