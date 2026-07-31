
(function(){
  var root=document.documentElement;
  // theme
  var t=document.getElementById('theme');
  function apply(m){root.setAttribute('data-theme',m);try{localStorage.setItem('oasis-theme',m)}catch(e){}}
  try{var s=localStorage.getItem('oasis-theme');if(s)root.setAttribute('data-theme',s)}catch(e){}
  t&&t.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    if(!cur)cur=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    apply(cur==='dark'?'light':'dark');
  });
  // header scroll
  var h=document.getElementById('header');
  var onScroll=function(){h.classList.toggle('scrolled',scrollY>20)};
  onScroll();addEventListener('scroll',onScroll,{passive:true});
  // mobile menu
  var mm=document.getElementById('mmenu');
  document.getElementById('burger').addEventListener('click',function(){mm.classList.add('open')});
  document.getElementById('mclose').addEventListener('click',function(){mm.classList.remove('open')});
  mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mm.classList.remove('open')})});
  // reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  // counters
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,end=+el.dataset.count,suf=el.dataset.suffix||'';
    if(rm){el.textContent=end+suf;return}
    var d=1400,st=performance.now();
    function tick(now){var p=Math.min((now-st)/d,1);var v=Math.round((1-Math.pow(1-p,3))*end);
      el.textContent=v+suf;if(p<1)requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  })},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el)});
})();

/* ---- FAQ accordion ---- */
document.querySelectorAll('.faq-q').forEach(function(q){
  q.addEventListener('click',function(){
    var item=q.closest('.faq-item'),a=item.querySelector('.faq-a');
    var open=item.classList.toggle('open');
    q.setAttribute('aria-expanded',open?'true':'false');
    a.style.maxHeight=open?a.querySelector('.faq-a-inner').offsetHeight+'px':'0';
  });
});
/* ---- Realisations filter ---- */
(function(){
  var chips=document.querySelectorAll('.filter');if(!chips.length)return;
  chips.forEach(function(c){c.addEventListener('click',function(){
    document.querySelector('.filter.active')&&document.querySelector('.filter.active').classList.remove('active');
    c.classList.add('active');
    var f=c.dataset.filter;
    document.querySelectorAll('.work[data-tags]').forEach(function(w){
      w.hidden=(f!=='all'&&w.dataset.tags.indexOf(f)===-1);
    });
  });});
})();
/* ---- Contact form (front-end demo) ---- */
(function(){
  var form=document.getElementById('contactForm');if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    form.style.display='none';
    var ok=document.getElementById('formSuccess');
    ok.classList.add('show');
    ok.scrollIntoView({block:'center',behavior:'smooth'});
  });
})();
