-- ============================================================================
-- L2Blitz Read-Only Database User Setup for L2J_Mobius_CT_2.6_HighFive
-- Run this script on your MySQL/MariaDB server as root.
-- ============================================================================

-- 1. Create a local-only user (never expose MySQL port 3306 to public internet)
CREATE USER IF NOT EXISTS 'l2blitz_readonly'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';

-- 2. Grant strictly SELECT-only privileges on required L2J Mobius High Five tables
GRANT SELECT ON `l2jmobius_h5`.`characters` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`character_offline_trade` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`clan_data` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`heroes` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`olympiad_data` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`olympiad_nobles` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`castle` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`grandboss_data` TO 'l2blitz_readonly'@'127.0.0.1';
GRANT SELECT ON `l2jmobius_h5`.`raidboss_spawnlist` TO 'l2blitz_readonly'@'127.0.0.1';

-- Optional: Grant SELECT on login accounts table for total account count
GRANT SELECT (`login`, `accessLevel`) ON `l2jmobius_login`.`accounts` TO 'l2blitz_readonly'@'127.0.0.1';

FLUSH PRIVILEGES;
