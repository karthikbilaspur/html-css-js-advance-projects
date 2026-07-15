const insert = document.getElementById('insert');

window.addEventListener('keydown', (event) => {
  insert.innerHTML = `
    <div class="key">
      ${event.key === ' ' ? 'Space' : event.key}
      <small>event.key</small>
    </div>
    <div class="key">
      ${event.keyCode}
      <small>event.keyCode</small>
    </div>
    <div class="key">
      ${event.code}
      <small>event.code</small>
    </div>
  `;

  // Visual feedback
  document.querySelectorAll('.key').forEach(key => {
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), 100);
  });
});

// Show initial message if no key pressed
if (insert.children.length === 0) {
  insert.innerHTML = `<div class="initial">Press any key to get the keyCode</div>`;
}

console.log('Event KeyCodes loaded - KarthikCodingSolutions ⚡ Bundle 2 Started');