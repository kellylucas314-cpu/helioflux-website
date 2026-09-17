/* Native film playback; the parent owns user, reduced-motion and viewport intent. */
(() => {
  'use strict';

  window.installMeasurementFilm = function installMeasurementFilm() {
    const video = document.querySelector('#measurement-film');
    if (!video) return null;
    video.__measurementFilmController?.cleanup();

    let requested = false;
    let loaded = false;
    let ready = false;
    let failed = false;
    let destroyed = false;
    let pageHidden = false;
    let revision = 0;
    let pending = false;
    let state = 'idle';
    let lastError = null;
    const removers = [];

    const listen = (target, name, handler) => {
      target.addEventListener(name, handler);
      removers.push(() => target.removeEventListener(name, handler));
    };
    const isCurrent = () => video.__measurementFilmController === controller;
    const canPlay = () => !destroyed && !failed && requested && !pageHidden && !document.hidden;
    const setState = value => {
      state = value;
      video.dataset.filmState = value;
    };
    const conceal = () => {
      ready = false;
      video.dataset.filmReady = 'false';
      video.style.opacity = '0';
    };
    const revealDecodedFrame = () => {
      if (!isCurrent() || !canPlay() || video.readyState < 2) return;
      ready = true;
      video.dataset.filmReady = 'true';
      video.style.opacity = '1';
    };
    const pause = () => {
      revision += 1;
      pending = false;
      video.pause();
      if (!failed && !destroyed) setState(loaded ? 'paused' : 'idle');
    };
    const fail = error => {
      if (!isCurrent() || destroyed) return;
      failed = true;
      requested = false;
      lastError = error?.name || error?.message || 'MediaError';
      pause();
      conceal();
      setState('error');
    };

    function synchronize() {
      if (!isCurrent() || destroyed) return;
      if (!canPlay()) {
        pause();
        return;
      }
      if (pending) return;
      if (!loaded) {
        const source = video.dataset.src;
        if (!source) {
          fail(new Error('Missing film data-src'));
          return;
        }
        // The first allowed play request is the only point that starts loading.
        loaded = true;
        video.src = source;
        video.load();
      }
      video.muted = true;
      video.playbackRate = .8;
      revealDecodedFrame();
      if (!video.paused) {
        setState(ready ? 'playing' : 'loading');
        return;
      }

      const attempt = ++revision;
      pending = true;
      setState('loading');
      let playback;
      try {
        playback = video.play();
      } catch (error) {
        handleRejection(error, attempt);
        return;
      }
      Promise.resolve(playback).then(() => {
        if (!isCurrent() || destroyed) return;
        // A late play promise must never undo a pause or a hidden-page gate.
        if (!canPlay()) {
          pause();
          return;
        }
        if (attempt !== revision) return;
        pending = false;
        revealDecodedFrame();
        setState(video.paused ? 'paused' : (ready ? 'playing' : 'loading'));
      }, error => handleRejection(error, attempt));
    }

    function handleRejection(error, attempt) {
      if (!isCurrent() || destroyed || attempt !== revision) return;
      pending = false;
      if (!canPlay()) {
        pause();
        return;
      }
      if (error?.name === 'NotSupportedError') {
        fail(error);
        return;
      }
      // Autoplay policy and interrupted play can be retried on a new request.
      requested = false;
      lastError = error?.name || 'PlaybackError';
      video.pause();
      conceal();
      setState('blocked');
    }

    function setPlaying(value) {
      if (destroyed || failed) return;
      requested = Boolean(value);
      if (requested) lastError = null;
      synchronize();
    }

    function cleanup() {
      if (destroyed) return;
      destroyed = true;
      requested = false;
      revision += 1;
      pending = false;
      removers.forEach(remove => remove());
      video.pause();
      conceal();
      setState('destroyed');
      // Release the download/decoder while retaining data-src for reinstallation.
      video.removeAttribute('src');
      video.load();
      loaded = false;
      if (isCurrent()) delete video.__measurementFilmController;
    }

    const controller = {
      setPlaying,
      getState: () => ({
        state, requested, loaded, ready, failed, destroyed,
        playing: canPlay() && !video.paused,
        pending,
        error: lastError,
        playbackRate: video.playbackRate
      }),
      cleanup
    };
    video.__measurementFilmController = controller;
    video.autoplay = false;
    video.removeAttribute('autoplay');
    video.preload = 'none';
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.loop = true;
    video.defaultPlaybackRate = .8;
    video.playbackRate = .8;
    video.hidden = false;
    video.pause();
    conceal();
    setState('idle');

    listen(video, 'loadeddata', revealDecodedFrame);
    listen(video, 'canplay', revealDecodedFrame);
    listen(video, 'playing', () => {
      if (!canPlay()) {
        pause();
        return;
      }
      revealDecodedFrame();
      setState(ready ? 'playing' : 'loading');
    });
    listen(video, 'error', () => fail(video.error));
    listen(document, 'visibilitychange', synchronize);
    listen(window, 'pagehide', () => { pageHidden = true; synchronize(); });
    listen(window, 'pageshow', () => { pageHidden = false; synchronize(); });
    return controller;
  };
})();
