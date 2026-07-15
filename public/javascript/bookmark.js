const bookmarkButton = document.getElementById("bookmark-button");
const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");

if (likeButton) {
    likeButton.addEventListener("click", async function () {
        const blogid = this.getAttribute("data-blog-id");
        const icon = this.querySelector("i");
        try {
            const response = await fetch(`/blog/like/${blogid}`, {
                method: "post",
                headers: {
                    "content-type": "application/json",
                },
            });
            const data = await response.json();

            if (response.status === 401) {
                alert("Please log in to save this post!");
                window.location.href = "/user/login";
                return;
            }

            if (response.ok) {
                console.log("data status", data.status);
                if (data.status === "saved") {
                    const value = likeCount.innerHTML;
                    const newValue = Number(value) + 1;
                    likeCount.innerHTML = newValue;
                    icon.classList.add("fa-solid");
                    icon.classList.remove("fa-regular");
                } else if (data.status === "unsaved") {
                    icon.classList.add("fa-regular");
                    icon.classList.remove("fa-solid");

                    const value = likeCount.innerHTML;
                    const newValue = Number(value) - 1;

                    likeCount.innerHTML = newValue;
                }
            } else {
                console.log("error");
            }
        } catch (error) {
            console.error("error", error);
        }
    });
}

if (bookmarkButton) {
    bookmarkButton.addEventListener("click", async function () {
        const blogid = this.getAttribute("data-blog-id");
        const icon = this.querySelector("i");

        try {
            const response = await fetch(`/blog/bookmark/${blogid}`, {
                method: "post",
                headers: {
                    "content-type": "application/json",
                },
            });

            if (response.status === 401) {
                alert("Please log in to save this post!");

                window.location.href = "/user/login";
                return;
            }

            const data = await response.json();

            if (response.ok) {
                if (data.status === "saved") {
                    icon.classList.remove("fa-regular");
                    icon.classList.add("fa-solid");
                } else if (data.status === "unsaved") {
                    icon.classList.remove("fa-solid");
                    icon.classList.add("fa-regular");
                }
            } else {
                console.error("failed to upate bookmark status");
            }
        } catch (error) {
            console.error("Error communicating with the server:", error);
            // console.log("RESPONSE: ");
        }
    });
}
