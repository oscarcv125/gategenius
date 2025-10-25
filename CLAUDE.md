# GateGenius - HackMTY 2025

## Project Overview

**GateGenius** is an AI-powered airline catering intelligence platform that solves 3 major operational problems for Gategroup:

1. **Expiration Date Management** - Stop food waste from expired products
2. **Consumption Prediction** - Predict what passengers actually eat to optimize loading
3. **Workforce Planning** - Calculate exact workforce needs for drawer assembly

The **killer feature** is the Smart Flight Assignment that combines all 3 modules using AI to assign near-expiry products to flights with high consumption predictions, saving $164M annually across Gategroup's global network.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3
- **State Management**: Zustand
- **Data Processing**: PapaParse (CSV parsing)
- **AI Integration**: Gemini API (Vision + Text)
- **Charts**: Recharts
- **Icons**: Lucide React

## Team Structure

- **Abel**: Data services, API integration, Zustand stores, smart algorithms
- **Hermann**: Expiration Intelligence Dashboard (Module 1)
- **Diego**: Consumption Prediction Dashboard (Module 2)
- **Oscar**: Workforce Planning (Module 3) + Smart Assignment Integration

## Architecture

### Data Flow
```
CSV Files → DataService → Zustand Stores → React Components
```

### Key Components
- **DataService**: Parses CSV data and performs calculations
- **Zustand Stores**: Manages state for each module (expiry, consumption, productivity)
- **Gemini API**: Vision scanning and AI predictions
- **Smart Assignment Algorithm**: Combines all 3 modules for intelligent recommendations

## Current Status

✅ **Phase 1 Complete** - Foundation built and working
- All module dashboards created with real data
- Zustand stores fully functional
- Smart assignment algorithm implemented
- Build succeeds, dev server running
- Ready for parallel team development

## What's Next

**Day 2**: Full functionality
- Real Gemini API integration
- Camera scanning UI
- Flight selector and predictions
- Charts and visualizations

**Day 3**: Polish and demo
- UI/UX refinements
- Animations
- Demo preparation
- Backup materials

## ROI

- **Single Facility**: $93,600 saved per year
- **200 Facilities**: $18.7 million saved annually
- **Global Network**: $164 million saved annually

This is a hackathon-winning solution that addresses a real $164M problem with AI!
