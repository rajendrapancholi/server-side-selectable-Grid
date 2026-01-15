# React Internship Assignment

## Overview

This project is a React application that displays artwork data from the **Art Institute of Chicago API** in a tabular format. The application demonstrates server-side pagination and persistent row selection using the **PrimeReact DataTable** component.

The goal of this assignment is to showcase practical React skills, API integration, state management, and UI component usage.

---

## Features

- Fetches live artwork data from a public REST API
- Displays data using PrimeReact DataTable
- Server-side pagination
- Persistent row selection across pages
- Clean and responsive UI

---

## API Reference

**Base Endpoint**

```
https://api.artic.edu/api/v1/artworks
```

**Example Request**

```
https://api.artic.edu/api/v1/artworks?page=1
```

---

## Displayed Data Fields

The table displays the following artwork fields:

- Title
- Place of Origin
- Artist Display
- Inscriptions
- Date Start
- Date End

---

## Tech Stack

- React
- Vite
- PrimeReact
- Bun (package manager)
- JavaScript / TypeScript

---

## Installation & Setup

### Prerequisites

- Bun installed on your system

### Steps

1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies

```bash
bun install
```

3. Start the development server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`.

---

## Implementation Notes

- Server-side pagination is implemented using the API `page` parameter.
- Selected rows are stored in state to ensure persistence when navigating between pages.
- PrimeReact DataTable is configured in lazy mode to handle pagination efficiently.

---

## Folder Structure

```
src/
├── App.css
├── App.tsx
├── assets
│   └── react.svg
├── components
│   └── TableData.tsx
├── index.css
└── main.tsx

```

---

## Assignment Objective

This assignment evaluates:

- React fundamentals
- API consumption and pagination
- State management
- UI component integration
- Code structure and readability

---

## License

This project is created for internship evaluation purposes only.
