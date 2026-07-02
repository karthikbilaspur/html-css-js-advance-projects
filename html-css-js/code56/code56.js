// JavaScript for Code 56
const qrType = document.getElementById('qr-type');
const textInput = document.getElementById('text-input');
const wifiSsid = document.getElementById('wifi-ssid');
const wifiPass = document.getElementById('wifi-pass');
const wifiType = document.getElementById('wifi-type');
const emailTo = document.getElementById('email-to');
const emailSubject = document.getElementById('email-subject');
const phoneNum = document.getElementById('phone-num');
const qrSize = document.getElementById('qr-size');
const qrColor = document.getElementById('qr-color');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrContainer = document.getElementById('qrcode-container');

// Input groups
const textGroup = document.getElementById('text-group');
const wifiGroup = document.getElementById('wifi-group');
const emailGroup = document.getElementById('email-group');
const phoneGroup = document.getElementById('phone-group');

let qrInstance = null;

// Switch input fields based on type
qrType.addEventListener('change', (e) => {
    const type = e.target.value;
    [textGroup, wifiGroup, emailGroup, phoneGroup].forEach(g => g.classList.add('hidden'));
    
    if (type === 'text') textGroup.classList.remove('hidden');
    if (type === 'wifi') wifiGroup.classList.remove('hidden');
    if (type === 'email') emailGroup.classList.remove('hidden');
    if (type === 'phone') phoneGroup.classList.remove('hidden');
});

// Generate QR code
generateBtn.addEventListener('click', generateQR);
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateQR();
    }
});

function generateQR() {
    const type = qrType.value;
    let data = '';

    // Format data based on type
    switch (type) {
        case 'text':
            data = textInput.value.trim();
            if (!data) return alert('Please enter text or URL');
            break;
        case 'wifi':
            const ssid = wifiSsid.value.trim();
            const pass = wifiPass.value;
            const enc = wifiType.value;
            if (!ssid) return alert('Please enter WiFi SSID');
            // WiFi QR format: WIFI:T:WPA;S:mynetwork;P:mypass;;
            data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
            break;
        case 'email':
            const email = emailTo.value.trim();
            if (!email) return alert('Please enter email address');
            const subject = emailSubject.value.trim();
            data = `mailto:${email}${subject ? '?subject=' + encodeURIComponent(subject) : ''}`;
            break;
        case 'phone':
            const phone = phoneNum.value.trim();
            if (!phone) return alert('Please enter phone number');
            data = `tel:${phone}`;
            break;
    }

    // Clear previous QR
    qrContainer.innerHTML = '';

    // Generate new QR code
    const size = parseInt(qrSize.value);
    const color = qrColor.value;

    qrInstance = new QRCode(qrContainer, {
        text: data,
        width: size,
        height: size,
        colorDark: color,
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    // Show download button after slight delay for canvas to render
    setTimeout(() => {
        downloadBtn.classList.remove('hidden');
    }, 100);
}

// Download QR as PNG
downloadBtn.addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Generate example on load
window.addEventListener('DOMContentLoaded', () => {
    textInput.value = 'https://github.com';
    generateQR();
});