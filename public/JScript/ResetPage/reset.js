var passwordTextBox = document.getElementById("form_password");
var retype_password = document.getElementById("form_password_re");
var enable_btn = document.querySelector(".submit");
var enable_btn1 = document.querySelector(".submit1");
var a = 0 ;
var b = 0 ;
var c = 0 ;

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
        console.log('yeahhhhhhh');
    }
    else 
    {
        window['a'] = 0 ;
        console.log('nope');
    }
};

function check_retype_password() {
var retype_password = form_password_re.value;
var password = passwordTextBox.value;
if ( password !== retype_password )
{
    window['b'] = 0 ;
    console.log('false');
}
else 
{
    window['b'] = 1 ;
    console.log('true');
}
}

function btn_check() {
if(a + b == 2 ){
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
}

function numbersOnly(input) {
    var regex = /[^0-9]/gi;
    input.value = input.value.replace(regex,"");
}

/*password critira div class handeling*/

function getfocus() {
    if(document.querySelector(".pass-info").style.visibility = "hidden"){
      document.querySelector(".pass-info").style.visibility = "visible";
      console.log('i am called');
    }
  }
  
  function losefocus() {
    if( document.querySelector(".pass-info").style.visibility = "visible"){
      document.querySelector(".pass-info").style.visibility = "hidden";
      console.log('i am if called');
    }
    else
    console.log('i am else called');
  }