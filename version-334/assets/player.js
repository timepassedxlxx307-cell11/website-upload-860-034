(function () {
    var ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    };

    ready(function () {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.movie-player-block'));

        blocks.forEach(function (block) {
            var video = block.querySelector('video');
            var overlay = block.querySelector('.player-overlay');
            var hlsInstance = null;
            var prepared = false;

            if (!video || !overlay) {
                return;
            }

            var streamUrl = video.getAttribute('data-hls');

            var prepare = function () {
                if (prepared || !streamUrl) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    prepared = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    prepared = true;
                    return;
                }

                video.src = streamUrl;
                prepared = true;
            };

            var start = function () {
                prepare();
                overlay.classList.add('is-hidden');
                video.controls = true;
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            };

            overlay.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('ended', function () {
                overlay.classList.remove('is-hidden');
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
})();
