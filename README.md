# SQL Query Builder for Marketers

A visual SQL query builder designed specifically for marketers and analysts who need data insights fast, without writing SQL code manually.

## Features

- **Visual Query Builder**: Build complex SQL queries through an intuitive interface
  - SELECT fields with dynamic field management
  - FROM table selection
  - WHERE conditions with multiple operators (=, !=, >, <, >=, <=, LIKE)
  - GROUP BY for aggregations
  - ORDER BY with ASC/DESC sorting
  - LIMIT for result control

- **Marketing Query Templates**: 6 pre-built templates for common marketing queries:
  - Top 10 Customers by Revenue
  - Email Campaign Performance
  - Lead Source ROI
  - Monthly Active Users
  - Churn Analysis
  - Product Performance

- **Real-time Query Execution**: Run queries against sample marketing data with instant results

- **Save & Manage Queries**:
  - Save queries with custom names
  - Load saved queries
  - Delete saved queries
  - Persistent storage using localStorage

- **Export Functionality**: Export generated SQL queries as .sql files

- **Live Preview**: See your SQL query update in real-time as you build

- **Sample Data Included**: Pre-loaded with sample marketing data:
  - Customers table
  - Orders table
  - Email campaigns table
  - Leads table

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SQL.js** - In-browser SQL database engine
- **LocalStorage** - Query persistence

## Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Navigate to project directory
cd sql-query-builder

# Install dependencies
npm install

# Run development server
npm run dev
```

## Usage

### Query Builder Tab
1. Select fields to return (or use * for all)
2. Choose the table to query from
3. Add WHERE conditions to filter results
4. Optionally add GROUP BY for aggregations
5. Add ORDER BY to sort results
6. Set LIMIT to control number of results
7. Click "Run Query" to execute
8. Save your query for later use

### Templates Tab
1. Browse 6 pre-built marketing queries
2. Click "Use Template" to load it into the builder
3. Click "Run" to execute directly
4. Modify templates to suit your needs

### Saved Queries Tab
1. View all your saved queries
2. Load saved queries back into the builder
3. Run saved queries directly
4. Delete queries you no longer need

## Sample Queries

**Top Customers by Revenue:**
```sql
SELECT customer_id, customer_name, SUM(order_total) as total_revenue
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id
GROUP BY customer_id, customer_name
ORDER BY total_revenue DESC
LIMIT 10
```

**Email Campaign Performance:**
```sql
SELECT campaign_name,
  COUNT(*) as emails_sent,
  SUM(opened) as total_opens,
  SUM(clicked) as total_clicks,
  ROUND(SUM(opened) * 100.0 / COUNT(*), 2) as open_rate,
  ROUND(SUM(clicked) * 100.0 / COUNT(*), 2) as click_rate
FROM email_campaigns
GROUP BY campaign_name
ORDER BY open_rate DESC
```

## Project Structure

```
sql-query-builder/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles with Tailwind
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md           # This file
```

## Key Features for Portfolio

This project demonstrates:

1. **Domain Knowledge**: Understanding of marketing data analysis needs
2. **SQL Expertise**: Building a tool that makes SQL accessible
3. **React Proficiency**: Complex state management and component architecture
4. **User Experience**: Intuitive interface for non-technical users
5. **Data Visualization**: Clean table rendering of query results
6. **Persistence**: LocalStorage integration for saving user data
7. **Export Functionality**: Practical feature for sharing queries
8. **Template System**: Reusable query patterns for efficiency

## Future Enhancements

- [ ] Support for JOIN operations in the visual builder
- [ ] Query validation and error suggestions
- [ ] More marketing query templates
- [ ] Export results as CSV
- [ ] Import custom data sources
- [ ] Query history/undo functionality
- [ ] Share queries via URL
- [ ] Dark/light theme toggle

## Built By

**Edou Mota**
RevOps & Marketing Automation Specialist
[GitHub](https://github.com/TheDuGuy)

## License

MIT
