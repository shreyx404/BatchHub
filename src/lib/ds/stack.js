/* ============================================================
   Unit 4 — Stack
   ============================================================
   Array-based stack with push, pop, peek operations.
   Includes infix-to-postfix conversion and postfix evaluation
   using the stack — classic stack applications.
   ============================================================ */

/**
 * Stack (LIFO — Last In, First Out).
 * Array-based implementation.
 *
 * Push: O(1) amortized
 * Pop:  O(1)
 * Peek: O(1)
 * Space: O(n)
 */
export class Stack {
  constructor() {
    this._items = [];
    /** @type {{ op: string, args: any, snapshot: any[] }[]} */
    this.history = [];
  }

  /**
   * Push an element onto the top of the stack.
   * @param {any} item
   */
  push(item) {
    this._items.push(item);
    this.history.push({ op: 'push', args: { item }, snapshot: [...this._items] });
  }

  /**
   * Remove and return the top element.
   * @returns {any}
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack underflow: cannot pop from empty stack');
    }
    const item = this._items.pop();
    this.history.push({ op: 'pop', args: { item }, snapshot: [...this._items] });
    return item;
  }

  /**
   * Return the top element without removing it.
   * @returns {any}
   */
  peek() {
    if (this.isEmpty()) return undefined;
    return this._items[this._items.length - 1];
  }

  /**
   * Check if the stack is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this._items.length === 0;
  }

  /**
   * Get the number of elements.
   * @returns {number}
   */
  get size() {
    return this._items.length;
  }

  /**
   * Convert to array (bottom to top).
   * @returns {any[]}
   */
  toArray() {
    return [...this._items];
  }

  /**
   * Clear the stack and history.
   */
  clear() {
    this._items = [];
    this.history = [];
  }
}


/* ── Operator Precedence & Associativity ── */

const OPERATORS = {
  '+': { precedence: 1, associativity: 'left' },
  '-': { precedence: 1, associativity: 'left' },
  '*': { precedence: 2, associativity: 'left' },
  '/': { precedence: 2, associativity: 'left' },
  '%': { precedence: 2, associativity: 'left' },
  '^': { precedence: 3, associativity: 'right' },
};

function isOperator(ch) {
  return ch in OPERATORS;
}

function isOperand(token) {
  return !isNaN(parseFloat(token)) || /^[a-zA-Z]$/.test(token);
}

/**
 * Tokenize an infix expression string into an array of tokens.
 * Handles multi-digit numbers, operators, and parentheses.
 * @param {string} expression
 * @returns {string[]}
 */
function tokenize(expression) {
  const tokens = [];
  let i = 0;
  const expr = expression.replace(/\s+/g, '');

  while (i < expr.length) {
    const ch = expr[i];

    if (/[0-9.]/.test(ch)) {
      // Read full number
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
    } else if (/[a-zA-Z]/.test(ch)) {
      tokens.push(ch);
      i++;
    } else if (ch === '(' || ch === ')' || isOperator(ch)) {
      tokens.push(ch);
      i++;
    } else {
      i++; // Skip unknown characters
    }
  }

  return tokens;
}

/**
 * @typedef {Object} ConversionStep
 * @property {string} token - Current token being processed
 * @property {string[]} stack - Current stack state
 * @property {string[]} output - Current output queue
 * @property {string} description - What happened in this step
 */

/**
 * Convert an infix expression to postfix (Reverse Polish Notation)
 * using the Shunting-Yard algorithm.
 *
 * Uses a stack to handle operator precedence and associativity.
 *
 * @param {string} expression - Infix expression (e.g., "3 + 4 * 2")
 * @returns {{ postfix: string, steps: ConversionStep[] }}
 */
export function infixToPostfix(expression) {
  const tokens = tokenize(expression);
  const stack = new Stack();
  const output = [];
  const steps = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      // Operands go directly to output
      output.push(token);
      steps.push({
        token,
        stack: stack.toArray(),
        output: [...output],
        description: `Operand '${token}' → output`,
      });
    } else if (token === '(') {
      stack.push(token);
      steps.push({
        token,
        stack: stack.toArray(),
        output: [...output],
        description: `Left parenthesis '(' → push to stack`,
      });
    } else if (token === ')') {
      // Pop until matching '('
      while (!stack.isEmpty() && stack.peek() !== '(') {
        output.push(stack.pop());
      }
      if (!stack.isEmpty()) stack.pop(); // Remove the '('
      steps.push({
        token,
        stack: stack.toArray(),
        output: [...output],
        description: `Right parenthesis ')' → pop operators until '('`,
      });
    } else if (isOperator(token)) {
      const op = OPERATORS[token];
      while (
        !stack.isEmpty() &&
        stack.peek() !== '(' &&
        isOperator(stack.peek()) &&
        (
          (op.associativity === 'left' && op.precedence <= OPERATORS[stack.peek()].precedence) ||
          (op.associativity === 'right' && op.precedence < OPERATORS[stack.peek()].precedence)
        )
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
      steps.push({
        token,
        stack: stack.toArray(),
        output: [...output],
        description: `Operator '${token}' (prec=${op.precedence}) → pop higher/equal precedence, then push`,
      });
    }
  }

  // Pop remaining operators
  while (!stack.isEmpty()) {
    const op = stack.pop();
    if (op !== '(' && op !== ')') {
      output.push(op);
    }
  }

  steps.push({
    token: 'END',
    stack: [],
    output: [...output],
    description: 'Pop all remaining operators to output',
  });

  return {
    postfix: output.join(' '),
    tokens: output,
    steps,
  };
}

/**
 * @typedef {Object} EvalStep
 * @property {string} token - Current token being processed
 * @property {string[]} stack - Current stack state
 * @property {string} description - What happened in this step
 */

/**
 * Evaluate a postfix expression using a stack.
 *
 * @param {string} expression - Postfix expression (e.g., "3 4 2 * +")
 * @returns {{ result: number, steps: EvalStep[] }}
 */
export function evaluatePostfix(expression) {
  const tokens = typeof expression === 'string'
    ? expression.split(/\s+/).filter(Boolean)
    : expression;

  const stack = new Stack();
  const steps = [];

  for (const token of tokens) {
    if (isOperator(token)) {
      if (stack.size < 2) {
        throw new Error(`Invalid expression: not enough operands for operator '${token}'`);
      }
      const b = stack.pop();
      const a = stack.pop();
      let result;

      switch (token) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          result = a / b;
          break;
        case '%': result = a % b; break;
        case '^': result = Math.pow(a, b); break;
        default: throw new Error(`Unknown operator: ${token}`);
      }

      stack.push(result);
      steps.push({
        token,
        stack: stack.toArray(),
        description: `Pop ${a} and ${b}, compute ${a} ${token} ${b} = ${result}, push ${result}`,
      });
    } else {
      const num = parseFloat(token);
      if (isNaN(num)) {
        throw new Error(`Invalid token: '${token}'`);
      }
      stack.push(num);
      steps.push({
        token,
        stack: stack.toArray(),
        description: `Push operand ${num}`,
      });
    }
  }

  if (stack.size !== 1) {
    throw new Error('Invalid expression: too many operands');
  }

  return { result: stack.pop(), steps };
}
