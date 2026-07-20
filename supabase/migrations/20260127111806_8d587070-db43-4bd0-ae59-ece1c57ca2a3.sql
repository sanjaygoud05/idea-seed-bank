-- Add requires_dates column to request_types to indicate if date fields should be shown
ALTER TABLE request_types ADD COLUMN requires_dates boolean NOT NULL DEFAULT false;

-- Set requires_dates for PTO and Remote Work (types that need date ranges)
UPDATE request_types SET requires_dates = true WHERE name IN ('Paid Time Off', 'Remote Work');