// JavaScript for Code 10
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Toggle 'active' class on the clicked item
        item.classList.toggle('active');
        
        // Optional: Close other open items (Accordion behavior)
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
    });
});