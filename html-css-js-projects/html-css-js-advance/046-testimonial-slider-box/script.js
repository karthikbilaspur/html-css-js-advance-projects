const sliderWrapper = document.getElementById('sliderWrapper');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Product Manager',
        company: 'TechCorp',
        avatar: 'https://i.pravatar.cc/100?img=1',
        rating: 5,
        text: 'This platform completely transformed how our team collaborates. The intuitive interface and powerful features saved us countless hours. Absolutely recommend!',
        verified: true
    },
    {
        name: 'Michael Chen',
        role: 'Startup Founder',
        company: 'InnovateLabs',
        avatar: 'https://i.pravatar.cc/100?img=12',
        rating: 5,
        text: 'Outstanding service from start to finish. The support team is incredibly responsive and the product delivers exactly what was promised. Game changer for our business.',
        verified: true
    },
    {
        name: 'Emily Rodriguez',
        role: 'Marketing Director',
        company: 'BrandWorks',
        avatar: 'https://i.pravatar.cc/100?img=5',
        rating: 4,
        text: 'We have been using this for 8 months now and it keeps getting better. The analytics dashboard gives us insights we never had before. Very satisfied!',
        verified: true
    },
    {
        name: 'David Park',
        role: 'Software Engineer',
        company: 'CodeBase',
        avatar: 'https://i.pravatar.cc/100?img=14',
        rating: 5,
        text: 'As a developer, I appreciate clean code and great UX. This delivers both. Integration was seamless and documentation is top-notch. 10/10.',
        verified: true
    },
    {
        name: 'Lisa Thompson',
        role: 'CEO',
        company: 'GrowthHub',
        avatar: 'https://i.pravatar.cc/100?img=9',
        rating: 5,
        text: 'Best investment we made this year. ROI was clear within the first month. The team loves it and productivity has skyrocketed. Cannot imagine working without it now.',
        verified: true
    },
    {
        name: 'James Wilson',
        role: 'Design Lead',
        company: 'CreativeStudio',
        avatar: 'https://i.pravatar.cc/100?img=15',
        rating: 4,
        text: 'Beautiful design meets functionality. Our designers picked it up instantly. The collaboration features are exactly what we needed for remote work.',
        verified: false
    }
];

let currentIndex = 0;
let autoPlayInterval;
let cardsPerView = getCardsPerView();

function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function createStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `
            <svg class="star ${i <= rating? 'filled' : ''}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        `;
    }
    return stars;
}

function createTestimonialCard(testimonial) {
    return `
        <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <div class="stars">${createStarRating(testimonial.rating)}</div>
            <p class="testimonial-text">${testimonial.text}</p>
            <div class="user-info">
                <img src="${testimonial.avatar}" alt="${testimonial.name}" class="user-avatar">
                <div class="user-details">
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.role} at ${testimonial.company}</p>
                    ${testimonial.verified? '<span class="verified-badge">✓ Verified</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

function initSlider() {
    sliderWrapper.innerHTML = testimonials.map(createTestimonialCard).join('');
    createDots();
    updateSlider();
    startAutoPlay();
}

function createDots() {
    const dotCount = Math.ceil(testimonials.length / cardsPerView);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function updateSlider() {
    const offset = -(currentIndex * (100 / cardsPerView));
    sliderWrapper.style.transform = `translateX(${offset}%)`;

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === Math.floor(currentIndex / cardsPerView));
    });
}

function nextSlide() {
    const maxIndex = testimonials.length - cardsPerView;
    currentIndex = currentIndex >= maxIndex? 0 : currentIndex + 1;
    updateSlider();
}

function prevSlide() {
    const maxIndex = testimonials.length - cardsPerView;
    currentIndex = currentIndex <= 0? maxIndex : currentIndex - 1;
    updateSlider();
}

function goToSlide(index) {
    currentIndex = index * cardsPerView;
    updateSlider();
    resetAutoPlay();
}

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

// Event listeners
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
});

// Pause on hover
sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
sliderWrapper.addEventListener('mouseleave', startAutoPlay);

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

sliderWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

sliderWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
    resetAutoPlay();
}

// Handle resize
window.addEventListener('resize', () => {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView!== cardsPerView) {
        cardsPerView = newCardsPerView;
        currentIndex = 0;
        createDots();
        updateSlider();
    }
});

// Init
initSlider();