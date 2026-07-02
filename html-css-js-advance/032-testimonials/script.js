const testimonialEl = document.getElementById('testimonial');
const textEl = document.getElementById('text');
const userImageEl = document.getElementById('userImage');
const usernameEl = document.getElementById('username');
const roleEl = document.getElementById('role');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsEl = document.getElementById('dots');
const progressBar = document.getElementById('progressBar');

const testimonials = [
    {
        name: 'Miyah Myles',
        role: 'Marketing Manager',
        photo: 'https://randomuser.me/api/portraits/women/46.jpg',
        text: "I've been using this service for 6 months and it's completely changed how I work. The team is responsive and the product just works."
    },
    {
        name: 'June Cha',
        role: 'Software Engineer',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
        text: "This guy is an amazing frontend developer that delivered the task exactly how we need it. Great attention to detail and communication."
    },
    {
        name: 'Iida Niskanen',
        role: 'Product Designer',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
        text: "I've worked with literally hundreds of HTML/CSS developers and I have to say the top spot goes to this guy. Super professional and fast."
    },
    {
        name: 'Renee Sims',
        role: 'Startup Founder',
        photo: 'https://randomuser.me/api/portraits/women/65.jpg',
        text: "This guy is a top notch designer and frontend developer. He communicates well and works super fast. We hired him again for a second project."
    },
    {
        name: 'Jonathan Nunfiez',
        role: 'DevOps Lead',
        photo: 'https://randomuser.me/api/portraits/men/43.jpg',
        text: "I had my concerns that due to a tight deadline this project couldn't be done. But this guy proved me wrong. Delivered ahead of schedule."
    }
];

let currentIndex = 0;
let autoPlayInterval;
const AUTO_PLAY_DURATION = 10000; // 10 seconds

// Create dots
function createDots() {
    dotsEl.innerHTML = '';
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsEl.appendChild(dot);
    });
}

// Update testimonial
function updateTestimonial() {
    const { name, role, photo, text } = testimonials[currentIndex];

    // Fade out
    testimonialEl.style.opacity = '0';

    setTimeout(() => {
        userImageEl.src = photo;
        usernameEl.textContent = name;
        roleEl.textContent = role;
        textEl.textContent = text;

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // Fade in
        testimonialEl.style.opacity = '1';
    }, 300);

    // Reset progress bar
    progressBar.style.animation = 'none';
    setTimeout(() => {
        progressBar.style.animation = `grow ${AUTO_PLAY_DURATION}ms linear infinite`;
    }, 10);
}

// Next testimonial
function nextTestimonial() {
    currentIndex++;
    if (currentIndex > testimonials.length - 1) {
        currentIndex = 0;
    }
    updateTestimonial();
    resetAutoPlay();
}

// Previous testimonial
function prevTestimonial() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = testimonials.length - 1;
    }
    updateTestimonial();
    resetAutoPlay();
}

// Go to specific slide
function goToSlide(index) {
    currentIndex = index;
    updateTestimonial();
    resetAutoPlay();
}

// Auto play
function startAutoPlay() {
    autoPlayInterval = setInterval(nextTestimonial, AUTO_PLAY_DURATION);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

// Event listeners
nextBtn.addEventListener('click', nextTestimonial);
prevBtn.addEventListener('click', prevTestimonial);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevTestimonial();
    if (e.key === 'ArrowRight') nextTestimonial();
});

// Pause on hover
testimonialEl.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
    progressBar.style.animationPlayState = 'paused';
});

testimonialEl.addEventListener('mouseleave', () => {
    progressBar.style.animationPlayState = 'running';
    startAutoPlay();
});

// Init
testimonialEl.style.transition = 'opacity 0.3s ease';
createDots();
startAutoPlay();