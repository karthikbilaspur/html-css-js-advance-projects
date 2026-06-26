// JavaScript for Code 8
const display = document.getElementById('display');

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = '';
}

function calculate() {
    try {
        // We use the Function constructor as a safer alternative to eval()
        // It treats the string as a mathematical expression
        display.value = new Function('return ' + display.value)();
    } catch (error) {
        display.value = 'Error';
    }
}