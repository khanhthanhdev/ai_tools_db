# Product Overview

AI Knowledge Cloud - A bilingual (English/Vietnamese) web application for discovering, reviewing, and managing AI tools.

## Core Features
- Browse and search AI tools with filtering by category, pricing, and language
- User authentication with Convex Auth (anonymous auth enabled)
- Add, edit, and delete tools (user-submitted content)
- Review and rating system for tools
- Favorites/bookmarking functionality
- Statistics dashboard
- Semantic search with vector embeddings (OpenAI ada-002)

## User Flows
- Anonymous users can browse and search tools
- Authenticated users can submit tools, write reviews, and save favorites
- All submitted tools are auto-approved (isApproved: true)
- Duplicate detection for tool names and URLs
