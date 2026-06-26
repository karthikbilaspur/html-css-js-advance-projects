// All 30 questions: 10 easy, 10 medium, 10 hard
const questions = {
    easy: [
        {
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Hyper Transfer Markup Language",
                "Home Tool Markup Language"
            ],
            correct: 0,
            explanation: "HTML stands for Hyper Text Markup Language. It's the standard markup language for creating web pages."
        },
        {
            question: "Which tag is used to create a hyperlink?",
            options: ["<link>", "<a>", "<href>", "<url>"],
            correct: 1,
            explanation: "The <a> tag defines a hyperlink, which is used to link from one page to another. The href attribute specifies the URL."
        },
        {
            question: "Which HTML tag is used to define an unordered list?",
            options: ["<ol>", "<li>", "<ul>", "<list>"],
            correct: 2,
            explanation: "<ul> creates an unordered list with bullet points. <ol> is for ordered lists with numbers."
        },
        {
            question: "What is the correct HTML for creating a heading?",
            options: ["<heading>", "<h1>", "<head>", "<header>"],
            correct: 1,
            explanation: "HTML has six heading tags from <h1> to <h6>, with <h1> being the largest/most important."
        },
        {
            question: "Which attribute is used to provide alternative text for an image?",
            options: ["title", "alt", "src", "text"],
            correct: 1,
            explanation: "The alt attribute provides alternative text for images if they cannot be displayed. Important for accessibility."
        },
        {
            question: "Which tag is used to create a line break?",
            options: ["<lb>", "<break>", "<br>", "<line>"],
            correct: 2,
            explanation: "<br> inserts a single line break. It's an empty tag, meaning it has no closing tag."
        },
        {
            question: "What is the correct HTML for inserting an image?",
            options: [
                "<img href='image.jpg'>",
                "<img src='image.jpg' alt='Image'>",
                "<image src='image.jpg'>",
                "<img>image.jpg</img>"
            ],
            correct: 1,
            explanation: "<img> uses the src attribute to specify the image URL and alt for alternative text."
        },
        {
            question: "Which HTML element defines the document's body?",
            options: ["<body>", "<main>", "<content>", "<section>"],
            correct: 0,
            explanation: "The <body> tag defines the document's body and contains all visible contents like headings, paragraphs, images, etc."
        },
        {
            question: "What is the correct HTML for making text bold?",
            options: ["<bold>", "<b>", "<strong>", "Both <b> and <strong>"],
            correct: 3,
            explanation: "Both <b> and <strong> make text bold, but <strong> indicates the text is of strong importance semantically."
        },
        {
            question: "Which tag is used to create a paragraph?",
            options: ["<para>", "<p>", "<pg>", "<paragraph>"],
            correct: 1,
            explanation: "The <p> tag defines a paragraph. Browsers automatically add space before and after each <p> element."
        }
    ],
    medium: [
        {
            question: "What is the purpose of the <!DOCTYPE html> declaration?",
            options: [
                "It links to an external CSS file",
                "It tells the browser which HTML version to use",
                "It creates a comment in HTML",
                "It defines the document title"
            ],
            correct: 1,
            explanation: "The <!DOCTYPE html> declaration tells the browser to render the page in HTML5 standards mode."
        },
        {
            question: "Which attribute specifies that an input field must be filled out?",
            options: ["required", "mandatory", "validate", "necessary"],
            correct: 0,
            explanation: "The required attribute is a boolean attribute that specifies the input must be filled before submitting."
        },
        {
            question: "What does the 'action' attribute in a <form> tag specify?",
            options: [
                "The HTTP method to use",
                "Where to send the form data when submitted",
                "The type of form validation",
                "The form's CSS class"
            ],
            correct: 1,
            explanation: "The action attribute specifies the URL where the form data should be sent when submitted."
        },
        {
            question: "Which HTML5 element is used for navigation links?",
            options: ["<navigation>", "<nav>", "<navigate>", "<menu>"],
            correct: 1,
            explanation: "The <nav> element represents a section with navigation links. It's a semantic HTML5 element."
        },
        {
            question: "What is the difference between <div> and <span>?",
            options: [
                "No difference, they are interchangeable",
                "<div> is block-level, <span> is inline",
                "<span> is block-level, <div> is inline",
                "<div> is for text, <span> is for images"
            ],
            correct: 1,
            explanation: "<div> is a block-level element that takes full width, while <span> is inline and only takes necessary width."
        },
        {
            question: "Which input type creates a slider control?",
            options: ["type='slider'", "type='range'", "type='slide'", "type='bar'"],
            correct: 1,
            explanation: "type='range' creates a slider control that lets users select a value from a range."
        },
        {
            question: "What does the 'defer' attribute do in a <script> tag?",
            options: [
                "Loads the script after the page has loaded",
                "Prevents the script from running",
                "Loads the script before HTML parsing",
                "Makes the script run twice"
            ],
            correct: 0,
            explanation: "The defer attribute tells the browser to execute the script after the document has been parsed, but before DOMContentLoaded."
        },
        {
            question: "Which HTML5 element is used to specify multiple media resources?",
            options: ["<media>", "<source>", "<src>", "<resource>"],
            correct: 1,
            explanation: "The <source> element is used inside <video>, <audio>, or <picture> to specify multiple media resources."
        },
        {
            question: "What is the purpose of the 'data-*' attribute?",
            options: [
                "To store custom data private to the page",
                "To link to a database",
                "To define data types",
                "To create data tables"
            ],
            correct: 0,
            explanation: "data-* attributes allow you to store custom data on HTML elements that can be accessed via JavaScript."
        },
        {
            question: "Which tag is used to define a description list?",
            options: ["<dl>", "<dd>", "<dt>", "<list>"],
            correct: 0,
            explanation: "<dl> defines a description list, <dt> defines terms, and <dd> defines descriptions."
        }
    ],
    hard: [
        {
            question: "What is the difference between 'async' and 'defer' in script tags?",
            options: [
                "No difference, both load scripts after HTML",
                "async loads in order, defer doesn't",
                "defer loads in order, async doesn't guarantee order",
                "async is for CSS, defer is for JS"
            ],
            correct: 2,
            explanation: "Both load scripts without blocking HTML parsing. Defer executes scripts in order after parsing, async executes as soon as loaded without order guarantee."
        },
        {
            question: "What is the purpose of the 'rel' attribute in <link> tags?",
            options: [
                "To define the relationship between current and linked document",
                "To set the relative path",
                "To make the link relative",
                "To reload the linked resource"
            ],
            correct: 0,
            explanation: "The rel attribute specifies the relationship between the current document and the linked resource (e.g., stylesheet, icon, preconnect)."
        },
        {
            question: "Which attribute makes an element editable by the user?",
            options: ["editable", "contenteditable", "edit", "user-edit"],
            correct: 1,
            explanation: "contenteditable is a global attribute that makes an element's content editable by the user."
        },
        {
            question: "What does the 'sandbox' attribute do in an <iframe>?",
            options: [
                "Makes the iframe draggable",
                "Applies extra restrictions to iframe content",
                "Increases iframe performance",
                "Adds a border to the iframe"
            ],
            correct: 1,
            explanation: "The sandbox attribute enables extra restrictions for iframe content for security, blocking scripts, forms, etc., unless explicitly allowed."
        },
        {
            question: "Which HTML5 API allows you to store data locally with no expiration?",
            options: ["sessionStorage", "localStorage", "cookies", "indexedDB"],
            correct: 1,
            explanation: "localStorage stores data with no expiration time. sessionStorage clears when the tab closes. Both are Web Storage APIs."
        },
        {
            question: "What is the purpose of the <picture> element?",
            options: [
                "To display multiple images at once",
                "To provide different images for different devices/screen sizes",
                "To create an image gallery",
                "To add captions to images"
            ],
            correct: 1,
            explanation: "The <picture> element provides different image sources for different display/device scenarios using <source> elements and media queries."
        },
        {
            question: "What does the 'hidden' attribute do?",
            options: [
                "Makes text invisible but selectable",
                "Hides the element from display and screen readers",
                "Makes element transparent",
                "Removes element from DOM"
            ],
            correct: 1,
            explanation: "The hidden attribute is a boolean attribute that indicates the element is not yet, or no longer, relevant and should not be rendered."
        },
        {
            question: "Which element is used to define a scalar measurement within a range?",
            options: ["<measure>", "<meter>", "<gauge>", "<scale>"],
            correct: 1,
            explanation: "The <meter> element represents a scalar value within a known range, like disk usage or a grade. Use <progress> for task progress."
        },
        {
            question: "What is the purpose of the 'preload' attribute in <video> and <audio>?",
            options: [
                "To specify if/how the media should be loaded when page loads",
                "To preload the poster image",
                "To buffer the entire video before playing",
                "To set the video quality"
            ],
            correct: 0,
            explanation: "preload can be 'none', 'metadata', or 'auto' to hint how much of the media should be downloaded when the page loads."
        },
        {
            question: "What is the difference between <section> and <article>?",
            options: [
                "No difference, both are containers",
                "<section> is generic, <article> is for self-contained content",
                "<article> is generic, <section> is for self-contained content",
                "<section> is for text, <article> is for images"
            ],
            correct: 1,
            explanation: "<article> represents self-contained content that could be distributed independently (blog post, news article). <section> is a generic thematic grouping."
        }
    ]
};

// DOM elements
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const questionNumber = document.getElementById('questionNumber');
const difficultyBadge = document.getElementById('difficultyBadge');
const score = document.getElementById('score');
const progressFill = document.getElementById('progressFill');
const questionText = document.getElementById('questionText');
const options = document.getElementById('options');
const explanation = document.getElementById('explanation');
const nextBtn = document.getElementById('nextBtn');
const finalScore = document.getElementById('finalScore');
const resultCircle = document.getElementById('resultCircle');
const resultMessage = document.getElementById('resultMessage');
const resultDetails = document.getElementById('resultDetails');
const retryBtn = document.getElementById('retryBtn');
const homeBtn = document.getElementById('homeBtn');

let currentQuestions = [];
let currentIndex = 0;
let currentScore = 0;
let selectedDifficulty = '';

// Event listeners
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedDifficulty = btn.dataset.level;
        startQuiz();
    });
});

nextBtn.addEventListener('click', nextQuestion);
retryBtn.addEventListener('click', () => startQuiz());
homeBtn.addEventListener('click', goHome);

function startQuiz() {
    currentQuestions = [...questions[selectedDifficulty]];
    currentIndex = 0;
    currentScore = 0;

    difficultyBadge.textContent = selectedDifficulty;
    difficultyBadge.className = `badge ${selectedDifficulty}`;

    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion();
}

function loadQuestion() {
    const question = currentQuestions[currentIndex];

    questionNumber.textContent = `Question ${currentIndex + 1}/${currentQuestions.length}`;
    score.textContent = currentScore;
    progressFill.style.width = `${((currentIndex) / currentQuestions.length) * 100}%`;

    questionText.textContent = question.question;
    options.innerHTML = '';
    explanation.classList.remove('show');
    nextBtn.disabled = true;

    question.options.forEach((option, index) => {
        const optionEl = document.createElement('button');
        optionEl.classList.add('option');
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectOption(index));
        options.appendChild(optionEl);
    });
}

function selectOption(selectedIndex) {
    const question = currentQuestions[currentIndex];
    const optionElements = document.querySelectorAll('.option');

    optionElements.forEach((el, index) => {
        el.classList.add('disabled');
        if (index === question.correct) {
            el.classList.add('correct');
        } else if (index === selectedIndex) {
            el.classList.add('wrong');
        }
    });

    if (selectedIndex === question.correct) {
        currentScore++;
        score.textContent = currentScore;
    }

    explanation.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
    explanation.classList.add('show');
    nextBtn.disabled = false;
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');

    const percentage = (currentScore / currentQuestions.length) * 100;
    finalScore.textContent = currentScore;

    // Animate circle
    const offset = 283 - (283 * percentage / 100);
    resultCircle.style.strokeDashoffset = offset;

    // Message based on score
    let message = '';
    if (percentage === 100) {
        message = 'Perfect! 🎉';
        resultDetails.textContent = 'You are an HTML master!';
    } else if (percentage >= 80) {
        message = 'Excellent! 🌟';
        resultDetails.textContent = 'You have strong HTML knowledge!';
    } else if (percentage >= 60) {
        message = 'Good Job! 👍';
        resultDetails.textContent = 'You know your HTML basics well!';
    } else if (percentage >= 40) {
        message = 'Not Bad! 📚';
        resultDetails.textContent = 'Keep practicing to improve!';
    } else {
        message = 'Keep Learning! 💪';
        resultDetails.textContent = 'Review the basics and try again!';
    }

    resultMessage.textContent = message;
}

function goHome() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}