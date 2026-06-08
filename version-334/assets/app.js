(function () {
    var ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    };

    ready(function () {
        var menuButton = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.main-nav');

        if (menuButton && nav) {
            menuButton.addEventListener('click', function () {
                var open = nav.classList.toggle('is-open');
                menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            };

            var start = function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            };

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                    start();
                });
            });

            if (slides.length > 1) {
                start();
            }
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var textInput = panel.querySelector('[data-filter-text]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var genreSelect = panel.querySelector('[data-filter-genre]');
            var list = document.querySelector('[data-card-list]');

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');

            if (initialQuery && textInput) {
                textInput.value = initialQuery;
            }

            var normalize = function (value) {
                return (value || '').toString().trim().toLowerCase();
            };

            var apply = function () {
                var keyword = normalize(textInput && textInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var genre = normalize(genreSelect && genreSelect.value);

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.year,
                        card.textContent
                    ].join(' '));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                        matched = false;
                    }
                    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.dataset.year).indexOf(year) === -1) {
                        matched = false;
                    }
                    if (genre && normalize(card.dataset.genre).indexOf(genre) === -1) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                });
            };

            [textInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            });

            apply();
        });
    });
})();
