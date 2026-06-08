(function () {
    document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var startButton = shell.querySelector('[data-player-start]');
        var hls;
        var isReady = false;

        if (!video) {
            return;
        }

        function attachStream() {
            if (isReady) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                isReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                isReady = true;
                return;
            }

            video.src = stream;
            isReady = true;
        }

        function playVideo() {
            attachStream();

            if (startButton) {
                startButton.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (startButton) {
            startButton.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
