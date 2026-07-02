// ---------- animated counters ----------
(function(){
  var counters=document.querySelectorAll('.counter');
  counters.forEach(function(counter){
    var target=parseInt(counter.getAttribute('data-target'));
    var duration=1500;
    var start=0;
    var increment=target/(duration/16);
    function update(){
      start+=increment;
      if(start<target){
        counter.textContent=Math.floor(start);
        requestAnimationFrame(update);
      }else{
        counter.textContent=target;
      }
    }
    counter.classList.add('counter-animate');
    setTimeout(update,300);
  });
})();

// ---------- sidebar active state ----------
(function(){
  var links=document.querySelectorAll('.sidebar-nav a:not(.logout)');
  links.forEach(function(link){
    link.addEventListener('click',function(e){
      links.forEach(function(l){l.classList.remove('active');});
      this.classList.add('active');
    });
  });
})();
