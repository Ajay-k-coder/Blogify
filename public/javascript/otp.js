const input_otp = document.querySelectorAll(".input-otp");
if (input_otp) {
    input_otp.forEach((input, index) => {
        input.addEventListener("input", (event) => {
            console.log("event.target.value", event.target.value);
            if (
                event.target.value.length === 1 &&
                index < input_otp.length - 1
            ) {
                input_otp[index + 1].focus();
                input_otp[index].classList.add("filled");
            }
        });

        input.addEventListener("keydown", (e) => {
            // If they hit Backspace, and the current box is empty, and it's not the first box...
            if (e.key === "Backspace" && !input.value && index > 0) {
                // ...move the cursor back to the previous input box
                input_otp[index - 1].focus();
                input_otp[index - 1].value = "";
                input_otp[index - 1].classList.remove("filled");
            }
            if (e.key === "ArrowLeft" && index > 0) {
                input_otp[index - 1].focus();
            }
            if (e.key === "ArrowRight" && index < input_otp.length - 1) {
                input_otp[index + 1].focus();
            }
        });
    });
} else {
    console.log("else function scope");
}
