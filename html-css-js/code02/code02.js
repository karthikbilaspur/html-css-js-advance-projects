        const messages = [
            "Great job! You changed the text 🎉",
            "JavaScript is awesome, right? 💻",
            "You just used getElementById!",
            "textContent updated successfully ✅",
            "Try clicking again for more messages!",
            "Click the button below to change this text!"
        ];
        
        // This keeps track of which message we're showing
        let currentIndex = 0;
        
        // STEP 2: getElementById - This method finds HTML elements by their "id" attribute
        // We store the elements in variables so we can use them later
        const textParagraph = document.getElementById('demoText');
        const button = document.getElementById('changeBtn');
        
        // STEP 3: onclick - This tells the button what to do when clicked
        // We assign a function that runs every time someone clicks the button
        button.onclick = function() {
            console.log('Button was clicked!');
            
            // Move to the next message in our array
            // The % operator makes sure we loop back to 0 after the last message
            currentIndex = (currentIndex + 1) % messages.length;
            
            // STEP 4: textContent - This property changes the text inside an HTML element
            // It's safer than innerHTML because it only changes text, not HTML tags
            textParagraph.textContent = messages[currentIndex];
            
            console.log('textContent changed to: ' + textParagraph.textContent);
            
            // BONUS: Add a CSS class for visual effect, then remove it after 500ms
            textParagraph.classList.add('updated');
            setTimeout(() => {
                textParagraph.classList.remove('updated');
            }, 500);
        };
        
        // This runs when the page first loads
        console.log('JavaScript loaded! Ready to change text.');
