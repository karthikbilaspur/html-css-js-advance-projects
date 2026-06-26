// JavaScript for Code 41
const micBtn = document.getElementById('micBtn');
const status = document.getElementById('status');
const waveAnimation = document.getElementById('waveAnimation');
const finalText = document.getElementById('finalText');
const interimText = document.getElementById('interimText');
const languageSelect = document.getElementById('languageSelect');
const continuousCheck = document.getElementById('continuousCheck');
const interimCheck = document.getElementById('interimCheck');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const wordCount = document.getElementById('wordCount');
const historyList = document.getElementById('historyList');

let recognition = null;
let isListening = false;
let finalTranscript = '';
let savedTranscriptions = JSON.parse(localStorage.getItem('speechHistory')) || [];

// Check browser support
if (!('webkitSpeechRecognition' in window) &&!('SpeechRecognition' in window)) {
  status.textContent = 'Speech Recognition not supported. Use Chrome/Edge.';
  micBtn.disabled = true;
} else {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micBtn.querySelector('.mic-text').textContent = 'Stop';
    status.textContent = 'Listening...';
    waveAnimation.classList.add('active');
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else if (interimCheck.checked) {
        interim += transcript;
      }
    }

    finalText.textContent = finalTranscript;
    interimText.textContent = interim;
    updateWordCount();
  };

  recognition.onerror = (event) => {
    status.textContent = 'Error: ' + event.error;
    stopListening();
  };

  recognition.onend = () => {
    if (isListening && continuousCheck.checked) {
      recognition.start(); // Restart for continuous mode
    } else {
      stopListening();
    }
  };
}

function startListening() {
  if (!recognition) return;

  finalTranscript = '';
  finalText.textContent = '';
  interimText.textContent = '';

  recognition.lang = languageSelect.value;
  recognition.continuous = continuousCheck.checked;
  recognition.interimResults = interimCheck.checked;

  recognition.start();
}

function stopListening() {
  isListening = false;
  micBtn.classList.remove('listening');
  micBtn.querySelector('.mic-text').textContent = 'Start Listening';
  status.textContent = 'Click mic to start';
  waveAnimation.classList.remove('active');
  if (recognition) recognition.stop();
}

function updateWordCount() {
  const words = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
  wordCount.textContent = `${words.length} words`;
}

function renderHistory() {
  historyList.innerHTML = savedTranscriptions.map((item, idx) => `
    <div class="history-item">
      <div class="history-meta">
        <span>${item.date}</span>
        <span>${item.lang}</span>
      </div>
      <div class="history-text">${item.text}</div>
    </div>
  `).join('');
}

// Event listeners
micBtn.addEventListener('click', () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
});

copyBtn.addEventListener('click', () => {
  const text = finalTranscript.trim();
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✓ Copied';
      setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
    });
  }
});

clearBtn.addEventListener('click', () => {
  finalTranscript = '';
  finalText.textContent = '';
  interimText.textContent = '';
  updateWordCount();
});

saveBtn.addEventListener('click', () => {
  const text = finalTranscript.trim();
  if (text) {
    const date = new Date().toLocaleString();
    const lang = languageSelect.options[languageSelect.selectedIndex].text;
    savedTranscriptions.unshift({ text, date, lang });
    if (savedTranscriptions.length > 10) savedTranscriptions.pop();
    localStorage.setItem('speechHistory', JSON.stringify(savedTranscriptions));
    renderHistory();
  }
});

// Init
renderHistory();