(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = panel.hasAttribute("hidden");
            if (opened) {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            } else {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length < 2) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function initFilters() {
        var inputList = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
        if (!inputList.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        inputList.forEach(function (input) {
            if (q) {
                input.value = q;
            }
        });

        function filter() {
            var queryInput = document.querySelector(".movie-search");
            var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var type = (document.querySelector(".type-filter") || {}).value || "";
            var region = (document.querySelector(".region-filter") || {}).value || "";
            var year = (document.querySelector(".year-filter") || {}).value || "";
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    ok = false;
                }
                if (region && card.getAttribute("data-region") !== region) {
                    ok = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            var empty = document.querySelector(".empty-state");
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        document.addEventListener("input", function (event) {
            if (event.target.matches(".movie-search")) {
                filter();
            }
        });
        document.addEventListener("change", function (event) {
            if (event.target.matches(".type-filter, .region-filter, .year-filter")) {
                filter();
            }
        });
        filter();
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play]");
            if (!video || !button) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var hlsInstance = null;

            function attach(autoplay) {
                if (!stream || video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    if (autoplay) {
                        video.play().catch(function () {});
                    }
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (autoplay) {
                            video.play().catch(function () {});
                        }
                    });
                } else {
                    video.src = stream;
                    if (autoplay) {
                        video.play().catch(function () {});
                    }
                }
            }

            function play() {
                shell.classList.add("is-playing");
                attach(true);
                video.play().catch(function () {});
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
