        // code4.js content

        // This lets JavaScript find and control elements from the HTML
        const textInput = document.getElementById('textInput');
        const charCount = document.getElementById('charCount');

        // Define the maximum number of characters allowed
        const MAX_CHARS = 200;

        // 2. Add an 'input' event listener to the textarea
        // The 'input' event fires every time the user types, deletes, or pastes text
        // This is perfect for live updates because it triggers on every change
        textInput.addEventListener('input', function() {
            
            // 3. Use .length to get the number of characters
            // .length is a property that exists on strings and arrays
            // It tells us how many characters are currently in the textarea
            let currentLength = textInput.value.length;
            
            // Calculate how many characters are remaining
            let remaining = MAX_CHARS - currentLength;

            // 4. Use .innerText to update the counter on the page
            // innerText changes the text content of an HTML element
            // Note: innerText vs textContent - innerText is aware of styling and won't 
            // return text of hidden elements, while textContent returns all text
            // For simple text updates like this, either works fine
            charCount.innerText = `Characters: ${currentLength} | Remaining: ${remaining}`;

            // Bonus: Change color based on how close we are to the limit
            // Add/remove CSS classes to style the counter
            if (remaining <= 20) {
                // Red warning when 20 or fewer chars left
                charCount.className = 'warning';
            } else {
                // Green/safe when we have lots of room
                charCount.className = 'safe';
            }
        });

        // Initialize the counter on page load
        charCount.innerText = `Characters: 0 | Remaining: ${MAX_CHARS}`;


