/*
  Food Order App - sample data

  Small demo dataset: 3 users, 15 categories, 10 cuisines, 10 restaurants,
  20 food items, 10 menus (25 menu items), 3 carts, 3 orders.
  Run 01_schema.sql first. Rows set isActive = 1 via the column default.

  All people, e-mail addresses, phone numbers and addresses are made up.
  passwordHash values are obviously fake bcrypt-shaped placeholders: they are NOT
  hashes of any real password, and no plaintext password is stored anywhere. An
  application would generate real hashes (e.g. bcrypt/argon2) at registration time.

  Changes from the original submission's data (the schema renames are in 01_schema.sql):
    - isVeg: the original flagged all 20 items as vegetarian, including chicken, prawn and
      salmon dishes; items 4, 6, 10, 15, 16, 17 and 18 are now isVeg = 0.
    - food item 3 name typo: "Cheescake" -> "Cheesecake".
    - order 2 used the year 2022 while its order_items used 2023 (typo); now 2023.
    - order_items row 6 stored a price of 10 although order 3 totals 90 for 3 units and
      menu_items lists that dish at 30; the price is now 30 so totals reconcile.
*/

USE `food_order_app`;


/* ---------- Users ---------- */
INSERT INTO `user` (`id`, `userName`, `fullName`, `emailId`, `phoneNo`, `passwordHash`)
VALUES
  (1, 'john.doe', 'John Doe', 'john.doe@example.com', '12345890', '$2b$10$DEMOPLACEHOLDERNOTAREALHASH01xxxxxxxxxxxxxxxxxxxxxxxx'),
  (2, 'jane.doe', 'Jane Doe', 'jane.doe@example.com', '09854321', '$2b$10$DEMOPLACEHOLDERNOTAREALHASH02xxxxxxxxxxxxxxxxxxxxxxxx'),
  (3, 'bob.smith', 'Bob Smith', 'bob.smith@example.com', '5234567', '$2b$10$DEMOPLACEHOLDERNOTAREALHASH03xxxxxxxxxxxxxxxxxxxxxxxx');

INSERT INTO `user_session` (`id`, `userId`, `sessionToken`)
VALUES
  (1, 1, 'demo-session-token-1'),
  (2, 2, 'demo-session-token-2'),
  (3, 3, 'demo-session-token-3');

/* ---------- Catalogue ---------- */

INSERT INTO `category` (`id`, `name`, `description`, `image`)
VALUES
  (1, 'Pizza', 'Mouthwatering slices of cheesy goodness, baked to perfection.', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg'),
  (2, 'Pasta', 'Deliciously sauced strands of pasta, cooked al dente for the perfect bite.', 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg'),
  (3, 'Icecream', 'Creamy frozen treats in a rainbow of flavors to satisfy your sweet cravings.', 'https://cdn.pixabay.com/photo/2018/08/16/22/59/ice-cream-3611698_1280.jpg'),
  (4, 'Cake', 'Indulgent layers of moist cake, frosted with heavenly flavors and artistic designs.', 'https://www.themealdb.com/images/media/meals/ldnrm91576791881.jpg'),
  (5, 'Soup', 'Warm bowls of comforting goodness, brimming with flavorful broths and fresh ingredients.', 'https://www.themealdb.com/images/media/meals/1529446137.jpg'),
  (6, 'Curry', 'Aromatic and spicy creations from around the world, guaranteed to tantalize your taste buds.', 'https://www.themealdb.com/images/media/meals/sywrsu1511463066.jpg'),
  (7, 'Sandwich', 'Stacked with fresh ingredients, these handcrafted delights are perfect for a quick and satisfying meal.', 'https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg'),
  (8, 'Salad', 'Crisp and refreshing mixtures of vibrant greens, colorful vegetables, and zesty dressings for a healthy feast.', 'https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg'),
  (9, 'Sushi', 'Artfully crafted bites of fresh fish, rice, and seaweed, a symphony of flavors in every bite.', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg'),
  (10, 'Rolls', 'Delightfully wrapped rolls filled with a variety of ingredients, making every bite an explosion of flavors.', 'https://cdn.pixabay.com/photo/2018/03/15/12/16/food-3228057_1280.jpg'),
  (11, 'Prawns', 'Juicy and succulent prawns, expertly seasoned and cooked to perfection, a seafood lover''s delight.', 'https://cdn.pixabay.com/photo/2020/10/18/17/17/meal-5665508_1280.jpg'),
  (12, 'Paneer', 'Soft and creamy cubes of Indian cottage cheese, cooked in a rich and aromatic blend of spices.', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1017&q=80'),
  (13, 'Tofu', 'Versatile and protein-packed, tofu dishes offer a healthy and satisfying alternative to meat.', 'https://cdn.pixabay.com/photo/2016/01/15/06/57/vegetarian-1141242_1280.jpg'),
  (14, 'Noodles', 'Slurp-worthy bowls of steaming noodles, tossed in savory sauces and loaded with fresh ingredients.', 'https://cdn.pixabay.com/photo/2020/02/15/20/38/noodles-4851996_1280.jpg'),
  (15, 'Chicken', 'Tender and juicy chicken dishes prepared in a variety of styles, from crispy fried to succulent grilled options.', 'https://www.themealdb.com/images/media/meals/hglsbl1614346998.jpg');

INSERT INTO `cuisine` (`id`, `name`, `description`, `image`)
VALUES
  (1, 'Italian', 'Mouthwatering slices of cheesy goodness, baked to perfection.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Collage_cucina_italiana.jpg/300px-Collage_cucina_italiana.jpg'),
  (2, 'Indian', 'Discover the diverse and vibrant flavors of India, from aromatic curries to sizzling tandoori dishes and mouthwatering biryanis.', 'https://cdn.pixabay.com/photo/2018/12/04/16/49/indian-food-3856050_1280.jpg'),
  (3, 'Chinese', 'Embark on a culinary journey through China with savory stir-fries, delectable dumplings, and aromatic fried rice.', 'https://cdn.pixabay.com/photo/2016/02/22/17/05/food-1216048_1280.jpg'),
  (4, 'Japanese', 'Savor the delicate artistry of Japanese cuisine with fresh sushi, savory ramen, and perfectly grilled teriyaki delights.', 'https://cdn.pixabay.com/photo/2015/02/17/07/54/sushi-639105_1280.jpg'),
  (5, 'Thai', 'Indulge in the exotic and harmonious flavors of Thailand, from fragrant curries to zesty stir-fries and tangy, sweet-sour delights.', 'https://cdn.pixabay.com/photo/2016/10/13/05/16/thai-curry-1736806_1280.jpg'),
  (6, 'Mexican', 'Spice up your taste buds with vibrant Mexican flavors, from sizzling fajitas to zesty guacamole and refreshing margaritas.', 'https://cdn.pixabay.com/photo/2019/04/14/03/08/burrito-4126108_1280.jpg'),
  (7, 'American', 'Experience the classic tastes of America with juicy burgers, crispy fried chicken, and all-American favorites like mac and cheese.', 'https://cdn.pixabay.com/photo/2014/09/18/21/17/sandwich-451403_1280.jpg'),
  (8, 'French', 'Indulge in the elegance of French cuisine with delicate pastries, rich sauces, and gourmet classics like Coq au Vin and Ratatouille.', 'https://cdn.pixabay.com/photo/2016/11/22/19/31/macarons-1850216_1280.jpg'),
  (9, 'Greek', 'Indulge in the simple yet delicious flavors of Greece, from tangy tzatziki and tender souvlaki to crispy spanakopita and sweet baklava.', 'https://cdn.pixabay.com/photo/2021/01/10/04/37/salad-5904093_1280.jpg'),
  (10, 'Turkish', 'Delight in the rich and aromatic flavors of Turkish cuisine, from succulent kebabs and flavorful mezes to mouthwatering baklava and traditional Turkish tea.', 'https://cdn.pixabay.com/photo/2016/09/06/14/23/authentic-greek-1649223_1280.jpg');

INSERT INTO `restaurant` (`id`, `name`, `address`, `contact`, `image`)
VALUES
  (1, 'Flavor Fusion', '123 Main Street, New York, NY 10001', '12583690', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'),
  (2, 'Tasty Haven', '456 Elm Avenue, Los Angeles, CA 90001', '4836383', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'),
  (3, 'Gourmet Junction', '789 Oak Street, Chicago, IL 60601', '173734', 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'),
  (4, 'Savory Delights', '321 Maple Drive, Houston, TX 77001', '9736234', 'https://images.pexels.com/photos/827528/pexels-photo-827528.jpeg?auto=compress&cs=tinysrgb&w=600'),
  (5, 'The Hungry Palette', '987 Pine Street, Miami, FL 33101', '372824', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60'),
  (6, 'Culinary Oasis', '654 Cedar Lane, San Francisco, CA 94101', '137473', 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60'),
  (7, 'Flavor Symphony', '321 Walnut Avenue, Boston, MA 02101', '847223', 'https://images.pexels.com/photos/2956952/pexels-photo-2956952.jpeg?auto=compress&cs=tinysrgb&w=600'),
  (8, 'Greenleaf Restaurant', '789 Broadway, Seattle, WA 98101', '828292', 'https://images.pexels.com/photos/6126306/pexels-photo-6126306.jpeg?auto=compress&cs=tinysrgb&w=600'),
  (9, 'Spice Junction', '234 Cherry Street, Atlanta, GA 30301', '228484', 'https://cdn.pixabay.com/photo/2020/08/27/07/31/restaurant-5521372_1280.jpg'),
  (10, 'The Food Town', '567 Elmwood Road, Denver, CO 80201', '9363344', 'https://cdn.pixabay.com/photo/2016/11/21/16/02/outdoor-dining-1846137_1280.jpg');

INSERT INTO `food_item` (`id`, `name`, `description`, `image`, `categoryId`, `cuisineId`, `isVeg`)
VALUES
  (1, 'Cabbage Roll', 'Savory parcels of goodness, stuffed with a flavorful medley.', 'https://www.themealdb.com/images/media/meals/q8sp3j1593349686.jpg', 10, 10, 1),
  (2, 'Grill Mac & Cheese Sandwich', 'Indulgent fusion of cheesy comfort and crispy perfection.', 'https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg', 7, 7, 1),
  (3, 'New York Cheesecake', 'A slice of velvety bliss from the Big Apple''s finest.', 'https://www.themealdb.com/images/media/meals/swttys1511385853.jpg', 4, 7, 1),
  (4, 'Nutty Chicken Curry', 'A tantalizing dance of flavors, where nuttiness meets spicy delight.', 'https://www.themealdb.com/images/media/meals/swttys1511385853.jpg', 6, 2, 0),
  (5, 'Spicy Arrabiata Penne', 'Fiery pasta perfection that will ignite your taste buds.', 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg', 2, 1, 1),
  (6, 'Salmon Prawn Risotto', 'Creamy risotto kissed by the sea, with succulent salmon and plump prawns.', 'https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg', 11, 1, 0),
  (7, 'Egg Drop Soup', 'A warm embrace of silky broth and delicate egg ribbons.', 'https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg', 5, 3, 1),
  (8, 'Dal Fry', 'A fragrant bowl of golden lentils, simmered to perfection.', 'https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg', 6, 2, 1),
  (9, 'Chocolate Souffle', 'A decadent masterpiece of airy chocolate delight that melts in your mouth.', 'https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg', 4, 8, 1),
  (10, 'Chic-Fil-A Sandwich', 'The epitome of crispy, juicy chicken goodness, served with love.', 'https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg', 7, 7, 0),
  (11, 'Thai Green Curry', 'A harmonious blend of vibrant Thai herbs and spices in a creamy green curry.', 'https://www.themealdb.com/images/media/meals/twspvx1511784937.jpg', 6, 5, 1),
  (12, 'Ma Po Tofu', 'Szechuan delight with silky tofu and a spicy kick that will leave you craving more.', 'https://www.themealdb.com/images/media/meals/1525874812.jpg', 13, 3, 1),
  (13, 'Breakfast Potatoes', 'Golden-brown potatoes, seasoned to perfection, adding flair to your morning.', 'https://www.themealdb.com/images/media/meals/1550441882.jpg', 8, 7, 1),
  (14, 'Ratatouille', 'A melody of fresh vegetables harmoniously simmered into a rustic masterpiece.', 'https://www.themealdb.com/images/media/meals/1550441882.jpg', 8, 8, 1),
  (15, 'Chicken Alfredo', 'Creamy pasta perfection with al dente fettuccine coated in velvety Alfredo sauce.', 'https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg', 2, 1, 0),
  (16, 'Prawn Noodles', 'Succulent prawns meet fragrant noodles, delivering an explosion of flavors.', 'https://www.themealdb.com/images/media/meals/syqypv1486981727.jpg', 14, 3, 0),
  (17, 'Chicken Baked Tacos', 'Refried beans, ground chicken and sour cream.', 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg', 15, 6, 0),
  (18, 'Salmon Sushi', 'Sushi rice topped with smoked salmon.', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg', 9, 4, 0),
  (19, 'Veg Pizza', 'Mouthwatering pizza made of fresh veggies.', 'https://images.unsplash.com/photo-1604917869287-3ae73c77e227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwcGl6emF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60', 1, 1, 1),
  (20, 'Berry Icecream', 'Made with plain greek yoghurt mixed with berries and vanilla cream.', 'https://images.unsplash.com/photo-1627222295124-f8b3fc09e47f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGljZWNyZWFtfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60', 3, 9, 1);

/* ---------- Menus ---------- */

INSERT INTO `menu` (`id`, `restaurantId`)
VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10);

INSERT INTO `menu_items` (`id`, `menuId`, `foodItemId`, `foodItemPrice`)
VALUES
  (1, 1, 1, 10),
  (2, 1, 4, 15),
  (3, 1, 8, 10),
  (4, 1, 11, 12),
  (5, 1, 17, 25),
  (6, 2, 1, 12),
  (7, 2, 3, 22),
  (8, 2, 6, 17),
  (9, 2, 12, 24),
  (10, 2, 15, 15),
  (11, 3, 4, 10),
  (12, 3, 5, 25),
  (13, 3, 13, 14),
  (14, 3, 20, 12),
  (15, 4, 2, 12),
  (16, 4, 9, 15),
  (17, 4, 10, 25),
  (18, 5, 16, 35),
  (19, 6, 18, 30),
  (20, 7, 19, 25),
  (21, 8, 16, 32),
  (22, 8, 19, 34),
  (23, 9, 18, 32),
  (24, 9, 19, 30),
  (25, 10, 10, 30);

/* ---------- Carts ---------- */

INSERT INTO `cart` (`id`, `userId`, `restaurantId`, `orderTotalPrice`)
VALUES
  (1, 1, 3, 270),
  (2, 2, 4, 140),
  (3, 3, 7, 100);

INSERT INTO `cart_items` (`id`, `cartId`, `foodItemId`, `foodItemPrice`, `unitsInCart`)
VALUES
  (1, 1, 4, 10, 4),
  (2, 1, 5, 25, 4),
  (3, 1, 13, 14, 5),
  (4, 1, 20, 12, 5),
  (6, 2, 2, 12, 5),
  (7, 2, 9, 15, 2),
  (8, 2, 10, 25, 2),
  (9, 3, 19, 25, 4);

/* ---------- Orders ---------- */

INSERT INTO `shipping_details` (`id`, `shippingAddress`, `emailId`, `phoneNo`)
VALUES
  (1, '123 Main St, Anytown USA', 'johndoe@example.com', '5551234'),
  (2, '456 Oak St, Anytown USA', 'janedoe@example.com', '5555678'),
  (3, '789 Elm St, Anytown USA', 'bob@example.com', '5559012');

INSERT INTO `orders` (`id`, `userId`, `restaurantId`, `orderTotalPrice`, `shippingDetailsId`, `orderStatus`, `createdTs`, `updatedTs`)
VALUES
  (1, 1, 2, 160, 1, 'PROCESSING', '2023-05-11 10:00:00', '2023-05-11 10:00:00'),
  (2, 2, 5, 70, 2, 'SHIPPED', '2023-05-09 12:00:00', '2023-05-09 13:00:00'),
  (3, 3, 10, 90, 3, 'DELIVERED', '2023-05-08 05:00:00', '2023-05-08 07:00:00');

INSERT INTO `order_items` (`id`, `orderId`, `foodItemId`, `foodItemPrice`, `unitsPurchased`, `createdTs`, `updatedTs`)
VALUES
  (1, 1, 1, 12, 5, '2023-05-11 10:00:00', '2023-05-11 10:00:00'),
  (2, 1, 3, 22, 1, '2023-05-11 10:00:00', '2023-05-11 10:00:00'),
  (3, 1, 12, 24, 2, '2023-05-11 10:00:00', '2023-05-11 10:00:00'),
  (4, 1, 15, 15, 2, '2023-05-11 10:00:00', '2023-05-11 10:00:00'),
  (5, 2, 16, 35, 2, '2023-05-09 12:00:00', '2023-05-09 12:00:00'),
  (6, 3, 10, 30, 3, '2023-05-08 05:00:00', '2023-05-08 05:00:00');
