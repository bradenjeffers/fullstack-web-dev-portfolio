'use strict';

/**
 * Conditionals: booleans, comparisons, switch, ternaries.
 * Every exercise is a small pure function so it can be unit-tested.
 */

/** Is the given action a smile? */
function isHappy(action) {
  return action === 'Smile';
}

/** Describe how `a` relates to `b` (>=). */
function compareNumbers(a, b) {
  return a >= b
    ? 'Num1 is greater than or equal to Num2'
    : 'Num1 is not greater than or equal to Num2';
}

function square(n) {
  return n * n;
}

function parity(n) {
  return n % 2 === 0 ? 'even' : 'odd';
}

/** Gregorian rule: divisible by 400, or by 4 but not by 100. */
function isLeapYear(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

/** Returns 'vowel', 'consonant', or 'not a letter' for a single character. */
function classifyLetter(char) {
  if (typeof char !== 'string' || char.length !== 1 || !/[a-z]/i.test(char)) {
    return 'not a letter';
  }
  return 'aeiou'.includes(char.toLowerCase()) ? 'vowel' : 'consonant';
}

/**
 * Largest of three numbers.
 * (The original if/else chain returned the wrong answer when the two largest
 * values tied, e.g. 10, 10, 8 -> 8. Math.max has no such edge case.)
 */
function largestOfThree(a, b, c) {
  return Math.max(a, b, c);
}

/** 'positive' | 'negative' | 'zero', using nested ternaries. */
function signOf(n) {
  return n > 0 ? 'positive' : n < 0 ? 'negative' : 'zero';
}

/** A (90-100), B (80-89), C (70-79), D (60-69), F (0-59). */
function gradeFor(percentage) {
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new RangeError('percentage must be a number between 0 and 100');
  }
  return percentage >= 90 ? 'A'
    : percentage >= 80 ? 'B'
    : percentage >= 70 ? 'C'
    : percentage >= 60 ? 'D'
    : 'F';
}

module.exports = {
  isHappy, compareNumbers, square, parity, isLeapYear,
  classifyLetter, largestOfThree, signOf, gradeFor,
};

if (require.main === module) {
  console.log('isHappy("Smile"):', isHappy('Smile'));
  console.log(compareNumbers(10, 5));
  console.log('square(4):', square(4));
  console.log('7 is', parity(7));
  console.log('2022 leap year?', isLeapYear(2022), '| 2024:', isLeapYear(2024), '| 1900:', isLeapYear(1900), '| 2000:', isLeapYear(2000));
  console.log('"a" is a', classifyLetter('a'), '| "z" is a', classifyLetter('z'), '| "7" is', classifyLetter('7'));
  console.log('largest of 10, 5, 8:', largestOfThree(10, 5, 8));
  console.log('sign of -5:', signOf(-5));
  console.log('grade for 85%:', gradeFor(85));
}
