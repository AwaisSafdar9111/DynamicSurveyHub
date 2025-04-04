# Database Scripts for Dynamic Survey Application

This directory contains the database scripts needed to set up and initialize the database for the Dynamic Survey Application.

## Files

- `schema.sql` - Creates the database schema including tables, indexes, and triggers
- `seed.sql` - Inserts seed data including sample users, forms, and workflows
- `migrate.js` - Utility script for running database migrations using Drizzle ORM

## Setting Up the Database

### Prerequisites

- PostgreSQL (v12 or newer)
- Node.js (v14 or newer)

### Steps

1. Create a new PostgreSQL database:

```bash
createdb dynamic_survey_db
```

2. Run the schema script to create tables and indexes:

```bash
psql -d dynamic_survey_db -f schema.sql
```

3. Run the seed script to populate the database with initial data:

```bash
psql -d dynamic_survey_db -f seed.sql
```

4. For future migrations, you can use the included Drizzle migration script:

```bash
node migrate.js
```

## Database Schema

The database schema consists of the following main tables:

- `users` - Stores user information
- `forms` - Stores form metadata
- `sections` - Stores form sections
- `controls` - Stores form controls/fields
- `submissions` - Stores form submissions
- `workflows` - Stores workflow configurations
- `webhooks` - Stores webhook configurations
- `conditional_logic` - Stores conditional logic rules

## Seed Data

The seed script creates:

1. An admin user with username: `admin` and password: `admin123`
2. A demo user with username: `demo` and password: `demo123`
3. A sample feedback form with conditional logic
4. A sample workflow for email notifications
5. A sample webhook configuration

You can use these credentials to log in and explore the application after setup.
