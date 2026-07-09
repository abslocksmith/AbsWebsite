(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.pw-carousel').forEach(function (root) {
    var track = root.querySelector('.pw-track');
    var bar = root.querySelector('.pw-progress-bar');
    var btn = root.querySelector('.pw-playpause');
    if (!track) return;

    var originalCards = Array.prototype.slice.call(track.children);
    if (originalCards.length < 2) return;

    // Clone the full set once so the track always has enough cards to fill
    // the viewport ahead of the current index, then loop seamlessly.
    originalCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    var count = originalCards.length;
    var index = 0;
    var duration = parseInt(root.dataset.autoplay, 10) || 4200;
    var playing = !reduceMotion;
    var timer = null;

    function cardStep() {
      var card = track.children[0];
      var style = getComputedStyle(track);
      var gap = parseFloat(style.gap || style.columnGap || '20');
      return card.getBoundingClientRect().width + gap;
    }

    function goTo(i, animate) {
      track.classList.toggle('no-transition', !animate);
      track.style.transform = 'translateX(-' + (i * cardStep()) + 'px)';
    }

    function resetBar() {
      if (!bar) return;
      bar.classList.remove('pw-animate');
      bar.style.width = '0%';
      // force reflow so the next width change animates from 0
      void bar.offsetWidth;
    }

    function runBar() {
      if (!bar) return;
      bar.classList.add('pw-animate');
      bar.style.transitionDuration = duration + 'ms';
      requestAnimationFrame(function () {
        bar.style.width = '100%';
      });
    }

    function advance() {
      index++;
      goTo(index, true);
      if (index === count) {
        window.setTimeout(function () {
          index = 0;
          goTo(0, false);
        }, 660);
      }
    }

    function tick() {
      advance();
      resetBar();
      runBar();
    }

    function start() {
      if (timer) return;
      playing = true;
      if (btn) { btn.textContent = '⏸'; btn.setAttribute('aria-label', 'Pause photo carousel'); }
      resetBar();
      runBar();
      timer = window.setInterval(tick, duration);
    }

    function stop() {
      playing = false;
      if (btn) { btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play photo carousel'); }
      if (timer) { window.clearInterval(timer); timer = null; }
      if (bar) { bar.classList.remove('pw-animate'); }
    }

    if (btn) {
      btn.addEventListener('click', function () {
        if (playing) { stop(); } else { start(); }
      });
    }

    window.addEventListener('resize', function () { goTo(index, false); });

    if (reduceMotion) {
      stop();
    } else {
      start();
    }
  });
})();
