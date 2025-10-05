# Project Structure

## Frontend (`src/`)
```
src/
├── components/
│   ├── ui/              # shadcn/ui components (buttons, dialogs, etc.)
│   ├── kokonutui/       # Custom UI components (hero, cards, etc.)
│   └── *.tsx            # Feature components (Layout, ToolCard, etc.)
├── pages/               # Route components (lazy loaded except BrowsePage)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
├── translations.ts      # i18n strings
└── index.css            # Global styles and CSS variables
```

## Backend (`convex/`)
```
convex/
├── schema.ts            # Database schema with tables and indexes
├── aiTools.ts           # Queries/mutations for AI tools
├── favourites.ts        # Favourites functionality
├── reviews.ts           # Review system
├── users.ts             # User management
├── auth.ts              # Auth helpers
├── auth.config.ts       # Auth configuration
├── http.ts              # HTTP routes (auth endpoints)
├── router.ts            # User-defined HTTP routes
└── _generated/          # Auto-generated Convex types
```

## Key Patterns

### Component Organization
- Page components in `src/pages/` (one per route)
- Reusable UI primitives in `src/components/ui/`
- Feature-specific components in `src/components/`
- Use lazy loading for non-critical routes

### Backend Patterns
- Queries for read operations (reactive, cached)
- Mutations for write operations (transactional)
- Use indexes for efficient queries
- Validate inputs with Convex validators (`v.*`)
- Auth check with `getAuthUserId(ctx)`
- Normalize data (URLs, names) before duplicate checks

### Data Model
- `aiTools`: Main entity with vector embeddings for semantic search
- `favourites`: User-tool relationship
- `reviews`: User reviews with ratings
- `reviewVotes`: Helpful votes on reviews
- Auth tables from `@convex-dev/auth`

### Styling
- Tailwind utility classes
- CSS variables for theme colors (defined in `index.css`)
- Component variants with `class-variance-authority`
- Use `cn()` helper to merge classes

## Configuration Files
- `vite.config.ts`: Build config with chunk splitting
- `tailwind.config.js`: Theme and plugin configuration
- `tsconfig.json`: TypeScript paths and references
- `components.json`: shadcn/ui configuration
