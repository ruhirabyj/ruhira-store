-- Store settings (shipping, config values editable without redeployment)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value) VALUES ('shipping_cost', '99');
INSERT INTO settings (key, value) VALUES ('free_shipping_threshold', '0');
INSERT INTO settings (key, value) VALUES ('store_name', 'Ruhira');
INSERT INTO settings (key, value) VALUES ('store_email', '');
INSERT INTO settings (key, value) VALUES ('order_timeout_minutes', '10');
