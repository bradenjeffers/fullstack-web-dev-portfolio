'use strict';

/**
 * Function expressions, IIFEs, closures, callbacks and plain objects.
 */

/** Anonymous function expression assigned to a constant. */
const square = function (num) {
  return num * num;
};

/** Build the greeting used by the IIFE demo. */
function greeting(personName) {
  return `Hello ${personName}, Welcome to Great Learning!`;
}

/** Mutates the array in place: adds `amount` to every element. */
function incrementAll(numbers, amount = 2) {
  for (let i = 0; i < numbers.length; i++) {
    numbers[i] += amount;
  }
  return numbers;
}

/**
 * Applies `callback` to each element and writes the result back into the SAME
 * array (the exercise asked for an in-place update, not a new array).
 */
function updateArrayInPlace(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = callback(arr[i]);
  }
  return arr;
}

function doubleNumber(num) {
  return num * 2;
}

/**
 * An IIFE that captures `factor` in a closure and returns the multiplier.
 * `factor` stays private; the only way to use it is through the returned function.
 */
const multiplyBy = (function (factor) {
  return function (num) {
    return num * factor;
  };
})(2);

/** Max of an array using Function.prototype.apply (spread would also work). */
function findMaxInArray(arr) {
  return Math.max.apply(null, arr);
}

/** Print one property of every object in a list. */
function valuesByKey(items, keyName) {
  return items.map((item) => item[keyName]);
}

module.exports = {
  square, greeting, incrementAll, updateArrayInPlace, doubleNumber,
  multiplyBy, findMaxInArray, valuesByKey,
};

if (require.main === module) {
  console.log('square(2):', square(2));

  (function (personName) {
    console.log(greeting(personName));
  })('Harry');

  console.log('incrementAll:', incrementAll([1, 2, 3]));

  const course = { courseName: 'Computer Science', durationInMonths: 24, level: 'Beginner' };
  console.log(course);
  course.level = 'Intermediate';
  console.log(course);

  const students = [
    { firstName: 'Harry', lastName: 'Potter', house: 'Slytherin' },
    { firstName: 'Ron', lastName: 'Weasley', house: 'Gryffindor' },
    { firstName: 'Hermione', lastName: 'Granger', house: 'Gryffindor' },
  ];
  students.forEach(({ firstName, lastName }) => console.log(`First Name: ${firstName}, Last Name: ${lastName}`));

  console.log('doubled in place:', updateArrayInPlace([1, 2, 3, 4, 5], doubleNumber));
  console.log('multiplyBy(5):', multiplyBy(5), '| multiplyBy(10):', multiplyBy(10));
  console.log('max:', findMaxInArray([10, 5, 8, 20, 3]));

  const car = {};
  car.make = 'Toyota';
  car.model = 'Camry';
  console.log(car);

  console.log('houses:', valuesByKey(students, 'house'));
}
