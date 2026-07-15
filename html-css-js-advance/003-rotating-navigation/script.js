const openBtn = document.getElementById('open');
const closeBtn = document.getElementById('close');
const body = document.body;
const nav = document.getElementById('main-menu');
const overlay = document.getElementById('overlay');
const menuLinks = nav.querySelectorAll('a');

function openNav() {
  body.classList.add('nav-open');
  openBtn.setAttribute('aria-expanded', 'true');
  closeBtn.setAttribute('aria-expanded', 'true');
  nav.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');

  // Focus first menu item
  menuLinks[0]?.focus();
}

function closeNav() {
  body.classList.remove('nav-open');
  openBtn.setAttribute('aria-expanded', 'false');
  closeBtn.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');

  // Return focus to open button
  openBtn.focus();
}

openBtn.addEventListener('click', openNav);
closeBtn.addEventListener('click', closeNav);
overlay.addEventListener('click', closeNav);

// Close on ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && body.classList.contains('nav-open')) {
    closeNav();
  }
});

// Close menu when clicking a nav link
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeNav();
  });
});

// Trap focus inside nav when open
document.addEventListener('keydown', e => {
  if (!body.classList.contains('nav-open') || e.key!== 'Tab') return;

  const focusableElements = [closeBtn,...menuLinks];
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstEl) {
    e.preventDefault();
    lastEl.focus();
  } else if (!e.shiftKey && document.activeElement === lastEl) {
    e.preventDefault();
    firstEl.focus();
  }
});