import { imagePath, videoPath } from '../config/assets-paths.js';

/**
 * Видео в блоке «О нас»: без UI, без звука, зациклено.
 * Воспроизведение только пока секция пересекается с вьюпортом (IntersectionObserver).
 */
export function mountAboutAmbientVideo(wrap, section, items) {
  if (!wrap) {
    return () => {};
  }

  wrap.replaceChildren();

  const list = items?.filter((item) => item.enabled !== false) ?? [];
  if (!list.length) {
    wrap.hidden = true;
    return () => {};
  }

  if (!section) {
    wrap.hidden = true;
    return () => {};
  }

  wrap.hidden = false;

  const videos = [];

  for (const item of list) {
    const fig = document.createElement('figure');
    fig.className = 'about-ambient-video';

    const video = document.createElement('video');
    video.className = 'about-ambient-video__media';
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.setAttribute('disablePictureInPicture', '');
    video.setAttribute('disableRemotePlayback', '');
    video.poster = imagePath(item.poster);
    video.setAttribute('aria-label', item.title);

    const source = document.createElement('source');
    source.src = videoPath(item.file);
    source.type = 'video/mp4';
    video.appendChild(source);

    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = `${item.title}. ${item.description ?? ''}`;

    fig.append(video, sr);
    wrap.appendChild(fig);
    videos.push(video);
  }

  let sectionInView = false;

  const setPlaying = (shouldPlay) => {
    for (const v of videos) {
      if (shouldPlay) {
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.target !== section) continue;
        sectionInView = e.isIntersecting;
        setPlaying(sectionInView);
      }
    },
    { threshold: 0, rootMargin: '0px' }
  );

  observer.observe(section);

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      setPlaying(false);
      return;
    }
    if (sectionInView) {
      setPlaying(true);
    }
  };

  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    observer.disconnect();
    setPlaying(false);
    wrap.replaceChildren();
  };
}
