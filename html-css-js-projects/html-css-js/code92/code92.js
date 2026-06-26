// JavaScript for Code 92
class InfiniteScroll {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.sentinel = document.getElementById('sentinel');
        this.endMessage = document.getElementById('end-message');
        this.postCountEl = document.getElementById('post-count');
        this.scrollTopBtn = document.getElementById('scroll-top');
        
        this.page = 0;
        this.loading = false;
        this.hasMore = true;
        this.postsPerPage = 5;
        this.maxPosts = 50;
        this.postIdCounter = 0;
        
        this.mockUsers = [
            {name: 'Alex Chen', avatar: 'AC'},
            {name: 'Sarah Kim', avatar: 'SK'},
            {name: 'Mike Johnson', avatar: 'MJ'},
            {name: 'Emma Davis', avatar: 'ED'},
            {name: 'James Wilson', avatar: 'JW'},
            {name: 'Olivia Brown', avatar: 'OB'},
            {name: 'Liam Taylor', avatar: 'LT'},
            {name: 'Sophia Martinez', avatar: 'SM'}
        ];
        
        this.mockContent = [
            'Just launched my new project! 🚀 So excited to share this with everyone.',
            'Beautiful sunset today. Nature never fails to amaze me. 🌅',
            'Working on something big. Can\'t wait to reveal it soon! 💻',
            'Coffee and code - the perfect combination for a productive day ☕',
            'Weekend vibes! Time to relax and recharge. 😎',
            'Learning new technologies every day. Growth mindset! 📚',
            'Collaboration makes everything better. Shoutout to my amazing team! 👥',
            'Small wins add up to big victories. Keep pushing forward! 💪',
            'Design is not just what it looks like, it\'s how it works. 🎨',
            'Grateful for all the support from this amazing community! ❤️'
        ];
        
        this.init();
    }
    
    init() {
        this.setupObserver();
        this.bindEvents();
        this.loadPosts();
        this.handleScrollTop();
    }
    
    setupObserver() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.loading && this.hasMore) {
                    this.loadPosts();
                }
            });
        }, options);
        
        this.observer.observe(this.sentinel);
    }
    
    bindEvents() {
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
        
        this.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
    
    handleScrollTop() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.scrollTopBtn.classList.remove('hidden');
            } else {
                this.scrollTopBtn.classList.add('hidden');
            }
        });
    }
    
    async loadPosts() {
        if (this.loading || !this.hasMore) return;
        
        this.loading = true;
        
        // Simulate API delay
        await this.delay(800);
        
        const posts = this.generateMockPosts(this.postsPerPage);
        
        posts.forEach(post => {
            this.postsContainer.appendChild(this.createPostElement(post));
        });
        
        this.page++;
        const totalPosts = this.page * this.postsPerPage;
        this.postCountEl.textContent = Math.min(totalPosts, this.maxPosts);
        
        if (totalPosts >= this.maxPosts) {
            this.hasMore = false;
            this.sentinel.classList.add('hidden');
            this.endMessage.classList.remove('hidden');
        }
        
        this.loading = false;
    }
    
    generateMockPosts(count) {
        const posts = [];
        for (let i = 0; i < count; i++) {
            const user = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
            const content = this.mockContent[Math.floor(Math.random() * this.mockContent.length)];
            const hasImage = Math.random() > 0.5;
            const likes = Math.floor(Math.random() * 500) + 10;
            const comments = Math.floor(Math.random() * 100) + 1;
            const timeAgo = this.getRandomTimeAgo();
            
            posts.push({
                id: this.postIdCounter++,
                user,
                content,
                hasImage,
                likes,
                comments,
                timeAgo
            });
        }
        return posts;
    }
    
    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'post';
        article.dataset.postId = post.id;
        
        const imageHtml = post.hasImage 
            ? `<div class="post-image">📷</div>` 
            : '';
        
        article.innerHTML = `
            <div class="post-header">
                <div class="avatar">${post.user.avatar}</div>
                <div class="post-meta">
                    <div class="author">${post.user.name}</div>
                    <div class="timestamp">${post.timeAgo}</div>
                </div>
            <div class="post-content">${post.content}</div>
            ${imageHtml}
            <div class="post-footer">
                <button class="post-action like-btn" data-likes="${post.likes}">
                    <span>👍</span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="post-action">
                    <span>💬</span>
                    <span>${post.comments}</span>
                </button>
                <button class="post-action">
                    <span>↗️</span>
                    <span>Share</span>
                </button>
            </div>
        `;
        
        // Like button functionality
        const likeBtn = article.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            const isLiked = likeBtn.classList.contains('liked');
            const countEl = likeBtn.querySelector('.like-count');
            let count = parseInt(likeBtn.dataset.likes);
            
            if (isLiked) {
                likeBtn.classList.remove('liked');
                count--;
            } else {
                likeBtn.classList.add('liked');
                count++;
            }
            
            likeBtn.dataset.likes = count;
            countEl.textContent = count;
        });
        
        return article;
    }
    
    getRandomTimeAgo() {
        const times = ['Just now', '5m', '15m', '1h', '3h', '5h', '12h', '1d', '2d', '3d'];
        return times[Math.floor(Math.random() * times.length)];
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    reset() {
        this.page = 0;
        this.loading = false;
        this.hasMore = true;
        this.postIdCounter = 0;
        this.postsContainer.innerHTML = '';
        this.sentinel.classList.remove('hidden');
        this.endMessage.classList.add('hidden');
        this.loadPosts();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

new InfiniteScroll();