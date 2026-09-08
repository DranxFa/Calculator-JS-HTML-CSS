const historyEl = document.getElementById('history');
const displayEl = document.getElementById('display');
const calculator = document.getElementById('calculator');

// Mapeo de operadores para visualización limpia estilo Google
const OP_DISPLAY = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

const OP_CANONICAL = {
  '+': '+',
  '-': '-',
  '−': '-',
  '×': '*',
  '÷': '/'
};

const OPERATORS = ['+', '-', '−', '×', '÷'];

// Estado de la calculadora
let currentInput = '0';
let expression = '';
let isCalculated = false;
let waitingForOperand = false;

function isOperator(char) {
  return OPERATORS.includes(char);
}

/**
 * Ajusta dinámicamente el tamaño de la fuente en el display principal
 * según la longitud del número actual para mantener legibilidad total.
 */
function adjustDisplay() {
  const len = displayEl.textContent.length;
  if (len <= 8) {
    displayEl.style.fontSize = '2.3rem';
  } else if (len <= 11) {
    displayEl.style.fontSize = '1.85rem';
  } else if (len <= 14) {
    displayEl.style.fontSize = '1.45rem';
  } else if (len <= 18) {
    displayEl.style.fontSize = '1.2rem';
  } else {
    displayEl.style.fontSize = '1rem';
  }

  displayEl.scrollLeft = displayEl.scrollWidth;
  historyEl.scrollLeft = historyEl.scrollWidth;
}

function clearAll() {
  currentInput = '0';
  expression = '';
  isCalculated = false;
  waitingForOperand = false;
  historyEl.textContent = '';
  displayEl.textContent = '0';
  adjustDisplay();
}

function deleteLast() {
  if (isCalculated) {
    clearAll();
    return;
  }

  if (waitingForOperand) {
    return;
  }

  if (currentInput === 'Error' || currentInput.length <= 1) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
    if (currentInput === '' || currentInput === '-') {
      currentInput = '0';
    }
  }

  displayEl.textContent = currentInput;
  adjustDisplay();
}

function inputDigit(digit) {
  // Si acabamos de calcular, empezar una nueva operación desde cero
  if (isCalculated) {
    expression = '';
    historyEl.textContent = '';
    currentInput = digit;
    isCalculated = false;
    waitingForOperand = false;
    displayEl.textContent = currentInput;
    adjustDisplay();
    return;
  }

  // Si acabamos de pulsar un operador, escribir el nuevo operando en el display principal
  if (waitingForOperand) {
    currentInput = digit;
    waitingForOperand = false;
  } else {
    if (currentInput === '0' || currentInput === 'Error') {
      currentInput = digit;
    } else if (currentInput === '-0') {
      currentInput = '-' + digit;
    } else {
      // Límite de 16 dígitos por número
      if (currentInput.length >= 16) return;
      currentInput += digit;
    }
  }

  displayEl.textContent = currentInput;
  adjustDisplay();
}

function inputDecimal() {
  if (isCalculated) {
    expression = '';
    historyEl.textContent = '';
    currentInput = '0.';
    isCalculated = false;
    waitingForOperand = false;
    displayEl.textContent = currentInput;
    adjustDisplay();
    return;
  }

  if (waitingForOperand) {
    currentInput = '0.';
    waitingForOperand = false;
  } else {
    if (currentInput === 'Error') {
      currentInput = '0.';
    } else if (!currentInput.includes('.')) {
      currentInput += '.';
    }
  }

  displayEl.textContent = currentInput;
  adjustDisplay();
}

function inputOperator(rawOp) {
  const symbol = OP_DISPLAY[rawOp] || rawOp;

  if (currentInput === 'Error') {
    clearAll();
    return;
  }

  // Caso especial: número negativo inicial
  if (currentInput === '0' && expression === '' && symbol === '−') {
    currentInput = '-';
    displayEl.textContent = '-';
    adjustDisplay();
    return;
  }

  // Si venimos de un resultado calculado, continuar la operación con ese resultado
  if (isCalculated) {
    expression = `${currentInput} ${symbol} `;
    historyEl.textContent = expression;
    waitingForOperand = true;
    isCalculated = false;
    adjustDisplay();
    return;
  }

  // Si ya estábamos esperando un operando y se pulsa otro operador, se reemplaza
  if (waitingForOperand) {
    const trimmed = expression.trimEnd();
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace !== -1) {
      expression = trimmed.slice(0, lastSpace) + ` ${symbol} `;
    } else {
      expression = `${currentInput} ${symbol} `;
    }
    historyEl.textContent = expression;
    adjustDisplay();
    return;
  }

  // Flujo normal: añadir el número actual y el operador a la línea de historial
  expression += `${currentInput} ${symbol} `;
  historyEl.textContent = expression;
  waitingForOperand = true;
  adjustDisplay();
}

/**
 * Evalúa expresiones aritméticas respetando jerarquía de operaciones
 * (* y / antes de + y -), división por cero y números negativos sin usar eval().
 */
function evaluateArithmetic(rawExpr) {
  // Convertir operadores visuales a canónicos
  let expr = '';
  for (const char of rawExpr) {
    expr += OP_CANONICAL[char] || char;
  }

  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];

    if (ch === ' ') {
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      const prevToken = tokens[tokens.length - 1];
      const isUnary = (ch === '-') && (tokens.length === 0 || (typeof prevToken === 'string' && '+-*/'.includes(prevToken)));

      if (isUnary) {
        let numStr = '-';
        i++;
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        if (numStr === '-') return NaN;
        tokens.push(parseFloat(numStr));
        continue;
      }

      tokens.push(ch);
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push(parseFloat(numStr));
    } else {
      i++;
    }
  }

  if (tokens.length === 0) return 0;

  // Paso 1: Resolver multiplicación (*) y división (/)
  const pass1 = [];
  let j = 0;
  while (j < tokens.length) {
    const token = tokens[j];
    if (token === '*' || token === '/') {
      const prev = pass1.pop();
      const next = tokens[j + 1];

      if (typeof prev !== 'number' || typeof next !== 'number') return NaN;
      if (token === '/' && next === 0) return Infinity;

      const result = token === '*' ? prev * next : prev / next;
      pass1.push(result);
      j += 2;
    } else {
      pass1.push(token);
      j++;
    }
  }

  // Paso 2: Resolver suma (+) y resta (-)
  let finalResult = typeof pass1[0] === 'number' ? pass1[0] : NaN;
  let k = 1;
  while (k < pass1.length) {
    const op = pass1[k];
    const next = pass1[k + 1];

    if (typeof next !== 'number') return NaN;
    if (op === '+') finalResult += next;
    else if (op === '-') finalResult -= next;
    k += 2;
  }

  return finalResult;
}

function formatResult(num) {
  if (isNaN(num) || !isFinite(num)) {
    return 'Error';
  }

  const abs = Math.abs(num);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-6)) {
    return num.toExponential(5);
  }

  const formatted = parseFloat(num.toFixed(10));
  return formatted.toString();
}

function calculate() {
  if (currentInput === 'Error') return;

  // Si no hay expresión previa
  if (expression === '') {
    historyEl.textContent = `${currentInput} =`;
    isCalculated = true;
    adjustDisplay();
    return;
  }

  let fullExpr = '';
  if (waitingForOperand) {
    // Si terminó en un operador sin número siguiente, quitar el operador final
    fullExpr = expression.trimEnd().slice(0, -1).trimEnd();
  } else {
    fullExpr = expression + currentInput;
  }

  historyEl.textContent = `${fullExpr} =`;

  const result = evaluateArithmetic(fullExpr);
  const formattedResult = formatResult(result);

  currentInput = formattedResult;
  displayEl.textContent = formattedResult;
  expression = '';
  waitingForOperand = false;
  isCalculated = (formattedResult !== 'Error');

  adjustDisplay();
}

// Delegación de eventos para clicks
calculator.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  switch (action) {
    case 'number':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      inputOperator(value);
      break;
    case 'calculate':
      calculate();
      break;
    case 'clear':
      clearAll();
      break;
    case 'delete':
      deleteLast();
      break;
  }
});

// Soporte para teclado físico con respuesta visual
window.addEventListener('keydown', (e) => {
  const key = e.key;

  if (key >= '0' && key <= '9') {
    inputDigit(key);
    highlightButton(`[data-action="number"][data-value="${key}"]`);
  } else if (key === '.' || key === ',') {
    inputDecimal();
    highlightButton('[data-action="decimal"]');
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    inputOperator(key);
    highlightButton(`[data-action="operator"][data-value="${key}"]`);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculate();
    highlightButton('#equal');
  } else if (key === 'Backspace') {
    deleteLast();
    highlightButton('#delete');
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    clearAll();
    highlightButton('#clear');
  }
});

function highlightButton(selector) {
  const btn = document.querySelector(selector);
  if (btn) {
    btn.classList.add('active-keyboard');
    setTimeout(() => btn.classList.remove('active-keyboard'), 150);
  }
}