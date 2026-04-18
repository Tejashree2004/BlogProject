-- ========================================
-- DATABASE SETUP
-- ========================================

CREATE DATABASE blogdb;

-- Connect to database (run manually in psql)
-- \c blogdb


-- ========================================
-- USERS TABLE
-- ========================================

CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" TEXT NOT NULL UNIQUE,
    "Email" TEXT NOT NULL UNIQUE,
    "Password" TEXT NOT NULL,
    "IsGuest" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "Otp" TEXT
);


-- ========================================
-- BLOGS TABLE
-- ========================================

CREATE TABLE "Blogs" (
    "Id" SERIAL PRIMARY KEY,
    "Title" TEXT NOT NULL,
    "Desc" TEXT NOT NULL,
    "Image" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "IsUserCreated" BOOLEAN NOT NULL DEFAULT FALSE,
    "Author" TEXT NOT NULL,
    "CreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate" TIMESTAMP WITH TIME ZONE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);


-- ========================================
-- SAVED BLOGS TABLE
-- ========================================

CREATE TABLE "SavedBlogs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "BlogId" INTEGER NOT NULL
);


-- ========================================
-- INDEXES (Performance Optimization)
-- ========================================

-- Users Indexes
CREATE INDEX idx_users_email 
ON "Users" ("Email");

CREATE UNIQUE INDEX idx_users_username 
ON "Users" ("Username");

-- Blogs Indexes
CREATE INDEX idx_blogs_createddate 
ON "Blogs" ("CreatedDate");

CREATE INDEX idx_blogs_author 
ON "Blogs" ("Author");


-- ========================================
-- CONSTRAINTS
-- ========================================

-- Foreign Key: Blog Author → Users Username
ALTER TABLE "Blogs"
ADD CONSTRAINT fk_blogs_author
FOREIGN KEY ("Author") REFERENCES "Users"("Username");

-- Foreign Key: SavedBlogs → Users & Blogs
ALTER TABLE "SavedBlogs"
ADD CONSTRAINT fk_savedblogs_user
FOREIGN KEY ("UserId") REFERENCES "Users"("Id");

ALTER TABLE "SavedBlogs"
ADD CONSTRAINT fk_savedblogs_blog
FOREIGN KEY ("BlogId") REFERENCES "Blogs"("Id");


-- ========================================
-- ALTER EXAMPLES (For Future Use)
-- ========================================

-- Add Column
-- ALTER TABLE "Users"
-- ADD COLUMN "Phone" VARCHAR(15);

-- Modify Column Type
-- ALTER TABLE "Users"
-- ALTER COLUMN "Username" TYPE TEXT;

-- Drop Column
-- ALTER TABLE "Users"
-- DROP COLUMN "Phone";


-- ========================================
-- TRUNCATE (Fast Delete Data)
-- ========================================

-- TRUNCATE TABLE "SavedBlogs";
-- TRUNCATE TABLE "Blogs";
-- TRUNCATE TABLE "Users";


-- ========================================
-- DROP (Use Carefully ⚠️)
-- ========================================

-- DROP TABLE "SavedBlogs";
-- DROP TABLE "Blogs";
-- DROP TABLE "Users";

-- DROP DATABASE blogdb;