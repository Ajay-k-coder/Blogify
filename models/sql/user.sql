-- CREATE TABLE users (

--     full_name VARCHAR(100) NOT NULL,
--     age INT NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     profile_image_url VARCHAR(255) DEFAULT '/images/default.png',

-- -- Added: Bio for the author profile page
-- bio TEXT,

-- -- Added: To show "Member since March 2026"
-- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- -- Added: To track the last time they logged in (Great for Analytics!)
-- last_login TIMESTAMP NULL,

-- -- Added: Role-based access (User vs Admin)
-- role ENUM('USER', 'ADMIN') DEFAULT 'USER',

-- -- Added: Account status (Useful if you ever need to ban a spammer)
-- status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
-- id  VARCHAR(100) PRIMARY KEY );

CREATE TABLE comments (
    id VARCHAR(100) PRIMARY KEY,
    content TEXT NOT NULL,

-- The MongoDB Blog ID (Stored as a String)
blog_id VARCHAR(24) NOT NULL,

-- The MySQL User ID (Links to your new users table)
user_id VARCHAR(100) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- If a user is deleted, their comments are automatically deleted
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE );