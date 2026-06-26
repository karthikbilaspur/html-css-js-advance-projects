        // Product Data
        const products = [
            {
                name: "Aurora Pro Headphones",
                desc: "Wireless noise-cancelling headphones with 40hr battery life",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                rating: 5,
                testimonials: [
                    { name: "Sarah M.", text: "Best sound quality I've ever experienced. Battery lasts forever!" },
                    { name: "James K.", text: "Noise cancellation is incredible. Worth every penny." },
                    { name: "Lisa T.", text: "Comfortable for all-day wear. My new daily driver." }
                ]
            },
            {
                name: "CloudWalk Sneakers",
                desc: "Ultra-lightweight running shoes with responsive cushioning",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
                rating: 4,
                testimonials: [
                    { name: "Mike R.", text: "Super comfortable but took a week to break in properly." },
                    { name: "Emma S.", text: "Great for running, but sizing runs a bit small." },
                    { name: "David L.", text: "Love the design and comfort. Good value." }
                ]
            },
            {
                name: "Glow Serum Pro",
                desc: "Vitamin C skincare serum for radiant, even-toned skin",
                image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
                rating: 5,
                testimonials: [
                    { name: "Ashley W.", text: "My skin has never looked better. Holy grail product!" },
                    { name: "Rachel B.", text: "Saw results in 2 weeks. Texture is amazing." },
                    { name: "Nina P.", text: "A bit pricey but worth it. Repurchasing for sure." }
                ]
            },
            {
                name: "Barista Brew Coffee Maker",
                desc: "Smart programmable coffee maker with thermal carafe",
                image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
                rating: 3,
                testimonials: [
                    { name: "Tom H.", text: "Makes good coffee but the app is buggy sometimes." },
                    { name: "Karen D.", text: "Decent machine. Wish the carafe kept coffee hotter." },
                    { name: "Steve M.", text: "Works fine, but overpriced for basic features." }
                ]
            },
            {
                name: "Zen Mat Yoga Pro",
                desc: "Eco-friendly non-slip yoga mat with alignment guides",
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
                rating: 4,
                testimonials: [
                    { name: "Yuki N.", text: "Great grip and cushioning. Love the eco materials." },
                    { name: "Carlos V.", text: "Alignment lines are super helpful for beginners." },
                    { name: "Maya J.", text: "A bit thin for my knees, but overall solid mat." }
                ]
            },
            {
                name: "PowerBank Ultra 20K",
                desc: "Fast-charging portable power bank with dual USB-C ports",
                image: "https://images.unsplash.com/photo-1609092626048-4b5e1b04e5e1?w=800&q=80",
                rating: 5,
                testimonials: [
                    { name: "Alex P.", text: "Charges my phone 4x on one charge. Absolute lifesaver!" },
                    { name: "Jordan C.", text: "Fast charging actually works. Compact for the capacity." },
                    { name: "Taylor R.", text: "Best power bank I've owned. No complaints." }
                ]
            },
            {
                name: "AeroDesk Standing Desk",
                desc: "Electric height-adjustable desk with memory presets",
                image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
                rating: 4,
                testimonials: [
                    { name: "Brian K.", text: "Smooth and quiet motor. Great build quality." },
                    { name: "Sofia L.", text: "Assembly took 2 hours but works perfectly now." },
                    { name: "Chris W.", text: "Love standing while working. Sturdy at max height." }
                ]
            },
            {
                name: "ChefKnives Master Set",
                desc: "Professional 5-piece kitchen knife set with wooden block",
                image: "https://images.unsplash.com/photo-1584990347449-a2f6d02f84f6?w=800&q=80",
                rating: 3,
                testimonials: [
                    { name: "Marco I.", text: "Sharp out of the box but need frequent honing." },
                    { name: "Jenny F.", text: "Good beginner set but not pro quality." },
                    { name: "Peter G.", text: "Handles feel cheap for the price point." }
                ]
            },
            {
                name: "SleepWell Weighted Blanket",
                desc: "15lb cooling weighted blanket for anxiety relief",
                image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80",
                rating: 5,
                testimonials: [
                    { name: "Olivia H.", text: "Changed my sleep completely. No more tossing!" },
                    { name: "Daniel Z.", text: "Cooling fabric works great. Not too hot." },
                    { name: "Grace Y.", text: "Helps with my anxiety. Best purchase this year." }
                ]
            },
            {
                name: "FitTrack Smartwatch",
                desc: "Fitness tracker with heart rate, GPS, and 7-day battery",
                image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
                rating: 4,
                testimonials: [
                    { name: "Ryan O.", text: "Accurate tracking and great battery life." },
                    { name: "Amber U.", text: "GPS takes a minute to lock but works well." },
                    { name: "Lucas Q.", text: "Solid watch for the price. Disappointed with sleep tracking." }
                ]
            }
        ];

        // Game State
        let currentRound = 0;
        let score = 0;
        let selectedRating = 0;
        let gameHistory = [];
        let shuffledProducts = [];
        let chartInstance = null;

        // DOM Elements
        const productCard3D = document.getElementById('productCard3D');
        const productImage = document.getElementById('productImage');
        const productName = document.getElementById('productName');
        const productDesc = document.getElementById('productDesc');
        const testimonialsContainer = document.getElementById('testimonialsContainer');
        const starSelector = document.getElementById('starSelector');
        const submitGuess = document.getElementById('submitGuess');
        const questionPhase = document.getElementById('questionPhase');
        const resultPhase = document.getElementById('resultPhase');
        const resultMessage = document.getElementById('resultMessage');
        const actualRatingStars = document.getElementById('actualRatingStars');
        const actualRatingText = document.getElementById('actualRatingText');
        const nextRound = document.getElementById('nextRound');
        const roundCounter = document.getElementById('roundCounter');
        const scoreCounter = document.getElementById('scoreCounter');
        const gameArea = document.getElementById('gameArea');
        const dashboardArea = document.getElementById('dashboardArea');
        const playAgain = document.getElementById('playAgain');

        // 3D Card Tilt Effect
        productCard3D.addEventListener('mousemove', (e) => {
            const rect = productCard3D.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            productCard3D.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        productCard3D.addEventListener('mouseleave', () => {
            productCard3D.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });

        // Shuffle array
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        // Initialize Game
        function initGame() {
            currentRound = 0;
            score = 0;
            gameHistory = [];
            shuffledProducts = shuffleArray(products);
            loadRound();
            gameArea.classList.remove('hidden');
            dashboardArea.classList.add('hidden');
        }

        // Load Round
        function loadRound() {
            if (currentRound >= shuffledProducts.length) {
                showDashboard();
                return;
            }

            const product = shuffledProducts[currentRound];
            selectedRating = 0;
            
            // Update UI
            productImage.src = product.image;
            productName.textContent = product.name;
            productDesc.textContent = product.desc;
            roundCounter.textContent = `${currentRound + 1}/${shuffledProducts.length}`;
            scoreCounter.textContent = score;
            
            // Load testimonials
            testimonialsContainer.innerHTML = '';
            product.testimonials.forEach((testimonial, idx) => {
                const card = document.createElement('div');
                card.className = 'testimonial-card glass rounded-xl p-4 animate-slide-in';
                card.style.animationDelay = `${idx * 0.1}s`;
                card.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            ${testimonial.name.charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <p class="font-semibold text-sm">${testimonial.name}</p>
                                <div class="text-yellow-400 text-sm">★★★★★ <span class="text-gray-500">???</span></div>
                            </div>
                            <p class="text-gray-300 text-sm leading-relaxed">${testimonial.text}</p>
                        </div>
                    </div>
                `;
                testimonialsContainer.appendChild(card);
            });

            // Reset star selector
            resetStarSelector();
            questionPhase.classList.remove('hidden');
            resultPhase.classList.add('hidden');
            submitGuess.disabled = true;
        }

        // Reset Star Selector
        function resetStarSelector() {
            const stars = starSelector.querySelectorAll('.star-btn');
            stars.forEach((star, idx) => {
                star.classList.remove('selected', 'text-yellow-400');
                star.classList.add('text-gray-600');
            });
        }

        // Star Selection
        starSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('star-btn')) {
                selectedRating = parseInt(e.target.dataset.rating);
                updateStarDisplay(selectedRating);
                submitGuess.disabled = false;
            }
        });

        function updateStarDisplay(rating) {
            const stars = starSelector.querySelectorAll('.star-btn');
            stars.forEach((star, idx) => {
                if (idx < rating) {
                    star.classList.add('selected', 'text-yellow-400');
                    star.classList.remove('text-gray-600');
                } else {
                    star.classList.remove('selected', 'text-yellow-400');
                    star.classList.add('text-gray-600');
                }
            });
        }

        // Submit Guess
        submitGuess.addEventListener('click', () => {
            const product = shuffledProducts[currentRound];
            const isCorrect = selectedRating === product.rating;
            
            if (isCorrect) {
                score++;
            }

            gameHistory.push({
                product: product.name,
                guessed: selectedRating,
                actual: product.rating,
                correct: isCorrect
            });

            // Show result
            questionPhase.classList.add('hidden');
            resultPhase.classList.remove('hidden');

            const diff = Math.abs(selectedRating - product.rating);
            if (isCorrect) {
                resultMessage.innerHTML = `
                    <div class="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-full px-6 py-3">
                        <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-lg font-bold text-green-400">Perfect! You nailed it!</span>
                    </div>
                `;
            } else {
                resultMessage.innerHTML = `
                    <div class="inline-flex items-center gap-3 bg-orange-500/20 border border-orange-500/50 rounded-full px-6 py-3">
                        <svg class="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-lg font-bold text-orange-400">Off by ${diff} star${diff > 1 ? 's' : ''}</span>
                    </div>
                `;
            }

            // Animate actual rating reveal
            actualRatingStars.innerHTML = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
            actualRatingStars.className = 'text-4xl sm:text-5xl mb-2 text-yellow-400 animate-reveal';
            actualRatingText.textContent = `${product.rating}.0 / 5.0`;

            scoreCounter.textContent = score;
        });

        // Next Round
        nextRound.addEventListener('click', () => {
            currentRound++;
            loadRound();
        });

        // Show Dashboard
        function showDashboard() {
            gameArea.classList.add('hidden');
            dashboardArea.classList.remove('hidden');

            const accuracy = Math.round((score / shuffledProducts.length) * 100);
            document.getElementById('accuracyPercent').textContent = `${accuracy}%`;
            document.getElementById('correctGuesses').textContent = score;
            document.getElementById('totalRounds').textContent = shuffledProducts.length;

            // Create comparison chart
            const ctx = document.getElementById('comparisonChart');
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: gameHistory.map((h, i) => `Round ${i + 1}`),
                    datasets: [
                        {
                            label: 'Your Guess',
                            data: gameHistory.map(h => h.guessed),
                            backgroundColor: 'rgba(99, 102, 241, 0.6)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 2,
                            borderRadius: 8
                        },
                        {
                            label: 'Actual Rating',
                            data: gameHistory.map(h => h.actual),
                            backgroundColor: 'rgba(168, 85, 247, 0.6)',
                            borderColor: 'rgba(168, 85, 247, 1)',
                            borderWidth: 2,
                            borderRadius: 8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1,
                                color: 'rgba(255, 255, 255, 0.6)'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.6)'
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 15, 26, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            borderWidth: 1
                        }
                    }
                }
            });

            // Breakdown
            const breakdown = document.getElementById('roundsBreakdown');
            breakdown.innerHTML = '';
            gameHistory.forEach((round, idx) => {
                const item = document.createElement('div');
                item.className = 'glass rounded-xl p-4 sm:p-5';
                item.innerHTML = `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="flex-1">
                            <p class="font-semibold mb-1">${round.product}</p>
                            <div class="flex items-center gap-4 text-sm text-gray-400">
                                <span>Your guess: <span class="text-yellow-400">${'★'.repeat(round.guessed)}</span></span>
                                <span>Actual: <span class="text-yellow-400">${'★'.repeat(round.actual)}</span></span>
                            </div>
                        </div>
                        <div class="flex-shrink-0">
                            ${round.correct 
                                ? '<span class="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Correct</span>'
                                : '<span class="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>Missed</span>'
                            }
                        </div>
                    </div>
                `;
                breakdown.appendChild(item);
            });
        }

        // Play Again
        playAgain.addEventListener('click', initGame);

        // Start Game
        initGame();