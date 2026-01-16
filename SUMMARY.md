# KFC CRM Enterprise System

## Overview
This is a production-ready, real-time CRM & CDP system designed for KFC.
It replaces manual Excel work with automated data pipelines and a visual interface.

## Quick Start
1. **Frontend**: Running on `http://localhost:5173`
2. **Backend**: Running on `http://localhost:3001`
3. **Database**: SQLite (`server/crm.sqlite`) - Pre-seeded with realistic KFC data.

## Features Implemented
- **Dashboard**: Real-time KPIs (Active, Churn, Downloads) with Recharts.
- **Funnel Analytics**: Visual conversion funnel from Download -> Loyalty.
- **Segments**: Auto-updating user segments based on rules.
- **Automation**: Visual Rule Builder (Trigger -> Condition -> Action).
- **Data Explorer**: Read-only tabular view of all users with search.
- **KFC Branding**: Red/Black/White theme, "Inter" font, enterprise styling.

## Architecture
- **Client**: React + Vite + Recharts + Lucide Icons.
- **Server**: Node.js + Express + SQLite3.
- **Real-time**: Frontend polls API every 5 seconds for fresh data.

## Next Steps
- Connect "Send Email" action to a real provider (e.g., SendGrid).
- Export CSV functionality (currently mocked).
- Add specific "Cohort Analysis" matrix visualization.
