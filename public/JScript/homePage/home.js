const tl = gsap.timeline({ defaults: { ease: "power1.out" } });

tl.to(".text", { y: "0%", duration: 1, stagger: 0.25 });
tl.to(".slider", { y: "-100%", duration: 1, delay: 0.5 });
tl.to(".intro", { y: "-120%", duration: 1.25 }, "-=1");
tl.fromTo("nav", { opacity: 0 }, { opacity: 1, duration: 1 });
tl.fromTo(".big-text", { opacity: 0 }, { opacity: 1, duration: 1 }, "-=1");
tl.fromTo(".bgvideo", { opacity: 0 }, { opacity: 1, duration: 2 }, "-=2");

setTimeout(function(){ 

//document.getElementById("bgvideo").play(); 

}, 8000);
//intro animation

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  links.forEach(link => {
    link.classList.toggle("fade");
  });
  hamburger.classList.toggle('toggle');
});

function close_nav(){
  navLinks.classList.toggle("open");
  links.forEach(link => {
    link.classList.toggle("fade");
  });
  hamburger.classList.toggle('toggle');
}
//nav animation

function scrollAppear(){
  var aboutText = document.querySelector('.about-text');
  var aboutPosition = aboutText.getBoundingClientRect().top;
  var screenPosition = window.innerHeight / 1.2;

  if(aboutPosition < screenPosition){
    aboutText.classList.add('about-appear');
  }
}

  window.addEventListener('scroll',scrollAppear);

//about animation

function scrollAppear1(){
  var paragraph = document.querySelector(".paragraph");
  var paragraphPosition = paragraph.getBoundingClientRect().top;
  var ScreenPosition = window.innerHeight /1.2;

  if(paragraphPosition < ScreenPosition){
    paragraph.classList.add('paragraph-appear');
  }
  scrollAppear3();
}

  window.addEventListener('scroll',scrollAppear1);

function scrollAppear2(){
  var paragraph = document.querySelector(".paragraph2");
  var paragraphPosition = paragraph.getBoundingClientRect().top;
  var ScreenPosition = window.innerHeight /1.2;

  if(paragraphPosition < ScreenPosition){
    paragraph.classList.add('paragraph-appear2');
  }
}

  window.addEventListener('scroll',scrollAppear2);

  function scrollAppear3(){
    var paragraph = document.querySelector(".paragraph3");
    var paragraphPosition = paragraph.getBoundingClientRect().top;
    var ScreenPosition = window.innerHeight /1;
  
    if(paragraphPosition < ScreenPosition){
      paragraph.classList.add('paragraph-appear3');
    }
  }
  
    window.addEventListener('scroll',scrollAppear3);

//paragraph animation

const scroll = new SmoothScroll('.nav-links a[href*="#"]',{
  speed: 1000
});

//smooth scroll

var $body = document.getElementsByTagName('body')[0];
var $btnCopy = document.getElementById('btnCopy');
var secretInfo = document.getElementById('secretInfo').innerHTML;

var copyToClipboard = function(secretInfo) {
  var $tempInput = document.createElement('INPUT');
  $body.appendChild($tempInput);
  $tempInput.setAttribute('value', secretInfo)
  $tempInput.select();
  document.execCommand('copy');
  $body.removeChild($tempInput);
}

$btnCopy.addEventListener('click', function(ev) {
  copyToClipboard(secretInfo);
  alert("The official Ping email ID has been copied");
});

// copy gmail email id