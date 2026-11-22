'use strict';

/**
 * Higher-order functions and the `this` keyword: call / apply / bind,
 * filter / reduce, closures, and functions as objects.
 */

const isEven = (num) => num % 2 === 0;

/** Returns a NEW array containing only the elements that pass `predicate`. */
function filterBy(numbers, predicate) {
  return numbers.filter(predicate);
}

/** Factorial computed inside an IIFE (the exercise's "run immediately" form). */
const factorialOf5 = (function (num) {
  let result = 1;
  for (let i = 2; i <= num; i++) result *= i;
  return result;
})(5);

/** Shared method borrowed by several objects via call(). */
function describeProduct() {
  return `Title: ${this.title} Price: ${this.price} Category: ${this.category}`;
}

/** Oldest person in the list, or undefined when the list is empty. */
function findOldestPerson(people) {
  return people.reduce(
    (oldest, person) => (oldest === undefined || person.age > oldest.age ? person : oldest),
    undefined
  );
}

/** Sum using an IIFE + reduce. */
const sum = (function (numbers) {
  return numbers.reduce((total, n) => total + n, 0);
})([1, 2, 3, 4, 5]);

/** Returns whatever `this` is when called, to show how call() changes it. */
function printContext() {
  return this;
}

function multiply(a, b) {
  return a * b;
}

/** Partial application with bind: first argument fixed to 2. */
const double = multiply.bind(null, 2);

function introduce() {
  return `Hi, my name is ${this.name} and I am ${this.age} years old.`;
}

/** Higher-order function: returns a function that scales by `factor`. */
function createMultiplier(factor) {
  return (number) => number * factor;
}

/** Functions are objects, so they can carry properties. */
function calculate(a, b) {
  return a + b;
}
calculate.description = 'This function adds two numbers.';

module.exports = {
  isEven, filterBy, factorialOf5, describeProduct, findOldestPerson, sum,
  printContext, multiply, double, introduce, createMultiplier, calculate,
};

if (require.main === module) {
  console.log('evens:', filterBy([1, 2, 3, 4, 5, 6], isEven));
  console.log('5! via IIFE:', factorialOf5);

  const nikeShoes = { title: 'Nike Shoes', price: 30, category: 'Shoes' };
  const sonyTv = { title: 'Sony TV', price: 100, category: 'Electronics' };
  console.log(describeProduct.call(nikeShoes));
  console.log(describeProduct.call(sonyTv));

  console.log('oldest:', findOldestPerson([
    { name: 'Harry', age: 12 }, { name: 'Ron', age: 11 }, { name: 'Hermione', age: 13 },
  ]));
  console.log('sum via IIFE:', sum);

  console.log('this with call():', printContext.call({ name: 'Alice', age: 30 }), printContext.call({ name: 'Bob', age: 25 }));
  console.log('double(5):', double(5), '| double(10):', double(10));
  console.log(introduce.call({ name: 'Alice', age: 30 }));

  const triple = createMultiplier(3);
  console.log('createMultiplier(2)(5):', createMultiplier(2)(5), '| triple(5):', triple(5));
  console.log(calculate.description);
}
