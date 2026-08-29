-- =============================================================
-- ACME Employee Salary Management — Database Seed Script
-- Run: psql -U postgres -d acme_employee_salary -f seed.sql
-- =============================================================

-- =============================================================
-- CREATE TABLES
-- =============================================================

CREATE TABLE IF NOT EXISTS departments (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currencies (
    id         SERIAL PRIMARY KEY,
    code       VARCHAR(10)  NOT NULL UNIQUE,
    name       VARCHAR(100) NOT NULL,
    symbol     VARCHAR(10)  NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS countries (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    currency_id INTEGER      NOT NULL REFERENCES currencies(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    id          SERIAL PRIMARY KEY,
    currency_id INTEGER        NOT NULL UNIQUE REFERENCES currencies(id),
    rate_to_usd NUMERIC(18, 6) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id            SERIAL PRIMARY KEY,
    employee_id   VARCHAR(20)    NOT NULL UNIQUE,
    name          VARCHAR(150)   NOT NULL,
    department_id INTEGER        NOT NULL REFERENCES departments(id),
    job_title     VARCHAR(100)   NOT NULL,
    country_id    INTEGER        NOT NULL REFERENCES countries(id),
    currency_id   INTEGER        NOT NULL REFERENCES currencies(id),
    date_joined   DATE           NOT NULL,
    base_salary   NUMERIC(18, 2) NOT NULL CHECK (base_salary > 0),
    status        VARCHAR(10)    NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_country_id    ON employees(country_id);
CREATE INDEX IF NOT EXISTS idx_employees_currency_id   ON employees(currency_id);
CREATE INDEX IF NOT EXISTS idx_employees_status        ON employees(status);

-- =============================================================
-- REFERENCE DATA — CURRENCIES
-- =============================================================

INSERT INTO currencies (code, name, symbol) VALUES
    ('INR', 'Indian Rupee',           '₹'),
    ('USD', 'United States Dollar',   '$'),
    ('GBP', 'British Pound Sterling', '£'),
    ('EUR', 'Euro',                   '€'),
    ('BRL', 'Brazilian Real',         'R$'),
    ('SGD', 'Singapore Dollar',       'S$')
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- REFERENCE DATA — EXCHANGE RATES
-- =============================================================

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 0.012000 FROM currencies WHERE code = 'INR'
ON CONFLICT (currency_id) DO NOTHING;

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 1.000000 FROM currencies WHERE code = 'USD'
ON CONFLICT (currency_id) DO NOTHING;

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 1.270000 FROM currencies WHERE code = 'GBP'
ON CONFLICT (currency_id) DO NOTHING;

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 1.080000 FROM currencies WHERE code = 'EUR'
ON CONFLICT (currency_id) DO NOTHING;

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 0.180000 FROM currencies WHERE code = 'BRL'
ON CONFLICT (currency_id) DO NOTHING;

INSERT INTO exchange_rates (currency_id, rate_to_usd)
SELECT id, 0.740000 FROM currencies WHERE code = 'SGD'
ON CONFLICT (currency_id) DO NOTHING;

-- =============================================================
-- REFERENCE DATA — COUNTRIES
-- =============================================================

INSERT INTO countries (code, name, currency_id)
SELECT 'IN', 'India',     id FROM currencies WHERE code = 'INR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name, currency_id)
SELECT 'US', 'USA',       id FROM currencies WHERE code = 'USD'
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name, currency_id)
SELECT 'GB', 'UK',        id FROM currencies WHERE code = 'GBP'
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name, currency_id)
SELECT 'DE', 'Germany',   id FROM currencies WHERE code = 'EUR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name, currency_id)
SELECT 'BR', 'Brazil',    id FROM currencies WHERE code = 'BRL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (code, name, currency_id)
SELECT 'SG', 'Singapore', id FROM currencies WHERE code = 'SGD'
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- REFERENCE DATA — DEPARTMENTS
-- =============================================================

INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('HR'),
    ('Finance'),
    ('Sales'),
    ('Marketing'),
    ('Operations')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- EMPLOYEES — 10,000 RECORDS
-- =============================================================

DO $$
DECLARE
    first_names TEXT[] := ARRAY[
        'Arun','Priya','James','Sarah','Carlos','Maria','Liam','Emma',
        'Raj','Anita','David','Sophie','Lucas','Isabella','Wei','Mei',
        'Ahmed','Fatima','Oliver','Amelia','Noah','Mia','Ethan','Ava',
        'Ravi','Deepa','John','Emily','Diego','Valentina','Felix','Nora',
        'Arjun','Kavya','Michael','Grace','Santiago','Camila','Hugo','Ella',
        'Vikram','Pooja','William','Charlotte','Mateo','Lucia','Leo','Zoe',
        'Suresh','Lakshmi','Daniel','Hannah','Rafael','Ana','Max','Lisa'
    ];
    last_names TEXT[] := ARRAY[
        'Kumar','Sharma','Smith','Johnson','Garcia','Martinez','Brown','Davis',
        'Patel','Singh','Wilson','Taylor','Gonzalez','Rodriguez','Miller','Anderson',
        'Muller','Schmidt','Silva','Santos','Li','Wang','Hassan','Ali',
        'Thomas','Jackson','White','Harris','Clark','Lewis','Robinson','Walker',
        'Gupta','Reddy','Nair','Mehta','Tan','Lim','Chan','Wong',
        'Fernandez','Lopez','Hill','Scott','Green','Adams','Baker','Nelson',
        'Oliveira','Pereira','Maier','Becker','Nakamura','Yamamoto','Park','Kim'
    ];
    dept_names  TEXT[] := ARRAY['Engineering','HR','Finance','Sales','Marketing','Operations'];
    job_titles  TEXT[][] := ARRAY[
        ARRAY['Software Engineer','Senior Software Engineer','Engineering Manager'],
        ARRAY['HR Coordinator','HR Manager','HR Business Partner'],
        ARRAY['Financial Analyst','Senior Financial Analyst','Finance Manager'],
        ARRAY['Sales Representative','Account Executive','Sales Manager'],
        ARRAY['Marketing Coordinator','Marketing Specialist','Marketing Manager'],
        ARRAY['Operations Analyst','Operations Specialist','Operations Manager']
    ];
    country_codes TEXT[] := ARRAY['IN','US','GB','DE','BR','SG'];
    salary_mins   INT[]  := ARRAY[400000, 40000, 30000, 35000, 30000, 40000];
    salary_maxs   INT[]  := ARRAY[3000000,180000,150000,160000,200000,200000];

    i            INT;
    country_idx  INT;
    dept_idx     INT;
    title_idx    INT;
    fname        TEXT;
    lname        TEXT;
    emp_status   TEXT;
    emp_salary   NUMERIC;
    emp_date     DATE;
    dept_id      INT;
    country_id   INT;
    currency_id  INT;
BEGIN
    -- Skip if employees already exist
    IF (SELECT COUNT(*) FROM employees) > 0 THEN
        RAISE NOTICE 'Employees already seeded, skipping.';
        RETURN;
    END IF;

    FOR i IN 1..10000 LOOP
        country_idx := (i % 6) + 1;
        dept_idx    := (i % 6) + 1;
        title_idx   := (i % 3) + 1;

        fname := first_names[ (i % array_length(first_names, 1)) + 1 ];
        lname := last_names[  ((i / array_length(first_names, 1)) % array_length(last_names, 1)) + 1 ];

        emp_status := CASE WHEN i % 10 = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END;

        emp_salary := salary_mins[country_idx] +
                      floor(random() * (salary_maxs[country_idx] - salary_mins[country_idx] + 1));

        emp_date := DATE '2010-01-01' + floor((i::float / 10000) * (DATE '2024-12-31' - DATE '2010-01-01'))::int;

        SELECT id INTO dept_id    FROM departments WHERE name = dept_names[dept_idx];
        SELECT id INTO country_id FROM countries   WHERE code = country_codes[country_idx];
        SELECT c.id INTO currency_id FROM currencies c
            JOIN countries co ON co.currency_id = c.id
            WHERE co.code = country_codes[country_idx];

        INSERT INTO employees (
            employee_id, name, department_id, job_title,
            country_id, currency_id, date_joined, base_salary, status
        ) VALUES (
            'EMP-' || LPAD(i::TEXT, 5, '0'),
            fname || ' ' || lname,
            dept_id,
            job_titles[dept_idx][title_idx],
            country_id,
            currency_id,
            emp_date,
            emp_salary,
            emp_status
        );
    END LOOP;

    RAISE NOTICE 'Seeding complete: 10000 employees inserted.';
END $$;

-- =============================================================
-- SUMMARY
-- =============================================================

SELECT 'departments'  AS entity, COUNT(*) AS count FROM departments
UNION ALL
SELECT 'currencies',   COUNT(*) FROM currencies
UNION ALL
SELECT 'countries',    COUNT(*) FROM countries
UNION ALL
SELECT 'exchange_rates', COUNT(*) FROM exchange_rates
UNION ALL
SELECT 'employees',    COUNT(*) FROM employees;
