var matches = document.querySelectorAll('.nav-radio');
var frame = document.getElementById('iframe_main');

for (match of matches) {
  match.onchange = function() {
    console.log(frame.src);
    frame.src = match.href;
  }
}