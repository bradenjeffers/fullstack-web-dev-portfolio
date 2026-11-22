'use strict';

/** Classic LIFO stack backed by an array. */
class Stack {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  push(element) {
    this.items.push(element);
  }

  /** Removes and returns the top element, or the string "Underflow" when empty. */
  pop() {
    return this.isEmpty() ? 'Underflow' : this.items.pop();
  }

  /** Top element without removing it, or null when empty. */
  peek() {
    return this.isEmpty() ? null : this.items[this.items.length - 1];
  }

  /** Space-separated elements, bottom to top. */
  printStack() {
    return this.items.join(' ');
  }
}

const MATCHING_BRACE = { '(': ')', '{': '}', '[': ']' };
const CLOSING_BRACES = new Set(Object.values(MATCHING_BRACE));

function isMatchingPair(opening, closing) {
  return MATCHING_BRACE[opening] === closing;
}

/**
 * True when every (), {} and [] in `expression` is closed in the right order.
 * Runs in O(n) time using the Stack above; non-brace characters are ignored.
 */
function isBalanced(expression) {
  const stack = new Stack();

  for (const char of expression) {
    if (char in MATCHING_BRACE) {
      stack.push(char);
    } else if (CLOSING_BRACES.has(char)) {
      if (stack.isEmpty() || !isMatchingPair(stack.pop(), char)) return false;
    }
  }
  return stack.isEmpty();
}

module.exports = { Stack, isBalanced, isMatchingPair };

if (require.main === module) {
  const stack = new Stack();
  stack.push(10);
  stack.push(20);
  stack.push(30);

  console.log('Is stack empty:', stack.isEmpty());
  console.log('Stack elements:', stack.printStack());
  console.log('Popped element:', stack.pop());
  console.log('Top element:', stack.peek());

  console.log('Balanced:', isBalanced('{(a+b)-c}*[a-{b*c}]')); // true
  console.log('Balanced:', isBalanced('{(a+b-c}*[a-{b*c}]')); // false
}
