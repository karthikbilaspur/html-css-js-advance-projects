// JavaScript for Code 96
class ScreenRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.stream = null;
        this.chunks = [];
        this.startTime = null;
        this.timerInterval = null;
        this.recordings = [];
        this.isPaused = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkSupport();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopRecording());
    }

    checkSupport() {
        if (!navigator.mediaDevices ||!navigator.mediaDevices.getDisplayMedia) {
            this.updateStatus('Browser not supported', 'error');
            document.getElementById('start-btn').disabled = true;
            return false;
        }
        return true;
    }

    async startRecording() {
        try {
            const audioSource = document.getElementById('audio-source').value;
            const quality = document.getElementById('quality').value;

            // Get display stream
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: {ideal: quality === '1080'? 1920 : quality === '720'? 1280 : 854},
                    height: {ideal: quality === '1080'? 1080 : quality === '720'? 720 : 480},
                    frameRate: {ideal: 30}
                },
                audio: audioSource === 'system' || audioSource === 'both'
            });

            let tracks = [...displayStream.getVideoTracks()];

            // Add audio tracks
            if (audioSource === 'system' || audioSource === 'both') {
                tracks = tracks.concat(displayStream.getAudioTracks());
            }

            if (audioSource === 'mic' || audioSource === 'both') {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({audio: true});
                    tracks = tracks.concat(micStream.getAudioTracks());
                } catch (err) {
                    console.warn('Mic access denied:', err);
                }
            }

            this.stream = new MediaStream(tracks);

            // Show preview
            const preview = document.getElementById('preview');
            preview.srcObject = this.stream;
            preview.classList.add('active');
            document.getElementById('no-preview').style.display = 'none';

            // Setup MediaRecorder
            const format = document.getElementById('format').value;
            const mimeType = format === 'mp4'? 'video/mp4' : 'video/webm; codecs=vp9';

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: MediaRecorder.isTypeSupported(mimeType)? mimeType : 'video/webm'
            });

            this.chunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                this.cleanup();
            };

            this.mediaRecorder.start(1000);
            this.startTime = Date.now();
            this.startTimer();

            this.updateStatus('Recording', 'recording');
            document.getElementById('recording-indicator').classList.add('active');
            document.getElementById('start-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;
            document.getElementById('stop-btn').disabled = false;

            // Handle stream end
            this.stream.getVideoTracks()[0].onended = () => {
                this.stopRecording();
            };

        } catch (err) {
            console.error('Error:', err);
            this.updateStatus('Error: ' + err.message, 'error');
        }
    }

    togglePause() {
        if (!this.mediaRecorder) return;

        if (this.isPaused) {
            this.mediaRecorder.resume();
            this.startTimer();
            this.updateStatus('Recording', 'recording');
            document.getElementById('pause-btn').textContent = 'Pause';
        } else {
            this.mediaRecorder.pause();
            this.stopTimer();
            this.updateStatus('Paused', 'paused');
            document.getElementById('pause-btn').textContent = 'Resume';
        }

        this.isPaused =!this.isPaused;
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state!== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    saveRecording() {
        const format = document.getElementById('format').value;
        const blob = new Blob(this.chunks, {type: `video/${format}`});
        const url = URL.createObjectURL(blob);
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        const recording = {
            id: Date.now(),
            url: url,
            blob: blob,
            name: `Recording-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.${format}`,
            size: this.formatSize(blob.size),
            duration: this.formatDuration(duration),
            timestamp: new Date().toLocaleString()
        };

        this.recordings.unshift(recording);
        this.renderRecordings();
    }

    renderRecordings() {
        const list = document.getElementById('recordings-list');

        if (this.recordings.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#718096;padding:20px;">No recordings yet</p>';
            return;
        }

        list.innerHTML = this.recordings.map(rec => `
            <div class="recording-item">
                <div class="recording-info">
                    <div class="recording-icon">🎬</div>
                    <div class="recording-details">
                        <div class="recording-name">${rec.name}</div>
                        <div class="recording-meta">${rec.duration} • ${rec.size} • ${rec.timestamp}</div>
                    </div>
                </div>
                <div class="recording-actions">
                    <button class="download-btn" onclick="recorder.downloadRecording(${rec.id})">Download</button>
                    <button class="delete-btn" onclick="recorder.deleteRecording(${rec.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    downloadRecording(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            const a = document.createElement('a');
            a.href = recording.url;
            a.download = recording.name;
            a.click();
        }
    }

    deleteRecording(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            URL.revokeObjectURL(recording.url);
            this.recordings = this.recordings.filter(r => r.id!== id);
            this.renderRecordings();
        }
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.stopTimer();
        this.updateStatus('Ready', 'ready');
        document.getElementById('recording-indicator').classList.remove('active');
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('preview').classList.remove('active');
        document.getElementById('no-preview').style.display = 'block';
        this.isPaused = false;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = this.formatDuration(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatus(text, type) {
        document.getElementById('status-text').textContent = text;
        const dot = document.getElementById('status-dot');
        dot.className = 'status-dot';
        if (type === 'recording') dot.classList.add('recording');
        if (type === 'paused') dot.classList.add('paused');
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

const recorder = new ScreenRecorder();