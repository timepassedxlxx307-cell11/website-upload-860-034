(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;

        var show = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5000);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (query) {
            filterInput.value = query;
        }

        var applyFilter = function () {
            var value = filterInput.value.trim().toLowerCase();
            var items = Array.prototype.slice.call(filterList.children);

            items.forEach(function (item) {
                var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                item.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
            });
        };

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
