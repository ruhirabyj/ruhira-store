-- Product code / SKU for the main product
ALTER TABLE products ADD COLUMN product_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_code
ON products(product_code);


-- Multiple images for each product
CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_product_images_product
ON product_images(product_id);


-- Generic product options
-- Examples: Size, Color, Waist, Length
CREATE TABLE IF NOT EXISTS product_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES products(id),

    UNIQUE(product_id, name)
);


-- Values belonging to each option
-- Examples: S/M/L or 30/32/34
CREATE TABLE IF NOT EXISTS product_option_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    option_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (option_id) REFERENCES product_options(id),

    UNIQUE(option_id, value)
);


-- Connect a sellable variant to its option values
CREATE TABLE IF NOT EXISTS product_variant_option_values (
    variant_id INTEGER NOT NULL,
    option_value_id INTEGER NOT NULL,

    PRIMARY KEY (variant_id, option_value_id),

    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (option_value_id) REFERENCES product_option_values(id)
);

CREATE INDEX IF NOT EXISTS idx_product_options_product
ON product_options(product_id);

CREATE INDEX IF NOT EXISTS idx_variant_option_values_variant
ON product_variant_option_values(variant_id);
