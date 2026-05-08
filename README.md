<div align="center">

# Class Pilot

### Intelligent attendance tracking and prediction for students

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Utility--First-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A modern attendance intelligence dashboard that helps students track attendance, predict safe bunk limits, and stay above required thresholds.

</div>

---

# Overview

Class Pilot is a React-based attendance management platform designed to simplify attendance tracking and eliminate manual percentage calculations.

Instead of only displaying attendance percentages, the system provides actionable insights such as:

- Classes required to recover attendance
- Safe skip limits
- Subject-wise risk levels
- Real-time attendance analytics

The application is built with a clean dark-themed interface focused on clarity, responsiveness, and usability.

---

# Features

| Feature | Description |
|---|---|
| Attendance Dashboard | Real-time attendance analytics across all subjects |
| Timetable Management | Weekly class scheduling and editing |
| Attendance Tracking | Session-wise attendance marking |
| Calendar Integration | Unified calendar-based attendance view |
| Activity & Event Tracking | Manage events and activity points |
| Risk Classification | Automatic Safe / Warning / Critical categorization |
| Predictive Insights | Calculates required and skippable classes |
| Responsive Design | Optimized for desktop and mobile devices |
| Persistent State | Shared state management using Context API |
| Error Boundary Handling | Isolated UI protection against component crashes |

---

# Why This Project Exists

Most college portals only display attendance percentages without providing meaningful guidance.

Class Pilot was created to solve practical student problems such as:

- How many classes can be skipped safely?
- How many consecutive classes are required to recover attendance?
- Which subjects are at risk?

The project converts attendance data into clear, actionable predictions using deterministic calculations instead of guesswork.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State Management | React Context API |
| Build Tool | Vite |
| Typography | DM Sans + DM Mono |
| Architecture | Provider-based SPA |

---

# Project Structure

```bash
class-pilot/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── TimetableEditor.jsx
│   │   ├── AttendanceInput.jsx
│   │   ├── CalendarView.jsx
│   │   └── EventManager.jsx
│   │
│   ├── contexts/
│   │   └── DataContext.jsx
│   │
│   ├── utils/
│   │   └── calculations.js
│   │
│   ├── App.jsx
│   └── index.css
│
├── public/
├── package.json
└── README.md
```

> Business logic is centralized inside `calculations.js` using pure utility functions to keep components modular and maintainable.

---

# Installation

## Prerequisites

- Node.js >= 16
- npm / yarn / pnpm

## Clone the Repository

```bash
git clone https://github.com/your-username/class-pilot.git
cd class-pilot
```

## Install Dependencies

```bash
npm install
```

---

# Running the Project

## Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

Default local server:

```bash
http://localhost:5173
```

---

# Usage Guide

## 1. Configure Timetable

Add subjects and weekly class slots using the timetable editor.

## 2. Mark Attendance

Record attendance session-wise from the attendance section.

## 3. View Analytics

Monitor:

- Attendance percentages
- Risk levels
- Required recovery classes
- Safe skip limits

## 4. Track Events

Manage college events and activity points from the events section.

## 5. Calendar Overview

Visualize attendance records and events chronologically.

---

# Workflow

```text
Timetable Setup
        ↓
Attendance Input
        ↓
Calculation Engine
        ↓
Dashboard Analytics
        ↓
Insights & Risk Prediction
```

The `DataContext` acts as the centralized source of truth shared across all components.

---

# Calculation Logic

All attendance-related logic is handled inside:

```bash
src/utils/calculations.js
```

## Risk Classification

```js
percentage >= 85  → Safe
percentage >= 75  → Warning
percentage < 75   → Critical
```

## Classes Required to Reach 85%

```text
x = ceil((0.85 × total − attended) / 0.15)
```

## Maximum Safe Skips

```text
x = floor((attended − 0.85 × total) / 0.85)
```

## Insight Generation

The system converts raw metrics into readable guidance such as:

- Attend 4 consecutive classes to reach 85%
- Maintain attendance to stay above threshold
- Can skip 2 classes safely

---

# Architecture Diagram

> Architecture and workflow diagrams will be added here later.

```text
[ System Architecture ]
[ Data Flow Diagram ]
[ Component Hierarchy ]
```

---

# Future Improvements

- Local storage persistence
- Progressive Web App support
- Smart attendance notifications
- Optional light theme support

---

# Challenges Faced

- Designing a session-aware attendance model
- Deriving predictive attendance formulas
- Maintaining synchronized state across multiple views
- Building a scalable design-token system
- Creating responsive navigation for mobile devices

---

# Learning Outcomes

- SPA architecture using React
- Context API state management
- Pure utility-based business logic
- Responsive UI development
- Error boundary implementation
- Mathematical modeling for attendance prediction
- Component-driven frontend design

---

# Contribution Guidelines

## Steps

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/feature-name

# Commit changes
git commit -m "Add feature"

# Push changes
git push origin feature/feature-name
```

Then open a Pull Request.

## Contribution Standards

- Keep components modular
- Maintain centralized calculation logic
- Follow existing design conventions
- Test responsive layouts
- Write meaningful commit messages

---

# License

This project is licensed under the MIT License.

See the `LICENSE` file for more information.

---

# Author

<div align="center">

**Navaneeth S**

[LinkedIn](www.linkedin.com/in/navaneeth-s-45148b361)

</div>

---

# Acknowledgements

- Lucide Icons
- Tailwind CSS
- DM Sans & DM Mono
- React Community

---

<div align="center">

### If you found this project useful, consider starring the repository.

Built for students who want clarity instead of manual attendance calculations.

</div>
