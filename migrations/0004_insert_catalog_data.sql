-- Seed 5 real products from catalog.js into D1
-- Collection (id=1, New Arrivals) and Category (id=1, Kurtis) already exist

-- ===================== PRODUCTS =====================

INSERT INTO products (id, collection_id, category_id, name, slug, description, price, product_code, image_url, is_active)
VALUES
(1, 1, 1, 'Pink Bloom', 'pink-bloom',
 'A charming cotton mul Chanderi kurta set featuring delicate floral embroidery and feather-soft comfort. Effortlessly versatile, it transitions beautifully from office hours to relaxed weekend outings.',
 2199, 'RKS101',
 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1424.jpg', 1),

(2, 1, 1, 'Forest Grove', 'forest-grove',
 'An elegant premium satin kurta set with a buttery-soft feel and luxurious sheen, complemented by a statement floral dupatta. A graceful choice for occasions that call for effortless elegance.',
 2199, 'RKS102',
 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1710.jpg', 1),

(3, 1, 1, 'Amber Glow', 'amber-glow',
 'A vibrant premium satin kurta set featuring a rich amber hue and statement neckline embroidery. Designed to stand out with its elegant details and luxurious finish.',
 2199, 'RKS103',
 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1790.jpg', 1),

(4, 1, 1, 'Midnight Noir', 'midnight-noir',
 'A timeless black premium georgette kurta set featuring statement leaf motifs on the sleeves and dupatta, with elegant gold butta detailing throughout. Perfect for festivities and evening celebrations.',
 2299, 'RKS104',
 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1636.jpg', 1),

(5, 1, 1, 'Ivory Mist', 'ivory-mist',
 'Crafted from pure Mul Chanderi, Ivory Mist brings a regal touch with its subtle sheen and graceful drape. Detailed with intricate statement embroidery on the yoke and sleeves, it offers effortless, understated sophistication. The complete set includes a kurta, pants, and dupatta.',
 2799, 'RKS105',
 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1577.jpg', 1);


-- ===================== PRODUCT IMAGES =====================

-- RKS101 Pink Bloom (product_id=1)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(1, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1424.jpg', 0, 1),
(1, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1423.jpg', 1, 0),
(1, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1407.jpg', 2, 0),
(1, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1403.jpg', 3, 0),
(1, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125875/IMG_1343.jpg', 4, 0);

-- RKS102 Forest Grove (product_id=2)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1710.jpg', 0, 1),
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1755.jpg', 1, 0),
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1704.jpg', 2, 0),
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1707.jpg', 3, 0),
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1713.jpg', 4, 0),
(2, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125243/IMG_1749.jpg', 5, 0);

-- RKS103 Amber Glow (product_id=3)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(3, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1790.jpg', 0, 1),
(3, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1788.jpg', 1, 0),
(3, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1791.jpg', 2, 0),
(3, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1792.jpg', 3, 0),
(3, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125256/IMG_1794.jpg', 4, 0);

-- RKS104 Midnight Noir (product_id=4)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(4, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1636.jpg', 0, 1),
(4, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1642.jpg', 1, 0),
(4, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1640.jpg', 2, 0),
(4, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1633.jpg', 3, 0),
(4, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125275/IMG_1630.jpg', 4, 0);

-- RKS105 Ivory Mist (product_id=5)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1577.jpg', 0, 1),
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1601.jpg', 1, 0),
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1517.jpg', 2, 0),
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1519.jpg', 3, 0),
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1511.jpg', 4, 0),
(5, 'https://res.cloudinary.com/kipwuap2/image/upload/v1787125294/IMG_1514.jpg', 5, 0);


-- ===================== PRODUCT OPTIONS =====================
-- Each kurti has a "Size" option

INSERT INTO product_options (id, product_id, name, display_order) VALUES
(1, 1, 'Size', 0),
(2, 2, 'Size', 0),
(3, 3, 'Size', 0),
(4, 4, 'Size', 0),
(5, 5, 'Size', 0);


-- ===================== PRODUCT OPTION VALUES =====================
-- 6 sizes per product: S, M, L, XL, 2XL, 3XL

-- Product 1 (option_id=1)
INSERT INTO product_option_values (id, option_id, value, display_order) VALUES
(1,  1, 'S',   0),
(2,  1, 'M',   1),
(3,  1, 'L',   2),
(4,  1, 'XL',  3),
(5,  1, '2XL', 4),
(6,  1, '3XL', 5);

-- Product 2 (option_id=2)
INSERT INTO product_option_values (id, option_id, value, display_order) VALUES
(7,  2, 'S',   0),
(8,  2, 'M',   1),
(9,  2, 'L',   2),
(10, 2, 'XL',  3),
(11, 2, '2XL', 4),
(12, 2, '3XL', 5);

-- Product 3 (option_id=3)
INSERT INTO product_option_values (id, option_id, value, display_order) VALUES
(13, 3, 'S',   0),
(14, 3, 'M',   1),
(15, 3, 'L',   2),
(16, 3, 'XL',  3),
(17, 3, '2XL', 4),
(18, 3, '3XL', 5);

-- Product 4 (option_id=4)
INSERT INTO product_option_values (id, option_id, value, display_order) VALUES
(19, 4, 'S',   0),
(20, 4, 'M',   1),
(21, 4, 'L',   2),
(22, 4, 'XL',  3),
(23, 4, '2XL', 4),
(24, 4, '3XL', 5);

-- Product 5 (option_id=5)
INSERT INTO product_option_values (id, option_id, value, display_order) VALUES
(25, 5, 'S',   0),
(26, 5, 'M',   1),
(27, 5, 'L',   2),
(28, 5, 'XL',  3),
(29, 5, '2XL', 4),
(30, 5, '3XL', 5);


-- ===================== PRODUCT VARIANTS =====================
-- One variant per size per product, with stock from catalog.js

-- RKS101: S:0, M:0, L:1, XL:1, 2XL:1, 3XL:1
INSERT INTO product_variants (id, product_id, sku, size, stock_quantity, is_active) VALUES
(1,  1, 'RKS101-S',   'S',   0, 1),
(2,  1, 'RKS101-M',   'M',   0, 1),
(3,  1, 'RKS101-L',   'L',   1, 1),
(4,  1, 'RKS101-XL',  'XL',  1, 1),
(5,  1, 'RKS101-2XL', '2XL', 1, 1),
(6,  1, 'RKS101-3XL', '3XL', 1, 1);

-- RKS102: S:0, M:1, L:1, XL:1, 2XL:1, 3XL:1
INSERT INTO product_variants (id, product_id, sku, size, stock_quantity, is_active) VALUES
(7,  2, 'RKS102-S',   'S',   0, 1),
(8,  2, 'RKS102-M',   'M',   1, 1),
(9,  2, 'RKS102-L',   'L',   1, 1),
(10, 2, 'RKS102-XL',  'XL',  1, 1),
(11, 2, 'RKS102-2XL', '2XL', 1, 1),
(12, 2, 'RKS102-3XL', '3XL', 1, 1);

-- RKS103: S:0, M:1, L:1, XL:1, 2XL:1, 3XL:1
INSERT INTO product_variants (id, product_id, sku, size, stock_quantity, is_active) VALUES
(13, 3, 'RKS103-S',   'S',   0, 1),
(14, 3, 'RKS103-M',   'M',   1, 1),
(15, 3, 'RKS103-L',   'L',   1, 1),
(16, 3, 'RKS103-XL',  'XL',  1, 1),
(17, 3, 'RKS103-2XL', '2XL', 1, 1),
(18, 3, 'RKS103-3XL', '3XL', 1, 1);

-- RKS104: S:0, M:1, L:1, XL:1, 2XL:0, 3XL:1
INSERT INTO product_variants (id, product_id, sku, size, stock_quantity, is_active) VALUES
(19, 4, 'RKS104-S',   'S',   0, 1),
(20, 4, 'RKS104-M',   'M',   1, 1),
(21, 4, 'RKS104-L',   'L',   1, 1),
(22, 4, 'RKS104-XL',  'XL',  1, 1),
(23, 4, 'RKS104-2XL', '2XL', 0, 1),
(24, 4, 'RKS104-3XL', '3XL', 1, 1);

-- RKS105: S:0, M:1, L:1, XL:2, 2XL:0, 3XL:0
INSERT INTO product_variants (id, product_id, sku, size, stock_quantity, is_active) VALUES
(25, 5, 'RKS105-S',   'S',   0, 1),
(26, 5, 'RKS105-M',   'M',   1, 1),
(27, 5, 'RKS105-L',   'L',   1, 1),
(28, 5, 'RKS105-XL',  'XL',  2, 1),
(29, 5, 'RKS105-2XL', '2XL', 0, 1),
(30, 5, 'RKS105-3XL', '3XL', 0, 1);


-- ===================== VARIANT ↔ OPTION VALUE LINKS =====================

-- Product 1 variants (variant 1-6) → option values (1-6)
INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6);

-- Product 2 variants (variant 7-12) → option values (7-12)
INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES
(7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12);

-- Product 3 variants (variant 13-18) → option values (13-18)
INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES
(13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18);

-- Product 4 variants (variant 19-24) → option values (19-24)
INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES
(19, 19), (20, 20), (21, 21), (22, 22), (23, 23), (24, 24);

-- Product 5 variants (variant 25-30) → option values (25-30)
INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES
(25, 25), (26, 26), (27, 27), (28, 28), (29, 29), (30, 30);
