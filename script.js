// Advanced JS Calculator
// Handles: basic & scientific ops, keyboard, memory, formatting, history, error handling

const display = document.getElementById('display');
const historyPanel = document.getElementById('history-panel');
const buttons = document.querySelectorAll('.btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

let current = '0';
let memory = 0;
let operator = null;
let operand = null;
let waitingForOperand = false;
let history = JSON.parse(localStorage.getItem('calc_history') || '[]');
let lastResult = null;

function formatNumber(num) {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    let [int, dec] = num.toString().split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec ? `${int}.${dec}` : int;
}

function updateDisplay() {
    display.textContent = formatNumber(current);
}

function saveHistory() {
    localStorage.setItem('calc_history', JSON.stringify(history));
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    // show latest first
    history.slice().reverse().forEach(h => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = h;
        div.title = 'Click to reuse result';
        div.addEventListener('click', () => {
            const parts = h.split('=');
            const val = parts[parts.length - 1].trim().replace(/,/g, '');
            if (!isNaN(val)) {
                current = val.toString();
                updateDisplay();
            }
        });
        historyList.appendChild(div);
    });
}

function updateHistoryPanel() {
    renderHistory();
    saveHistory();
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        saveHistory();
        renderHistory();
    });
}

function clearAll() {
    current = '0';
    operator = null;
    operand = null;
    waitingForOperand = false;
    updateDisplay();
}

function inputDigit(d) {
    if (waitingForOperand) {
        current = d;
        waitingForOperand = false;
    } else {
        if (current.length >= 16) return; // overflow
        current = current === '0' ? d : current + d;
    }
    updateDisplay();
}

function inputDot() {
    if (waitingForOperand) {
        current = '0.';
        waitingForOperand = false;
    } else if (!current.includes('.')) {
        current += '.';
    }
    updateDisplay();
}

function handleOperator(nextOp) {
    if (operator && !waitingForOperand) {
        calculate();
    }
    operand = parseFloat(current);
    operator = nextOp;
    waitingForOperand = true;
}

function calculate() {
    if (operator === null || waitingForOperand) return;
    let result;
    const prev = operand;
    const next = parseFloat(current);
    switch (operator) {
        case '+': result = prev + next; break;
        case '-': result = prev - next; break;
        case '*': result = prev * next; break;
        case '/':
            if (next === 0) {
                current = 'Error';
                updateDisplay();
                operator = null;
                waitingForOperand = false;
                return;
            }
            result = prev / next; break;
        case '^': result = Math.pow(prev, next); break;
        default: return;
    }
    history.push(`${formatNumber(prev)} ${operator} ${formatNumber(next)} = ${formatNumber(result)}`);
    lastResult = result;
    current = result.toString();
    operator = null;
    waitingForOperand = false;
    updateDisplay();
    updateHistoryPanel();
}

function handleFunction(fn) {
    let num = parseFloat(current);
    let result;
    switch (fn) {
        case 'sqrt':
            if (num < 0) {
                current = 'Error';
                updateDisplay();
                return;
            }
            result = Math.sqrt(num); break;
        case 'sin': result = Math.sin(num * Math.PI / 180); break;
        case 'cos': result = Math.cos(num * Math.PI / 180); break;
        case 'tan': result = Math.tan(num * Math.PI / 180); break;
        case 'exp': result = Math.exp(num); break;
        default: return;
    }
    history.push(`${fn}(${formatNumber(num)}) = ${formatNumber(result)}`);
    current = result.toString();
    updateDisplay();
    updateHistoryPanel();
}

function handleMemory(action) {
    switch (action) {
        case 'mc': memory = 0; break;
        case 'mr': current = memory.toString(); updateDisplay(); return;
        case 'mplus': memory += parseFloat(current); break;
        case 'mminus': memory -= parseFloat(current); break;
        default: return;
    }
}

function handleBackspace() {
    if (waitingForOperand) return;
    if (current.length > 1) {
        current = current.slice(0, -1);
    } else {
        current = '0';
    }
    updateDisplay();
}

function handleButton(e) {
    const id = e.target.id;
    if (e.target.classList.contains('number')) {
        inputDigit(id);
    } else if (id === 'dot') {
        inputDot();
    } else if (id === 'add') {
        handleOperator('+');
    } else if (id === 'subtract') {
        handleOperator('-');
    } else if (id === 'multiply') {
        handleOperator('*');
    } else if (id === 'divide') {
        handleOperator('/');
    } else if (id === 'pow') {
        handleOperator('^');
    } else if (id === 'equals') {
        calculate();
    } else if (id === 'clear') {
        clearAll();
    } else if (id === 'backspace') {
        handleBackspace();
    } else if (['sqrt','sin','cos'].includes(id)) {
        handleFunction(id);
    } else if (['mc','mr','mplus','mminus'].includes(id)) {
        handleMemory(id);
    }
}

buttons.forEach(btn => btn.addEventListener('click', handleButton));

document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
    } else if (e.key === '.') {
        inputDot();
    } else if (e.key === '+') {
        handleOperator('+');
    } else if (e.key === '-') {
        handleOperator('-');
    } else if (e.key === '*' || e.key === 'x') {
        handleOperator('*');
    } else if (e.key === '/' || e.key === '÷') {
        handleOperator('/');
    } else if (e.key === '^') {
        handleOperator('^');
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key === 'c' || e.key === 'C') {
        clearAll();
    }
});

// Initial display
updateDisplay();
updateHistoryPanel();
