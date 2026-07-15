# HTML 100 Codes: Code 11 – Code 20

A collection of 10 mini frontend components built with vanilla HTML, CSS, and JavaScript. Each project is self-contained in its own folder with `index.html`, `codeXX.css`, and `codeXX.js`.

Tech stack: HTML5, CSS3, Vanilla JS  
Accessibility: ARIA roles, `aria-live` regions, keyboard support  
Responsive: Mobile-first with viewport meta tag

---

 Code 11: Tabs Component
Path: `/code11/index.html`  
Description: Accessible tabbed interface with 3 panels: Home, Profile, Settings.  
Key features:

- WAI-ARIA compliant: `role="tablist"`, `aria-selected`, `aria-controls`
- Active state management for buttons and panels
- Keyboard navigation ready
Files: `code11.css`, `code11.js`

 Code 12: Modal Popup  
Path: `/code12/index.html`  
Description: Simple dialog modal with overlay and focus trapping.  
Key features:

- `role="dialog"` + `aria-modal="true"`
- Open/close with button + ESC key support
- Background overlay prevents interaction
Files: `code12.css`, `code12.js`

 Code 13: Copy to Clipboard
Path: `/code13/index.html`  
Description: One-click promo code copy with feedback message.  
Key features:

- Read-only input for code `SAVE20-SUMMER-2026`
- `navigator.clipboard` API with fallback
- `aria-live="polite"` for copy confirmation
Files: `code13.css`, `code13.js`

 Code 14: Word Counter
Path: `/code14/index.html`  
Description: Real-time text analyzer for words and characters.  
Key features:

- Counts words, characters, and characters without spaces
- Handles extra spaces and line breaks
- Live update on `input` event
Files: `code14.css`, `code14.js`

 Code 15: Dice Roller
Path: `/code15/index.html`  
Description: Random 6-sided dice with image + number result.  
Key features:

- Random number 1-6 generation
- Updates dice face image from Wikimedia
- `aria-live="polite"` announces roll result
Files: `code15.css`, `code15.js`

 Code 16: Coin Flip
Path: `/code16/index.html`  
Description: 3D coin flip animation for Heads or Tails.  
Key features:

- CSS 3D transform for flip animation
- US penny heads/tails images
- Random 50/50 outcome with text result
Files: `code16.css`, `code16.js`

 Code 17: Traffic Light
Path: `/code17/index.html`  
Description: Automated traffic light cycle: Red → Yellow → Green.  
Key features:

- Start/Stop buttons to control cycle
- Current state indicator
- `setInterval` timing logic
Files: `code17.css`, `code17.js`

 Code 18: Basic Form Validation
Path: `/code18/index.html`  
Description: Signup form with client-side validation.  
Key features:

- Fields: username, email, password, phone
- `novalidate` + custom JS error messages
- Success message on valid submit
- Regex for email/phone patterns
Files: `code18.css`, `code18.js`

 Code 19: BMI Calculator
Path: `/code19/index.html`  
Description: Calculate Body Mass Index from weight/height.  
Key features:

- Inputs: weight in kg, height in cm
- Formula: `BMI = weight / (height/100)²`
- Returns BMI value + category: Underweight, Normal, Overweight, Obese
Files: `code19.css`, `code19.js`

 Code 20: Age Calculator
Path: `/code20/index.html`  
Description: Detailed age breakdown from date of birth.  
Key features:

- Calculates years, months, days since DOB
- Extra stats: total days, weeks, hours, minutes lived
- Next birthday countdown
- Reset button to clear
Files: `code20.css`, `code20.js`

---

## Folder Structure

/code11
  ├── index.html
  ├── code11.css
  └── code11.js
/code12
  ├── index.html
  ├── code12.css
  └── code12.js
...
/code20
  ├── index.html
  ├── code20.css
  └── code20.js

## Navigation

Each page includes a footer with links to Previous, Home, and Next code for easy browsing.

## How to Run

1. Clone or download the repo
2. Open any `/codeXX/index.html` in your browser
3. No build step or dependencies needed

## Notes

- All external images use Wikimedia Commons URLs
- JS files use `defer` to avoid render blocking
- Built as part of "HTML 100 Codes" learning project

## Future Improvements

- [ ] Add dark mode toggle
- [ ] Store form data in `localStorage`
- [ ] Add unit tests for calculators
- [ ] Export Age Calculator results as PDF

HTML100Codes #FrontendDevelopment #WebDevelopment #HTML5 #CSS3 #JavaScript #VanillaJS #CodingJourney #100DaysOfCode #BuildInPublic #WebDev #Frontend #LearnToCode #OpenSource
