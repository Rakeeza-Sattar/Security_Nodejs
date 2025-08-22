# MySQL Setup Guide for SecureHome Audit Platform

## 📋 MySQL Setup Options

### Option 1: PlanetScale (Recommended - Serverless MySQL)
```bash
# 1. Sign up at https://planetscale.com
# 2. Create new database
# 3. Get connection string
DATABASE_URL=mysql://username:password@aws.connect.psdb.cloud/database-name?ssl={"rejectUnauthorized":true}
```

### Option 2: Railway
```bash
# 1. Sign up at https://railway.app
# 2. Add MySQL service
# 3. Get connection string
DATABASE_URL=mysql://root:password@containers-us-west-xxx.railway.app:6543/railway
```

### Option 3: Local MySQL
```bash
# Install MySQL locally
sudo apt install mysql-server  # Ubuntu/Debian
brew install mysql            # macOS

# Create database
mysql -u root -p
CREATE DATABASE securehome_audit_db;
CREATE USER 'securehome_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON securehome_audit_db.* TO 'securehome_user'@'localhost';
FLUSH PRIVILEGES;

DATABASE_URL=mysql://securehome_user:your_password@localhost:3306/securehome_audit_db
```

## 🔄 Migration Steps from PostgreSQL to MySQL

### Step 1: Update Schema Files
```bash
# Replace the main schema file
cp shared/schema-mysql.ts shared/schema.ts
```

### Step 2: Update Database Configuration
```bash
# Use the new MySQL database configuration
cp .env.mysql .env
# Update your actual values in .env
```

### Step 3: Update Drizzle Config
Create new `drizzle.config.mysql.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", 
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Step 4: Push Schema to MySQL
```bash
npm run db:push
```

### Step 5: Update Session Store (if needed)
For MySQL session storage, update `server/storage.ts`:
```typescript
import session from 'express-session';
import MySQLStore from 'express-mysql-session';

const MySQLSessionStore = MySQLStore(session);

const sessionStore = new MySQLSessionStore({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

## 🚀 Final Setup Commands

```bash
# 1. Install MySQL dependencies (already done)
npm install mysql2

# 2. Set up your .env file
cp .env.mysql .env
# Edit .env with your actual values

# 3. Push schema to database
npm run db:push

# 4. Start application
npm run dev
```

## ⚠️ Important Notes

1. **Replit Built-in Database**: Replit provides PostgreSQL by default, not MySQL
2. **External Hosting Required**: You'll need external MySQL hosting service
3. **Schema Differences**: MySQL uses different data types and UUID generation
4. **Connection Pooling**: Configure properly for production use

## 🔍 MySQL vs PostgreSQL Key Changes

- `pgTable` → `mysqlTable`
- `jsonb` → `json`
- `gen_random_uuid()` → `UUID()`
- `defaultNow()` → `CURRENT_TIMESTAMP`
- `varchar` lengths specified explicitly
- `integer` → `int`

## 📊 Recommended MySQL Providers

1. **PlanetScale** - Serverless, auto-scaling
2. **Railway** - Simple deployment
3. **DigitalOcean** - Managed databases
4. **AWS RDS** - Enterprise grade
5. **Google Cloud SQL** - Google ecosystem