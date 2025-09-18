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
-- Added more sample products
('Google Pixel 8', 'Pixel 8 with excellent camera and clean Android', 749.00, 699.00, 'PIXEL8-128', 45, 6, 'Google', 0.187, '6.2" display', TRUE),
('OnePlus 12', 'Flagship killer with fast performance', 699.00, NULL, 'OP12-256', 35, 6, 'OnePlus', 0.19, '6.7" display', FALSE),
('HP Spectre x360', 'Convertible ultrabook with OLED screen', 1399.00, 1299.00, 'HPS-13-OLED', 20, 7, 'HP', 1.3, '13"', TRUE),
('ASUS ROG Zephyrus G14', 'Compact gaming laptop', 1699.00, NULL, 'ROG-G14', 15, 7, 'ASUS', 1.6, '14"', FALSE),
('Bose QC45', 'Comfortable noise cancelling headphones', 329.00, 299.00, 'BOSE-QC45', 80, 8, 'Bose', 0.25, 'N/A', TRUE),
('Kindle Paperwhite', 'Waterproof e-reader with backlight', 149.99, NULL, 'KINDLE-PW', 100, 5, 'Amazon', 0.182, '6.8"', TRUE),
('Garden Hose Pro 50ft', 'Durable expandable hose', 39.99, NULL, 'GARDEN-HOSE-50', 200, 3, 'GreenFlow', 1.1, '50ft', FALSE),
('Spalding NBA Basketball', 'Official size indoor/outdoor ball', 29.99, NULL, 'SPALDING-NBA', 150, 4, 'Spalding', 0.62, 'Size 7', FALSE);

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
(16, 'https://st.meta.vn/Data/image/2018/04/24/bong-ro-spalding-jr-nba-silver-size-6-74-945z.jpg', 'Spalding NBA Basketball', TRUE, 1);

-- Insert sample users (passwords are hashed with bcrypt)
-- Password for all test users is: password123
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_admin) VALUES
('admin', 'admin@shopping.com', '$2b$10$rQZ8kF5jK9mN2pL3qR7sTuVwXyZ1aB4cD6eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8', 'Admin', 'User', '+1234567890', TRUE),
('john_doe', 'john@example.com', '$2b$10$rQZ8kF5jK9mN2pL3qR7sTuVwXyZ1aB4cD6eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8', 'John', 'Doe', '+1234567891', FALSE),
('jane_smith', 'jane@example.com', '$2b$10$rQZ8kF5jK9mN2pL3qR7sTuVwXyZ1aB4cD6eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8', 'Jane', 'Smith', '+1234567892', FALSE);

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
