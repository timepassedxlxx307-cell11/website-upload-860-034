(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
        img.removeAttribute("src");
      });
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var formInput = document.querySelector("[data-search-input]");
    var liveInput = document.querySelector("[data-live-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-text]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (formInput && query) {
      formInput.value = query;
    }

    if (liveInput && query) {
      liveInput.value = query;
    }

    function filter(value) {
      var needle = (value || "").trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var matched = !needle || text.indexOf(needle) !== -1;
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    if (cards.length) {
      filter(query);
    }

    if (liveInput) {
      liveInput.addEventListener("input", function () {
        filter(liveInput.value);
      });
    }
  }

  function initPlayers() {
    document.querySelectorAll(".js-player").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function loadStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        video.controls = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        player.classList.add("is-playing");
        if (cover) {
          cover.hidden = true;
        }
        loadStream();
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 80);
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initImages();
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
