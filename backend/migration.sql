-- Digo CRM 테이블 마이그레이션
-- 실행: psql -U digo_user -d digo_db -f migration.sql

-- 1. customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  sn VARCHAR(20),
  name VARCHAR(500) NOT NULL,
  contact_name VARCHAR(255),
  reg_date VARCHAR(10),
  region VARCHAR(255),
  title VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  link VARCHAR(500),
  content TEXT,
  status VARCHAR(50),
  category VARCHAR(50) DEFAULT '경리',
  tags TEXT,
  is_excluded INTEGER DEFAULT 0,
  first_sent_date VARCHAR(10),
  first_sent_time VARCHAR(10),
  first_sent_type VARCHAR(20),
  second_sent_date VARCHAR(10),
  second_sent_time VARCHAR(10),
  second_sent_type VARCHAR(20),
  third_sent_date VARCHAR(10),
  third_sent_time VARCHAR(10),
  third_sent_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. consultation_applications
CREATE TABLE IF NOT EXISTS consultation_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(500),
  service_type VARCHAR(100),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  time VARCHAR(10) NOT NULL,
  text TEXT NOT NULL,
  customer_id INTEGER,
  customer_name VARCHAR(255),
  customer_region VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. tags
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. salespersons
CREATE TABLE IF NOT EXISTS salespersons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) DEFAULT '123456',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) DEFAULT '123456',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. applications
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  service_type VARCHAR(100) NOT NULL,
  "bizNm" VARCHAR(500) NOT NULL,
  "userNm" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  sales_person VARCHAR(255) NOT NULL,
  sales_code VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  source VARCHAR(255),
  referrer VARCHAR(500),
  "regDate" VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. email_queue
CREATE TABLE IF NOT EXISTS email_queue (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(500) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at VARCHAR(50),
  scheduled_date VARCHAR(10),
  sent_at VARCHAR(50)
);

-- 10. crawl_jobs
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(50),
  start_time VARCHAR(50),
  end_time VARCHAR(50),
  status VARCHAR(20),
  result_summary TEXT
);

-- 11. landing_sources
CREATE TABLE IF NOT EXISTS landing_sources (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL,
  company_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. landing_service_salesperson_mappings
CREATE TABLE IF NOT EXISTS landing_service_salesperson_mappings (
  id SERIAL PRIMARY KEY,
  landing_folder VARCHAR(255) NOT NULL,
  service_id INTEGER NOT NULL,
  salesperson_id INTEGER NOT NULL,
  url_path VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. linkee_mails
CREATE TABLE IF NOT EXISTS linkee_mails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500),
  email VARCHAR(255) NOT NULL,
  sent_at VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  optout BOOLEAN DEFAULT FALSE,
  optout_at VARCHAR(50)
);

-- 14. class_registrations
CREATE TABLE IF NOT EXISTS class_registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  course_name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  tid VARCHAR(100),
  order_id VARCHAR(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
