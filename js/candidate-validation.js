// ---------- candidate form validation ----------
(function(){
  var form=document.getElementById('regForm');
  if(!form) return;
  var success=document.getElementById('formSuccess');

  function setError(field, on, msg){
    var wrap=form.querySelector('[data-field="'+field+'"]');
    if(!wrap) return;
    wrap.classList.toggle('invalid', !!on);
    if(on && msg){
      var em=wrap.querySelector('.err-msg');
      if(em) em.textContent=msg;
    }
    var ctrl=wrap.querySelector('.input, input[type=file]');
    if(ctrl) ctrl.setAttribute('aria-invalid', on?'true':'false');
  }

  function val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }

  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function isUrl(v){ try{ var u=new URL(v); return u.protocol==='http:'||u.protocol==='https:'; }catch(e){ return false; } }

  function clearOnInput(field, ids){
    ids.forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      var ev=(el.tagName==='SELECT'||el.type==='file')?'change':'input';
      el.addEventListener(ev,function(){ setError(field,false); });
    });
  }
  [['fullName',['fullName']],['email',['email']],['phone',['phone']],['dob',['dob']],
   ['password',['password']],['confirm',['confirm']],['gender',['gender']],
   ['qualification',['qualification']],['college',['college']],['experience',['experience']],
   ['role',['role']],['location',['location']],['skills',['skills']],['resume',['resume']],
   ['linkedin',['linkedin']],['github',['github']]].forEach(function(p){clearOnInput(p[0],p[1]);});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true, firstBad=null;
    function fail(field,msg){
      setError(field,true,msg); ok=false;
      if(!firstBad) firstBad=form.querySelector('[data-field="'+field+'"] .input, [data-field="'+field+'"] input[type=file]');
    }

    if(!val('fullName')) fail('fullName','Please enter your full name.');

    var email=val('email');
    if(!email) fail('email','Email is required.');
    else if(!emailRe.test(email)) fail('email','Enter a valid email address.');

    var phoneDigits=val('phone').replace(/\D/g,'');
    if(!val('phone')) fail('phone','Phone number is required.');
    else if(phoneDigits.length<10) fail('phone','Enter a valid phone number (10+ digits).');

    if(!val('dob')) fail('dob','Please select your date of birth.');

    var pw=val('password');
    if(!pw) fail('password','Password is required.');
    else if(pw.length<8) fail('password','Password must be at least 8 characters.');

    var cf=val('confirm');
    if(!cf) fail('confirm','Please confirm your password.');
    else if(cf!==pw) fail('confirm','Passwords do not match.');

    if(!val('gender')) fail('gender','Please select an option.');
    if(!val('qualification')) fail('qualification','Please select an option.');
    if(!val('college')) fail('college','Please enter your college or university.');
    if(!val('experience')) fail('experience','Please select an option.');
    if(!val('role')) fail('role','Please enter a preferred job role.');
    if(!val('location')) fail('location','Please enter a preferred location.');
    if(!val('skills')) fail('skills','Please list at least one skill.');

    var resume=document.getElementById('resume');
    var file=resume&&resume.files&&resume.files[0];
    if(!file) fail('resume','Please upload a PDF, DOC, or DOCX file.');
    else if(!/\.(pdf|doc|docx)$/i.test(file.name)) fail('resume','Only .pdf, .doc, or .docx files are allowed.');

    var li=val('linkedin');
    if(li && !isUrl(li)) fail('linkedin','Enter a valid URL.');
    var gh=val('github');
    if(gh && !isUrl(gh)) fail('github','Enter a valid URL.');

    if(!ok){
      if(firstBad){ firstBad.focus(); firstBad.scrollIntoView({behavior:'auto', block:'center'}); }
      return;
    }

    // success
    var grid=document.getElementById('formGrid'),
        actions=form.querySelector('.form-actions'),
        foot=form.querySelector('.form-foot');
    if(grid) grid.style.display='none';
    if(actions) actions.style.display='none';
    if(foot) foot.style.display='none';
    if(success){ success.classList.add('show'); success.scrollIntoView({behavior:'auto', block:'center'}); }
  });
})();
