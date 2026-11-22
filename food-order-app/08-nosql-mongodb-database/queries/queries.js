/*
  Task 2 queries for the Food Order App MongoDB database.

  Run after seed/seed.js:
      mongosh "mongodb://localhost:27017" queries/queries.js

  Notes
  - Collection names are the lowercase names Mongoose/Compass created: menuitems, cartitems,
    orderitems, shippingdetails, usersessions (the assessment headings wrote them in camelCase).
  - Relations hold the *string* `id` of the referenced document, so lookups join on `.id`.
    The submitted queries used `._id` (an ObjectId), which never matches those string values and
    returned nothing; they are fixed below.
  - The "Expected" comments describe the result on the supplied seed data.
*/

const appDb = db.getSiblingDB("FoodOrderAppDb");

function show(title, result) {
  print(`\n--- ${title}`);
  printjson(result && typeof result.toArray === "function" ? result.toArray() : result);
}

// findOne() returns null when nothing matches; fail with a useful message instead of a TypeError.
function mustFind(doc, what) {
  if (!doc) throw new Error(`${what} not found - did you run seed/seed.js?`);
  return doc;
}

// 1. All distinct category names.
// Expected: 15 names (Pizza ... Chicken).
show("1. Distinct category names", appDb.categories.distinct("name"));

// 2. All vegetarian food items.
// Expected: 13 documents.
show("2. Vegetarian food items", appDb.fooditems.find({ isVeg: true }));

// 3. Name and address of each restaurant (without _id).
// Expected: 10 documents.
show("3. Restaurant names and addresses", appDb.restaurants.find({}, { name: 1, address: 1, _id: 0 }));

// 4. Orders with orderTotalPrice between $75 and $150 (inclusive).
// Expected: 1 order (id "3", total 90).
show("4. Orders between $75 and $150", appDb.orders.find({ orderTotalPrice: { $gte: 75, $lte: 150 } }));

// 5. Orders created after 10 May 2023.
// Expected: 1 order (id "1", created 2023-05-11).
show("5. Orders created after 10 May 2023", appDb.orders.find({ createdTs: { $gt: new Date("2023-05-10T00:00:00Z") } }));

// 6. All food items belonging to the Italian cuisine.
// Expected: 4 items (Spicy Arrabiata Penne, Salmon Prawn Risotto, Chicken Alfredo, Veg Pizza).
const italian = mustFind(appDb.cuisines.findOne({ name: "Italian" }), "Cuisine 'Italian'");
show("6. Italian food items", appDb.fooditems.find({ cuisineId: italian.id }));

// 7. All menu items available at the restaurant "Gourmet Junction" (restaurant -> menu -> menu items).
// Expected: 4 menu items (food items "4", "5", "13", "20").
const restaurant = mustFind(appDb.restaurants.findOne({ name: "Gourmet Junction" }), "Restaurant 'Gourmet Junction'");
const menu = mustFind(appDb.menus.findOne({ restaurantId: restaurant.id, isActive: true }), "Menu for 'Gourmet Junction'");
show("7. Menu items at Gourmet Junction", appDb.menuitems.find({ menuId: menu.id }));

// 8. The order with the lowest orderTotalPrice.
// Expected: order id "2" (total 70).
show("8. Cheapest order", appDb.orders.find().sort({ orderTotalPrice: 1 }).limit(1));

// 9. Number of menu items for the food item "Veg Pizza" (how many menus list it).
// Expected: 3 (menus "7", "8" and "9").
const pizza = mustFind(appDb.fooditems.findOne({ name: "Veg Pizza" }), "Food item 'Veg Pizza'");
show("9. Menu items for Veg Pizza", appDb.menuitems.countDocuments({ fooditemId: pizza.id }));

// 10. The id of the cart with the most food items (ties broken by lower cartId).
// Expected: { _id: "1", itemCount: 4 }.
show("10. Cart with the most items", appDb.cartitems.aggregate([
  { $group: { _id: "$cartId", itemCount: { $sum: 1 } } },
  { $sort: { itemCount: -1, _id: 1 } },
  { $limit: 1 },
]));
