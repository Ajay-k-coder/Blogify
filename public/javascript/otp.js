//  const CORRECT_OTP = "<%= otp %>";
//     const inputs = document.querySelectorAll('.otp-input');
//     const submitBtn = document.getElementById('submitBtn');
//     const msgEl = document.getElementById('message');
//     const timerEl = document.getElementById('timer');
//     const resendBtn = document.getElementById('resendBtn');

//     let timerInterval;
//     let expired = false;

//     // ── Auto-focus & navigation ──────────────────────────────────────
//     inputs.forEach((inp, i) => {
//       inp.addEventListener('input', (e) => {
//         const val = e.target.value.replace(/\D/g, '');
//         inp.value = val;
//         if (val) {
//           inp.classList.add('filled');
//           if (i < inputs.length - 1) inputs[i + 1].focus();
//         } else {
//           inp.classList.remove('filled');
//         }
//         checkComplete();
//       });

//       inp.addEventListener('keydown', (e) => {
//         if (e.key === 'Backspace' && !inp.value && i > 0) {
//           inputs[i - 1].focus();
//           inputs[i - 1].value = '';
//           inputs[i - 1].classList.remove('filled');
//           checkComplete();
//         }
//         if (e.key === 'ArrowLeft' && i > 0) inputs[i - 1].focus();
//         if (e.key === 'ArrowRight' && i < inputs.length - 1) inputs[i + 1].focus();
//       });

//       // Handle paste on first input
//       inp.addEventListener('paste', (e) => {
//         e.preventDefault();
//         const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
//         pasted.split('').forEach((ch, j) => {
//           if (inputs[j]) {
//             inputs[j].value = ch;
//             inputs[j].classList.add('filled');
//           }
//         });
//         const nextEmpty = [...inputs].findIndex(el => !el.value);
//         if (nextEmpty !== -1) inputs[nextEmpty].focus();
//         else inputs[inputs.length - 1].focus();
//         checkComplete();
//       });
//     });

//     inputs[0].focus();

//     function checkComplete() {
//       const filled = [...inputs].every(el => el.value.length === 1);
//       submitBtn.disabled = !filled || expired;
//     }

//     function getEnteredOtp() {
//       return [...inputs].map(el => el.value).join('');
//     }

//     // ── Verify ───────────────────────────────────────────────────────
//     function verifyOtp() {
//       if (expired) return showMessage('Code has expired. Please request a new one.', 'error');

//       const entered = getEnteredOtp();

//       if (entered === CORRECT_OTP) {
//         inputs.forEach(el => { el.classList.add('success'); el.classList.remove('error'); });
//         showMessage('✓ Verified successfully! Redirecting…', 'success');
//         submitBtn.disabled = true;

//         // Submit form to backend
//         document.getElementById('otpHidden').value = entered;
//         setTimeout(() => document.getElementById('otp-form').submit(), 1200);
//       } else {
//         inputs.forEach(el => { el.classList.add('error'); el.classList.remove('filled', 'success'); });
//         showMessage('Incorrect code. Please try again.', 'error');
//         setTimeout(() => {
//           inputs.forEach(el => { el.classList.remove('error'); el.value = ''; });
//           inputs[0].focus();
//           checkComplete();
//         }, 800);
//       }
//     }

//     function showMessage(text, type) {
//       msgEl.textContent = text;
//       msgEl.className = 'message ' + type;
//     }

//     // ── Countdown Timer ──────────────────────────────────────────────
//     function startTimer(seconds) {
//       clearInterval(timerInterval);
//       expired = false;
//       resendBtn.classList.remove('active');

//       timerInterval = setInterval(() => {
//         const m = String(Math.floor(seconds / 60)).padStart(2, '0');
//         const s = String(seconds % 60).padStart(2, '0');
//         timerEl.textContent = `${m}:${s}`;

//         if (seconds <= 0) {
//           clearInterval(timerInterval);  
//           timerEl.textContent = '00:00';
//           expired = true;
//           submitBtn.disabled = true;
//           resendBtn.classList.add('active');
//           showMessage('Code expired. Click "Resend code" to get a new one.', 'error');
//         }
//         seconds--;
//       }, 1000);
//     }

//     function resendOtp() {
//       if (!resendBtn.classList.contains('active')) return;
//       // POST to backend resend route — adjust URL as needed
//       fetch('/resend-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: "<%= email %>" })
//       }).then(res => {
//         if (res.ok) {
//           inputs.forEach(el => { el.value = ''; el.className = 'otp-input'; });
//           inputs[0].focus();
//           msgEl.className = 'message';
//           expired = false;
//           submitBtn.disabled = true;
//           startTimer(120);
//           showMessage('New code sent! Check your inbox.', 'success');
//         } else {
//           showMessage('Could not resend. Please try again.', 'error');
//         }
//       }).catch(() => showMessage('Network error. Please try again.', 'error'));
//     }

//     // Start on load
//     startTimer(120);



// const otp_input_container = document.getElementById("otp-input-container");
// const otp_verify_button = document.getElementById("otp-verify-button");

const input_otp = document.querySelectorAll(".input-otp");
console.log("input_otp" ,input_otp);

if(input_otp){
  console.log("inside if function scope")
  input_otp.forEach((input, index)=>{
    console.log("inside forEach scope")
      input.addEventListener("input", (event)=>{
        console.log("event.target.value", event.target.value );
        if(event.target.value.length === 1 && index < input_otp.length-1){
            
          input_otp[index+1].focus();
          input_otp[index].classList.add("filled");
  
        }
       
      
      })
      
input.addEventListener('keydown', (e) => {
        // If they hit Backspace, and the current box is empty, and it's not the first box...
        if (e.key === 'Backspace' && !input.value && index > 0) {
            // ...move the cursor back to the previous input box
            input_otp[index - 1].focus();
            input_otp[index-1].value = '';
            input_otp[index-1].classList.remove("filled");
        }
        if(e.key === "ArrowLeft" && index > 0){
          input_otp[index-1].focus();
        }
        if(e.key === "ArrowRight" && index < input_otp.length-1){
          input_otp[index+1].focus();
        }
          
    });


        // input.addEventListener('keydown', (e) => {
        // if (e.key === 'Backspace' && !input.value && index > 0) {
        //   input_otp[index - 1].focus();
        //   input_otp[index - 1].value = '';
          // input_otp[index - 1].classList.remove('filled');
          // checkComplete();
        // }
        // if (e.key === 'ArrowLeft' && i > 0) inputs[i - 1].focus();
        // if (e.key === 'ArrowRight' && i < inputs.length - 1) inputs[i + 1].focus();
      // });
  })
      
}else{
    console.log("else function scope")
}


// console.log("otp_input_container", otp_input_container);
// otp_input_container = 0;
// console.log("otp-verify-button", otp_verify_button)

