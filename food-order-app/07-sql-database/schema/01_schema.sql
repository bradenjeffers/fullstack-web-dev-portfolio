/*
  Food Order App - MySQL 8 schema (13 tables)

  Entities
    user, user_session          registered users and their login sessions
    category, cuisine           lookup tables used to classify food items
    restaurant, food_item       who sells, and what can be sold
    menu, menu_items            a restaurant's menu and the price of each item on it
    cart, cart_items            a user's in-progress basket (one restaurant at a time)
    shipping_details, orders,
    order_items                 a placed order, where it ships, and what was bought

  Conventions
    - Every table has isActive (soft delete: rows are flagged inactive, not deleted),
      createdTs and updatedTs (updatedTs refreshes automatically on UPDATE).
    - Prices are DECIMAL(10,2). Prices are copied onto cart_items / order_items so
      an order keeps the price that was paid even if the menu price changes later.
    - Targets MySQL 8.0.16+ (CHECK constraints are enforced from that version) and
      8.0.13+ (functional index used for the "one active ..." rules).

  Running this file DROPs and re-creates every table in food_order_app.
*/

CREATE DATABASE IF NOT EXISTS `food_order_app`;
USE `food_order_app`;

/* Drop in reverse dependency order so the script can be re-run. */
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `shipping_details`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `menu`;
DROP TABLE IF EXISTS `food_item`;
DROP TABLE IF EXISTS `restaurant`;
DROP TABLE IF EXISTS `cuisine`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `user_session`;
DROP TABLE IF EXISTS `user`;

/* ---------- Users ---------- */

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `emailId` varchar(100) NOT NULL,
  `phoneNo` varchar(20) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_userName` (`userName`),
  UNIQUE KEY `uq_user_emailId` (`emailId`),
  CONSTRAINT `chk_user_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_session` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `sessionToken` varchar(200) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_session_token` (`sessionToken`),
  KEY `idx_user_session_userId` (`userId`),
  CONSTRAINT `fk_user_session_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `chk_user_session_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ---------- Catalogue ---------- */

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(200) NOT NULL,
  `image` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_name` (`name`),
  CONSTRAINT `chk_category_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cuisine` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cuisine_name` (`name`),
  CONSTRAINT `chk_cuisine_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `restaurant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `image` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_restaurant_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `food_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `categoryId` int NOT NULL,
  `cuisineId` int NOT NULL,
  `isVeg` tinyint(1) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_food_item_categoryId` (`categoryId`),
  KEY `idx_food_item_cuisineId` (`cuisineId`),
  CONSTRAINT `fk_food_item_category` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`),
  CONSTRAINT `fk_food_item_cuisine` FOREIGN KEY (`cuisineId`) REFERENCES `cuisine` (`id`),
  CONSTRAINT `chk_food_item_isVeg` CHECK (`isVeg` IN (0, 1)),
  CONSTRAINT `chk_food_item_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ---------- Menus ---------- */

/* A restaurant may keep old (inactive) menus but only one active menu at a time.
   The original design used UNIQUE (restaurantId, isActive), which wrongly also limited
   a restaurant to a single inactive menu; this functional index only constrains
   active rows (NULLs are never equal in a unique index). */
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurantId` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_menu_restaurantId` (`restaurantId`),
  UNIQUE KEY `uq_menu_one_active_per_restaurant` ((CASE WHEN `isActive` = 1 THEN `restaurantId` END)),
  CONSTRAINT `fk_menu_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`),
  CONSTRAINT `chk_menu_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menuId` int NOT NULL,
  `foodItemId` int NOT NULL,
  `foodItemPrice` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_menu_items_menu_food` (`menuId`, `foodItemId`),
  KEY `idx_menu_items_foodItemId` (`foodItemId`),
  CONSTRAINT `fk_menu_items_menu` FOREIGN KEY (`menuId`) REFERENCES `menu` (`id`),
  CONSTRAINT `fk_menu_items_food_item` FOREIGN KEY (`foodItemId`) REFERENCES `food_item` (`id`),
  CONSTRAINT `chk_menu_items_price` CHECK (`foodItemPrice` >= 0),
  CONSTRAINT `chk_menu_items_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ---------- Carts ---------- */

/* One active cart per user (same functional-index approach as menu). */
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `restaurantId` int NOT NULL,
  `orderTotalPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_userId` (`userId`),
  KEY `idx_cart_restaurantId` (`restaurantId`),
  UNIQUE KEY `uq_cart_one_active_per_user` ((CASE WHEN `isActive` = 1 THEN `userId` END)),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_cart_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`),
  CONSTRAINT `chk_cart_total` CHECK (`orderTotalPrice` >= 0),
  CONSTRAINT `chk_cart_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int NOT NULL,
  `foodItemId` int NOT NULL,
  `foodItemPrice` decimal(10,2) NOT NULL,
  `unitsInCart` int NOT NULL DEFAULT 1,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_items_cart_food` (`cartId`, `foodItemId`),
  KEY `idx_cart_items_foodItemId` (`foodItemId`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`),
  CONSTRAINT `fk_cart_items_food_item` FOREIGN KEY (`foodItemId`) REFERENCES `food_item` (`id`),
  CONSTRAINT `chk_cart_items_price` CHECK (`foodItemPrice` >= 0),
  CONSTRAINT `chk_cart_items_units` CHECK (`unitsInCart` > 0),
  CONSTRAINT `chk_cart_items_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* ---------- Orders ---------- */

CREATE TABLE `shipping_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shippingAddress` varchar(200) NOT NULL,
  `emailId` varchar(100) NOT NULL,
  `phoneNo` varchar(20) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_shipping_details_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/* Named `orders` (not `order`) so it does not collide with the reserved word ORDER. */
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `restaurantId` int NOT NULL,
  `orderTotalPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shippingDetailsId` int NOT NULL,
  `orderStatus` enum('PROCESSING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_userId` (`userId`),
  KEY `idx_orders_restaurantId` (`restaurantId`),
  KEY `idx_orders_shippingDetailsId` (`shippingDetailsId`),
  KEY `idx_orders_updatedTs` (`updatedTs`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_orders_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`id`),
  CONSTRAINT `fk_orders_shipping_details` FOREIGN KEY (`shippingDetailsId`) REFERENCES `shipping_details` (`id`),
  CONSTRAINT `chk_orders_total` CHECK (`orderTotalPrice` >= 0),
  CONSTRAINT `chk_orders_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `foodItemId` int NOT NULL,
  `foodItemPrice` decimal(10,2) NOT NULL,
  `unitsPurchased` int NOT NULL DEFAULT 1,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTs` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_items_order_food` (`orderId`, `foodItemId`),
  KEY `idx_order_items_foodItemId` (`foodItemId`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_food_item` FOREIGN KEY (`foodItemId`) REFERENCES `food_item` (`id`),
  CONSTRAINT `chk_order_items_price` CHECK (`foodItemPrice` >= 0),
  CONSTRAINT `chk_order_items_units` CHECK (`unitsPurchased` > 0),
  CONSTRAINT `chk_order_items_isActive` CHECK (`isActive` IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
