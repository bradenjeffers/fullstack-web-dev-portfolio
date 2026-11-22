'use strict';

/**
 * FIFO printer queue.
 * Uses a head index instead of Array#shift(), so dequeue is amortised O(1)
 * rather than O(n) (shift re-indexes every remaining element).
 */
class PrinterQueue {
  constructor() {
    this.queue = [];
    this.head = 0;
  }

  get size() {
    return this.queue.length - this.head;
  }

  isEmpty() {
    return this.size === 0;
  }

  enqueue(document) {
    this.queue.push(document);
    console.log(`${document} has been added to the printer queue.`);
  }

  /** Removes and returns the first document, or null when the queue is empty. */
  dequeue() {
    if (this.isEmpty()) {
      console.log('The printer queue is empty.');
      return null;
    }
    const document = this.queue[this.head];
    this.queue[this.head] = undefined; // let the document be garbage-collected
    this.head++;

    // Reclaim space once more than half the backing array is dead weight.
    if (this.head * 2 >= this.queue.length) {
      this.queue = this.queue.slice(this.head);
      this.head = 0;
    }
    return document;
  }

  /** Describes the next document without removing it, or null when empty. */
  peek() {
    if (this.isEmpty()) {
      console.log('The printer queue is empty.');
      return null;
    }
    return `Next document to print: ${this.queue[this.head]}`;
  }

  /** Documents waiting, in print order. */
  toArray() {
    return this.queue.slice(this.head);
  }

  displayQueue() {
    if (this.isEmpty()) {
      console.log('The printer queue is empty.');
      return;
    }
    console.log('Printer Queue:');
    this.toArray().forEach((doc, index) => console.log(`${index + 1}: ${doc}`));
  }
}

/**
 * LeetCode 1700 "Number of Students Unable to Eat Lunch".
 * Students (0 = circular, 1 = square sandwich preference) wait in a queue; the
 * sandwiches sit in a stack. If the front student doesn't want the top
 * sandwich they go to the back of the line. Returns how many never eat.
 *
 * Inputs are copied, so the caller's arrays are not mutated.
 * (The first version consumed the arrays passed in.)
 */
function countStudentsUnableToEat(students, sandwiches) {
  const line = [...students];
  const stack = [...sandwiches];
  let refusals = 0; // consecutive students who skipped the current sandwich

  while (line.length > 0 && refusals < line.length) {
    if (line[0] === stack[0]) {
      line.shift();
      stack.shift();
      refusals = 0;
    } else {
      line.push(line.shift());
      refusals++;
    }
  }
  return line.length;
}

module.exports = { PrinterQueue, countStudentsUnableToEat };

if (require.main === module) {
  const printer = new PrinterQueue();
  printer.enqueue('Document-1');
  printer.enqueue('Document-2');
  printer.enqueue('Document-3');

  console.log(printer.peek());
  console.log('Printing document:', printer.dequeue());
  printer.displayQueue();

  console.log('Students unable to eat:', countStudentsUnableToEat([1, 1, 0, 0], [0, 1, 0, 1]));
  console.log('Students unable to eat:', countStudentsUnableToEat([1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1]));
}
