# Dynamic Survey Application

A comprehensive survey application with drag-and-drop form building, multiple control types, conditional logic, and workflow management.

## Features

- Drag-and-drop form builder
- Multiple control types (text, textarea, radio, checkbox, dropdown, etc.)
- Conditional logic for dynamic form behavior
- Form submission and data collection
- Workflow management
- Responsive design

## Technology Stack

- **Frontend**: Angular with Angular Material
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Angular CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install backend dependencies
cd DynamicSurveyApp
npm install

# Install frontend dependencies
cd ClientApp
npm install
```

3. Set up the database:

```bash
# Create the database
createdb dynamic_survey_db

# Run the schema script
psql -d dynamic_survey_db -f DbScripts/schema.sql

# Run the seed data script
psql -d dynamic_survey_db -f DbScripts/seed_data.sql
```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/dynamic_survey_db
PORT=8000
```

5. Start the application:

```bash
# Start the backend
npm run server

# Start the frontend
cd ClientApp
npm start
```

## Database Schema

The application uses the following main tables:

- `users` - Stores user information
- `forms` - Stores form metadata
- `sections` - Stores form sections
- `controls` - Stores form controls/fields
- `control_options` - Stores options for dropdown/radio/checkbox controls
- `submissions` - Stores form submissions
- `submission_responses` - Stores individual responses for each submission
- `workflows` - Stores workflow configurations
- `webhooks` - Stores webhook configurations
- `conditional_logic` - Stores conditional logic rules

## Application Structure

- `ClientApp/` - Angular frontend application
- `Server/` - Node.js backend API
- `DbScripts/` - Database scripts for setup and migrations

## License

MIT
