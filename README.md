# Smart Expense Tracker 💸

> "Track every rupee. Manage your money smarter."

Smart Expense Tracker is a premium MERN Stack web application designed to help users manage their daily expenses and incomes. It features secure JWT authentication, real-time budget threshold warnings, detailed transaction filtering/sorting, interactive Chart.js visualizations, and offline CSV/PDF report exports.

---

## Technical Stack

* **Frontend**: React + Vite, Tailwind CSS, React Router, Chart.js, Lucide Icons (in `frontend/` folder)
* **Backend**: Node.js, Express.js (in `backend/` folder)
* **Database**: MongoDB (using Mongoose) with an **automatic in-memory JSON fallback** if MongoDB is offline.
* **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing

---

## Features

1. **Premium Dark Mode & Glassmorphic UI**: Inspired by Linear.app and Apple designs with smooth transitions and glow effects.
2. **Interactive Dashboard**:
   * Metrics: Net Balance, Total Income, Total Expenses, and Monthly Spending.
   * Visual Charts: Expense distribution pie chart and Income vs. Expense bar chart.
   * Goal Tracker: Real-time progress bar representing monthly budget utilization.
3. **Transaction Forms**:
   * Add Income: Log earnings with custom categories.
   * Add Expense: Log spending with real-time warnings if the transaction pushes you past your monthly limit.
4. **Unified Ledger History**:
   * Full-text search and category filters.
   * Date range, month, and year filter selectors.
   * Multi-column sorting (newest, oldest, amount).
   * Export details to **CSV** spreadsheet or print a clean **PDF Report**.
5. **Secure Settings**:
   * Update name, email, and set monthly budget thresholds.
   * Convert and save profile pictures as Base64 strings.
   * Change passwords or safely delete the entire account.

---

## Installation & Running

This project is structured for easy running. You can launch both the frontend and backend servers concurrently.

### Prerequisites

You must have **Node.js** (which includes `npm`) installed on your system.

### Running the App

1. Open your terminal in the root project folder.
2. Install all dependencies for the root, frontend, and backend:
   ```bash
   npm run install-all
   ```
3. Run the development server (runs frontend on port `3000` and backend on port `5000` concurrently):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Graceful Database Fallback

If a local MongoDB instance (`mongodb://127.0.0.1:27017/smart-expense-tracker`) is not running, the backend server will **automatically fall back to a mock local JSON-file database** under `backend/data/`. This allows you to immediately run and test the full registration, login, and CRUD functionalities of the website without requiring any database setup!
