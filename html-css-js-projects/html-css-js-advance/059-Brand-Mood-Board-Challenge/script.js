    const quizData = [
        {
            id: 'energy',
            question: "What's your brand energy?",
            options: [
                { text: "Bold & Disruptive", value: "bold", imgId: "img-bold", tags: ["bold", "disruptive", "confident"] },
                { text: "Calm & Minimal", value: "calm", imgId: "img-calm", tags: ["calm", "minimal", "clean"] },
                { text: "Playful & Quirky", value: "playful", imgId: "img-playful", tags: ["playful", "quirky", "fun"] },
                { text: "Luxury & Elegant", value: "luxury", imgId: "img-luxury", tags: ["luxury", "elegant", "premium"] },
                { text: "Earthy & Organic", value: "earthy", imgId: "img-earthy", tags: ["earthy", "organic", "natural"] }
            ]
        },
        {
            id: 'color',
            question: "Color preference?",
            options: [
                { text: "Neon Pop", value: "neon", imgId: "img-neon", tags: ["vibrant", "energetic"] },
                { text: "Monochrome", value: "mono", imgId: "img-mono", tags: ["minimal", "timeless"] },
                { text: "Pastel Dream", value: "pastel", imgId: "img-pastel", tags: ["soft", "dreamy"] },
                { text: "Jewel Tones", value: "jewel", imgId: "img-jewel", tags: ["rich", "luxury"] },
                { text: "Natural Neutrals", value: "natural", imgId: "img-natural", tags: ["organic", "grounded"] }
            ]
        },
        {
            id: 'typography',
            question: "Typography feel?",
            options: [
                { text: "Sharp & Modern", value: "sharp", imgId: "img-sharp", tags: ["modern", "clean"] },
                { text: "Soft & Rounded", value: "soft", imgId: "img-soft", tags: ["friendly", "approachable"] },
                { text: "Handwritten", value: "hand", imgId: "img-hand", tags: ["personal", "authentic"] },
                { text: "Classic Serif", value: "serif", imgId: "img-serif", tags: ["traditional", "elegant"] },
                { text: "Tech Mono", value: "tech", imgId: "img-tech", tags: ["tech", "innovative"] }
            ]
        },
        {
            id: 'audience',
            question: "Audience vibe?",
            options: [
                { text: "Gen Z Rebels", value: "genz", imgId: "img-genz", tags: ["youth", "trendy"] },
                { text: "Mindful Millennials", value: "millennial", imgId: "img-millennial", tags: ["conscious", "mindful"] },
                { text: "Luxury Buyers", value: "luxbuyer", imgId: "img-luxbuyer", tags: ["premium", "exclusive"] },
                { text: "Creative Pros", value: "creative", imgId: "img-creative", tags: ["creative", "professional"] },
                { text: "Everyday People", value: "everyday", imgId: "img-everyday", tags: ["accessible", "relatable"] }
            ]
        },
        {
            id: 'emotion',
            question: "Brand emotion?",
            options: [
                { text: "Energizing", value: "energy", imgId: "img-energy", tags: ["dynamic", "powerful"] },
                { text: "Peaceful", value: "peaceful", imgId: "img-peaceful", tags: ["serene", "calm"] },
                { text: "Joyful", value: "joyful", imgId: "img-joyful", tags: ["happy", "uplifting"] },
                { text: "Prestigious", value: "prestige", imgId: "img-prestige", tags: ["exclusive", "sophisticated"] },
                { text: "Grounded", value: "grounded", imgId: "img-grounded", tags: ["stable", "authentic"] }
            ]
        }
    ];

    let currentQuestion = 0;
    let answers = [];
    let ratings = {};

    function init() {
        renderQuestion();
        updateProgress();
        setupEventListeners();
    }

    function renderQuestion() {
        const q = quizData[currentQuestion];
        document.getElementById('question-title').textContent = q.question;
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        
        q.options.forEach((option, idx) => {
            const card = document.createElement('div');
            card.className = 'option-card glass glass-hover rounded-2xl p-6 text-center fade-in';
            card.style.animationDelay = `${idx * 0.1}s`;
            card.innerHTML = `
                <div class="text-lg font-semibold mb-2">${option.text}</div>
                <div class="text-sm text-white/60">${option.tags.join(' • ')}</div>
            `;
            card.onclick = () => selectOption(option, card);
            container.appendChild(card);
        });
    }

    function selectOption(option, cardElement) {
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        
        setTimeout(() => {
            answers[currentQuestion] = { ...option, questionId: quizData[currentQuestion].id };
            addToMoodBoard(option);
            
            if (currentQuestion < quizData.length - 1) {
                currentQuestion++;
                updateProgress();
                renderQuestion();
            } else {
                showResults();
            }
        }, 400);
    }

    function addToMoodBoard(option) {
        const preview = document.getElementById('mood-board-preview');
        const slot = preview.children[currentQuestion];
        const img = document.getElementById(option.imgId);
        
        slot.innerHTML = '';
        slot.className = 'mood-image aspect-[4/3] rounded-xl overflow-hidden';
        slot.style.animationDelay = '0s';
        
        const newImg = document.createElement('img');
        newImg.src = img.src;
        newImg.alt = option.text;
        newImg.className = 'w-full h-full object-cover';
        slot.appendChild(newImg);
    }

    function updateProgress() {
        const percent = ((currentQuestion + 1) / quizData.length) * 100;
        document.getElementById('progress-bar').style.width = `${percent}%`;
        document.getElementById('progress-text').textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
    }

    function showResults() {
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('results-section').classList.add('slide-up');
        
        renderFinalMoodBoard();
        setupComparison();
        calculateBrandDNA();
    }

    function renderFinalMoodBoard() {
        const container = document.getElementById('final-mood-board');
        container.innerHTML = '';
        
        answers.forEach((answer, idx) => {
            const img = document.getElementById(answer.imgId);
            const card = document.createElement('div');
            card.className = 'glass rounded-2xl overflow-hidden';
            card.innerHTML = `
                <div class="aspect-[4/3] relative">
                    <img src="${img.src}" alt="${answer.text}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <div class="font-semibold text-sm mb-2">${answer.text}</div>
                        <div class="flex gap-1" data-img-id="${answer.imgId}">
                            ${[1,2,3,4,5].map(i => `
                                <svg class="star w-5 h-5 text-white/40" data-rating="${i}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        
        // Add star rating listeners
        document.querySelectorAll('.star').forEach(star => {
            star.onclick = (e) => rateImage(e.target.closest('.flex'), parseInt(e.target.dataset.rating));
        });
    }

    function rateImage(container, rating) {
        const imgId = container.dataset.imgId;
        ratings[imgId] = rating;
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, idx) => {
            if (idx < rating) {
                star.classList.add('filled');
                star.setAttribute('fill', 'currentColor');
            } else {
                star.classList.remove('filled');
                star.setAttribute('fill', 'none');
            }
        });
    }

    function setupComparison() {
        const select1 = document.getElementById('compare-1');
        const select2 = document.getElementById('compare-2');
        
        answers.forEach(answer => {
            [select1, select2].forEach(select => {
                const option = document.createElement('option');
                option.value = answer.imgId;
                option.textContent = answer.text;
                select.appendChild(option);
            });
        });
        
        [select1, select2].forEach(select => {
            select.onchange = updateComparison;
        });
    }

    function updateComparison() {
        const id1 = document.getElementById('compare-1').value;
        const id2 = document.getElementById('compare-2').value;
        
        if (id1 && id2 && id1 !== id2) {
            document.getElementById('comparison-container').classList.remove('hidden');
            document.getElementById('comp-img-1').src = document.getElementById(id1).src;
            document.getElementById('comp-img-2').src = document.getElementById(id2).src;
            setupSlider();
        }
    }

    function setupSlider() {
        const slider = document.getElementById('comparison-slider');
        const handle = document.getElementById('slider-handle');
        const wrapper = document.getElementById('comp-img-2-wrapper');
        let isDragging = false;
        
        const moveSlider = (x) => {
            const rect = slider.getBoundingClientRect();
            let pos = (x - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            handle.style.left = `${pos * 100}%`;
            wrapper.style.width = `${pos * 100}%`;
        };
        
        handle.onmousedown = () => isDragging = true;
        document.onmouseup = () => isDragging = false;
        document.onmousemove = (e) => isDragging && moveSlider(e.clientX);
        
        handle.ontouchstart = () => isDragging = true;
        document.ontouchend = () => isDragging = false;
        document.ontouchmove = (e) => isDragging && moveSlider(e.touches[0].clientX);
    }

    function calculateBrandDNA() {
        const tagCount = {};
        answers.forEach(answer => {
            answer.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        
        const total = answers.length * 3;
        const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
        
        const dnaContainer = document.getElementById('dna-stats');
        dnaContainer.innerHTML = '';
        
        sorted.forEach(([tag, count]) => {
            const percent = Math.round((count / total) * 100 * 3);
            const bar = document.createElement('div');
            bar.innerHTML = `
                <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium capitalize">${tag}</span>
                    <span class="text-white/70">${percent}%</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
            `;
            dnaContainer.appendChild(bar);
            setTimeout(() => {
                bar.querySelector('.h-full').style.width = `${percent}%`;
            }, 100);
        });
        
        document.getElementById('brand-name').oninput = (e) => {
            const name = e.target.value || 'Your';
            document.getElementById('dna-title').textContent = `${name}'s Brand DNA`;
        };
    }

    function setupEventListeners() {
        document.getElementById('restart-btn').onclick = () => {
            currentQuestion = 0;
            answers = [];
            ratings = {};
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('quiz-section').classList.remove('hidden');
            document.getElementById('mood-board-preview').innerHTML = `
                <div class="aspect-[4/3] rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
            `;
            updateProgress();
            renderQuestion();
        };
        
        document.getElementById('share-btn').onclick = generateCollage;
        document.getElementById('close-modal').onclick = () => {
            document.getElementById('share-modal').classList.add('hidden');
        };
    }

    function generateCollage() {
        const modal = document.getElementById('share-modal');
        const container = document.getElementById('collage-container');
        const brandName = document.getElementById('brand-name').value || 'My Brand';
        
        container.innerHTML = `
            <div id="collage-content" class="bg-gradient-to-br from-purple-900 via-purple-700 to-pink-700 p-8 rounded-xl">
                <h2 class="text-3xl font-bold text-white mb-2 text-center">${brandName} Mood Board</h2>
                <p class="text-white/80 text-center mb-6 text-sm">Created with Brand Mood Board Challenge</p>
                <div class="grid grid-cols-5 gap-2 mb-6">
                    ${answers.map(answer => {
                        const img = document.getElementById(answer.imgId);
                        return `<img src="${img.src}" alt="${answer.text}" class="w-full aspect-[4/3] object-cover rounded-lg">`;
                    }).join('')}
                </div>
                <div class="text-center text-white/70 text-xs">
                    ${answers.map(a => a.text).join(' • ')}
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('download-btn').onclick = () => {
            const collage = document.getElementById('collage-content');
            html2canvas(collage, { 
                backgroundColor: null,
                scale: 2,
                useCORS: true 
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-mood-board.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        };
    }

    init();