import pool from "../config/db.connection.js";

/* Run this script to initialize the database */
const query = {
  users: `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(30),
    username VARCHAR(20) UNIQUE,
    country_code VARCHAR(5) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    profile_pic TEXT,
    password TEXT,
    role INT NOT NULL DEFAULT 0,
    access_token TEXT,
    refresh_token TEXT,
    register_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`,

  restaurants: `CREATE TABLE IF NOT EXISTS restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(20) NOT NULL,
  username VARCHAR(20) UNIQUE,
  description VARCHAR(250) NOT NULL,
  logo TEXT,
  banner TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  is_active TINYINT(1)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  restaurant_hours: `CREATE TABLE IF NOT EXISTS restaurants_hours (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rid INT,
  day_of_week ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
  open_time DATETIME,
  close_time DATETIME,
  CONSTRAINT fk_restaurant_hours FOREIGN KEY (rid) REFERENCES restaurants(id) ON DELETE CASCADE
  )`,

  categories: `CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY  KEY AUTO_INCREMENT,
    rid INT,
    name VARCHAR(15),
    description VARCHAR(250),
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_restaurant FOREIGN KEY (rid) REFERENCES restaurants(id) ON DELETE CASCADE
);`,

  memories: `CREATE TABLE IF NOT EXISTS memories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50),
    img TEXT,
    msg VARCHAR(250),
    rating TINYINT CHECK(rating BETWEEN 0 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_memories_users FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);`,

  orders: `CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rid INT,
    customer_id INT,
    item_id INT,
    quantity INT,
    order_status ENUM('pending', 'processing', 'ready', 'completed', 'cancelled'),
    payment_status ENUM('pending', 'completed'),
    payment_method ENUM('upi', 'cash', 'card', 'others'),
    total_amount INT,
    special_instructions VARCHAR(250),
    delivery_type ENUM('dine-in', 'takeaway', 'delivery'),
    discount_amount INT DEFAULT 0,
    preparation_time INT DEFAULT 20,
    table_no INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fK_orders_users FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_restaurant FOREIGN KEY (rid) REFERENCES restaurants(id) ON DELETE CASCADE
);`,

  favourite_list: `CREATE TABLE IF NOT EXISTS favourite_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50),
    list JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favlist_users FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);`,

  coupon_codes: `CREATE TABLE IF NOT EXISTS coupon_codes (
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
);`,

  inventory: `CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rid INT,
    category_id INT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(250),
    images JSON DEFAULT [],
    is_veg TINYINT(1),
    cost INT(5),
    price INT(5),
    sku VARCHAR(10),
    status ENUM('available', 'out_of_stock','low_stock'),
    preparation_time INT(10),
    is_upsell TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_restaurant FOREIGN KEY (rid) REFERENCES restaurants(id) ON DELETE CASCADE    
);`,

  variants: `CREATE TABLE IF NOT EXISTS variants (
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
    CONSTRAINT fk_variants_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);`,

  otps: `CREATE TABLE IF NOT EXISTS otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(50) UNIQUE,
    code INT,
    attempts INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`,

  config: `CREATE TABLE IF NOT EXISTS config (
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
);`,

  temp_sessions: `CREATE TABLE IF NOT EXISTS temp_sessions (
  user_id INT PRIMARY KEY,
  table_no INT,
  login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_temp_session FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`,

  qr_codes: `CREATE TABLE IF NOT EXISTS qr_codes (
  id VARCHAR(100) PRIMARY KEY,
  table_no INT,
  status TINYINT(1) DEFAULT 0,
  url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`,

  roles: `CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY,
  name VARCHAR(15),
  description VARCHAR(200),
  power INT(3)
);`,
};

const dbInit = async () => {
  for (let key in query) {
    const result = await pool.query(query[key]);
    if (result[0].warningStatus === 1) {
      console.log(`${key} : Table already exists ❎`);
    } else if (result[0].affectedRows === 0) {
      console.log(`${key} : Table created ☑`);
    }
  }
};

export default dbInit;
