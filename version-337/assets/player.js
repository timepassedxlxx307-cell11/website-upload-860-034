import { H as Hls } from './video-player-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

players.forEach(function (shell) {
    var video = shell.querySelector('.movie-player');
    var button = shell.querySelector('.player-start');

    if (!video) {
        return;
    }

    var url = video.getAttribute('src');

    if (url) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        }
    }

    var start = function () {
        if (button) {
            button.classList.add('is-hidden');
        }
        var request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    };

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
});
