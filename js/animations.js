// ==========================================================================
// animations.js — hero typewriter, skill bars, route progress
// ==========================================================================

// ---------- Hero role typewriter ----------
(function(){
  var el = document.getElementById('roleType');
  if(!el) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var roles = [
    'Senior Software Engineer',
    'Backend Engineer',
    'AI Engineer',
    'LLM Developer',
    'GIS Specialist',
    'Cloud Architect'
  ];

  if(reduceMotion){
    el.textContent = roles[0];
    return;
  }

  var roleIndex = 0;
  var charIndex = 0;
  var deleting = false;
  var typeSpeed = 55;
  var deleteSpeed = 30;
  var holdTime = 1400;

  function tick(){
    var current = roles[roleIndex];
    if(!deleting){
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if(charIndex === current.length){
        deleting = true;
        setTimeout(tick, holdTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if(charIndex === 0){
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  setTimeout(tick, 600);
})();

// ---------- Core stack proficiency bars ----------
(function(){
  var bars = document.querySelectorAll('.stack-bar .fill');
  if(!bars.length) return;
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var fill = entry.target;
          var pct = fill.getAttribute('data-pct') || '0';
          requestAnimationFrame(function(){ fill.style.width = pct + '%'; });
          io.unobserve(fill);
        }
      });
    }, {threshold: 0.4});
    bars.forEach(function(b){ io.observe(b); });
  } else {
    bars.forEach(function(b){ b.style.width = (b.getAttribute('data-pct') || '0') + '%'; });
  }
})();

// ---------- Route (experience timeline) fill + active waypoint ----------
(function(){
  var route = document.querySelector('.route');
  var fill = document.querySelector('.route-fill');
  var waypoints = document.querySelectorAll('.waypoint');
  if(!route || !fill || !waypoints.length) return;

  function update(){
    var rect = route.getBoundingClientRect();
    var viewportMid = window.innerHeight * 0.55;
    var total = rect.height;
    var progressed = Math.min(Math.max(viewportMid - rect.top, 0), total);
    var pct = total > 0 ? (progressed / total) * 100 : 0;
    fill.style.height = pct + '%';

    waypoints.forEach(function(wp){
      var wpRect = wp.getBoundingClientRect();
      if(wpRect.top < viewportMid){
        wp.classList.add('in-view');
      }
    });
  }

  update();
  window.addEventListener('scroll', update, {passive: true});
  window.addEventListener('resize', update);
})();
