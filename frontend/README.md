# PHitness Frontend

The frontend application for PHitness, built with React, Vite, and Tailwind CSS.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Axios for API communication
- React Router for navigation
- Context API for state management

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
├── lib/           # Utility functions
└── App.jsx        # Root component
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## Color Palette

- **Neon Green**: `#32CD32`
- **Balanced Green**: `#4CAF50`
- **Dark Gray**: `#1E1E1E`
- **Black**: `#121212`
- **Medium Gray**: `#2A2A2A`
- **Light Gray**: `#B0B0B0`
- **White**: `#F5F5F5`

## Environment Variables

The frontend expects the following environment variables:

- `VITE_API_URL`: Backend API URL (default: http://localhost:8080)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
