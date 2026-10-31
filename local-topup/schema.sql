-- LOCAL-ONLY L2Blitz payment test extension.
-- Existing blitz_topup_* order, audit and item-delivery tables remain authoritative.
CREATE TABLE IF NOT EXISTS blitz_local_pairing (
  code_hash BINARY(32) PRIMARY KEY,
  account_name VARCHAR(45) NOT NULL,
  character_id INT UNSIGNED NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  used_at DATETIME(6) NULL,
  issued_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS blitz_local_sessions (
  token_hash BINARY(32) PRIMARY KEY,
  account_name VARCHAR(45) NOT NULL,
  character_id INT UNSIGNED NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS blitz_local_slips (
  order_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  image_sha CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  private_file VARCHAR(240) NOT NULL,
  mime VARCHAR(32) NOT NULL,
  verification ENUM('MANUAL_PENDING','API_REVIEW','FLAGGED','RETRY_NEEDED','MANUAL_VERIFIED') NOT NULL DEFAULT 'MANUAL_PENDING',
  provider_code VARCHAR(20) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  reviewed_at DATETIME(6) NULL,
  UNIQUE KEY uq_blitz_local_image (image_sha),
  CONSTRAINT fk_blitz_local_slip_order FOREIGN KEY (order_id) REFERENCES blitz_topup_order(order_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS blitz_local_bank_transfers (
  bank_reference VARCHAR(140) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  order_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  verified_amount DECIMAL(12,2) NOT NULL,
  verified_by VARCHAR(80) NOT NULL,
  verified_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_blitz_local_bank_order FOREIGN KEY (order_id) REFERENCES blitz_topup_order(order_id)
) ENGINE=InnoDB;

-- Native game-triggered local browser login: 256-bit bearer secret, hashed in SQL, once/60s.
CREATE TABLE IF NOT EXISTS blitz_local_browser_tickets (
  ticket_hash BINARY(32) PRIMARY KEY,
  account_name VARCHAR(45) NOT NULL,
  character_id INT UNSIGNED NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  redeemed_at DATETIME(6) NULL,
  issued_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  KEY idx_blitz_local_browser_account (account_name, redeemed_at, expires_at)
) ENGINE=InnoDB;

-- A bank transfer reference cannot be claimed by more than one Local order.
-- This is informational only: the existing GM + item delivery gates still apply.
CREATE TABLE IF NOT EXISTS blitz_local_provider_receipts (
  trans_ref VARCHAR(140) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  order_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  provider_code VARCHAR(20) NOT NULL,
  transferred_at DATETIME(6) NULL,
  recorded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_blitz_local_provider_order FOREIGN KEY(order_id) REFERENCES blitz_topup_order(order_id)
) ENGINE=InnoDB;
