/*
  Joins and aggregates (GROUP BY, ORDER BY, multi-table joins)
  Run after schema/01_schema.sql and schema/02_seed_data.sql.

  Written to be valid under MySQL 8's default ONLY_FULL_GROUP_BY mode.
  The "Expected" notes describe the result on the supplied seed data.
*/
USE food_order_app;

/* 1. Number of food items for each cuisine.
   LEFT JOIN so a cuisine with no food items is still listed with a count of 0.
   Expected: 10 rows - American 4, Italian 4, Chinese 3, French 2, Indian 2, then Greek, Japanese,
   Mexican, Thai and Turkish with 1 each (20 items in total). */
SELECT c.name AS cuisineName,
       COUNT(f.id) AS foodItemCount
FROM cuisine c
LEFT JOIN food_item f ON f.cuisineId = c.id
GROUP BY c.id, c.name
ORDER BY foodItemCount DESC, cuisineName;

/* 2. Category names ordered from the highest to the lowest number of food items.
   Expected: 15 rows - Curry 3 first; Cake, Pasta, Salad and Sandwich 2 each; nine categories with 1;
   Paneer last with 0 (categories with no items are still listed). */
SELECT c.name AS categoryName,
       COUNT(f.id) AS foodItemCount
FROM category c
LEFT JOIN food_item f ON f.categoryId = c.id
GROUP BY c.id, c.name
ORDER BY foodItemCount DESC, categoryName;

/* 3. CuisineName, FoodItemName and Description of all food items in the 'Italian' cuisine.
   Expected: 4 rows - Spicy Arrabiata Penne, Salmon Prawn Risotto, Chicken Alfredo, Veg Pizza. */
SELECT c.name AS CuisineName,
       f.name AS FoodItemName,
       f.description AS Description
FROM food_item f
JOIN cuisine c ON c.id = f.cuisineId
WHERE c.name = 'Italian';

/* 4. Name, vegetarian status and cuisine name of the vegetarian food items.
   Expected: 13 rows. */
SELECT f.name AS foodItemName,
       f.isVeg,
       c.name AS cuisineName
FROM food_item f
JOIN cuisine c ON c.id = f.cuisineId
WHERE f.isVeg = 1
ORDER BY f.id;

/* 5. Users who have items in an active cart, with the total cart amount
   (sum of price x units over the cart's items).
   Expected: 3 rows - John Doe 270.00, Jane Doe 140.00, Bob Smith 100.00.
   Uses the price stored on cart_items (the price when the item was added), which
   matches the cart's orderTotalPrice. */
SELECT u.id AS userId,
       u.userName,
       u.fullName,
       u.emailId,
       SUM(ci.foodItemPrice * ci.unitsInCart) AS totalOrderAmount
FROM `user` u
JOIN cart       c  ON c.userId = u.id AND c.isActive = 1
JOIN cart_items ci ON ci.cartId = c.id AND ci.isActive = 1
GROUP BY u.id, u.userName, u.fullName, u.emailId
ORDER BY u.id;
