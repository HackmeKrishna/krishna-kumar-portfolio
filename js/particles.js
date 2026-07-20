// ==========================================================================
// particles.js — hero neural-network canvas + cursor glow trail
// ==========================================================================

var PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var IS_TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// ---------- Hero neural network ----------
(function(){
  var canvas = document.getElementById('heroCanvas');
  if(!canvas || PREFERS_REDUCED_MOTION) return;
  var ctx = canvas.getContext('2d');
  var hero = canvas.closest('.hero');
  var nodes = [];
  var running = false;
  var rafId = null;
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  var NODE_COUNT_DESKTOP = 70;
  var NODE_COUNT_MOBILE = 30;
  var LINK_DIST = 170;

  function accentColor(){
    var light = document.documentElement.classList.contains('theme-light');
    return light ? [124, 58, 237] : [165, 102, 245]; // matches --contour
  }
  function beaconColor(){
    var light = document.documentElement.classList.contains('theme-light');
    return light ? [242, 121, 10] : [242, 145, 74]; // matches --beacon
  }

  function resize(){
    var rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function seed(){
    var count = window.innerWidth < 720 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
    nodes = [];
    for(var i = 0; i < count; i++){
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.3 + Math.random() * 1.4
      });
    }
  }

  function step(){
    if(!running) return;
    ctx.clearRect(0, 0, W, H);
    var a = accentColor();
    var b = beaconColor();

    for(var i = 0; i < nodes.length; i++){
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if(n.x < 0 || n.x > W) n.vx *= -1;
      if(n.y < 0 || n.y > H) n.vy *= -1;
    }

    // links
    for(var i = 0; i < nodes.length; i++){
      for(var j = i + 1; j < nodes.length; j++){
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < LINK_DIST){
          var alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.strokeStyle = 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for(var i = 0; i < nodes.length; i++){
      var n = nodes[i];
      var col = i % 4 === 0 ? b : a;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.8)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function start(){
    if(running) return;
    running = true;
    rafId = requestAnimationFrame(step);
  }
  function stop(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
  }

  resize();
  seed();

  if('IntersectionObserver' in window && hero){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ start(); } else { stop(); }
      });
    }, {threshold: 0.05});
    io.observe(hero);
  } else {
    start();
  }

  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){ resize(); seed(); }, 200);
  });
})();

// ---------- Cursor glow trail ----------
(function(){
  var canvas = document.getElementById('trailCanvas');
  if(!canvas || PREFERS_REDUCED_MOTION || IS_TOUCH) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var lastSpawn = 0;
  var rafId = null;

  function resize(){
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var palette = [
    [165, 102, 245],
    [242, 145, 74],
    [79, 184, 168]
  ];

  window.addEventListener('pointermove', function(e){
    var now = performance.now();
    if(now - lastSpawn < 24) return; // throttle spawn rate
    lastSpawn = now;
    var col = palette[Math.floor(Math.random() * palette.length)];
    particles.push({
      x: e.clientX,
      y: e.clientY,
      r: 2 + Math.random() * 2.5,
      life: 1,
      color: col
    });
    if(particles.length > 90) particles.shift();
    if(!rafId) rafId = requestAnimationFrame(loop);
  }, {passive: true});

  function loop(){
    ctx.clearRect(0, 0, W, H);
    for(var i = particles.length - 1; i >= 0; i--){
      var p = particles[i];
      p.life -= 0.02;
      p.y -= 0.25;
      if(p.life <= 0){ particles.splice(i, 1); continue; }
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      var c = p.color;
      grad.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (p.life * 0.55).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if(particles.length > 0){
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
    }
  }
})();
