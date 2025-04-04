# Database Scripts for Dynamic Survey Application

This directory contains database scripts and utilities for setting up and migrating the Dynamic Survey Application database.

## SQL Server Setup

The Dynamic Survey Application can run on either PostgreSQL or SQL Server. This directory contains scripts for setting up and migrating between these database systems.

### Files Overview

1. `DynamicSurveyDB_SQLServer.sql` - SQL Server database creation script
2. `PostgresqlToSqlServer.js` - Migration utility to export PostgreSQL data to SQL Server format
3. `sqlserver-connect.js` - Example script for connecting to SQL Server from Node.js
4. `generate-connection-string.js` - Utility to generate SQL Server connection strings

## SQL Server Setup Instructions

### Option 1: Create a new SQL Server database

1. Install SQL Server (Developer/Express edition is free for development)
2. Connect to your SQL Server instance using SQL Server Management Studio (SSMS)
3. Run the `DynamicSurveyDB_SQLServer.sql` script to create the database schema
4. Update your application's connection string to point to your SQL Server

### Option 2: Migrate from PostgreSQL to SQL Server

If you have been using the PostgreSQL database and want to migrate to SQL Server:

1. Set up SQL Server and create a new database
2. Run the `DynamicSurveyDB_SQLServer.sql` script to create the database schema
3. Install the required dependencies
4. Modify the connection settings in `PostgresqlToSqlServer.js` to match your environment
5. Run the migration script
6. This will create a `migration_script.sql` file that you can execute in SQL Server
