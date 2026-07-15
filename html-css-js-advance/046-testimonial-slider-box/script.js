class TestimonialSlider {
    constructor(data) {
        this.testimonials = data;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isPlaying = true;
        this.isDragging = false;

        // DOM Elements
        this.track = document.getElementById('sliderTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pagination = document.getElementById('pagination');

        this.cardsPerView = this.getCardsPerView();
        this.init();
    }

    getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    createStarRating(rating) {
        return Array.from({ length: 5 }, (_, i) => `
            <svg class="star ${i < rating? 'filled' : ''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        `).join('');
    }

    createTestimonialCard(t, index) {
        return `
            <article class="testimonial-card" role="tabpanel" aria-roledescription="slide"
                     aria-label="${index + 1} of ${this.testimonials.length}">
                <div class="quote-icon" aria-hidden="true">"</div>
                <div class="stars" aria-label="Rating: ${t.rating} out of 5 stars">
                    ${this.createStarRating(t.rating)}
                </div>
                <p class="testimonial-text">${t.text}</p>
                <div class="user-info">
                    <img src="${t.avatar}" alt="${t.name}" class="user-avatar" loading="lazy">
                    <div class="user-details">
                        <h4>${t.name}</h4>
                        <p>${t.role} at ${t.company}</p>
                        ${t.verified? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                </div>
            </article>
        `;
    }

    render() {
        this.track.innerHTML = this.testimonials.map((t, i) => this.createTestimonialCard(t, i)).join('');
        this.createPagination();
        this.updateSlider(false);
    }

    createPagination() {
        const pageCount = Math.ceil(this.testimonials.length / this.cardsPerView);
        this.pagination.innerHTML = '';

        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            dot.setAttribute('aria-controls', 'sliderTrack');
            dot.addEventListener('click', () => this.goToPage(i));
            this.pagination.appendChild(dot);
        }
    }

    updateSlider(animate = true) {
        const cardWidth = this.track.children[0].offsetWidth;
        const gap = 30;
        const offset = -(this.currentIndex * (cardWidth + gap));

        this.track.style.transition = animate? '' : 'none';
        this.track.style.transform = `translateX(${offset}px)`;

        this.updatePagination();
        this.updateButtons();
    }

    updatePagination() {
        const currentPage = Math.floor(this.currentIndex / this.cardsPerView);
        const dots = this.pagination.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.setAttribute('aria-selected', index === currentPage);
            dot.setAttribute('tabindex', index === currentPage? '0' : '-1');
        });
    }

    updateButtons() {
        const maxIndex = this.testimonials.length - this.cardsPerView;
        this.prevBtn.disabled = this.currentIndex <= 0;
        this.nextBtn.disabled = this.currentIndex >= maxIndex;
    }

    next() {
        const maxIndex = this.testimonials.length - this.cardsPerView;
        this.currentIndex = this.currentIndex >= maxIndex? 0 : this.currentIndex + 1;
        this.updateSlider();
    }

    prev() {
        const maxIndex = this.testimonials.length - this.cardsPerView;
        this.currentIndex = this.currentIndex <= 0? maxIndex : this.currentIndex - 1;
        this.updateSlider();
    }

    goToPage(pageIndex) {
        this.currentIndex = pageIndex * this.cardsPerView;
        this.updateSlider();
        this.resetAutoPlay();
    }

    startAutoPlay() {
        if (!this.isPlaying) return;
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        if (this.isPlaying) this.startAutoPlay();
    }

    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prev();
            this.resetAutoPlay();
        }
        if (e.key === 'ArrowRight') {
            this.next();
            this.resetAutoPlay();
        }
    }

    handleTouch() {
        let startX = 0;
        let currentX = 0;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.stopAutoPlay();
            this.isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            const diff = startX - currentX;

            if (Math.abs(diff) > 50) {
                diff > 0? this.next() : this.prev();
            }
            this.resetAutoPlay();
        });
    }

    handleVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else if (this.isPlaying) {
                this.startAutoPlay();
            }
        });
    }

    handleResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newCardsPerView = this.getCardsPerView();
                if (newCardsPerView!== this.cardsPerView) {
                    this.cardsPerView = newCardsPerView;
                    this.currentIndex = 0;
                    this.createPagination();
                    this.updateSlider(false);
                }
            }, 250);
        });
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => {
            this.next();
            this.resetAutoPlay();
        });

        this.prevBtn.addEventListener('click', () => {
            this.prev();
            this.resetAutoPlay();
        });

        this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.track.addEventListener('mouseleave', () => this.startAutoPlay());
        this.track.addEventListener('focusin', () => this.stopAutoPlay());
        this.track.addEventListener('focusout', () => this.startAutoPlay());

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        this.handleTouch();
        this.handleVisibility();
        this.handleResize();
    }

    init() {
        this.render();
        this.bindEvents();
        this.startAutoPlay();
    }
}

// Data
const testimonialData = [
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

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialSlider(testimonialData);
});