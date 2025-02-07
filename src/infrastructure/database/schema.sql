CREATE TABLE submissions (
id UUID PRIMARY KEY,
source_code TEXT NOT NULL,
language VARCHAR(50) NOT NULL,
expected_output TEXT NOT NULL,
status VARCHAR(20) DEFAULT 'pending',
output TEXT,
execution_time INTEGER,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);