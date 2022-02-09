var enable_btn = document.querySelector(".submit1");
var counter = 0;

function check_email() {
    var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    var email = form_email.value;

    if (pattern.test(email) && email !== '') 
    {   
        console.log("if condition");
        window['counter'] = window['counter'] + 1;
    } 
    else 
    {
        console.log("else condition");
        window['counter'] = 0
    }

    if( counter === 1){
        enable_btn.classList.toggle("on");
    }
  }