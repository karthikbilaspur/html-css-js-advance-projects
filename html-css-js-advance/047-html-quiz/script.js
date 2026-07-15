class QuizApp {
    constructor(questions) {
        this.questions = questions;
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.difficulty = '';
        this.answers = []; // Track user answers

        // DOM
        this.screens = {
            start: document.getElementById('startScreen'),
            quiz: document.getElementById('quizScreen'),
            result: document.getElementById('resultScreen')
        };

        this.elements = {
            difficultyBadge: document.getElementById('difficultyBadge'),
            score: document.getElementById('score'),
            progressFill: document.getElementById('progressFill'),
            questionText: document.getElementById('questionText'),
            options: document.getElementById('options'),
            explanation: document.getElementById('explanation'),
            nextBtn: document.getElementById('nextBtn'),
            pagination: document.getElementById('pagination'),
            finalScore: document.getElementById('finalScore'),
            resultCircle: document.getElementById('resultCircle'),
            resultMessage: document.getElementById('resultMessage'),
            resultDetails: document.getElementById('resultDetails')
        };

        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startQuiz(btn.dataset.level));
        });

        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        document.getElementById('retryBtn').addEventListener('click', () => this.startQuiz(this.difficulty));
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.screens.quiz.classList.contains('active')) return;

            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const option = this.elements.options.children[index];
                if (option &&!option.classList.contains('disabled')) {
                    option.click();
                }
            }
            if (e.key === 'Enter' &&!this.elements.nextBtn.disabled) {
                this.nextQuestion();
            }
        });
    }

    startQuiz(level) {
        this.difficulty = level;
        this.currentQuestions = [...this.questions[level]];
        this.currentIndex = 0;
        this.score = 0;
        this.answers = new Array(this.currentQuestions.length).fill(null);

        this.elements.difficultyBadge.textContent = level;
        this.elements.difficultyBadge.className = `badge ${level}`;

        this.showScreen('quiz');
        this.loadQuestion();
    }

    loadQuestion() {
        const question = this.currentQuestions[this.currentIndex];

        // Update progress
        this.elements.score.textContent = this.score;
        this.elements.progressFill.style.width = `${(this.currentIndex / this.currentQuestions.length) * 100}%`;

        // Set question
        this.elements.questionText.textContent = question.question;
        this.elements.explanation.classList.remove('show');
        this.elements.nextBtn.disabled = true;

        // Render options
        this.elements.options.innerHTML = '';
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.textContent = option;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.addEventListener('click', () => this.selectOption(index));
            this.elements.options.appendChild(btn);
        });

        // Render pagination IN BETWEEN
        this.renderPagination();

        // If already answered, show state
        if (this.answers[this.currentIndex]!== null) {
            this.showAnswer(this.answers[this.currentIndex]);
        }
    }

    renderPagination() {
        this.elements.pagination.innerHTML = '';
        this.currentQuestions.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'page-dot';
            dot.textContent = index + 1;
            dot.setAttribute('aria-label', `Go to question ${index + 1}`);

            if (index === this.currentIndex) dot.classList.add('current');
            if (this.answers[index]!== null) {
                dot.classList.add('answered');
                if (this.answers[index] === this.currentQuestions[index].correct) {
                    dot.classList.add('correct');
                } else {
                    dot.classList.add('wrong');
                }
            }

            dot.addEventListener('click', () => {
                this.currentIndex = index;
                this.loadQuestion();
            });

            this.elements.pagination.appendChild(dot);
        });
    }

    selectOption(selectedIndex) {
        if (this.answers[this.currentIndex]!== null) return; // Already answered

        this.answers[this.currentIndex] = selectedIndex;
        this.showAnswer(selectedIndex);
    }

    showAnswer(selectedIndex) {
        const question = this.currentQuestions[this.currentIndex];
        const options = this.elements.options.querySelectorAll('.option');

        options.forEach((el, index) => {
            el.classList.add('disabled');
            el.setAttribute('aria-checked', index === selectedIndex? 'true' : 'false');

            if (index === question.correct) {
                el.classList.add('correct');
            } else if (index === selectedIndex) {
                el.classList.add('wrong');
            }
        });

        if (selectedIndex === question.correct &&!options[selectedIndex].dataset.scored) {
            this.score++;
            this.elements.score.textContent = this.score;
            options[selectedIndex].dataset.scored = 'true';
        }

        this.elements.explanation.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
        this.elements.explanation.classList.add('show');
        this.elements.nextBtn.disabled = false;
        this.renderPagination();
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.currentQuestions.length) {
            this.loadQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.showScreen('result');
        const percentage = (this.score / this.currentQuestions.length) * 100;

        this.elements.finalScore.textContent = this.score;

        // Animate circle
        const offset = 283 - (283 * percentage / 100);
        this.elements.resultCircle.style.strokeDashoffset = offset;

        // Messages
        const messages = [
            { min: 100, msg: 'Perfect! 🎉', detail: 'You are an HTML master!' },
            { min: 80, msg: 'Excellent! 🌟', detail: 'You have strong HTML knowledge!' },
            { min: 60, msg: 'Good Job! 👍', detail: 'You know your HTML basics well!' },
            { min: 40, msg: 'Not Bad! 📚', detail: 'Keep practicing to improve!' },
            { min: 0, msg: 'Keep Learning! 💪', detail: 'Review the basics and try again!' }
        ];

        const result = messages.find(m => percentage >= m.min);
        this.elements.resultMessage.textContent = result.msg;
        this.elements.resultDetails.textContent = result.detail;
    }

    showScreen(screen) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screen].classList.add('active');
    }

    goHome() {
        this.showScreen('start');
    }
}

// Question data
const questions = {
    easy: [
        {question: "What does HTML stand for?",options: ["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Language","Home Tool Markup Language"],correct: 0,explanation: "HTML stands for Hyper Text Markup Language. It's the standard markup language for creating web pages."},
        {question: "Which tag is used to create a hyperlink?",options: ["<link>", "<a>", "<href>", "<url>"],correct: 1,explanation: "The <a> tag defines a hyperlink, which is used to link from one page to another. The href attribute specifies the URL."},
        {question: "Which HTML tag is used to define an unordered list?",options: ["<ol>", "<li>", "<ul>", "<list>"],correct: 2,explanation: "<ul> creates an unordered list with bullet points. <ol> is for ordered lists with numbers."},
        {question: "What is the correct HTML for creating a heading?",options: ["<heading>", "<h1>", "<head>", "<header>"],correct: 1,explanation: "HTML has six heading tags from <h1> to <h6>, with <h1> being the largest/most important."},
        {question: "Which attribute is used to provide alternative text for an image?",options: ["title", "alt", "src", "text"],correct: 1,explanation: "The alt attribute provides alternative text for images if they cannot be displayed. Important for accessibility."},
        {question: "Which tag is used to create a line break?",options: ["<lb>", "<break>", "<br>", "<line>"],correct: 2,explanation: "<br> inserts a single line break. It's an empty tag, meaning it has no closing tag."},
        {question: "What is the correct HTML for inserting an image?",options: ["<img href='image.jpg'>","<img src='image.jpg' alt='Image'>","<image src='image.jpg'>","<img>image.jpg</img>"],correct: 1,explanation: "<img> uses the src attribute to specify the image URL and alt for alternative text."},
        {question: "Which HTML element defines the document's body?",options: ["<body>", "<main>", "<content>", "<section>"],correct: 0,explanation: "The <body> tag defines the document's body and contains all visible contents like headings, paragraphs, images, etc."},
        {question: "What is the correct HTML for making text bold?",options: ["<bold>", "<b>", "<strong>", "Both <b> and <strong>"],correct: 3,explanation: "Both <b> and <strong> make text bold, but <strong> indicates the text is of strong importance semantically."},
        {question: "Which tag is used to create a paragraph?",options: ["<para>", "<p>", "<pg>", "<paragraph>"],correct: 1,explanation: "The <p> tag defines a paragraph. Browsers automatically add space before and after each <p> element."}
    ],
    medium: [
        {question: "What is the purpose of the <!DOCTYPE html> declaration?",options: ["It links to an external CSS file","It tells the browser which HTML version to use","It creates a comment in HTML","It defines the document title"],correct: 1,explanation: "The <!DOCTYPE html> declaration tells the browser to render the page in HTML5 standards mode."},
        {question: "Which attribute specifies that an input field must be filled out?",options: ["required", "mandatory", "validate", "necessary"],correct: 0,explanation: "The required attribute is a boolean attribute that specifies the input must be filled before submitting."},
        {question: "What does the 'action' attribute in a <form> tag specify?",options: ["The HTTP method to use","Where to send the form data when submitted","The type of form validation","The form's CSS class"],correct: 1,explanation: "The action attribute specifies the URL where the form data should be sent when submitted."},
        {question: "Which HTML5 element is used for navigation links?",options: ["<navigation>", "<nav>", "<navigate>", "<menu>"],correct: 1,explanation: "The <nav> element represents a section with navigation links. It's a semantic HTML5 element."},
        {question: "What is the difference between <div> and <span>?",options: ["No difference, they are interchangeable","<div> is block-level, <span> is inline","<span> is block-level, <div> is inline","<div> is for text, <span> is for images"],correct: 1,explanation: "<div> is a block-level element that takes full width, while <span> is inline and only takes necessary width."},
        {question: "Which input type creates a slider control?",options: ["type='slider'", "type='range'", "type='slide'", "type='bar'"],correct: 1,explanation: "type='range' creates a slider control that lets users select a value from a range."},
        {question: "What does the 'defer' attribute do in a <script> tag?",options: ["Loads the script after the page has loaded","Prevents the script from running","Loads the script before HTML parsing","Makes the script run twice"],correct: 0,explanation: "The defer attribute tells the browser to execute the script after the document has been parsed, but before DOMContentLoaded."},
        {question: "Which HTML5 element is used to specify multiple media resources?",options: ["<media>", "<source>", "<src>", "<resource>"],correct: 1,explanation: "The <source> element is used inside <video>, <audio>, or <picture> to specify multiple media resources."},
        {question: "What is the purpose of the 'data-*' attribute?",options: ["To store custom data private to the page","To link to a database","To define data types","To create data tables"],correct: 0,explanation: "data-* attributes allow you to store custom data on HTML elements that can be accessed via JavaScript."},
        {question: "Which tag is used to define a description list?",options: ["<dl>", "<dd>", "<dt>", "<list>"],correct: 0,explanation: "<dl> defines a description list, <dt> defines terms, and <dd> defines descriptions."}
    ],
    hard: [
        {question: "What is the difference between 'async' and 'defer' in script tags?",options: ["No difference, both load scripts after HTML","async loads in order, defer doesn't","defer loads in order, async doesn't guarantee order","async is for CSS, defer is for JS"],correct: 2,explanation: "Both load scripts without blocking HTML parsing. Defer executes scripts in order after parsing, async executes as soon as loaded without order guarantee."},
        {question: "What is the purpose of the 'rel' attribute in <link> tags?",options: ["To define the relationship between current and linked document","To set the relative path","To make the link relative","To reload the linked resource"],correct: 0,explanation: "The rel attribute specifies the relationship between the current document and the linked resource (e.g., stylesheet, icon, preconnect)."},
        {question: "Which attribute makes an element editable by the user?",options: ["editable", "contenteditable", "edit", "user-edit"],correct: 1,explanation: "contenteditable is a global attribute that makes an element's content editable by the user."},
        {question: "What does the 'sandbox' attribute do in an <iframe>?",options: ["Makes the iframe draggable","Applies extra restrictions to iframe content","Increases iframe performance","Adds a border to the iframe"],correct: 1,explanation: "The sandbox attribute enables extra restrictions for iframe content for security, blocking scripts, forms, etc., unless explicitly allowed."},
        {question: "Which HTML5 API allows you to store data locally with no expiration?",options: ["sessionStorage", "localStorage", "cookies", "indexedDB"],correct: 1,explanation: "localStorage stores data with no expiration time. sessionStorage clears when the tab closes. Both are Web Storage APIs."},
        {question: "What is the purpose of the <picture> element?",options: ["To display multiple images at once","To provide different images for different devices/screen sizes","To create an image gallery","To add captions to images"],correct: 1,explanation: "The <picture> element provides different image sources for different display/device scenarios using <source> elements and media queries."},
        {question: "What does the 'hidden' attribute do?",options: ["Makes text invisible but selectable","Hides the element from display and screen readers","Makes element transparent","Removes element from DOM"],correct: 1,explanation: "The hidden attribute is a boolean attribute that indicates the element is not yet, or no longer, relevant and should not be rendered."},
        {question: "Which element is used to define a scalar measurement within a range?",options: ["<measure>", "<meter>", "<gauge>", "<scale>"],correct: 1,explanation: "The <meter> element represents a scalar value within a known range, like disk usage or a grade. Use <progress> for task progress."},
        {question: "What is the purpose of the 'preload' attribute in <video> and <audio>?",options: ["To specify if/how the media should be loaded when page loads","To preload the poster image","To buffer the entire video before playing","To set the video quality"],correct: 0,explanation: "preload can be 'none', 'metadata', or 'auto' to hint how much of the media should be downloaded when the page loads."},
        {question: "What is the difference between <section> and <article>?",options: ["No difference, both are containers","<section> is generic, <article> is for self-contained content","<article> is generic, <section> is for self-contained content","<section> is for text, <article> is for images"],correct: 1,explanation: "<article> represents self-contained content that could be distributed independently (blog post, news article). <section> is a generic thematic grouping."}
    ]
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp(questions);
});