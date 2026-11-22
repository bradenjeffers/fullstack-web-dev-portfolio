/*
  Basic SELECT queries (filtering, LIKE, ORDER BY / LIMIT, simple aggregates)
  Run after schema/01_schema.sql and schema/02_seed_data.sql.

  The "Expected" notes describe the result on the supplied seed data.
*/
USE food_order_app;

/* 1. Display all distinct cuisine names.
   Expected: 10 rows (Italian, Indian, Chinese, Japanese, Thai, Mexican, American, French, Greek, Turkish). */
SELECT DISTINCT name AS cuisineName
FROM cuisine;

/* 2. Display the description of the 'Cake' category.
   Expected: 1 row - 'Indulgent layers of moist cake, frosted with heavenly flavors and artistic designs.' */
SELECT description
FROM category
WHERE name = 'Cake';

/* 3. Select all restaurants whose name ends with 'Junction'.
   Expected: 2 rows - Gourmet Junction (id 3), Spice Junction (id 9). */
SELECT *
FROM restaurant
WHERE name LIKE '%Junction';

/* 4. Display details of all vegetarian food items.
   Expected: 13 rows (20 items, 7 of them non-vegetarian). */
SELECT *
FROM food_item
WHERE isVeg = 1;

/* 5. Retrieve all menu items whose price is $10 or less, with the food item and restaurant.
   Expected: 3 rows - Cabbage Roll @ Flavor Fusion (10), Dal Fry @ Flavor Fusion (10),
   Nutty Chicken Curry @ Gourmet Junction (10).
   (Price lives on menu_items.foodItemPrice; the original query filtered a non-existent Menu.price.) */
SELECT mi.id AS menuItemId,
       r.name AS restaurantName,
       fi.name AS foodItemName,
       mi.foodItemPrice
FROM menu_items mi
JOIN menu       m  ON m.id = mi.menuId
JOIN restaurant r  ON r.id = m.restaurantId
JOIN food_item  fi ON fi.id = mi.foodItemId
WHERE mi.foodItemPrice <= 10
ORDER BY mi.id;

/* 6. Retrieve the cartId having the maximum number of food items (distinct items in the cart).
   Expected: cartId 1 (4 distinct items). Ties are broken by the lower cartId. */
SELECT cartId
FROM cart_items
GROUP BY cartId
ORDER BY COUNT(foodItemId) DESC, cartId
LIMIT 1;

/* 7. Retrieve all shipping details where emailId contains 'doe'.
   Expected: 2 rows - johndoe@example.com (id 1), janedoe@example.com (id 2). */
SELECT *
FROM shipping_details
WHERE emailId LIKE '%doe%';

/* 8. Retrieve the order with the highest price.
   Expected: order id 1, orderTotalPrice 160.00. */
SELECT *
FROM orders
ORDER BY orderTotalPrice DESC
LIMIT 1;

/* 9. Retrieve the most recently updated order.
   Expected: order id 1 (updatedTs 2023-05-11 10:00:00). */
SELECT *
FROM orders
ORDER BY updatedTs DESC
LIMIT 1;

/* 10. How many total units of food items were purchased in order 1?
   Expected: 10 (5 + 1 + 2 + 2). */
SELECT SUM(unitsPurchased) AS totalUnits
FROM order_items
WHERE orderId = 1;
