(function () {
    var panel = document.querySelector('[data-mobile-panel]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    document.querySelectorAll('[data-live-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            document.querySelectorAll('[data-filter-card]').forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(query) === -1 ? 'none' : '';
            });
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-overlay');
        var stream = player.getAttribute('data-stream');
        var started = false;
        var hls = null;

        function attach() {
            if (started || !video || !stream) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('emptied', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
                started = false;
            });
        }
    });

    var searchMount = document.querySelector('[data-search-results]');
    if (searchMount && window.MOVIE_SEARCH_DATA) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var note = document.querySelector('[data-search-note]');
        if (query) {
            var lower = query.toLowerCase();
            var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                return [movie.title, movie.region, movie.year, movie.genre, movie.oneLine].join(' ').toLowerCase().indexOf(lower) !== -1;
            });
            if (note) {
                note.textContent = '搜索“' + query + '”的相关影片';
            }
            if (results.length) {
                searchMount.innerHTML = results.map(renderSearchCard).join('');
            } else {
                searchMount.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
            }
        }
    }

    function renderSearchCard(movie) {
        return [
            '<article class="movie-card" data-filter-card>',
            '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="movie-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
