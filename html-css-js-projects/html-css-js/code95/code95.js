// JavaScript for Code 95
class CustomVideoPlayer {
    constructor() {
        this.video = document.getElementById('video');
        this.wrapper = document.getElementById('video-wrapper');
        this.controls = document.getElementById('controls');
        this.playPauseBtn = document.getElementById('play-pause');
        this.muteBtn = document.getElementById('mute');
        this.volumeSlider = document.getElementById('volume');
        this.progressContainer = document.getElementById('progress-container');
        this.played = document.getElementById('played');
        this.buffered = document.getElementById('buffered');
        this.progressThumb = document.getElementById('progress-thumb');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.fullscreenBtn = document.getElementById('fullscreen');
        this.pipBtn = document.getElementById('pip');
        this.speedSelect = document.getElementById('playback-speed');
        this.loading = document.getElementById('loading');
        
        this.isDragging = false;
        this.hideControlsTimeout = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updatePlayPauseIcon();
    }
    
    bindEvents() {
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.video.addEventListener('progress', () => this.onProgress());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('ended', () => this.onEnded());
        this.video.addEventListener('click', () => this.togglePlay());
        
        // Control events
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.pipBtn.addEventListener('click', () => this.togglePip());
        this.speedSelect.addEventListener('change', (e) => this.setPlaybackRate(e.target.value));
        
        document.getElementById('rewind').addEventListener('click', () => this.seek(-10));
        document.getElementById('forward').addEventListener('click', () => this.seek(10));
        
        // Progress bar
        this.progressContainer.addEventListener('click', (e) => this.scrub(e));
        this.progressContainer.addEventListener('mousedown', () => this.isDragging = true);
        document.addEventListener('mouseup', () => this.isDragging = false);
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) this.scrub(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Auto-hide controls
        this.wrapper.addEventListener('mousemove', () => this.showControls());
        this.wrapper.addEventListener('mouseleave', () => this.hideControls());
    }
    
    onLoadedMetadata() {
        this.durationEl.textContent = this.formatTime(this.video.duration);
    }
    
    onTimeUpdate() {
        if (!this.isDragging) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.played.style.width = percent + '%';
            this.progressThumb.style.left = percent + '%';
        }
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
    }
    
    onProgress() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const percent = (bufferedEnd / this.video.duration) * 100;
            this.buffered.style.width = percent + '%';
        }
    }
    
    onPlay() {
        this.updatePlayPauseIcon();
        this.controls.classList.remove('paused');
        this.hideControlsDelayed();
    }
    
    onPause() {
        this.updatePlayPauseIcon();
        this.controls.classList.add('paused');
        this.showControls();
    }
    
    onEnded() {
        this.updatePlayPauseIcon();
    }
    
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    updatePlayPauseIcon() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (this.video.paused) {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        } else {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }
    }
    
    toggleMute() {
        this.video.muted =!this.video.muted;
        this.updateMuteIcon();
    }
    
    updateMuteIcon() {
        const volumeIcon = this.muteBtn.querySelector('.volume-icon');
        const muteIcon = this.muteBtn.querySelector('.mute-icon');
        
        if (this.video.muted || this.video.volume === 0) {
            volumeIcon.classList.add('hidden');
            muteIcon.classList.remove('hidden');
        } else {
            volumeIcon.classList.remove('hidden');
            muteIcon.classList.add('hidden');
        }
    }
    
    setVolume(value) {
        this.video.volume = value;
        this.video.muted = value == 0;
        this.updateMuteIcon();
    }
    
    seek(seconds) {
        this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
    }
    
    scrub(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = percent * this.video.duration;
        this.video.currentTime = time;
        
        this.played.style.width = (percent * 100) + '%';
        this.progressThumb.style.left = (percent * 100) + '%';
    }
    
    setPlaybackRate(rate) {
        this.video.playbackRate = parseFloat(rate);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.wrapper.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    async togglePip() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await this.video.requestPictureInPicture();
            }
        } catch (error) {
            console.log('PiP error:', error);
        }
    }
    
    showControls() {
        this.controls.style.opacity = '1';
        clearTimeout(this.hideControlsTimeout);
        if (!this.video.paused) {
            this.hideControlsDelayed();
        }
    }
    
    hideControls() {
        if (!this.video.paused) {
            this.controls.style.opacity = '0';
        }
    }
    
    hideControlsDelayed() {
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsTimeout = setTimeout(() => {
            if (!this.video.paused) {
                this.controls.style.opacity = '0';
            }
        }, 3000);
    }
    
    showLoading() {
        this.loading.classList.add('active');
    }
    
    hideLoading() {
        this.loading.classList.remove('active');
    }
    
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'm':
                this.toggleMute();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 'ArrowLeft':
                this.seek(-5);
                break;
            case 'ArrowRight':
                this.seek(5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(Math.min(1, this.video.volume + 0.1));
                this.volumeSlider.value = this.video.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(Math.max(0, this.video.volume - 0.1));
                this.volumeSlider.value = this.video.volume;
                break;
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize player
new CustomVideoPlayer();

// Update fullscreen icon
document.addEventListener('fullscreenchange', () => {
    const fsEnter = document.querySelector('.fs-enter');
    const fsExit = document.querySelector('.fs-exit');
    
    if (document.fullscreenElement) {
        fsEnter.classList.add('hidden');
        fsExit.classList.remove('hidden');
    } else {
        fsEnter.classList.remove('hidden');
        fsExit.classList.add('hidden');
    }
});