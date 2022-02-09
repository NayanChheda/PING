const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const fly = document.querySelector(".image1");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
  fly.classList.toggle("fly-away");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
  fly.classList.toggle("fly-away");
});

/* signup related suff begins below */
/*variables that will be required for form submission check */

var e_mail = 0 ;
var letter = 0 ;
var a = 0 ;
var b = 0 ;
var c = 0 ;
var name_len = document.getElementById('name');
var btn_check = document.querySelector(".check");
var enable_btn = document.querySelector(".submit-btn");
var passwordTextBox = document.getElementById("form_password");
var retype_password = document.getElementById("form_password_re");

/* check name*/

function lettersOnly(input) {
  var regex = /[^a-z]/gi;
  input.value = input.value.replace(regex," ");
}

function count(letter) {
  if (name_len.value.length >= 2)
  {
    window['letter'] = 1;
  }
  else
  {
    window['letter'] = 0;
  }
}

/*check email*/


function check_email() {
  var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  var email = form_email.value;
  if (pattern.test(email) && email !== '') 
  {
    window['e_mail'] = 1 ;
  } 
  else 
  {
    window['e_mail'] = 0 ;
  }
}

/* check password */


function checkPasswordStrength() {
        var password = passwordTextBox.value;
        var specialCharacters = "!£$%^&*_@#~?<>/';:{}[]=+-\|";
        var passwordScore = 0;

        // Contains special characters
        for (var i = 0; i < password.length; i++) 
        {
            if (specialCharacters.indexOf(password.charAt(i)) > -1) 
            {
                passwordScore += 20;
                break;
            }
        }

        // Contains numbers
        if (/\d/.test(password))
            passwordScore += 20;

        // Contains lower case letter
        if (/[a-z]/.test(password))
            passwordScore += 20;

        // Contains upper case letter
        if (/[A-Z]/.test(password))
            passwordScore += 20;

        if (password.length >= 8)
            passwordScore += 20;


        if (passwordScore >= 100) 
        {
            window['a'] = 1;
        }
        else 
        {
            window['a'] = 0 ;
        }
    };

function check_retype_password() {
    var retyping_password = retype_password.value;
    var password = passwordTextBox.value;
    if ( password !== retyping_password )
    {
        window['b'] = 0 ;
    }
    else 
    {
        window['b'] = 1 ;
    }
}

btn_check.addEventListener("keyup",function() {
  if(a + b + e_mail + letter  == 4 ){
        enable_btn.classList.toggle("active");
        c=1;
  }
  else if (c == 1 && b != 1){
      enable_btn.classList.toggle("active");
      c=0;
  }
  else if( c == 1 && a != 1){
    enable_btn.classList.toggle("active");
  }
  else{
      c=0;
  }
})

/* signup related stuff ends here */
/* signin related stuff happens below */

var e_mail1 = 0 ;
var da = 0 ;
var passBox = document.getElementById("Pass_word");
var enable_btn1 = document.querySelector(".submit1");
var enable_frogotpass = document.querySelector(".forgotpass");

function check_email1() {
  var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  var email = form_email_1.value;
  if (pattern.test(email) && email !== '') 
  {
    window['e_mail1'] = 1 ;
    enable_frogotpass.classList.toggle("switchonn");
  } 
  else 
  {
    window['e_mail1'] = 0 ;
  }
}

/* password checker */

function checkPassword() {
  var pass = passBox.value;
  var specialChars = "!£$%^&*_@#~?<>/';:{}[]=+-\|";
  var passScore = 0;

  // Contains special characters
  for (var i = 0; i < pass.length; i++) 
  {
      if (specialChars.indexOf(pass.charAt(i)) > -1) 
      {
          passScore += 20;
          break;
      }
  }

  // Contains numbers
  if (/\d/.test(pass))
      passScore += 20;

  // Contains lower case letter
  if (/[a-z]/.test(pass))
      passScore += 20;

  // Contains upper case letter
  if (/[A-Z]/.test(pass))
      passScore += 20;

  if (pass.length >= 8)
      passScore += 20;


  if (passScore >= 100) 
  {
      window['da'] = 1;
  }
  else 
  {
      window['da'] = 0 ;
  }
};

var f = 0;
function signin_btn_check() {
  if(da + e_mail1  === 2 ){
        f = f+1 ;
        while( f === 1)
        {
          enable_btn1.classList.toggle("onn");
          f = 5 ;
          break;
        }
  }
  else if (f >= 1 && da!= 1){
      enable_btn1.classList.toggle("onn");
      f = 0;

  }
  else{
      f = 0;
  }
}

/*password critira div class handeling*/

function getfocus() {
  if(document.querySelector(".pass-info").style.visibility = "hidden"){
    document.querySelector(".pass-info").style.visibility = "visible";
  }
}

function losefocus() {
  if( document.querySelector(".pass-info").style.visibility = "visible"){
    document.querySelector(".pass-info").style.visibility = "hidden";
  }
}