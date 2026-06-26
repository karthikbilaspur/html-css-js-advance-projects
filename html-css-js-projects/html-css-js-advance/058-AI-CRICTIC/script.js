    const artworks = [
        {
            url: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&q=80',
            title: 'Starry Night',
            type: 'human',
            artist: 'Vincent van Gogh, 1889'
        },
        {
            url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
            title: 'The Persistence of Memory',
            type: 'human', 
            artist: 'Salvador Dalí, 1931'
        },
        {
            url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
            title: 'Synthwave Dreams',
            type: 'ai',
            artist: 'Midjourney v5, 2024'
        },
        {
            url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
            title: 'Water Lilies',
            type: 'human',
            artist: 'Claude Monet, 1919'
        },
        {
            url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
            title: 'Cosmic Cathedral',
            type: 'ai',
            artist: 'DALL-E 3, 2024'
        },
        {
            url: 'https://images.unsplash.com/photo-1531913764164-f637e75ab054?w=800&q=80',
            title: 'Girl with a Pearl Earring',
            type: 'human',
            artist: 'Johannes Vermeer, 1665'
        },
        {
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            title: 'Quantum Fractals',
            type: 'ai',
            artist: 'Stable Diffusion XL, 2024'
        },
        {
            url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&q=80',
            title: 'The Scream',
            type: 'human',
            artist: 'Edvard Munch, 1893'
        },
        {
            url: 'https://images.unsplash.com/photo-1614849286521-4c58b2f0f365?w=800&q=80',
            title: 'Neon Utopia',
            type: 'ai',
            artist: 'Midjourney v6, 2024'
        },
        {
            url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
            title: 'Composition VIII',
            type: 'human',
            artist: 'Wassily Kandinsky, 1923'
        }
    ];

    let gameState = {
        currentRound: 0,
        score: 0,
        guesses: [],
        ratings: [],
        currentGuess: null,
        currentRating: 0,
        shuffledArtworks: [],
        answered: false
    };

    const artworkImg = document.getElementById('artworkImg');
    const artworkTitle = document.getElementById('artworkTitle');
    const btnAI = document.getElementById('btnAI');
    const btnHuman = document.getElementById('btnHuman');
    const ratingSection = document.getElementById('ratingSection');
    const stars = document.querySelectorAll('.star');
    const btnNext = document.getElementById('btnNext');
    const feedback = document.getElementById('feedback');
    const progressFill = document.getElementById('progressFill');
    const roundStat = document.getElementById('roundStat');
    const scoreStat = document.getElementById('scoreStat');
    const accuracyStat = document.getElementById('accuracyStat');
    const gameScreen = document.getElementById('gameScreen');
    const resultsScreen = document.getElementById('resultsScreen');

    function initGame() {
        gameState.shuffledArtworks = [...artworks].sort(() => Math.random() - 0.5);
        gameState.currentRound = 0;
        gameState.score = 0;
        gameState.guesses = [];
        gameState.ratings = [];
        loadRound();
    }

    function loadRound() {
        if (gameState.currentRound >= 10) {
            showResults();
            return;
        }

        const artwork = gameState.shuffledArtworks[gameState.currentRound];
        gameState.answered = false;
        gameState.currentGuess = null;
        gameState.currentRating = 0;

        artworkImg.src = artwork.url;
        artworkTitle.textContent = artwork.title;
        
        btnAI.disabled = false;
        btnHuman.disabled = false;
        btnAI.style.opacity = '1';
        btnHuman.style.opacity = '1';
        ratingSection.classList.remove('active');
        btnNext.style.display = 'none';
        feedback.classList.remove('show');
        
        stars.forEach(star => star.classList.remove('active'));
        
        updateStats();
    }

    function makeGuess(guess) {
        if (gameState.answered) return;
        
        gameState.currentGuess = guess;
        gameState.answered = true;
        
        const artwork = gameState.shuffledArtworks[gameState.currentRound];
        const correct = guess === artwork.type;
        
        if (correct) {
            gameState.score++;
            feedback.textContent = `✓ Correct! This is ${artwork.type === 'ai' ? 'AI-generated' : 'human-made'} art`;
            feedback.className = 'feedback correct show';
        } else {
            feedback.textContent = `✗ Wrong! This is actually ${artwork.type === 'ai' ? 'AI-generated' : 'human-made'}`;
            feedback.className = 'feedback incorrect show';
        }
        
        gameState.guesses.push({
            correct,
            artwork: artwork
        });
        
        btnAI.disabled = true;
        btnHuman.disabled = true;
        ratingSection.classList.add('active');
        
        if (guess === 'ai') {
            btnHuman.style.opacity = '0.3';
        } else {
            btnAI.style.opacity = '0.3';
        }
        
        updateStats();
    }

    function setRating(rating) {
        if (!gameState.answered) return;
        
        gameState.currentRating = rating;
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        btnNext.style.display = 'block';
    }

    function nextRound() {
        if (gameState.currentRating === 0) return;
        
        gameState.ratings.push({
            rating: gameState.currentRating,
            artwork: gameState.shuffledArtworks[gameState.currentRound]
        });
        
        gameState.currentRound++;
        loadRound();
    }

    function updateStats() {
        const round = Math.min(gameState.currentRound + 1, 10);
        roundStat.textContent = `${round}/10`;
        scoreStat.textContent = gameState.score;
        
        if (gameState.guesses.length > 0) {
            const accuracy = Math.round((gameState.score / gameState.guesses.length) * 100);
            accuracyStat.textContent = `${accuracy}%`;
        }
        
        progressFill.style.width = `${(round / 10) * 100}%`;
    }

    function showResults() {
        gameScreen.style.display = 'none';
        resultsScreen.classList.add('show');
        
        const accuracy = Math.round((gameState.score / 10) * 100);
        const avgRating = (gameState.ratings.reduce((sum, r) => sum + r.rating, 0) / gameState.ratings.length).toFixed(1);
        
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('correctCount').textContent = `${gameState.score}/10`;
        document.getElementById('accuracyPercent').textContent = `${accuracy}%`;
        document.getElementById('avgRating').textContent = avgRating;
        
        let rankTitle, rankDesc;
        if (gameState.score >= 9) {
            rankTitle = 'Master Art Connoisseur';
            rankDesc = 'Incredible! You have an exceptional eye for distinguishing AI from human art.';
        } else if (gameState.score >= 7) {
            rankTitle = 'Gallery Expert';
            rankDesc = 'Impressive! You can spot the nuances between artificial and authentic.';
        } else if (gameState.score >= 5) {
            rankTitle = 'Art Enthusiast';
            rankDesc = 'Good job! You have a solid understanding of artistic styles.';
        } else {
            rankTitle = 'Novice Observer';
            rankDesc = 'Keep practicing to hone your eye for artistic details!';
        }
        
        document.getElementById('rankTitle').textContent = rankTitle;
        document.getElementById('rankDesc').textContent = rankDesc;
        
        const scoreCircle = document.getElementById('scoreCircle');
        const degrees = (gameState.score / 10) * 360;
        scoreCircle.style.background = `conic-gradient(var(--accent) 0deg, var(--accent) ${degrees}deg, rgba(255,255,255,0.1) ${degrees}deg)`;
        
        generateTopPicks();
    }

    function generateTopPicks() {
        const slider = document.getElementById('slider');
        const sliderNav = document.getElementById('sliderNav');
        
        const sortedRatings = [...gameState.ratings]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, Math.min(5, gameState.ratings.length))
            .filter(r => r.rating >= 3);
        
        if (sortedRatings.length === 0) {
            slider.innerHTML = '<div class="slide"><p style="text-align: center; padding: 40px; color: var(--text-secondary);">No highly rated artworks yet!</p></div>';
            return;
        }
        
        slider.innerHTML = sortedRatings.map(item => `
            <div class="slide">
                <img src="${item.artwork.url}" alt="${item.artwork.title}">
                <div class="slide-rating">${'⭐'.repeat(item.rating)}</div>
                <div style="text-align: center; font-weight: 600;">${item.artwork.title}</div>
                <div style="text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${item.artwork.artist}</div>
            </div>
        `).join('');
        
        sliderNav.innerHTML = sortedRatings.map((_, i) => 
            `<div class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
        
        let currentSlide = 0;
        const dots = sliderNav.querySelectorAll('.slider-dot');
        
        const updateSlider = (index) => {
            currentSlide = index;
            slider.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };
        
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => updateSlider(i));
        });
        
        setInterval(() => {
            currentSlide = (currentSlide + 1) % sortedRatings.length;
            updateSlider(currentSlide);
        }, 4000);
    }

    btnAI.addEventListener('click', () => makeGuess('ai'));
    btnHuman.addEventListener('click', () => makeGuess('human'));
    
    stars.forEach(star => {
        star.addEventListener('click', () => setRating(parseInt(star.dataset.rating)));
    });
    
    btnNext.addEventListener('click', nextRound);
    
    document.getElementById('btnRestart').addEventListener('click', () => {
        resultsScreen.classList.remove('show');
        gameScreen.style.display = 'block';
        initGame();
    });
    
    document.getElementById('btnShare').addEventListener('click', () => {
        const accuracy = Math.round((gameState.score / 10) * 100);
        const text = `I scored ${gameState.score}/10 (${accuracy}%) on the AI Art Critic Quiz! 🎨 Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'AI Art Critic Quiz',
                text: text
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Results copied to clipboard!');
            });
        }
    });

    