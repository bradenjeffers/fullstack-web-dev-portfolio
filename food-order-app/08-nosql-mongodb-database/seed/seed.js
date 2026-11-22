/*
  Seed script for the Food Order App MongoDB database.

  Run with mongosh (from this folder):
      mongosh "mongodb://localhost:27017" seed/seed.js
  or from inside a mongosh session:
      load("seed/seed.js")

  It drops and re-creates the 13 collections below in the database `FoodOrderAppDb`,
  inserts the demo documents, and creates indexes. It only touches those collections.

  Document shape (matches the original Compass screenshots in docs/screenshots):
    - `_id` is the ObjectId MongoDB generates; `id` is a string business key ("1", "2", ...).
    - Relations are stored as the *string* `id` of the other document (e.g. cuisineId: "7"),
      NOT as an ObjectId. Queries therefore join on `.id`, not `._id`.
    - Every document has isActive, createdTs and updatedTs.
  Not carried over from the original: Mongoose's `__v` version key, the duplicate copies of
  every document (the original database held each document twice because the load ran twice),
  and plaintext passwords (see users below).
*/

const seedDbName = "FoodOrderAppDb";
const seedDb = db.getSiblingDB(seedDbName);

const T0 = new Date("2023-12-12T17:18:03.000Z"); // load timestamp shown in the screenshots

// Adds isActive/createdTs/updatedTs; a document may supply its own timestamps via __ts.
const meta = (docs) =>
  docs.map(({ __ts, ...doc }) => ({ ...doc, isActive: true, createdTs: T0, updatedTs: T0, ...__ts }));

// indexes: each entry is a key spec, or [keySpec, options].
function loadCollection(name, docs, indexes = []) {
  seedDb.getCollection(name).drop();
  const res = seedDb.getCollection(name).insertMany(docs);
  seedDb.getCollection(name).createIndex({ id: 1 }, { unique: true });
  indexes.forEach((ix) => {
    const [spec, options] = Array.isArray(ix) ? ix : [ix];
    seedDb.getCollection(name).createIndex(spec, options);
  });
  print(`${name}: inserted ${Object.keys(res.insertedIds).length}`);
}

// users: the original stored plaintext `password` values (e.g. "password123"); these are
// fake bcrypt-shaped placeholders instead. `isAdmin` is in the original documents.
// phoneNo is a number in the original (so the leading 0 of 09854321 was lost); kept as shown.
loadCollection("users", meta([
  { id: "1", userName: "john.doe", fullName: "John Doe", emailId: "john.doe@example.com", phoneNo: 12345890, passwordHash: "$2b$10$DEMOPLACEHOLDERNOTAREALHASH01xxxxxxxxxxxxxxxxxxxxxxxx", isAdmin: true },
  { id: "2", userName: "jane.doe", fullName: "Jane Doe", emailId: "jane.doe@example.com", phoneNo: 9854321, passwordHash: "$2b$10$DEMOPLACEHOLDERNOTAREALHASH02xxxxxxxxxxxxxxxxxxxxxxxx", isAdmin: false },
  { id: "3", userName: "bob.smith", fullName: "Bob Smith", emailId: "bob.smith@example.com", phoneNo: 5234567, passwordHash: "$2b$10$DEMOPLACEHOLDERNOTAREALHASH03xxxxxxxxxxxxxxxxxxxxxxxx", isAdmin: false }
]), [[{ userName: 1 }, { unique: true }], [{ emailId: 1 }, { unique: true }]]);

loadCollection("usersessions", meta([
  { id: "1", userId: "1", sessionToken: "sessionToken123" },
  { id: "2", userId: "2", sessionToken: "sessionToken456" },
  { id: "3", userId: "3", sessionToken: "sessionToken789" }
]), [{ userId: 1 }]);

loadCollection("categories", meta([
  { id: "1", name: "Pizza", description: "Mouthwatering slices of cheesy goodness, baked to perfection.", image: "https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg" },
  { id: "2", name: "Pasta", description: "Deliciously sauced strands of pasta, cooked al dente for the perfect bite.", image: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg" },
  { id: "3", name: "Icecream", description: "Creamy frozen treats in a rainbow of flavors to satisfy your sweet cravings.", image: "https://cdn.pixabay.com/photo/2018/08/16/22/59/ice-cream-3611698_1280.jpg" },
  { id: "4", name: "Cake", description: "Indulgent layers of moist cake, frosted with heavenly flavors and artistic designs.", image: "https://www.themealdb.com/images/media/meals/ldnrm91576791881.jpg" },
  { id: "5", name: "Soup", description: "Warm bowls of comforting goodness, brimming with flavorful broths and fresh ingredients.", image: "https://www.themealdb.com/images/media/meals/1529446137.jpg" },
  { id: "6", name: "Curry", description: "Aromatic and spicy creations from around the world, guaranteed to tantalize your taste buds.", image: "https://www.themealdb.com/images/media/meals/sywrsu1511463066.jpg" },
  { id: "7", name: "Sandwich", description: "Stacked with fresh ingredients, these handcrafted delights are perfect for a quick and satisfying meal.", image: "https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg" },
  { id: "8", name: "Salad", description: "Crisp and refreshing mixtures of vibrant greens, colorful vegetables, and zesty dressings for a healthy feast.", image: "https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg" },
  { id: "9", name: "Sushi", description: "Artfully crafted bites of fresh fish, rice, and seaweed, a symphony of flavors in every bite.", image: "https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg" },
  { id: "10", name: "Rolls", description: "Delightfully wrapped rolls filled with a variety of ingredients, making every bite an explosion of flavors.", image: "https://cdn.pixabay.com/photo/2018/03/15/12/16/food-3228057_1280.jpg" },
  { id: "11", name: "Prawns", description: "Juicy and succulent prawns, expertly seasoned and cooked to perfection, a seafood lover's delight.", image: "https://cdn.pixabay.com/photo/2020/10/18/17/17/meal-5665508_1280.jpg" },
  { id: "12", name: "Paneer", description: "Soft and creamy cubes of Indian cottage cheese, cooked in a rich and aromatic blend of spices.", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1017&q=80" },
  { id: "13", name: "Tofu", description: "Versatile and protein-packed, tofu dishes offer a healthy and satisfying alternative to meat.", image: "https://cdn.pixabay.com/photo/2016/01/15/06/57/vegetarian-1141242_1280.jpg" },
  { id: "14", name: "Noodles", description: "Slurp-worthy bowls of steaming noodles, tossed in savory sauces and loaded with fresh ingredients.", image: "https://cdn.pixabay.com/photo/2020/02/15/20/38/noodles-4851996_1280.jpg" },
  { id: "15", name: "Chicken", description: "Tender and juicy chicken dishes prepared in a variety of styles, from crispy fried to succulent grilled options.", image: "https://www.themealdb.com/images/media/meals/hglsbl1614346998.jpg" }
]), [{ name: 1 }]);

loadCollection("cuisines", meta([
  { id: "1", name: "Italian", description: "Mouthwatering slices of cheesy goodness, baked to perfection.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Collage_cucina_italiana.jpg/300px-Collage_cucina_italiana.jpg" },
  { id: "2", name: "Indian", description: "Discover the diverse and vibrant flavors of India, from aromatic curries to sizzling tandoori dishes and mouthwatering biryanis.", image: "https://cdn.pixabay.com/photo/2018/12/04/16/49/indian-food-3856050_1280.jpg" },
  { id: "3", name: "Chinese", description: "Embark on a culinary journey through China with savory stir-fries, delectable dumplings, and aromatic fried rice.", image: "https://cdn.pixabay.com/photo/2016/02/22/17/05/food-1216048_1280.jpg" },
  { id: "4", name: "Japanese", description: "Savor the delicate artistry of Japanese cuisine with fresh sushi, savory ramen, and perfectly grilled teriyaki delights.", image: "https://cdn.pixabay.com/photo/2015/02/17/07/54/sushi-639105_1280.jpg" },
  { id: "5", name: "Thai", description: "Indulge in the exotic and harmonious flavors of Thailand, from fragrant curries to zesty stir-fries and tangy, sweet-sour delights.", image: "https://cdn.pixabay.com/photo/2016/10/13/05/16/thai-curry-1736806_1280.jpg" },
  { id: "6", name: "Mexican", description: "Spice up your taste buds with vibrant Mexican flavors, from sizzling fajitas to zesty guacamole and refreshing margaritas.", image: "https://cdn.pixabay.com/photo/2019/04/14/03/08/burrito-4126108_1280.jpg" },
  { id: "7", name: "American", description: "Experience the classic tastes of America with juicy burgers, crispy fried chicken, and all-American favorites like mac and cheese.", image: "https://cdn.pixabay.com/photo/2014/09/18/21/17/sandwich-451403_1280.jpg" },
  { id: "8", name: "French", description: "Indulge in the elegance of French cuisine with delicate pastries, rich sauces, and gourmet classics like Coq au Vin and Ratatouille.", image: "https://cdn.pixabay.com/photo/2016/11/22/19/31/macarons-1850216_1280.jpg" },
  { id: "9", name: "Greek", description: "Indulge in the simple yet delicious flavors of Greece, from tangy tzatziki and tender souvlaki to crispy spanakopita and sweet baklava.", image: "https://cdn.pixabay.com/photo/2021/01/10/04/37/salad-5904093_1280.jpg" },
  { id: "10", name: "Turkish", description: "Delight in the rich and aromatic flavors of Turkish cuisine, from succulent kebabs and flavorful mezes to mouthwatering baklava and traditional Turkish tea.", image: "https://cdn.pixabay.com/photo/2016/09/06/14/23/authentic-greek-1649223_1280.jpg" }
]), [{ name: 1 }]);

loadCollection("restaurants", meta([
  { id: "1", name: "Flavor Fusion", address: "123 Main Street, New York, NY 10001", contact: 12583690, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60" },
  { id: "2", name: "Tasty Haven", address: "456 Elm Avenue, Los Angeles, CA 90001", contact: 4836383, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60" },
  { id: "3", name: "Gourmet Junction", address: "789 Oak Street, Chicago, IL 60601", contact: 173734, image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60" },
  { id: "4", name: "Savory Delights", address: "321 Maple Drive, Houston, TX 77001", contact: 9736234, image: "https://images.pexels.com/photos/827528/pexels-photo-827528.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "5", name: "The Hungry Palette", address: "987 Pine Street, Miami, FL 33101", contact: 372824, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60" },
  { id: "6", name: "Culinary Oasis", address: "654 Cedar Lane, San Francisco, CA 94101", contact: 137473, image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60" },
  { id: "7", name: "Flavor Symphony", address: "321 Walnut Avenue, Boston, MA 02101", contact: 847223, image: "https://images.pexels.com/photos/2956952/pexels-photo-2956952.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "8", name: "Greenleaf Restaurant", address: "789 Broadway, Seattle, WA 98101", contact: 828292, image: "https://images.pexels.com/photos/6126306/pexels-photo-6126306.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "9", name: "Spice Junction", address: "234 Cherry Street, Atlanta, GA 30301", contact: 228484, image: "https://cdn.pixabay.com/photo/2020/08/27/07/31/restaurant-5521372_1280.jpg" },
  { id: "10", name: "The Food Town", address: "567 Elmwood Road, Denver, CO 80201", contact: 9363344, image: "https://cdn.pixabay.com/photo/2016/11/21/16/02/outdoor-dining-1846137_1280.jpg" }
]), [{ name: 1 }]);

// isVeg is false for the chicken, prawn, salmon dishes (ids 4, 6, 10, 15, 16, 17, 18); the screenshot of item 4 shows false.
loadCollection("fooditems", meta([
  { id: "1", name: "Cabbage Roll", description: "Savory parcels of goodness, stuffed with a flavorful medley.", image: "https://www.themealdb.com/images/media/meals/q8sp3j1593349686.jpg", categoryId: "10", cuisineId: "10", isVeg: true },
  { id: "2", name: "Grill Mac & Cheese Sandwich", description: "Indulgent fusion of cheesy comfort and crispy perfection.", image: "https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg", categoryId: "7", cuisineId: "7", isVeg: true },
  { id: "3", name: "New York Cheesecake", description: "A slice of velvety bliss from the Big Apple's finest.", image: "https://www.themealdb.com/images/media/meals/swttys1511385853.jpg", categoryId: "4", cuisineId: "7", isVeg: true },
  { id: "4", name: "Nutty Chicken Curry", description: "A tantalizing dance of flavors, where nuttiness meets spicy delight.", image: "https://www.themealdb.com/images/media/meals/swttys1511385853.jpg", categoryId: "6", cuisineId: "2", isVeg: false },
  { id: "5", name: "Spicy Arrabiata Penne", description: "Fiery pasta perfection that will ignite your taste buds.", image: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg", categoryId: "2", cuisineId: "1", isVeg: true },
  { id: "6", name: "Salmon Prawn Risotto", description: "Creamy risotto kissed by the sea, with succulent salmon and plump prawns.", image: "https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg", categoryId: "11", cuisineId: "1", isVeg: false },
  { id: "7", name: "Egg Drop Soup", description: "A warm embrace of silky broth and delicate egg ribbons.", image: "https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg", categoryId: "5", cuisineId: "3", isVeg: true },
  { id: "8", name: "Dal Fry", description: "A fragrant bowl of golden lentils, simmered to perfection.", image: "https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg", categoryId: "6", cuisineId: "2", isVeg: true },
  { id: "9", name: "Chocolate Souffle", description: "A decadent masterpiece of airy chocolate delight that melts in your mouth.", image: "https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg", categoryId: "4", cuisineId: "8", isVeg: true },
  { id: "10", name: "Chic-Fil-A Sandwich", description: "The epitome of crispy, juicy chicken goodness, served with love.", image: "https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg", categoryId: "7", cuisineId: "7", isVeg: false },
  { id: "11", name: "Thai Green Curry", description: "A harmonious blend of vibrant Thai herbs and spices in a creamy green curry.", image: "https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg", categoryId: "6", cuisineId: "5", isVeg: true },
  { id: "12", name: "Ma Po Tofu", description: "Szechuan delight with silky tofu and a spicy kick that will leave you craving more.", image: "https://www.themealdb.com/images/media/meals/1525874812.jpg", categoryId: "13", cuisineId: "3", isVeg: true },
  { id: "13", name: "Breakfast Potatoes", description: "Golden-brown potatoes, seasoned to perfection, adding flair to your morning.", image: "https://www.themealdb.com/images/media/meals/1550441882.jpg", categoryId: "8", cuisineId: "7", isVeg: true },
  { id: "14", name: "Ratatouille", description: "A melody of fresh vegetables harmoniously simmered into a rustic masterpiece.", image: "https://www.themealdb.com/images/media/meals/1550441882.jpg", categoryId: "8", cuisineId: "8", isVeg: true },
  { id: "15", name: "Chicken Alfredo", description: "Creamy pasta perfection with al dente fettuccine coated in velvety Alfredo sauce.", image: "https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg", categoryId: "2", cuisineId: "1", isVeg: false },
  { id: "16", name: "Prawn Noodles", description: "Succulent prawns meet fragrant noodles, delivering an explosion of flavors.", image: "https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg", categoryId: "14", cuisineId: "3", isVeg: false },
  { id: "17", name: "Chicken Baked Tacos", description: "Refried beans, ground chicken and sour cream.", image: "https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg", categoryId: "15", cuisineId: "6", isVeg: false },
  { id: "18", name: "Salmon Sushi", description: "Sushi rice topped with smoked salmon.", image: "https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg", categoryId: "9", cuisineId: "4", isVeg: false },
  { id: "19", name: "Veg Pizza", description: "Mouthwatering pizza made of fresh veggies.", image: "https://images.unsplash.com/photo-1604917869287-3ae73c77e227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwcGl6emF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60", categoryId: "1", cuisineId: "1", isVeg: true },
  { id: "20", name: "Berry Icecream", description: "Made with plain greek yoghurt mixed with berries and vanilla cream.", image: "https://images.unsplash.com/photo-1627222295124-f8b3fc09e47f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGljZWNyZWFtfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60", categoryId: "3", cuisineId: "9", isVeg: true }
]), [{ categoryId: 1 }, { cuisineId: 1 }, { isVeg: 1 }]);

loadCollection("menus", meta([
  { id: "1", restaurantId: "1" },
  { id: "2", restaurantId: "2" },
  { id: "3", restaurantId: "3" },
  { id: "4", restaurantId: "4" },
  { id: "5", restaurantId: "5" },
  { id: "6", restaurantId: "6" },
  { id: "7", restaurantId: "7" },
  { id: "8", restaurantId: "8" },
  { id: "9", restaurantId: "9" },
  { id: "10", restaurantId: "10" }
]), [{ restaurantId: 1 }]);

loadCollection("menuitems", meta([
  { id: "1", menuId: "1", fooditemId: "1", fooditemPrice: 10 },
  { id: "2", menuId: "1", fooditemId: "4", fooditemPrice: 15 },
  { id: "3", menuId: "1", fooditemId: "8", fooditemPrice: 10 },
  { id: "4", menuId: "1", fooditemId: "11", fooditemPrice: 12 },
  { id: "5", menuId: "1", fooditemId: "17", fooditemPrice: 25 },
  { id: "6", menuId: "2", fooditemId: "1", fooditemPrice: 12 },
  { id: "7", menuId: "2", fooditemId: "3", fooditemPrice: 22 },
  { id: "8", menuId: "2", fooditemId: "6", fooditemPrice: 17 },
  { id: "9", menuId: "2", fooditemId: "12", fooditemPrice: 24 },
  { id: "10", menuId: "2", fooditemId: "15", fooditemPrice: 15 },
  { id: "11", menuId: "3", fooditemId: "4", fooditemPrice: 10 },
  { id: "12", menuId: "3", fooditemId: "5", fooditemPrice: 25 },
  { id: "13", menuId: "3", fooditemId: "13", fooditemPrice: 14 },
  { id: "14", menuId: "3", fooditemId: "20", fooditemPrice: 12 },
  { id: "15", menuId: "4", fooditemId: "2", fooditemPrice: 12 },
  { id: "16", menuId: "4", fooditemId: "9", fooditemPrice: 15 },
  { id: "17", menuId: "4", fooditemId: "10", fooditemPrice: 25 },
  { id: "18", menuId: "5", fooditemId: "16", fooditemPrice: 35 },
  { id: "19", menuId: "6", fooditemId: "18", fooditemPrice: 30 },
  { id: "20", menuId: "7", fooditemId: "19", fooditemPrice: 25 },
  { id: "21", menuId: "8", fooditemId: "16", fooditemPrice: 32 },
  { id: "22", menuId: "8", fooditemId: "19", fooditemPrice: 34 },
  { id: "23", menuId: "9", fooditemId: "18", fooditemPrice: 32 },
  { id: "24", menuId: "9", fooditemId: "19", fooditemPrice: 30 },
  { id: "25", menuId: "10", fooditemId: "10", fooditemPrice: 30 }
]), [{ menuId: 1 }, { fooditemId: 1 }]);

loadCollection("carts", meta([
  { id: "1", userId: "1", restaurantId: "3", orderTotalPrice: 270 },
  { id: "2", userId: "2", restaurantId: "4", orderTotalPrice: 140 },
  { id: "3", userId: "3", restaurantId: "7", orderTotalPrice: 100 }
]), [{ userId: 1 }]);

// Note: the source data has no cart item with id "5" (ids jump from 4 to 6), as in the SQL version.
loadCollection("cartitems", meta([
  { id: "1", cartId: "1", fooditemId: "4", fooditemPrice: 10, unitsInCart: 4 },
  { id: "2", cartId: "1", fooditemId: "5", fooditemPrice: 25, unitsInCart: 4 },
  { id: "3", cartId: "1", fooditemId: "13", fooditemPrice: 14, unitsInCart: 5 },
  { id: "4", cartId: "1", fooditemId: "20", fooditemPrice: 12, unitsInCart: 5 },
  { id: "6", cartId: "2", fooditemId: "2", fooditemPrice: 12, unitsInCart: 5 },
  { id: "7", cartId: "2", fooditemId: "9", fooditemPrice: 15, unitsInCart: 2 },
  { id: "8", cartId: "2", fooditemId: "10", fooditemPrice: 25, unitsInCart: 2 },
  { id: "9", cartId: "3", fooditemId: "19", fooditemPrice: 25, unitsInCart: 4 }
]), [{ cartId: 1 }]);

loadCollection("shippingdetails", meta([
  { id: "1", shippingAddress: "123 Main St, Anytown USA", emailId: "johndoe@example.com", phoneNo: 5551234 },
  { id: "2", shippingAddress: "456 Oak St, Anytown USA", emailId: "janedoe@example.com", phoneNo: 5555678 },
  { id: "3", shippingAddress: "789 Elm St, Anytown USA", emailId: "bob@example.com", phoneNo: 5559012 }
]));

// Order timestamps are the ones shown in the screenshots. Order 2 is dated 2022 there while its
// order item is dated 2023; that looks like a typo in the original but is kept as shown
// (the SQL version in ../07-sql-database uses 2023 for both).
loadCollection("orders", meta([
  { id: "1", userId: "1", restaurantId: "2", orderTotalPrice: 160, shippingDetailsId: "1", orderStatus: "PROCESSING", __ts: { createdTs: new Date("2023-05-11T15:00:00Z"), updatedTs: new Date("2023-05-11T15:00:00Z") } },
  { id: "2", userId: "2", restaurantId: "5", orderTotalPrice: 70, shippingDetailsId: "2", orderStatus: "SHIPPED", __ts: { createdTs: new Date("2022-05-09T17:00:00Z"), updatedTs: new Date("2022-05-09T18:00:00Z") } },
  { id: "3", userId: "3", restaurantId: "10", orderTotalPrice: 90, shippingDetailsId: "3", orderStatus: "DELIVERED", __ts: { createdTs: new Date("2023-05-08T10:00:00Z"), updatedTs: new Date("2023-05-08T12:00:00Z") } }
]), [{ userId: 1 }, { createdTs: 1 }, { orderTotalPrice: 1 }]);

// Order item 6 (order 3) is not visible in the screenshots; its price (30) is taken from the menu so the order total (90) reconciles.
loadCollection("orderitems", meta([
  { id: "1", orderId: "1", fooditemId: "1", fooditemPrice: 12, unitsPurchased: 5, __ts: { createdTs: new Date("2023-05-11T15:00:00Z"), updatedTs: new Date("2023-05-11T15:00:00Z") } },
  { id: "2", orderId: "1", fooditemId: "3", fooditemPrice: 22, unitsPurchased: 1, __ts: { createdTs: new Date("2023-05-11T15:00:00Z"), updatedTs: new Date("2023-05-11T15:00:00Z") } },
  { id: "3", orderId: "1", fooditemId: "12", fooditemPrice: 24, unitsPurchased: 2, __ts: { createdTs: new Date("2023-05-11T15:00:00Z"), updatedTs: new Date("2023-05-11T15:00:00Z") } },
  { id: "4", orderId: "1", fooditemId: "15", fooditemPrice: 15, unitsPurchased: 2, __ts: { createdTs: new Date("2023-05-11T15:00:00Z"), updatedTs: new Date("2023-05-11T15:00:00Z") } },
  { id: "5", orderId: "2", fooditemId: "16", fooditemPrice: 35, unitsPurchased: 2, __ts: { createdTs: new Date("2023-05-09T17:00:00Z"), updatedTs: new Date("2023-05-09T17:00:00Z") } },
  { id: "6", orderId: "3", fooditemId: "10", fooditemPrice: 30, unitsPurchased: 3, __ts: { createdTs: new Date("2023-05-08T10:00:00Z"), updatedTs: new Date("2023-05-08T10:00:00Z") } }
]), [{ orderId: 1 }, { fooditemId: 1 }]);

print("Seed complete: database " + seedDbName);
