// All 10 questions split into 5 for medium level
const quizData = [
    {
        question: "Pick a color palette that speaks to you:",
        options: [
            { text: "Ocean Blues & Teals", keywords: "ocean,blue,water" },
            { text: "Sunset Orange & Pink", keywords: "sunset,warm,orange" },
            { text: "Forest Green & Earth", keywords: "forest,nature,green" },
            { text: "Monochrome Black & White", keywords: "minimal,black,white" }
        ]
    },
    {
        question: "What's your brand vibe?",
        options: [
            { text: "Bold & Disruptive", keywords: "abstract,bold,geometric" },
            { text: "Calm & Minimal", keywords: "minimal,clean,simple" },
            { text: "Playful & Creative", keywords: "colorful,fun,creative" },
            { text: "Luxury & Elegant", keywords: "luxury,elegant,gold" }
        ]
    },
    {
        question: "Choose an environment:",
        options: [
            { text: "Modern Tech Office", keywords: "office,modern,technology" },
            { text: "Cozy Coffee Shop", keywords: "cafe,coffee,cozy" },
            { text: "Nature Retreat", keywords: "nature,mountain,peaceful" },
            { text: "Urban Cityscape", keywords: "city,urban,skyline" }
        ]
    },
    {
        question: "Pick a texture:",
        options: [
            { text: "Smooth Glass", keywords: "glass,smooth,reflection" },
            { text: "Rough Concrete", keywords: "concrete,texture,industrial" },
            { text: "Soft Fabric", keywords: "fabric,textile,soft" },
            { text: "Natural Wood", keywords: "wood,natural,grain" }
        ]
    },
    {
        question: "Final touch: What energy?",
        options: [
            { text: "High Energy & Dynamic", keywords: "dynamic,energy,motion" },
            { text: "Zen & Balanced", keywords: "zen,balance,calm" },
            { text: "Edgy & Rebellious", keywords: "dark,edgy,street" },
            { text: "Warm & Inviting", keywords: "warm,cozy,inviting" }
        ]
    }
];

// State
let currentQuestion = 0;
let userAnswers = [];
let generatedImages = [];
let currentRating = 0;
let testimonials = JSON.parse(localStorage.getItem('brandTestimonials')) || [];

// DOM Elements
const quizScreen = document.getElementById('quizScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');
const sliderScreen = document.getElementById('sliderScreen');
const progressFill = document.getElementById('progressFill');
const stepCount = document.getElementById('stepCount');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const loadingText = document.getElementById('loadingText');
const moodBoard = document.getElementById('moodBoard');
const brandSummary = document.getElementById('brandSummary');
const starRating = document.getElementById('starRating');
const reviewText = document.getElementById('reviewText');
const addToSliderBtn = document.getElementById('addToSliderBtn');
const restartBtn = document.getElementById('restartBtn');
const sliderWrapper = document.getElementById('sliderWrapper');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.getElementById('dots');
const createNewBtn = document.getElementById('createNewBtn');

let currentSlide = 0;

// Init
loadQuestion();

// Quiz Logic
function loadQuestion() {
    const question = quizData[currentQuestion];
    quizQuestion.textContent = question.question;
    quizOptions.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option');
        btn.textContent = option.text;
        btn.addEventListener('click', () => selectAnswer(index));
        quizOptions.appendChild(btn);
    });

    updateProgress();
}

function selectAnswer(index) {
    userAnswers.push(quizData[currentQuestion].options[index]);
    currentQuestion++;

    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        generateMoodBoard();
    }
}

function updateProgress() {
    const percent = ((currentQuestion + 1) / quizData.length) * 100;
    progressFill.style.width = `${percent}%`;
    stepCount.textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
}

// Image Generation
async function generateMoodBoard() {
    quizScreen.classList.remove('active');
    loadingScreen.classList.add('active');

    generatedImages = [];

    for (let i = 0; i < userAnswers.length; i++) {
        loadingText.textContent = `Creating image ${i + 1} of ${userAnswers.length}`;

        const keywords = userAnswers[i].keywords;
        const url = `https://source.unsplash.com/600x400/?${keywords}&sig=${Date.now() + i}`;

        // Simulate loading delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        generatedImages.push({
            url: url,
            label: userAnswers[i].text
        });
    }

    showResults();
}

function showResults() {
    loadingScreen.classList.remove('active');
    resultScreen.classList.add('active');

    // Generate brand summary from answers
    const summary = userAnswers.map(a => a.text.split('&')[0].trim()).join(' + ');
    brandSummary.textContent = `Your brand: ${summary}`;

    // Render mood board
    moodBoard.innerHTML = generatedImages.map(img => `
        <div class="mood-card">
            <img src="${img.url}" alt="${img.label}" loading="lazy">
            <div class="mood-card-info">
                <div class="mood-card-label">${img.label}</div>
            </div>
        </div>
    `).join('');
}

// Star Rating
starRating.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value);
        updateStars();
        addToSliderBtn.disabled = false;
    });

    star.addEventListener('mouseover', () => {
        const value = parseInt(star.dataset.value);
        highlightStars(value);
    });
});

starRating.addEventListener('mouseleave', () => {
    updateStars();
});

function updateStars() {
    starRating.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
    });
}

function highlightStars(value) {
    starRating.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < value);
    });
}

// Add to Testimonial Slider
addToSliderBtn.addEventListener('click', () => {
    const testimonial = {
        images: generatedImages.map(img => img.url),
        rating: currentRating,
        text: reviewText.value || "Love my brand vibe!",
        summary: userAnswers.map(a => a.text.split('&')[0].trim()).join(' + '),
        timestamp: Date.now()
    };

    testimonials.unshift(testimonial);
    if (testimonials.length > 10) testimonials.pop();

    localStorage.setItem('brandTestimonials', JSON.stringify(testimonials));

    showSlider();
});

// Testimonial Slider
function showSlider() {
    resultScreen.classList.remove('active');
    sliderScreen.classList.add('active');
    renderSlider();
}

function renderSlider() {
    if (testimonials.length === 0) {
        sliderWrapper.innerHTML = '<div class="testimonial-slide"><p style="text-align:center;color:#94a3b8;">No testimonials yet. Create one!</p></div>';
        return;
    }

    sliderWrapper.innerHTML = testimonials.map(t => `
        <div class="testimonial-slide">
            <div class="slide-images">
                ${t.images.map(url => `<img src="${url}" alt="Mood">`).join('')}
            </div>
            <div class="slide-rating">
                ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
            </div>
            <p class="slide-text">${t.text}</p>
            <div class="slide-user">${t.summary}</div>
        </div>
    `).join('');

    createDots();
    updateSliderPosition();
}

function createDots() {
    dots.innerHTML = '';
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
    });
}

function updateSliderPosition() {
    const offset = -(currentSlide * 100);
    sliderWrapper.style.transform = `translateX(${offset}%)`;

    dots.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % testimonials.length;
    updateSliderPosition();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
    updateSliderPosition();
}

function goToSlide(index) {
    currentSlide = index;
    updateSliderPosition();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Restart
restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    userAnswers = [];
    generatedImages = [];
    currentRating = 0;
    reviewText.value = '';

    resultScreen.classList.remove('active');
    sliderScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion();
});

createNewBtn.addEventListener('click', () => {
    sliderScreen.classList.remove('active');
    quizScreen.classList.add('active');
    currentQuestion = 0;
    userAnswers = [];
    loadQuestion();
});

// Auto-show slider if testimonials exist
if (testimonials.length > 0) {
    // Uncomment to start on slider instead of quiz
    // quizScreen.classList.remove('active');
    // showSlider();
}