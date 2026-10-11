/* ============================================================
   Unit 5 — Expression Tree
   ============================================================
   Builds a binary tree from a postfix expression where:
   - Leaf nodes are operands (numbers or variables)
   - Internal nodes are operators (+, -, *, /, ^)
   
   Connects to the Stack module's infixToPostfix output.
   ============================================================ */

/**
 * Expression Tree Node.
 */
class ExprTreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }

  /**
   * Check if this node is an operator.
   */
  get isOperator() {
    return ['+', '-', '*', '/', '%', '^'].includes(this.value);
  }
}

/**
 * Expression Tree.
 * Built from a postfix expression using a stack.
 *
 * Build: O(n)
 * Evaluate: O(n)
 * Space: O(n)
 */
export class ExpressionTree {
  constructor(root = null) {
    this.root = root;
  }

  /**
   * Build an expression tree from a postfix (RPN) token array.
   *
   * Algorithm (uses a stack):
   * 1. For each token:
   *    - If operand → create a leaf node, push to stack
   *    - If operator → pop two nodes, create operator node with them as children, push
   * 2. Final node on stack is the root
   *
   * @param {string[]} tokens - Postfix expression tokens (e.g., ['3', '4', '2', '*', '+'])
   * @returns {{ tree: ExpressionTree, steps: Object[] }}
   */
  static fromPostfix(tokens) {
    const stack = [];
    const steps = [];

    for (const token of tokens) {
      const node = new ExprTreeNode(token);

      if (['+', '-', '*', '/', '%', '^'].includes(token)) {
        if (stack.length < 2) {
          throw new Error(`Invalid expression: not enough operands for '${token}'`);
        }
        // Pop right first, then left (order matters for subtraction/division)
        node.right = stack.pop();
        node.left = stack.pop();

        steps.push({
          token,
          action: 'operator',
          description: `Operator '${token}': pop '${node.right.value}' and '${node.left.value}', create subtree`,
          treeSnapshot: nodeToJSON(node),
          stackSize: stack.length + 1,
        });
      } else {
        steps.push({
          token,
          action: 'operand',
          description: `Operand '${token}': create leaf node, push to stack`,
          treeSnapshot: nodeToJSON(node),
          stackSize: stack.length + 1,
        });
      }

      stack.push(node);
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression: too many operands');
    }

    return { tree: new ExpressionTree(stack[0]), steps };
  }

  /**
   * Evaluate the expression tree recursively.
   *
   * @param {Object} [variables] - Variable values, e.g., { x: 5, y: 3 }
   * @returns {{ result: number, steps: Object[] }}
   */
  evaluate(variables = {}) {
    const steps = [];
    const result = this._evaluate(this.root, variables, steps);
    return { result, steps };
  }

  _evaluate(node, variables, steps) {
    if (!node) throw new Error('Empty expression tree');

    // Leaf node (operand)
    if (!node.isOperator) {
      const val = variables[node.value] !== undefined
        ? variables[node.value]
        : parseFloat(node.value);

      if (isNaN(val)) {
        throw new Error(`Unknown variable: '${node.value}'`);
      }

      steps.push({
        node: node.value,
        action: 'evaluate-leaf',
        result: val,
        description: `Leaf '${node.value}' = ${val}`,
      });

      return val;
    }

    // Internal node (operator)
    const leftVal = this._evaluate(node.left, variables, steps);
    const rightVal = this._evaluate(node.right, variables, steps);
    let result;

    switch (node.value) {
      case '+': result = leftVal + rightVal; break;
      case '-': result = leftVal - rightVal; break;
      case '*': result = leftVal * rightVal; break;
      case '/':
        if (rightVal === 0) throw new Error('Division by zero');
        result = leftVal / rightVal;
        break;
      case '%': result = leftVal % rightVal; break;
      case '^': result = Math.pow(leftVal, rightVal); break;
      default: throw new Error(`Unknown operator: '${node.value}'`);
    }

    steps.push({
      node: node.value,
      action: 'evaluate-operator',
      left: leftVal,
      right: rightVal,
      result,
      description: `${leftVal} ${node.value} ${rightVal} = ${result}`,
    });

    return result;
  }

  /**
   * Convert the expression tree back to an infix string.
   * Adds parentheses for clarity.
   * @returns {string}
   */
  toInfix() {
    return this._toInfix(this.root);
  }

  _toInfix(node) {
    if (!node) return '';
    if (!node.isOperator) return node.value;
    return `(${this._toInfix(node.left)} ${node.value} ${this._toInfix(node.right)})`;
  }

  /**
   * Convert the tree to a JSON structure for rendering.
   * @returns {Object|null}
   */
  toJSON() {
    return nodeToJSON(this.root);
  }
}

/**
 * Helper to convert a node subtree to a JSON object.
 */
function nodeToJSON(node) {
  if (!node) return null;
  return {
    value: node.value,
    isOperator: node.isOperator,
    left: nodeToJSON(node.left),
    right: nodeToJSON(node.right),
  };
}
