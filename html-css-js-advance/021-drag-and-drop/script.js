const fill = document.querySelector('.fill');
const empties = document.querySelectorAll('.empty');

// Desktop drag events
fill.addEventListener('dragstart', dragStart);
fill.addEventListener('dragend', dragEnd);

for (const empty of empties) {
  empty.addEventListener('dragover', dragOver);
  empty.addEventListener('dragenter', dragEnter);
  empty.addEventListener('dragleave', dragLeave);
  empty.addEventListener('drop', dragDrop);
}

// Touch support for mobile
let draggedElement = null;

fill.addEventListener('touchstart', (e) => {
  draggedElement = e.target;
  setTimeout(() => e.target.classList.add('invisible'), 0);
}, { passive: true });

fill.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);

  empties.forEach(empty => empty.classList.remove('hovered'));

  if (element && element.classList.contains('empty')) {
    element.classList.add('hovered');
  }
}, { passive: false });

fill.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);

  empties.forEach(empty => empty.classList.remove('hovered'));

  if (element && element.classList.contains('empty')) {
    element.appendChild(draggedElement);
  }

  draggedElement.classList.remove('invisible');
  draggedElement = null;
});

// Drag functions
function dragStart() {
  this.className += ' hold';
  setTimeout(() => (this.className = 'invisible'), 0);
}

function dragEnd() {
  this.className = 'fill';
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.className += ' hovered';
}

function dragLeave() {
  this.className = 'empty';
}

function dragDrop() {
  this.className = 'empty';
  this.append(this.fill || fill);
}

// Prevent image drag ghost
fill.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move';
});

console.log('Drag N Drop loaded - KarthikCodingSolutions ⚡ Touch enabled');