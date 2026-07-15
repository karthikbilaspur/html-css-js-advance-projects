class BrandMoodBoard {
    constructor(quizData) {
        this.quizData = quizData;
        this.state = {
            currentQuestion: 0,
            answers: [],
            images: [],
            rating: 0,
            currentSlide: 0,
            testimonials: this.loadTestimonials()
        };

        this.screens = {
            quiz: document.getElementById('quizScreen'),
            loading: document.getElementById('loadingScreen'),
            result: document.getElementById('resultScreen'),
            slider: document.getElementById('sliderScreen')
        };

        this.elements = this.cacheElements();
        this.init();
    }

    cacheElements() {
        return {
            progressFill: document.getElementById('progressFill'),
            stepCount: document.getElementById('stepCount'),
            quizQuestion: document.getElementById('quizQuestion'),
            quizOptions: document.getElementById('quizOptions'),
            questionPagination: document.getElementById('questionPagination'),
            backBtn: document.getElementById('backBtn'),
            loadingText: document.getElementById('loadingText'),
            moodBoard: document.getElementById('moodBoard'),
            brandSummary: document.getElementById('brandSummary'),
            starRating: document.getElementById('starRating'),
            reviewText: document.getElementById('reviewText'),
            addToSliderBtn: document.getElementById('addToSliderBtn'),
            shareBtn: document.getElementById('shareBtn'),
            restartBtn: document.getElementById('restartBtn'),
            sliderWrapper: document.getElementById('sliderWrapper'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            dots: document.getElementById('dots'),
            createNewBtn: document.getElementById('createNewBtn'),
            toast: document.getElementById('toast')
        };
    }

    init() {
        this.bindEvents();
        this.loadQuestion();
        this.renderQuestionPagination();
    }

    bindEvents() {
        this.elements.backBtn.addEventListener('click', () => this.goBack());
        this.elements.addToSliderBtn.addEventListener('click', () => this.addToTestimonials());
        this.elements.shareBtn.addEventListener('click', () => this.shareBoard());
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.createNewBtn.addEventListener('click', () => this.restart());
        this.elements.prevBtn.addEventListener('click', () => this.prevSlide());
        this.elements.nextBtn.addEventListener('click', () => this.nextSlide());

        // Star rating
        this.elements.starRating.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => this.setRating(parseInt(star.dataset.value)));
            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setRating(parseInt(star.dataset.value));
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        if (!this.screens.quiz.classList.contains('active')) return;

        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
            const option = this.elements.quizOptions.children[num - 1];
            if (option) option.click();
        }
        if (e.key === 'Enter' && this.state.answers[this.state.currentQuestion]) {
            this.nextQuestion();
        }
    }

    renderQuestionPagination() {
        this.elements.questionPagination.innerHTML = '';
        this.quizData.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = 'q-page';
            btn.textContent = index + 1;
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', `Question ${index + 1}`);
            btn.setAttribute('aria-selected', index === this.state.currentQuestion);
            btn.setAttribute('tabindex', index === this.state.currentQuestion? '0' : '-1');

            if (index === this.state.currentQuestion) btn.classList.add('current');
            if (this.state.answers[index]) btn.classList.add('answered');

            btn.addEventListener('click', () => this.jumpToQuestion(index));
            this.elements.questionPagination.appendChild(btn);
        });
    }

    jumpToQuestion(index) {
        this.state.currentQuestion = index;
        this.loadQuestion();
        this.renderQuestionPagination();
    }

    loadQuestion() {
        const question = this.quizData[this.state.currentQuestion];
        this.elements.quizQuestion.textContent = question.question;
        this.elements.quizOptions.innerHTML = '';

        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option.text;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.addEventListener('click', () => this.selectAnswer(index, btn));
            this.elements.quizOptions.appendChild(btn);
        });

        this.updateProgress();
        this.elements.backBtn.disabled = this.state.currentQuestion === 0;

        // Restore selection if exists
        if (this.state.answers[this.state.currentQuestion]) {
            const idx = this.state.answers[this.state.currentQuestion].index;
            this.elements.quizOptions.children[idx]?.classList.add('selected');
        }
    }

    selectAnswer(index, btn) {
        this.state.answers[this.state.currentQuestion] = {
           ...this.quizData[this.state.currentQuestion].options[index],
            index
        };

        this.elements.quizOptions.querySelectorAll('.quiz-option').forEach(o => {
            o.classList.remove('selected');
            o.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');

        this.renderQuestionPagination();

        // Auto-advance after short delay
        setTimeout(() => this.nextQuestion(), 300);
    }

    nextQuestion() {
        if (this.state.currentQuestion < this.quizData.length - 1) {
            this.state.currentQuestion++;
            this.loadQuestion();
            this.renderQuestionPagination();
        } else {
            this.generateMoodBoard();
        }
    }

    goBack() {
        if (this.state.currentQuestion > 0) {
            this.state.currentQuestion--;
            this.loadQuestion();
            this.renderQuestionPagination();
        }
    }

    updateProgress() {
        const percent = ((this.state.currentQuestion + 1) / this.quizData.length) * 100;
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.stepCount.textContent = `Question ${this.state.currentQuestion + 1}/${this.quizData.length}`;
        document.querySelector('.progress').setAttribute('aria-valuenow', percent);
    }

    async generateMoodBoard() {
        this.showScreen('loading');
        this.state.images = [];

        for (let i = 0; i < this.state.answers.length; i++) {
            this.elements.loadingText.textContent = `Creating image ${i + 1} of ${this.state.answers.length}`;
            const keywords = this.state.answers[i].keywords;
            const url = `https://source.unsplash.com/600x400/?${keywords}&sig=${Date.now() + i}`;

            await new Promise(resolve => setTimeout(resolve, 800));
            this.state.images.push({ url, label: this.state.answers[i].text });
        }

        this.showResults();
    }

    showResults() {
        this.showScreen('result');
        const summary = this.state.answers.map(a => a.text.split('&')[0].trim()).join(' + ');
        this.elements.brandSummary.textContent = `Your brand: ${summary}`;

        this.elements.moodBoard.innerHTML = this.state.images.map(img => `
            <div class="mood-card">
                <img src="${img.url}" alt="${img.label}" loading="lazy">
                <div class="mood-card-info">
                    <div class="mood-card-label">${img.label}</div>
                </div>
            </div>
        `).join('');
    }

    setRating(value) {
        this.state.rating = value;
        this.elements.starRating.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < value);
            star.setAttribute('aria-checked', index + 1 === value? 'true' : 'false');
        });
        this.elements.addToSliderBtn.disabled = false;
    }

    addToTestimonials() {
        const testimonial = {
            images: this.state.images.map(img => img.url),
            rating: this.state.rating,
            text: this.elements.reviewText.value || "Love my brand vibe!",
            summary: this.state.answers.map(a => a.text.split('&')[0].trim()).join(' + '),
            timestamp: Date.now()
        };

        this.state.testimonials.unshift(testimonial);
        if (this.state.testimonials.length > 10) this.state.testimonials.pop();
        localStorage.setItem('brandTestimonials', JSON.stringify(this.state.testimonials));

        this.showToast('Added to community board!');
        this.showSlider();
    }

    shareBoard() {
        const data = {
            answers: this.state.answers,
            images: this.state.images
        };
        const url = `${window.location.origin}${window.location.pathname}?board=${btoa(JSON.stringify(data))}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Link copied to clipboard!');
        });
    }

    showSlider() {
        this.showScreen('slider');
        this.renderSlider();
    }

    renderSlider() {
        if (this.state.testimonials.length === 0) {
            this.elements.sliderWrapper.innerHTML = '<div class="testimonial-slide"><p style="text-align:center;color:var(--text-dim);">No testimonials yet. Create one!</p></div>';
            return;
        }

        this.elements.sliderWrapper.innerHTML = this.state.testimonials.map(t => `
            <div class="testimonial-slide">
                <div class="slide-images">
                    ${t.images.map(url => `<img src="${url}" alt="Mood" loading="lazy">`).join('')}
                </div>
                <div class="slide-rating">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
                <p class="slide-text">${t.text}</p>
                <div class="slide-user">${t.summary}</div>
            </div>
        `).join('');

        this.createDots();
        this.updateSliderPosition();
    }

    createDots() {
        this.elements.dots.innerHTML = '';
        this.state.testimonials.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.elements.dots.appendChild(dot);
        });
    }

    updateSliderPosition() {
        const offset = -(this.state.currentSlide * 100);
        this.elements.sliderWrapper.style.transform = `translateX(${offset}%)`;
        this.elements.dots.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentSlide);
        });
    }

    nextSlide() {
        this.state.currentSlide = (this.state.currentSlide + 1) % this.state.testimonials.length;
        this.updateSliderPosition();
    }

    prevSlide() {
        this.state.currentSlide = (this.state.currentSlide - 1 + this.state.testimonials.length) % this.state.testimonials.length;
        this.updateSliderPosition();
    }

    goToSlide(index) {
        this.state.currentSlide = index;
        this.updateSliderPosition();
    }

    restart() {
        this.state.currentQuestion = 0;
        this.state.answers = [];
        this.state.images = [];
        this.state.rating = 0;
        this.elements.reviewText.value = '';
        this.showScreen('quiz');
        this.loadQuestion();
        this.renderQuestionPagination();
    }

    showScreen(screen) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screen].classList.add('active');
    }

    showToast(message) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');
        setTimeout(() => this.elements.toast.classList.remove('show'), 3000);
    }

    loadTestimonials() {
        return JSON.parse(localStorage.getItem('brandTestimonials')) || [];
    }
}

// Quiz Data
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

// Init
document.addEventListener('DOMContentLoaded', () => {
    new BrandMoodBoard(quizData);
});