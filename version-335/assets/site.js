const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const menuButton = qs('[data-menu-toggle]');
const mobilePanel = qs('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    const opened = mobilePanel.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', opened);
  });
}

qsa('[data-hero-slider]').forEach((slider) => {
  const slides = qsa('[data-hero-slide]', slider);
  const dots = qsa('[data-hero-dot]', slider);
  const previous = qs('[data-hero-prev]', slider);
  const next = qs('[data-hero-next]', slider);
  let current = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  if (previous) {
    previous.addEventListener('click', () => {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      restart();
    });
  }

  show(0);
  restart();
});

const normalize = (value) => String(value || '').trim().toLowerCase();

qsa('[data-filter-list]').forEach((list) => {
  const cards = qsa('[data-filter-card]', list);
  const panel = list.closest('main') || document;
  const input = qs('[data-filter-input]', panel);
  const selects = qsa('[data-filter-select]', panel);

  const applyFilter = () => {
    const query = normalize(input ? input.value : '');
    const filters = new Map();

    selects.forEach((select) => {
      if (select.value) {
        filters.set(select.dataset.filterSelect, normalize(select.value));
      }
    });

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search);
      const matchQuery = !query || haystack.includes(query);
      const matchFilters = Array.from(filters.entries()).every(([key, value]) => {
        return normalize(card.dataset[key]).includes(value);
      });
      card.classList.toggle('is-hidden', !(matchQuery && matchFilters));
    });
  };

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  selects.forEach((select) => {
    select.addEventListener('change', applyFilter);
  });

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('q');
  if (queryFromUrl && input) {
    input.value = queryFromUrl;
  }

  applyFilter();
});

let hlsLoader = null;

const loadHls = () => {
  if (!hlsLoader) {
    hlsLoader = import('./hls.js').then((module) => module.H);
  }
  return hlsLoader;
};

qsa('[data-player]').forEach((player) => {
  const video = qs('video', player);
  const cover = qs('.player-cover', player);
  let ready = false;
  let starting = false;

  const bindSource = async () => {
    if (!video || ready) {
      return;
    }

    const source = video.dataset.src;
    if (!source) {
      return;
    }

    const Hls = await loadHls();

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    ready = true;
  };

  const start = async () => {
    if (!video || starting) {
      return;
    }

    starting = true;
    await bindSource();
    player.classList.add('is-playing');

    try {
      await video.play();
    } catch (error) {
      player.classList.remove('is-playing');
    } finally {
      starting = false;
    }
  };

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (!video.ended) {
        player.classList.add('is-playing');
      }
    });
  }
});
