const cards = document.querySelectorAll('.card');

function setActiveCard(clickedCard) {
  if (clickedCard.classList.contains('active')) return;
  
  cards.forEach(card => {
    const isActive = card === clickedCard;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
  });
}

cards.forEach(card => {
  card.addEventListener('click', () => setActiveCard(card));
  
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveCard(card);
    }
  });
});