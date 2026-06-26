// JavaScript for Code 11
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            button.classList.add('active');

            // Hide all content sections
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            // Show the target content section
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
        });
    });
});