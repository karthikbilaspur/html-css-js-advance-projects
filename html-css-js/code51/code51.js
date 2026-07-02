// JavaScript for Code 51
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const resultsGrid = document.getElementById('results-grid');
const statusEl = document.getElementById('status');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Search recipes
async function searchRecipes(query) {
    if (!query.trim()) {
        statusEl.textContent = 'Please enter a search term';
        return;
    }

    statusEl.textContent = 'Searching...';
    resultsGrid.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/search.php?s=${query}`);
        const data = await res.json();

        if (data.meals) {
            statusEl.textContent = `Found ${data.meals.length} recipes for "${query}"`;
            displayRecipes(data.meals);
        } else {
            statusEl.textContent = `No recipes found for "${query}". Try chicken, pasta, or beef`;
        }
    } catch (error) {
        statusEl.textContent = 'Error fetching recipes. Check your connection.';
        console.error(error);
    }
}

// Get random recipe
async function getRandomRecipe() {
    statusEl.textContent = 'Fetching random recipe...';
    resultsGrid.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/random.php`);
        const data = await res.json();
        statusEl.textContent = 'Here is a random recipe for you';
        displayRecipes(data.meals);
    } catch (error) {
        statusEl.textContent = 'Error fetching random recipe';
        console.error(error);
    }
}

// Display recipe cards
function displayRecipes(meals) {
    resultsGrid.innerHTML = meals.map(meal => `
        <div class="recipe-card" data-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
            <div class="recipe-card-body">
                <h3>${meal.strMeal}</h3>
                <div class="meta">
                    <span class="tag">${meal.strCategory}</span>
                    <span>${meal.strArea}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Show recipe details in modal
async function showRecipeDetails(id) {
    try {
        const res = await fetch(`${API_BASE}/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];

        // Extract ingredients + measures
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
            }
        }

        modalBody.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="modal-details">
                <h2>${meal.strMeal}</h2>
                <div class="modal-meta">
                    <span><strong>Category:</strong> ${meal.strCategory}</span>
                    <span><strong>Cuisine:</strong> ${meal.strArea}</span>
                    ${meal.strTags? `<span><strong>Tags:</strong> ${meal.strTags}</span>` : ''}
                </div>

                <div class="modal-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-section">
                    <h3>Instructions</h3>
                    <div class="instructions">${meal.strInstructions}</div>
                </div>

                ${meal.strYoutube? `
                    <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                        ▶ Watch on YouTube
                    </a>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading recipe details:', error);
    }
}

// Event listeners
searchBtn.addEventListener('click', () => searchRecipes(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchRecipes(searchInput.value);
});
randomBtn.addEventListener('click', getRandomRecipe);

resultsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.recipe-card');
    if (card) showRecipeDetails(card.dataset.id);
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Load default on page load
window.addEventListener('DOMContentLoaded', () => {
    searchRecipes('chicken');
});