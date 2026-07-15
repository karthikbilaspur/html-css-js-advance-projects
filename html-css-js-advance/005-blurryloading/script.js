const loadText = document.querySelector('.loading-text');
const bg = document.querySelector('.bg');

const DURATION = 3000; // Total load time in ms
const BLUR_START = 30;
const IMAGE_URL = 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1600&q=80';

// Preload image before starting animation
function startLoading() {
  const img = new Image();
  img.src = IMAGE_URL;
  
  img.onload = () => {
    bg.style.backgroundImage = `url(${IMAGE_URL})`;
    runAnimation();
  };
  
  img.onerror = () => {
    loadText.textContent = 'Error loading image';
    loadText.style.opacity = '1';
  };
}

function runAnimation() {
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    
    const load = Math.floor(progress * 100);
    const opacity = 1 - progress;
    const blur = BLUR_START * (1 - progress);
    
    loadText.textContent = `${load}%`;
    loadText.style.opacity = opacity;
    bg.style.filter = `blur(${blur}px)`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      loadText.style.display = 'none';
    }
  }
  
  requestAnimationFrame(animate);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLoading);
} else {
  startLoading();
}