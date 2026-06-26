// Create an array with 63 elements
const dataArray = Array.from({ length: 63 }, (_, i) => i + 1);

// Get the container where we'll add elements
const grid = document.getElementById('grid');
const countSpan = document.getElementById('count');

// Loop through array and create DOM element for each item
dataArray.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'element';
    div.textContent = `#${item}`;
    
    // Add click event to each element
    div.addEventListener('click', () => {
        alert(`You clicked element ${item} at index ${index}`);
    });
    
    grid.appendChild(div);
});

// Update the count
countSpan.textContent = dataArray.length;

console.log(`Created ${dataArray.length} DOM elements from array`);