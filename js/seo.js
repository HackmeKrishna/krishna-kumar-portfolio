// ==========================================================================
// seo.js — progressive enhancements only.
//
// The tags that actually matter for search engines and link previews
// (title, meta description, canonical, Open Graph, Twitter Card, and the
// Person/ProfilePage JSON-LD) are written directly into index.html's <head>
// on purpose, so they're present even if JavaScript never runs. This file
// only adds small niceties on top of that.
// ==========================================================================

// Keep the browser tab title in sync with whichever section is in view,
// so a shared/bookmarked link's title reflects where the reader landed.
(function(){
  var sections = document.querySelectorAll('main section[id], .hero[id]');
  var baseTitle = document.title;
  if(!sections.length || !('IntersectionObserver' in window)) return;

  var titles = {
    work: 'Experience — Krishna Kumar',
    skills: 'Skills — Krishna Kumar',
    ai: 'AI & LLM Engineering — Krishna Kumar',
    projects: 'Projects — Krishna Kumar',
    achievements: 'Achievements — Krishna Kumar',
    recognition: 'Recognition — Krishna Kumar',
    education: 'Education — Krishna Kumar',
    contact: 'Contact — Krishna Kumar'
  };

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && titles[entry.target.id]){
        document.title = titles[entry.target.id];
      }
    });
  }, {threshold: 0.6});

  sections.forEach(function(s){ if(titles[s.id]) io.observe(s); });

  window.addEventListener('beforeunload', function(){ document.title = baseTitle; });
})();

// Match the browser chrome / PWA theme-color to the active theme so
// installed/pinned versions of the site look intentional, not default.
(function(){
  var meta = document.querySelector('meta[name="theme-color"]');
  var toggle = document.getElementById('themeToggle');
  if(!meta || !toggle) return;
  function sync(){
    var light = document.documentElement.classList.contains('theme-light');
    meta.setAttribute('content', light ? '#FFFFFF' : '#07060A');
  }
  toggle.addEventListener('click', sync);
  sync();
})();
