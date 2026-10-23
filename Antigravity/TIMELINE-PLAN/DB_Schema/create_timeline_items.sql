-- Neon Postgres DDL Schema for Calendar Timeline
-- Table: timeline_items

CREATE TABLE IF NOT EXISTS timeline_items (
    id VARCHAR(120) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('period', 'event', 'person')),
    category VARCHAR(100) NOT NULL,
    importance SMALLINT NOT NULL DEFAULT 1 CHECK (importance BETWEEN 1 AND 4),
    start_year INT NOT NULL,
    end_year INT,
    description TEXT DEFAULT '',
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    links JSONB DEFAULT '[]'::jsonb,
    color VARCHAR(50),
    tradition VARCHAR(30) DEFAULT 'jewish' CHECK (tradition IN ('jewish', 'general')),
    created_at BIGINT NOT NULL
);

-- Indexes for lightning-fast queries and timeline range searches
CREATE INDEX IF NOT EXISTS idx_timeline_start_year ON timeline_items(start_year);
CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline_items(category);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_items(type);
CREATE INDEX IF NOT EXISTS idx_timeline_tradition ON timeline_items(tradition);
CREATE INDEX IF NOT EXISTS idx_timeline_importance ON timeline_items(importance);
