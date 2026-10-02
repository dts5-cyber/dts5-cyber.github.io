// Keep the latest scroll target while the browser finishes decoding a seek.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
const controllers = [['hero', 'etVideo', 0.12, 0.84], ['abSceneSec', 'etAboutVideo', 0, 0.92]].map(([sectionId, videoId, start, length]) => {
  const section = document.getElementById(sectionId);
  const video = document.getElementById(videoId);
  if (!section || !video) return null;
  let target = 0;
  function seek() {
    if (video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return;
    if (Math.abs(video.currentTime - target) > 1 / 48) video.currentTime = target;
  }
  function update() {
    const bounds = section.getBoundingClientRect();
    const headerHeight = document.querySelector('header').getBoundingClientRect().height;
    const progress = clamp((headerHeight - bounds.top) / Math.max(1, bounds.height - innerHeight + headerHeight));
    target = reducedMotion.matches ? 0 : clamp((progress - start) / length) * Math.max(0, (video.duration || 0) - 1 / 24);
    seek();
  }
  video.pause();
  video.addEventListener('loadedmetadata', update);
  video.addEventListener('loadeddata', update);
  video.addEventListener('seeked', seek);
  return { update };
}).filter(Boolean);
let scheduled = false;
function update() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    controllers.forEach(controller => controller.update());
  });
}
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
reducedMotion.addEventListener('change', update);
update();
