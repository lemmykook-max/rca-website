(function(){
  "use strict";
  var mb = document.querySelector(".menu-btn"), nav = document.getElementById("hovedmenu");
  if (mb && nav) mb.addEventListener("click", function(){
    var open = nav.classList.toggle("open");
    mb.setAttribute("aria-expanded", open);
  });
})();
