const open = document.getElementById('open');
const close = document.getElementById('close');
const container = document.querySelector('.container');

open.addEventListener('click', () => container.classList.add('show-nav'));

close.addEventListener('click', () => container.classList.remove('show-nav'));

// Optional: close menu when clicking nav items
document.querySelectorAll('nav li').forEach(item => {
  item.addEventListener('click', () => {
    container.classList.remove('show-nav');
  });
});

console.log('Rotating Navigation loaded - KarthikCodingSolutions ⚡');