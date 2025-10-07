-- Sample data for shopping website
-- Insert sample data for testing and development

USE shopping_website;

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and gadgets', 'https://kntn.ly/4d7c7445'),
('Clothing', 'Fashion and apparel', 'https://kntn.ly/8735f6bb'),
('Home & Garden', 'Home improvement and garden supplies', 'https://m.media-amazon.com/images/I/912jssUWcHL.jpg'),
('Sports', 'Sports equipment and accessories', 'https://kntn.ly/47296a2a'),
('Books', 'Books and educational materials', 'https://kntn.ly/05f07184');

-- Insert subcategories
INSERT INTO categories (name, description, parent_id) VALUES
('Smartphones', 'Mobile phones and accessories', 1),
('Laptops', 'Laptop computers and accessories', 1),
('Headphones', 'Audio equipment and headphones', 1),
('Men\'s Clothing', 'Men\'s fashion and apparel', 2),
('Women\'s Clothing', 'Women\'s fashion and apparel', 2),
('Kids\' Clothing', 'Children\'s clothing', 2);

-- Insert sample products
INSERT INTO products (name, description, price, discount_price, sku, stock_quantity, category_id, brand, weight, dimensions, is_featured) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced camera system', 999.99, 899.99, 'IPH15PRO-128', 50, 6, 'Apple', 0.187, '6.1" x 2.78" x 0.32"', TRUE),
('MacBook Air M2', 'Lightweight laptop with M2 chip', 1199.99, NULL, 'MBA-M2-256', 25, 7, 'Apple', 1.24, '11.97" x 8.46" x 0.44"', TRUE),
('Sony WH-1000XM5', 'Noise-canceling wireless headphones', 399.99, 349.99, 'SONY-WH1000XM5', 100, 8, 'Sony', 0.25, '8.7" x 10.3" x 3.0"', FALSE),
('Nike Air Max 270', 'Comfortable running shoes', 150.00, 120.00, 'NIKE-AM270-10', 75, 9, 'Nike', 0.8, 'Size 10', TRUE),
('Adidas Ultraboost 22', 'Premium running shoes', 180.00, NULL, 'ADIDAS-UB22-9', 60, 9, 'Adidas', 0.75, 'Size 9', FALSE),
('Levi\'s 501 Jeans', 'Classic straight-fit jeans', 89.99, 69.99, 'LEVIS-501-32', 120, 9, 'Levi\'s', 0.6, '32" waist', FALSE),
('Samsung Galaxy S24', 'Android smartphone with AI features', 799.99, 699.99, 'SAMSUNG-S24-128', 40, 6, 'Samsung', 0.168, '6.2" x 2.79" x 0.30"', TRUE),
('Dell XPS 13', 'Premium ultrabook laptop', 1099.99, 999.99, 'DELL-XPS13-512', 30, 7, 'Dell', 1.27, '11.9" x 7.8" x 0.58"', FALSE),
('Google Pixel 8', 'Pixel 8 with excellent camera and clean Android', 749.00, 699.00, 'PIXEL8-128', 45, 6, 'Google', 0.187, '6.2" display', TRUE),
('OnePlus 12', 'Flagship killer with fast performance', 699.00, NULL, 'OP12-256', 35, 6, 'OnePlus', 0.19, '6.7" display', FALSE),
('HP Spectre x360', 'Convertible ultrabook with OLED screen', 1399.00, 1299.00, 'HPS-13-OLED', 20, 7, 'HP', 1.3, '13"', TRUE),
('ASUS ROG Zephyrus G14', 'Compact gaming laptop', 1699.00, NULL, 'ROG-G14', 15, 7, 'ASUS', 1.6, '14"', FALSE),
('Bose QC45', 'Comfortable noise cancelling headphones', 329.00, 299.00, 'BOSE-QC45', 80, 8, 'Bose', 0.25, 'N/A', TRUE),
('Kindle Paperwhite', 'Waterproof e-reader with backlight', 149.99, NULL, 'KINDLE-PW', 100, 5, 'Amazon', 0.182, '6.8"', TRUE),
('Garden Hose Pro 50ft', 'Durable expandable hose', 39.99, NULL, 'GARDEN-HOSE-50', 200, 3, 'GreenFlow', 1.1, '50ft', FALSE),
('Spalding NBA Basketball', 'Official size indoor/outdoor ball', 29.99, NULL, 'SPALDING-NBA', 150, 4, 'Spalding', 0.62, 'Size 7', FALSE),
('iPhone 15', 'Base model with A17 chip and advanced display', 899.99, 829.99, 'IPH15-128', 60, 6, 'Apple', 0.172, '6.1" display', FALSE),
('Samsung Galaxy S24 Ultra', 'Flagship Android with S-Pen support', 1199.99, 1099.99, 'S24U-256', 25, 6, 'Samsung', 0.233, '6.8" display', TRUE),
('Google Pixel 8 Pro', 'Premium camera performance and AI features', 999.99, 949.99, 'PIXEL8PRO-256', 30, 6, 'Google', 0.21, '6.7" display', FALSE),
('ASUS ZenBook 14', 'Slim ultrabook for productivity', 999.00, 899.00, 'ASUS-ZB14', 40, 7, 'ASUS', 1.3, '14"', FALSE),
('Lenovo ThinkPad X1 Carbon', 'Professional business ultrabook', 1499.00, NULL, 'LENOVO-X1C', 20, 7, 'Lenovo', 1.12, '14"', TRUE),
('Beats Studio Pro', 'Wireless noise-cancelling over-ear headphones', 349.99, 299.99, 'BEATS-SPRO', 70, 8, 'Beats', 0.26, '8.5" x 7.5" x 3.0"', TRUE),
('JBL Flip 6', 'Portable Bluetooth speaker with waterproof design', 129.99, 99.99, 'JBL-F6', 150, 8, 'JBL', 0.55, '7"', FALSE),
('Sony WF-1000XM5', 'True wireless noise-cancelling earbuds', 299.99, 249.99, 'SONY-WF1000XM5', 120, 8, 'Sony', 0.1, 'N/A', TRUE),
('Adidas Stan Smith', 'Classic white tennis shoes', 85.00, 70.00, 'ADIDAS-SS-42', 80, 9, 'Adidas', 0.7, 'Size 42', FALSE),
('Puma RS-X', 'Retro-inspired running shoes', 110.00, 95.00, 'PUMA-RSX-43', 70, 9, 'Puma', 0.8, 'Size 43', FALSE),
('Under Armour HOVR Sonic 6', 'Lightweight running shoes', 130.00, NULL, 'UA-HOVR6-44', 65, 9, 'Under Armour', 0.75, 'Size 44', TRUE),
('Kitchen Knife Set', 'Professional stainless steel knife set', 89.99, 69.99, 'KITCHEN-KNIFE-SET', 75, 3, 'HomePro', 2.5, '12-piece', TRUE),
('Vacuum Cleaner Pro', 'High suction power vacuum cleaner', 199.99, 179.99, 'VAC-PRO-2000', 50, 3, 'Dyson', 3.5, 'Full-size', FALSE),
('Yoga Mat Premium', 'Non-slip yoga mat with extra padding', 45.00, 35.00, 'YOGA-MAT-PREM', 180, 4, 'Reebok', 1.1, '72" x 24"', TRUE),
('Basketball Shoes Elite', 'High-top shoes for professional play', 160.00, 140.00, 'BBALL-ELITE-44', 50, 4, 'Nike', 0.85, 'Size 44', TRUE),
('Succulent Plant Set', 'Set of 3 small decorative succulents', 25.00, NULL, 'PLANT-SET-3', 200, 3, 'GreenFlow', 0.8, 'Set of 3 pots', FALSE),
('Bookshelf Organizer', '5-tier wooden bookshelf for home office', 149.99, 129.99, 'BOOKSHELF-5TIER', 30, 3, 'IKEA', 18.0, '72" x 24" x 12"', TRUE);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, 'https://shorturl.at/oHPqD', 'iPhone 15 Pro front view', TRUE, 1),
(1, 'https://shorturl.at/hU6e4', 'iPhone 15 Pro back view', FALSE, 2),
(2, 'https://shorturl.at/GD2uj', 'MacBook Air M2 closed', TRUE, 1),
(2, 'https://shorturl.at/oeqFG', 'MacBook Air M2 open', FALSE, 2),
(3, 'https://rb.gy/00vbhf', 'Sony WH-1000XM5 headphones', TRUE, 1),
(4, 'https://shorturl.at/OpS9L', 'Nike Air Max 270 side view', TRUE, 1),
(4, 'https://kntn.ly/a70674c4', 'Nike Air Max 270 top view', FALSE, 2),
(7, 'https://kntn.ly/28fa3495', 'Samsung Galaxy S24', TRUE, 1),
(9, 'https://kntn.ly/8eae6e37', 'Google Pixel 8', TRUE, 1),
(10, 'https://kntn.ly/667e88f8', 'OnePlus 12', TRUE, 1),
(11, 'https://kntn.ly/048dd756', 'HP Spectre x360', TRUE, 1),
(12, 'https://kntn.ly/8706fd77', 'ASUS ROG Zephyrus G14', TRUE, 1),
(13, 'https://kntn.ly/cd1d14d6', 'Bose QC45', TRUE, 1),
(14, 'https://kntn.ly/6a9cb7b7', 'Kindle Paperwhite', TRUE, 1),
(15, 'https://images-na.ssl-images-amazon.com/images/I/71-Fu-9ITnL.jpg', 'Garden Hose Pro 50ft', TRUE, 1),
(16, 'https://st.meta.vn/Data/image/2018/04/24/bong-ro-spalding-jr-nba-silver-size-6-74-945z.jpg', 'Spalding NBA Basketball', TRUE, 1),
(17, 'https://shorturl.at/oHPqD', 'iPhone 15', TRUE, 1),
(18, 'https://kntn.ly/28fa3495', 'Samsung Galaxy S24 Ultra', TRUE, 1),
(19, 'https://kntn.ly/8eae6e37', 'Google Pixel 8 Pro', TRUE, 1),
(20, 'https://kntn.ly/8706fd77', 'ASUS ZenBook 14', TRUE, 1),
(21, 'https://kntn.ly/048dd756', 'Lenovo ThinkPad X1 Carbon', TRUE, 1),
(22, 'https://rb.gy/00vbhf', 'Beats Studio Pro', TRUE, 1),
(23, 'https://rb.gy/00vbhf', 'JBL Flip 6', TRUE, 1),
(24, 'https://rb.gy/00vbhf', 'Sony WF-1000XM5', TRUE, 1),
(25, 'https://kntn.ly/a70674c4', 'Adidas Stan Smith', TRUE, 1),
(26, 'https://kntn.ly/a70674c4', 'Puma RS-X', TRUE, 1),
(27, 'https://kntn.ly/a70674c4', 'Under Armour HOVR Sonic 6', TRUE, 1),
(28, 'https://kntn.ly/8735f6bb', 'Women Summer Dress', TRUE, 1),
(29, 'https://kntn.ly/8735f6bb', 'Men Polo Shirt', TRUE, 1),
(30, 'https://kntn.ly/8735f6bb', 'Kids Sneakers', TRUE, 1);

-- Note: Users are created by backend/scripts/seed_users.js with proper password hashing


-- Insert sample user addresses
INSERT INTO user_addresses (user_id, type, first_name, last_name, address_line_1, city, state, postal_code, country, phone, is_default) VALUES
(2, 'shipping', 'John', 'Doe', '123 Main St', 'New York', 'NY', '10001', 'United States', '+1234567891', TRUE),
(2, 'billing', 'John', 'Doe', '123 Main St', 'New York', 'NY', '10001', 'United States', '+1234567891', TRUE),
(3, 'shipping', 'Jane', 'Smith', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'United States', '+1234567892', TRUE);

-- Insert sample cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(2, 1, 1),
(2, 4, 2),
(3, 2, 1),
(3, 3, 1);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified_purchase) VALUES
(2, 1, 5, 'Amazing phone!', 'The camera quality is outstanding and the performance is smooth.', TRUE),
(3, 2, 4, 'Great laptop', 'Very fast and lightweight. Perfect for work and travel.', TRUE),
(2, 4, 5, 'Comfortable shoes', 'These shoes are so comfortable for daily wear and running.', TRUE);

-- Insert sample wishlist items
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 3),
(2, 7),
(3, 1),
(3, 5);

-- Insert sample coupons
INSERT IGNORE INTO coupons (code, description, discount_type, discount_value, min_order_amount, expires_at, is_active) VALUES
('SAVE10', '10% off any order', 'percent', 10, 0, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 DAY), TRUE),
('WELCOME5', 'Welcome $5 off your first order', 'fixed', 5.00, 0, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 90 DAY), TRUE),
('VIP15', '15% off orders over $100', 'percent', 15, 100.00, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 120 DAY), TRUE);

-- Grant coupons to users (manual)
-- Grant to john@example.com
INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
SELECT u.id, c.id, 'manual'
FROM users u JOIN coupons c ON c.code = 'SAVE10'
WHERE u.email = 'john@example.com';
INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
SELECT u.id, c.id, 'manual'
FROM users u JOIN coupons c ON c.code = 'WELCOME5'
WHERE u.email = 'john@example.com';

-- Grant to jane@example.com
INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
SELECT u.id, c.id, 'manual'
FROM users u JOIN coupons c ON c.code = 'SAVE10'
WHERE u.email = 'jane@example.com';
-- If the demo user exists (email user@gmail.com), grant VIP15
INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
SELECT u.id, c.id, 'manual'
FROM users u CROSS JOIN coupons c
WHERE u.email = 'user@gmail.com' AND c.code = 'VIP15';

-- Grant the same set of coupons to ALL users (idempotent)
INSERT IGNORE INTO user_coupons (user_id, coupon_id, granted_reason)
SELECT u.id, c.id, 'manual'
FROM users u
JOIN coupons c ON c.code IN ('SAVE10','WELCOME5','VIP15');
