
-- -- Query for creating the table--
-- CREATE TABLE Users IF NOT EXISTS(
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     uid VARCHAR(20) NOT NULL UNIQUE,
--     name VARCHAR(20) NOT NULL,
--     email VARCHAR(30) NOT NULL UNIQUE,
--     phone_number VARCHAR(15) NOT NULL,
--     profile_pic TEXT,
--     password TEXT NOT NULL,
--     refresh_token TEXT,
--     role INT(1) DEFAULT 0,
--     provider INT(1) DEFAULT 0,
--     isVerified TINYINT(1) DEFAULT 1,
--     register_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );


-- -- Query for adding new row--

-- INSERT INTO Users(uid, name, email, profile_pic , password, refresh_token) VALUES("Data")

-- -- Query for Update data--

-- UPDATE Users SET c1 = "NEW DATA" WHERE uid = "UID"

-- -- Query for adding constraint--
-- ALTER TABLE Users
-- ADD CONSTRAINT check_verified CHECK (verified IN (0, 1));






--- Database model --
--https://www.canva.com/design/DAGhfqTN8iQ/XEAvjBejj7EoAyFUQPKbgA/edit?utm_content=DAGhfqTN8iQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
--Users table

CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(30) NOT NULL UNIQUE,
    username VARCHAR(20) UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    profile_pic TEXT,
    password TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    role TINYINT(1) DEFAULT 0,
    provider TINYINT(1) DEFAULT 0,
    verified TINYINT(1) DEFAULT 1,
    register_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS Categories (
    id INT PRIMARY  KEY AUTO_INCREMENT,
    name VARCHAR(15),
    description VARCHAR(250),
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS Memories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50),
    img TEXT,
    msg VARCHAR(250),
    rating TINYINT CHECK(rating BETWEEN 0 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_memories_users FOREIGN KEY (uid) REFERENCES Users(uid) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    item_id INT,
    quantity INT,
    order_status ENUM('pending', 'processing', 'completed', 'cancelled'),
    payment_status ENUM('pending', 'completed'),
    total_amount INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fK_orders_users FOREIGN KEY (customer_id) REFERENCES Users(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS Favourite_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50),
    list JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favlist_users FOREIGN KEY (uid) REFERENCES Users(uid) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS Coupon_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10),
    discount INT,
    discount_type ENUM('fixed', 'percentage'),
    max_discount INT,
    min_order_value INT,
    usage_limit INT,
    times_used INT,
    valid_from DATETIME,
    valid_until DATETIME,
    status ENUM('active', 'full', 'expired'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE IF NOT EXISTS Inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(50),
    description VARCHAR(250),
    img TEXT,
    is_veg TINYINT(1),
    cost_price INT(5),
    discount INT(2),
    sku VARCHAR(10),
    quantity INT(5),
    status ENUM('available', 'out_of_stock','low_stock'),
    preparation_time INT(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_category FOREIGN KEY (category_id) REFERENCES Categories(id)     
);


CREATE TABLE IF NOT EXISTS Variants  (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT,
    name VARCHAR(50),
    description VARCHAR(250),
    img TEXT,
    is_veg TINYINT(1),
    cost_price INT(5),
    discount INT(2),
    sku VARCHAR(10),
    quantity INT(5),
    status ENUM('available', 'out_of_stock','low_stock'),
    preparation_time INT(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ivariants_cinventory FOREIGN KEY (inventory_id) REFERENCES Inventory(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS Otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50),
    code INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 

    CONSTRAINT fk_otps_users FOREIGN KEY (uid) REFERENCES Users(uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Config (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(50),
     images JSON,
     fav_icon TEXT,
     colors JSON,
     business_info JSON,
     currency VARCHAR(10),
     opening_hours JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)