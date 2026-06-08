(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q'], input[type='search']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initSlider() {
        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slider-dot]"));
            var prev = slider.querySelector("[data-slider-prev]");
            var next = slider.querySelector("[data-slider-next]");
            var index = 0;
            var timer = null;

            function render(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function schedule() {
                clearInterval(timer);
                timer = setInterval(function () {
                    render(index + 1);
                }, 5600);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    render(index - 1);
                    schedule();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    render(index + 1);
                    schedule();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    render(Number(dot.getAttribute("data-slider-dot")) || 0);
                    schedule();
                });
            });
            render(0);
            schedule();
        });
    }

    function fillFilterOptions(scope, cards) {
        [
            ["[data-filter-year]", "year"],
            ["[data-filter-region]", "region"],
            ["[data-filter-type]", "type"]
        ].forEach(function (item) {
            var select = scope.querySelector(item[0]);
            if (!select || select.options.length > 1) {
                return;
            }
            var values = Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-" + item[1]) || "";
            }).filter(Boolean))).sort().reverse();
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var grid = scope.parentElement.querySelector("[data-filter-grid]") || document.querySelector("[data-filter-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var result = scope.querySelector("[data-filter-result]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            fillFilterOptions(scope, cards);
            if (query && input && !input.value) {
                input.value = query;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        ok = false;
                    }
                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        shown += 1;
                    }
                });
                if (result) {
                    result.textContent = shown ? "已筛选出相关影片" : "没有匹配的影片";
                }
            }

            [input, year, region, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var loaded = false;

            function prepare() {
                if (loaded || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                prepare();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        });
    }

    onReady(function () {
        initSearchForms();
        initSlider();
        initFilters();
        initPlayers();
    });
})();
