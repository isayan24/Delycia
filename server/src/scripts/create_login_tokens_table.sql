CREATE TABLE IF NOT EXISTS login_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL COMMENT 'E.164 format',
    user_id INT NULL,
    token_hash VARCHAR(64) NOT NULL COMMENT 'SHA256 hash',
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    attempt_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone_number),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires (expires_at),
    INDEX idx_verify (token_hash, expires_at, used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
