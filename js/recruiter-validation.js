// ---------- recruiter form validation ----------
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
  [['companyName',['companyName']],['fullName',['fullName']],['jobTitle',['jobTitle']],
   ['email',['email']],['phone',['phone']],['password',['password']],['confirm',['confirm']],
   ['industry',['industry']],['companySize',['companySize']],['website',['website']],
   ['address',['address']],['description',['description']]].forEach(function(p){clearOnInput(p[0],p[1]);});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true, firstBad=null;
    function fail(field,msg){
      setError(field,true,msg); ok=false;
      if(!firstBad) firstBad=form.querySelector('[data-field="'+field+'"] .input, [data-field="'+field+'"] input[type=file]');
    }

    if(!val('companyName')) fail('companyName','Please enter your company name.');
    if(!val('fullName')) fail('fullName','Please enter your full name.');
    if(!val('jobTitle')) fail('jobTitle','Please enter your job title.');

    var email=val('email');
    if(!email) fail('email','Email is required.');
    else if(!emailRe.test(email)) fail('email','Enter a valid email address.');

    var phoneDigits=val('phone').replace(/\D/g,'');
    if(!val('phone')) fail('phone','Phone number is required.');
    else if(phoneDigits.length<10) fail('phone','Enter a valid phone number (10+ digits).');

    var pw=val('password');
    if(!pw) fail('password','Password is required.');
    else if(pw.length<8) fail('password','Password must be at least 8 characters.');

    var cf=val('confirm');
    if(!cf) fail('confirm','Please confirm your password.');
    else if(cf!==pw) fail('confirm','Passwords do not match.');

    if(!val('industry')) fail('industry','Please select an option.');
    if(!val('companySize')) fail('companySize','Please select an option.');

    var website=val('website');
    if(!website) fail('website','Company website is required.');
    else if(!isUrl(website)) fail('website','Enter a valid URL.');

    if(!val('address')) fail('address','Please enter your company address.');
    if(!val('description')) fail('description','Please provide a company description.');

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
