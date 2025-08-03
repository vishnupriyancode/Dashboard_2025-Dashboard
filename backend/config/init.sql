-- Create sample_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS sample_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)
);

-- Create api_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    domain_id VARCHAR(255),
    model VARCHAR(255),
    method VARCHAR(50),
    status VARCHAR(50),
    endpoint VARCHAR(255),
    time TIMESTAMP,
    value VARCHAR(255),
    request_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO sample_data (name, value, status) VALUES
    ('API Request 1', '200ms', 'success'),
    ('API Request 2', '150ms', 'success'),
    ('API Request 3', '500ms', 'failed'),
    ('API Request 4', '300ms', 'success'),
    ('API Request 5', '450ms', 'pending'); 