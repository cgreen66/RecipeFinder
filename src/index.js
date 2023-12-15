document.addEventListener('DOMContentLoaded', () => {
    // Get references to various elements in the HTML
    const searchButton = document.getElementById('search-button');
    const ingredientInput = document.getElementById('ingredient-input');
    const mealTypeSelect = document.getElementById('meal-type');
    const cuisineTypeSelect = document.getElementById('cuisine-type');
    const recipesSection = document.getElementById('recipes-section');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const clearButton = document.getElementById('clear-button');

    // Check if any required elements are missing and log an error if so
    if (!searchButton || !ingredientInput || !mealTypeSelect || !cuisineTypeSelect || !recipesSection || !loadingIndicator || !errorMessage || !clearButton) {
        console.error('One or more elements were not found in the document.');
        return; // Exit the function if elements are missing
    }

    // Define a function to handle the search button click
    const handleSearch = () => {
        // Get user input values
        const ingredients = ingredientInput.value;
        const healthLabels = Array.from(document.querySelectorAll('input[name="health"]:checked'))
            .map(checkbox => checkbox.value)
            .join(',');
        const mealType = mealTypeSelect.value;
        const cuisineType = cuisineTypeSelect.value;
        
        // Call the fetchRecipes function with the user inputs
        fetchRecipes(ingredients, healthLabels, mealType, cuisineType);
    };

    // Add a click event listener to the search button
    searchButton.addEventListener('click', handleSearch);

    // Add a keyup event listener to the ingredient input field to trigger search on Enter key press
    ingredientInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Add a click event listener to the clear button to reset the search and clear results
    clearButton.addEventListener('click', () => {
        // Clear input fields, reset checkboxes, and clear recipe section
        ingredientInput.value = '';
        document.querySelectorAll('input[name="health"]').forEach(checkbox => checkbox.checked = false);
        mealTypeSelect.value = '';
        cuisineTypeSelect.value = '';
        recipesSection.innerHTML = '';
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'none';
    });

    const headerTitle = document.querySelector('header h1');
    const text = headerTitle.textContent;
    const splitText = text.split('');

    // Clear the current text content
    headerTitle.textContent = '';

    // Wrap each letter in a span and add to the header
    splitText.forEach(letter => {
        let span = document.createElement('span');
        span.textContent = letter;
        headerTitle.appendChild(span);
    });

    // GSAP animation for the typing effect
    const spans = headerTitle.querySelectorAll('span');
    gsap.set(spans, { autoAlpha: 0 });

    gsap.to(spans, {
        autoAlpha: 1,
        duration: 0.2,
        stagger: 0.05,
        repeat: -1,
        repeatDelay: 0.1,
        yoyo: true,
        ease: "none"
    });

});

function fetchRecipes(query, health, mealType, cuisineType) {
    const apiId = '2a21323f';
    const apiKey = 'e33ff0b27913e1c906b2f652a9f24f33';
    let url = new URL(`https://api.edamam.com/api/recipes/v2`);
    let params = {
        q: query,
        app_id: apiId,
        app_key: apiKey,
        type: 'public',
        health: health,
        mealType: mealType,
        cuisineType: cuisineType
    };

    Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const recipesSection = document.getElementById('recipes-section');

    loadingIndicator.style.display = 'block';
    errorMessage.style.display = 'none';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.hits.length === 0) {
                errorMessage.textContent = 'No recipes found matching the criteria.';
                errorMessage.style.display = 'block';
                recipesSection.innerHTML = ''; // Clear previous recipes
            } else {
                errorMessage.style.display = 'none';
                displayRecipes(data.hits);
            }
            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            console.error('Fetch error:', error);
            errorMessage.textContent = 'Failed to load recipes. Please try again.';
            errorMessage.style.display = 'block';
            recipesSection.innerHTML = ''; // Clear previous recipes
            loadingIndicator.style.display = 'none';
        });
}


function displayRecipes(recipes) {
    const recipesSection = document.getElementById('recipes-section');
    recipesSection.innerHTML = '';

    recipes.forEach((recipeData, index) => {
        const recipe = recipeData.recipe;
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-card';
        recipeElement.innerHTML = `
            <div class="recipe-image-container">
                <img src="${recipe.image}" alt="${recipe.label}" class="recipe-image">
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.label}</h3>
                <p class="recipe-source">${recipe.source}</p>
                <a href="${recipe.url}" target="_blank" class="view-recipe-btn">View Recipe</a>
            </div>
        `;

        const ingredientsBtn = document.createElement('button');
        ingredientsBtn.textContent = 'Ingredients';
        ingredientsBtn.className = 'ingredients-btn';
        ingredientsBtn.addEventListener('click', () => showIngredients(index));

        recipeElement.querySelector('.recipe-content').appendChild(ingredientsBtn);

        recipeElement.dataset.ingredients = recipe.ingredientLines.join(', ');

        recipesSection.appendChild(recipeElement);
    });

    // Animate recipe cards using GSAP's stagger feature
    gsap.from(".recipe-card", {
        duration: 0.5,
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2 // Delay the start of the animation to allow time for data fetching
    });
}

// Define a function to show a modal with recipe ingredients
function showIngredients(index) {
    const recipeElement = document.querySelectorAll('.recipe-card')[index];
    const ingredients = recipeElement.dataset.ingredients;
    showModal(ingredients);
}

function showModal(ingredients) {
    const ingredientList = ingredients.split(', ').map(item => `<li>${item}</li>`).join('');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <ul class="ingredient-list">${ingredientList}</ul>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block'; // Set display to block before animation starts

    // Animate modal content appearance with GSAP
    gsap.fromTo('.modal-content', {
        scale: 0.8,
        autoAlpha: 0
    }, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.out"
    });

    // Close button click event
    modal.querySelector('.close').onclick = function() {
        gsap.to('.modal-content', {
            autoAlpha: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "power2.in",
            onComplete: function() {
                modal.style.display = 'none'; // Hide the modal after the animation
                document.body.removeChild(modal); // Remove the modal from the DOM
            }
        });
    };

    // Clicking outside the modal content to close
    window.onclick = function(event) {
        if (event.target === modal) {
            gsap.to('.modal-content', {
                autoAlpha: 0,
                scale: 0.8,
                duration: 0.5,
                ease: "power2.in",
                onComplete: function() {
                    modal.style.display = 'none'; // Hide the modal after the animation
                    document.body.removeChild(modal); // Remove the modal from the DOM
                }
            });
        }
    };
}


document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseover', () => {
        gsap.to(button, {
            scale: 1.05,
            duration: 0.2
        });
    });

    button.addEventListener('mouseout', () => {
        gsap.to(button, {
            scale: 1,
            duration: 0.2
        });
    });
});

document.querySelectorAll('#search-button, #clear-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        // GSAP hover animation
        gsap.to(button, { scale: 1.1, duration: 0.3, ease: "power1.out" });
    });
    button.addEventListener('mouseleave', () => {
        // GSAP reset animation
        gsap.to(button, { scale: 1, duration: 0.3, ease: "power1.out" });
    });
});

