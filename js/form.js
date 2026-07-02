// ---------- mobile off-canvas menu ----------
(function(){
  var btn=document.getElementById('menuBtn'),
      panel=document.getElementById('panel'),
      backdrop=document.getElementById('backdrop');
  if(!btn||!panel||!backdrop) return;
  function open(){
    panel.classList.add('open'); backdrop.classList.add('open');
    btn.classList.add('active'); btn.setAttribute('aria-expanded','true');
    btn.setAttribute('aria-label','Close navigation menu');
    document.body.classList.add('no-scroll');
  }
  function close(){
    panel.classList.remove('open'); backdrop.classList.remove('open');
    btn.classList.remove('active'); btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open navigation menu');
    document.body.classList.remove('no-scroll');
  }
  btn.addEventListener('click',function(){
    panel.classList.contains('open')?close():open();
  });
  backdrop.addEventListener('click',close);
  panel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();

var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

// ---------- scroll reveal ----------
(function(){
  var els=document.querySelectorAll('.reveal');
  if(reduce||!('IntersectionObserver' in window)){
    els.forEach(function(el){el.classList.add('in');}); return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('in'); io.unobserve(en.target);}
    });
  },{threshold:.14, rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){io.observe(el);});
})();

// ---------- file input label ----------
(function(){
  var input=document.getElementById('resume'), name=document.getElementById('fileName');
  if(!input||!name) return;
  input.addEventListener('change',function(){
    name.textContent = input.files && input.files.length
      ? input.files[0].name
      : 'No file selected — .pdf, .doc, .docx';
  });
})();

// ---------- particle + neural network background ----------
(function(){
  if(reduce) return;
  var c=document.getElementById('bg'), x=c.getContext('2d'), w,h,pts;
  function size(){w=c.width=window.innerWidth; h=c.height=window.innerHeight; init();}
  function init(){
    var n=Math.min(70,Math.floor(w*h/22000)); pts=[];
    for(var i=0;i<n;i++){pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4});}
  }
  function draw(){
    x.clearRect(0,0,w,h);
    for(var i=0;i<pts.length;i++){
      var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1;
      x.beginPath(); x.arc(p.x,p.y,1.6,0,6.28); x.fillStyle='rgba(99,102,241,.7)'; x.fill();
      for(var j=i+1;j<pts.length;j++){
        var q=pts[j], dx=p.x-q.x, dy=p.y-q.y, d=dx*dx+dy*dy;
        if(d<16000){
          x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(q.x,q.y);
          x.strokeStyle='rgba(139,92,246,'+(1-d/16000)*.25+')'; x.lineWidth=1; x.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',size); size(); draw();
})();
