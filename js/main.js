// ==========================================================================
// main.js — core page interactions
// ==========================================================================

// ---------- Topographic contour + survey-mark background ----------
(function(){
  var svg = document.getElementById('contour-bg');
  if(!svg) return;
  var ns = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build(){
    var w = window.innerWidth, h = document.documentElement.scrollHeight;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.innerHTML = '';

    var lines = Math.max(10, Math.round(h / 140));
    var colors = ['#4FB8A8', '#8FA8AC', '#4FB8A8'];
    var linePoints = []; // sample points for survey marks

    for(var i = 0; i < lines; i++){
      var baseY = (h / lines) * i + 40;
      var amp = 24 + (i % 4) * 14;
      var freq = 0.0022 + (i % 3) * 0.0006;
      var phase = i * 0.7;
      var d = 'M 0 ' + baseY;
      var step = 24;
      for(var x = 0; x <= w; x += step){
        var y = baseY + Math.sin(x * freq + phase) * amp;
        d += ' L ' + x + ' ' + y.toFixed(1);
        if(x % (step * 22) === 0 && i % 3 === 1){
          linePoints.push([x, y]);
        }
      }
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[i % colors.length]);
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', (0.06 + (i % 5) * 0.015).toFixed(3));
      svg.appendChild(path);
    }

    // Sparse survey-mark crosses at a handful of intersections — a quiet
    // nod to the "network background" idea that stays true to the
    // cartographic language already established, instead of a generic
    // neon neural-net overlay.
    if(!reduceMotion){
      var markCount = Math.min(14, Math.floor(linePoints.length / 6));
      for(var m = 0; m < markCount; m++){
        var p = linePoints[Math.floor(Math.random() * linePoints.length)];
        if(!p) continue;
        var g = document.createElementNS(ns, 'g');
        g.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')');
        g.setAttribute('opacity', '0.5');
        g.style.animation = 'markPulse ' + (3 + Math.random() * 3).toFixed(1) + 's ease-in-out infinite';
        g.style.animationDelay = (Math.random() * 3).toFixed(1) + 's';
        var cross = document.createElementNS(ns, 'path');
        cross.setAttribute('d', 'M -4 0 L 4 0 M 0 -4 L 0 4');
        cross.setAttribute('stroke', '#A566F5');
        cross.setAttribute('stroke-width', '1');
        g.appendChild(cross);
        svg.appendChild(g);
      }
    }
  }
  build();
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
})();

// ---------- Coordinate readout follows cursor ----------
(function(){
  var readout = document.getElementById('coord-readout');
  if(!readout) return;
  var baseLat = 28.6139, baseLng = 77.2090;
  window.addEventListener('pointermove', function(e){
    var lat = (baseLat + (e.clientY / window.innerHeight - 0.5) * 0.4).toFixed(4);
    var lng = (baseLng + (e.clientX / window.innerWidth - 0.5) * 0.4).toFixed(4);
    readout.textContent = lat + '° N · ' + lng + '° E';
  }, {passive: true});

  // Avoid overlapping the hero's floating skill badges near the bottom-right
  // corner: dim the readout while the hero (and its badges) are on screen.
  var heroSection = document.querySelector('.hero');
  if(heroSection && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        readout.classList.toggle('dim', entry.isIntersecting);
      });
    }, {threshold: 0.15});
    io.observe(heroSection);
  }
})();

// ---------- Scroll reveal ----------
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  els.forEach(function(el){ io.observe(el); });
})();

// ---------- Cursor spotlight tracking ----------
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('pointermove', function(e){
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
  }, {passive: true});
})();

// ---------- 3D tilt on cards ----------
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(window.matchMedia('(max-width: 720px)').matches) return;
  var cards = document.querySelectorAll('.legend-cell, .ai-card, .cert-card, .achieve-item, .subproject, .project-card, .contact-tile');
  cards.forEach(function(card){
    card.style.willChange = 'transform';
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      var rotX = (py * -6).toFixed(2);
      var rotY = (px * 6).toFixed(2);
      card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(2px)';
    });
    card.addEventListener('mouseleave', function(){
      card.style.transform = '';
    });
  });
})();

// ---------- Count-up hero stats ----------
(function(){
  var nums = document.querySelectorAll('.hero-meta .num');
  if(!nums.length) return;
  function animateCount(el){
    var text = el.textContent.trim();
    var match = text.match(/^(\d+)(.*)$/);
    if(!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2];
    var start = null;
    var duration = 1100;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.5});
    nums.forEach(function(el){ io.observe(el); });
  }
})();

// ---------- Nav smooth scroll ----------
(function(){
  document.querySelectorAll('[data-scroll-to]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(btn.getAttribute('data-scroll-to'));
      if(target){ target.scrollIntoView({behavior: 'smooth', block: 'start'}); }
      var links = document.querySelector('.navlinks');
      if(links && window.innerWidth <= 720){ links.style.display = 'none'; }
    });
  });
})();

// ---------- Theme toggle ----------
(function(){
  var toggle = document.getElementById('themeToggle');
  if(!toggle) return;
  toggle.addEventListener('click', function(){
    document.documentElement.classList.toggle('theme-light');
  });
})();

// ---------- Mobile nav toggle ----------
(function(){
  var btn = document.getElementById('navToggle');
  var links = document.querySelector('.navlinks');
  if(!btn) return;
  btn.addEventListener('click', function(){
    var open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '68px';
    links.style.right = '0';
    links.style.left = '0';
    links.style.background = 'var(--ink)';
    links.style.padding = '20px 32px';
    links.style.borderTop = '1px solid var(--line)';
    links.style.gap = '18px';
  });
})();
