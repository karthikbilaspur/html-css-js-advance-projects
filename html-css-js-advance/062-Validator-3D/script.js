  // State Management
  let currentStep = 1;
  let userPreferences = {
    careAbout: [],
    useCase: '',
    style: 50
  };
  let selectedRating = 0;
  let reviews = [];
  let currentReviewIndex = 0;
  let generatedProduct = {};
  let autoSlideInterval;

  const stepNames = ['Preferences', 'Your Product', 'Your Review', 'Community'];

  // Initialize app
  document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    setupEventListeners();
    initialize3DCard();
    updateStats();
    if (reviews.length === 0) {
      addSampleReviews();
    }
    renderReviewsSlider();
    startAutoSlide();
  });

  function setupEventListeners() {
    // Style slider
    document.getElementById('style-slider').addEventListener('input', (e) => {
      const val = e.target.value;
      userPreferences.style = val;
      const label = val < 30 ? 'Minimal' : val > 70 ? 'Maximal' : 'Balanced';
      document.getElementById('style-value').textContent = label;
    });

    // Star rating
    document.querySelectorAll('.star-input').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        updateStarDisplay();
        validateForm();
      });
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        highlightStars(rating);
      });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', () => {
      updateStarDisplay();
    });

    // Form inputs
    document.getElementById('reviewer-name').addEventListener('input', (e) => {
      document.getElementById('preview-name').textContent = e.target.value || 'Your Name';
      document.getElementById('preview-avatar').textContent = e.target.value ? e.target.value[0].toUpperCase() : '?';
      validateForm();
    });

    document.getElementById('review-text').addEventListener('input', (e) => {
      const len = e.target.value.length;
      document.getElementById('char-count').textContent = len;
      document.getElementById('preview-text').textContent = e.target.value || 'Your review will appear here...';
      validateForm();
    });
  }

  function highlightStars(rating) {
    document.querySelectorAll('.star-input').forEach((star, idx) => {
      if (idx < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  function updateStarDisplay() {
    highlightStars(selectedRating);
    document.getElementById('preview-stars').textContent = '⭐'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);
  }

  function validateStep1() {
    const careAbout = Array.from(document.querySelectorAll('input[name="care-about"]:checked')).map(cb => cb.value);
    const useCase = document.querySelector('input[name="use-case"]:checked')?.value;

    if (careAbout.length === 0) {
      showToast('Hold on!', 'Please select at least one thing you care about', 'error');
      return;
    }

    if (!useCase) {
      showToast('Almost there!', 'Please select your primary use case', 'error');
      return;
    }

    userPreferences.careAbout = careAbout;
    userPreferences.useCase = useCase;
    
    goToStep(2);
    generateProduct();
  }

  function generateProduct() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('product-result').classList.add('hidden');

    setTimeout(() => {
      // Logic to select image based on preferences
      const style = userPreferences.style < 50 ? 'minimal' : 'maximal';
      const useCase = userPreferences.useCase.toLowerCase().replace(' ', '-');
      let imageId = `img-${style}-${useCase}`;
      
      // Fallback if specific image doesn't exist
      let imgElement = document.getElementById(imageId);
      if (!imgElement) {
        imgElement = document.getElementById('img-default');
      }

      const productName = generateProductName();
      const description = generateProductDescription();

      generatedProduct = {
        name: productName,
        image: imgElement.src,
        tags: userPreferences.careAbout,
        useCase: userPreferences.useCase,
        description: description
      };

      // Update UI
      document.getElementById('generated-image').src = generatedProduct.image;
      document.getElementById('product-name').textContent = generatedProduct.name;
      document.getElementById('product-description').textContent = generatedProduct.description;
      
      const tagsContainer = document.getElementById('product-tags');
      tagsContainer.innerHTML = generatedProduct.tags.map(tag => 
        `<span class="glass px-3 py-1 rounded-full text-xs text-indigo-300">${tag}</span>`
      ).join('');

      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('product-result').classList.remove('hidden');

      // Animate product card entrance
      gsap.from('#product-card', {
        opacity: 0,
        scale: 0.9,
        rotationY: -15,
        duration: 0.8,
        ease: 'back.out(1.7)'
      });
    }, 2500);
  }

  function generateProductName() {
    const styles = userPreferences.style < 30 ? ['Minimal', 'Essential', 'Pure'] : 
                   userPreferences.style > 70 ? ['Ultra', 'Pro', 'Max'] : ['Classic', 'Signature', 'Elite'];
    const useCases = {
      'Daily Use': 'Everyday',
      'Gift': 'Gift Edition',
      'Professional': 'Pro Series',
      'Travel': 'Traveler',
      'Collection': 'Collector'
    };
    return `${styles[Math.floor(Math.random() * styles.length)]} ${useCases[userPreferences.useCase]}`;
  }

  function generateProductDescription() {
    const cares = userPreferences.careAbout.join(', ');
    return `Crafted with ${cares.toLowerCase()} in mind, this ${userPreferences.useCase.toLowerCase()} product delivers exceptional quality. Perfect for those who value ${userPreferences.careAbout[0].toLowerCase()} above all.`;
  }

  function initialize3DCard() {
    const card = document.getElementById('product-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  }

  function validateForm() {
    const name = document.getElementById('reviewer-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    
    let isValid = true;

    // Name validation
    if (name.length === 0) {
      document.getElementById('name-error').classList.add('show');
      document.getElementById('reviewer-name').classList.add('input-error');
      isValid = false;
    } else {
      document.getElementById('name-error').classList.remove('show');
      document.getElementById('reviewer-name').classList.remove('input-error');
    }

    // Rating validation
    if (selectedRating === 0) {
      document.getElementById('rating-error').classList.add('show');
      isValid = false;
    } else {
      document.getElementById('rating-error').classList.remove('show');
    }

    // Text validation
    if (text.length < 20) {
      document.getElementById('text-error').classList.add('show');
      document.getElementById('review-text').classList.add('input-error');
      isValid = false;
    } else {
      document.getElementById('text-error').classList.remove('show');
      document.getElementById('review-text').classList.remove('input-error');
    }

    document.getElementById('submit-btn').disabled = !isValid;
    return isValid;
  }

  function submitReview() {
    if (!validateForm()) return;

    const review = {
      id: Date.now(),
      name: document.getElementById('reviewer-name').value.trim(),
      rating: selectedRating,
      text: document.getElementById('review-text').value.trim(),
      product: generatedProduct,
      timestamp: new Date().toISOString()
    };

    reviews.unshift(review);
    saveReviews();
    updateStats();
    renderReviewsSlider();
    
    showToast('Success!', 'Your review has been published', 'success');
    
    setTimeout(() => {
      goToStep(4);
      currentReviewIndex = 0;
      updateSlider();
    }, 500);
  }

  function goToStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    
    currentStep = step;
    document.getElementById('current-step').textContent = step;
    document.getElementById('step-name').textContent = stepNames[step - 1];
    document.getElementById('progress-fill').style.width = `${step * 25}%`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetToStart() {
    // Reset form
    document.getElementById('reviewer-name').value = '';
    document.getElementById('review-text').value = '';
    document.getElementById('char-count').textContent = '0';
    selectedRating = 0;
    updateStarDisplay();
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false);
    document.getElementById('style-slider').value = 50;
    document.getElementById('style-value').textContent = 'Balanced';
    document.getElementById('preview-name').textContent = 'Your Name';
    document.getElementById('preview-avatar').textContent = '?';
    document.getElementById('preview-text').textContent = 'Your review will appear here...';
    document.getElementById('preview-stars').textContent = '☆☆☆☆☆';
    
    userPreferences = { careAbout: [], useCase: '', style: 50 };
    
    goToStep(1);
  }

  function renderReviewsSlider() {
    const slider = document.getElementById('review-slider');
    const dots = document.getElementById('slider-dots');
    
    slider.innerHTML = reviews.map(review => `
      <div class="min-w-full px-2">
        <div class="glass rounded-xl p-6">
          <div class="flex items-start gap-4 mb-4">
            <img src="${review.product.image}" alt="${review.product.name}" class="w-16 h-16 rounded-xl object-cover">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-semibold text-sm">
                  ${review.name[0].toUpperCase()}
                </div>
                <div>
                  <div class="font-semibold text-sm">${review.name}</div>
                  <div class="text-xs text-yellow-400">${'⭐'.repeat(review.rating)}</div>
                </div>
              </div>
              <div class="text-xs text-slate-400 mb-2">${review.product.name}</div>
            </div>
          <p class="text-sm text-slate-300 leading-relaxed mb-3">${review.text}</p>
          <div class="flex flex-wrap gap-1.5">
            ${review.product.tags.map(tag => 
              `<span class="glass px-2 py-0.5 rounded-full text-xs text-indigo-300">${tag}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `).join('');

    dots.innerHTML = reviews.map((_, idx) => `
      <button onclick="goToReview(${idx})" class="w-2 h-2 rounded-full transition-all ${idx === currentReviewIndex ? 'bg-indigo-500 w-6' : 'bg-slate-600'}"></button>
    `).join('');
  }

  function updateSlider() {
    const slider = document.getElementById('review-slider');
    slider.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
    
    document.querySelectorAll('#slider-dots button').forEach((dot, idx) => {
      if (idx === currentReviewIndex) {
        dot.classList.add('bg-indigo-500', 'w-6');
        dot.classList.remove('bg-slate-600');
      } else {
        dot.classList.remove('bg-indigo-500', 'w-6');
        dot.classList.add('bg-slate-600');
      }
    });
  }

  function nextReview() {
    currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
    updateSlider();
  }

  function prevReview() {
    currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
    updateSlider();
  }

  function goToReview(index) {
    currentReviewIndex = index;
    updateSlider();
  }

  function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      if (reviews.length > 1 && currentStep === 4) {
        nextReview();
      }
    }, 5000);
  }

  function updateStats() {
    document.getElementById('total-reviews').textContent = reviews.length;
    
    if (reviews.length > 0) {
      const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
      document.getElementById('avg-rating').textContent = `${avgRating}★`;
      
      // Calculate top tag
      const tagCounts = {};
      reviews.forEach(r => {
        r.product.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const topTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b, 'Design');
      document.getElementById('top-tag').textContent = topTag;
    }
  }

  function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const titleEl = document.getElementById('toast-title');
    const messageEl = document.getElementById('toast-message');
    
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function saveReviews() {
    localStorage.setItem('userReviews', JSON.stringify(reviews));
  }

  function loadReviews() {
    const stored = localStorage.getItem('userReviews');
    if (stored) {
      reviews = JSON.parse(stored);
    }
  }

  function addSampleReviews() {
    reviews = [
      {
        id: 1,
        name: 'Sarah Chen',
        rating: 5,
        text: 'Absolutely love this! The design is so sleek and minimal, perfect for my daily workflow. The attention to detail in sustainability really shows.',
        product: {
          name: 'Essential Everyday',
          image: document.getElementById('img-minimal-daily').src,
          tags: ['Design', 'Sustainability', 'Daily Use'],
          useCase: 'Daily Use'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Marcus Johnson',
        rating: 4,
        text: 'Great performance and build quality. Using this professionally has elevated my entire setup. Worth every penny for the durability.',
        product: {
          name: 'Pro Series',
          image: document.getElementById('img-maximal-professional').src,
          tags: ['Performance', 'Durability', 'Professional'],
          useCase: 'Professional'
        },
        timestamp: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Emma Rodriguez',
        rating: 5,
        text: 'Bought this as a gift and they absolutely loved it! The brand story and maximal design aesthetic made it perfect. So happy with this choice.',
        product: {
          name: 'Ultra Gift Edition',
          image: document.getElementById('img-maximal-gift').src,
          tags: ['Brand Story', 'Design', 'Gift'],
          useCase: 'Gift'
        },
        timestamp: new Date().toISOString()
      }
    ];
    saveReviews();
  }
