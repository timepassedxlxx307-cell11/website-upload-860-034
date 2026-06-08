(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (menuButton && navPanel) {
        menuButton.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && !input.value.trim()) {
                event.preventDefault();
                input.focus();
            }
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-local-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-chip]'));
        var empty = scope.querySelector('[data-empty-result]');
        var activeChip = 'all';

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var genre = card.getAttribute('data-genre') || '';
                var matchText = !query || text.indexOf(query) !== -1;
                var matchChip = activeChip === 'all' || genre.indexOf(activeChip) !== -1 || text.indexOf(activeChip.toLowerCase()) !== -1;
                var isVisible = matchText && matchChip;

                card.hidden = !isVisible;
                if (isVisible) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeChip = chip.getAttribute('data-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilter();
            });
        });
    });

    var searchPage = document.querySelector('[data-global-search-page]');

    if (searchPage && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-global-search-input]');
        var title = searchPage.querySelector('[data-search-title]');
        var results = searchPage.querySelector('[data-global-search-results]');

        if (input) {
            input.value = query;
        }

        function createCard(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-shade"></span>',
                '<span class="play-dot"></span>',
                '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
                '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="movie-tags">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function renderSearch(nextQuery) {
            var term = (nextQuery || '').trim().toLowerCase();
            var filtered = window.SEARCH_MOVIES.filter(function (movie) {
                if (!term) {
                    return true;
                }
                return movie.search.indexOf(term) !== -1;
            }).slice(0, 96);

            if (title) {
                title.textContent = term ? '搜索结果' : '精选片库';
            }

            if (results) {
                results.innerHTML = filtered.map(createCard).join('');
            }
        }

        renderSearch(query);

        if (input) {
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }
    }
})();
