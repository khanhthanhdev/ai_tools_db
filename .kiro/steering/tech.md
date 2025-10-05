# Tech Stack

## Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 3 with CSS variables for theming
- **UI Components**: Radix UI primitives + shadcn/ui components
- **Animations**: Motion (Framer Motion successor)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

## Backend
- **Platform**: Convex (serverless backend)
- **Auth**: @convex-dev/auth with anonymous authentication
- **Database**: Convex DB with indexes and vector search
- **Deployment**: Connected to `industrious-snake-569`

## Key Libraries
- `class-variance-authority` + `clsx` + `tailwind-merge` for component styling
- `date-fns` for date handling
- `embla-carousel-react` for carousels
- `recharts` for data visualization

## Common Commands
```bash
# Development (runs both frontend and backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build

# Lint and type check
npm run lint
```

## Path Aliases
- `@/*` maps to `./src/*`

## Code Style
- TypeScript strict mode enabled
- Use functional components with hooks
- Lazy load route components for code splitting
- CSS variables for theming (HSL color format)
