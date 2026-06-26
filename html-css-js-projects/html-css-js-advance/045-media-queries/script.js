const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const indicator = document.getElementById('indicator');
const deviceSize = document.getElementById('deviceSize');
const breakpointItems = document.querySelectorAll('.breakpoint-item');

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Close mobile menu when clicking link
document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Update device indicator
function updateDeviceIndicator() {
    const width = window.innerWidth;
    let device = 'Desktop';
    let icon = '💻';
    let size = '1200px+';
    let activeBreakpoint = 'desktop';

    if (width < 768) {
        device = 'Mobile';
        icon = '📱';
        size = '< 768px';
        activeBreakpoint = 'mobile';
    } else if (width < 1024) {
        device = 'Tablet';
        icon = '💻';
        size = '768px - 1023px';
        activeBreakpoint = 'tablet';
    } else if (width < 1440) {
        device = 'Desktop';
        icon = '🖥️';
        size = '1024px - 1439px';
        activeBreakpoint = 'desktop';
    } else {
        device = 'Large Desktop';
        icon = '📺';
        size = '1440px+';
        activeBreakpoint = 'large';
    }

    indicator.querySelector('.device-icon').textContent = icon;
    indicator.querySelector('.device-name').textContent = device;
    deviceSize.textContent = size;

    // Update breakpoint highlights
    breakpointItems.forEach(item => {
        item.classList.toggle('active', item.dataset.size === activeBreakpoint);
    });
}

// Listen for resize
window.addEventListener('resize', updateDeviceIndicator);

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Init
updateDeviceIndicator();