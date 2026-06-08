(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = $('.menu-toggle');
        var nav = $('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.hasAttribute('hidden');
            if (opened) {
                nav.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = '×';
            } else {
                nav.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
                button.textContent = '☰';
            }
        });
    }

    function setupHero() {
        var slider = $('[data-hero]');
        if (!slider) {
            return;
        }
        var slides = $all('.hero-slide', slider);
        var dots = $all('.hero-dot', slider);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function go(next) {
            slides[index].classList.remove('is-active');
            dots[index].classList.remove('is-active');
            index = (next + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            dots[index].classList.add('is-active');
        }
        function start() {
            timer = window.setInterval(function () {
                go(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                go(dotIndex);
                start();
            });
        });
        start();
    }

    function setupSearchFilters() {
        var inputs = $all('.page-search-input');
        var grids = $all('.search-grid');
        if (!inputs.length || !grids.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        inputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
        });
        function apply(value) {
            var term = String(value || '').trim().toLowerCase();
            grids.forEach(function (grid) {
                var items = $all('.search-item', grid);
                var visible = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                    var ok = !term || text.indexOf(term) !== -1;
                    item.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                var empty = grid.parentElement ? $('.empty-state', grid.parentElement) : null;
                if (empty) {
                    if (visible) {
                        empty.setAttribute('hidden', '');
                    } else {
                        empty.removeAttribute('hidden');
                    }
                }
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                apply(input.value);
            });
        });
        apply(query);
    }

    function setupPlayers() {
        $all('.player').forEach(function (player) {
            var video = $('video', player);
            var trigger = $('.player-trigger', player);
            var url = player.getAttribute('data-url');
            var ready = false;
            var hls = null;
            if (!video || !trigger || !url) {
                return;
            }
            function attach() {
                if (ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    return;
                }
                video.src = url;
            }
            function play() {
                attach();
                player.classList.add('is-playing');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }
            trigger.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearchFilters();
        setupPlayers();
    });
})();
