const result = document.getElementById('result');
const filter = document.getElementById('filter');
const resultCount = document.getElementById('resultCount');
const loader = document.getElementById('loader');

const API_URL = 'https://randomuser.me/api/?results=50';
let listItems = [];

// Fetch users
async function getData() {
    loader.classList.add('active');
    try {
        const res = await fetch(API_URL);
        const { results } = await res.json();

        // Clear loading
        result.innerHTML = '';

        // Create list items
        results.forEach(user => {
            const li = document.createElement('li');

            li.innerHTML = `
                <img src="${user.picture.large}" alt="${user.name.first}">
                <div class="user-info">
                    <h4>${user.name.first} ${user.name.last}</h4>
                    <p>${user.location.city}, ${user.location.country}</p>
                </div>
            `;

            listItems.push(li);
            result.appendChild(li);
        });

        updateCount();
    } catch (error) {
        result.innerHTML = '<li style="text-align: center; color: #ff4757;">Failed to load users</li>';
        resultCount.textContent = 'Error loading users';
    } finally {
        loader.classList.remove('active');
    }
}

// Filter users
function filterData(searchTerm) {
    let visibleCount = 0;

    listItems.forEach(item => {
        if (item.innerText.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.classList.remove('hide');
            visibleCount++;
        } else {
            item.classList.add('hide');
        }
    });

    updateCount(visibleCount);
}

function updateCount(count) {
    const total = listItems.length;
    const showing = count !== undefined ? count : total;
    resultCount.textContent = `Showing ${showing} of ${total} users`;
}

// Event listener
filter.addEventListener('input', (e) => filterData(e.target.value));

// Init
getData();