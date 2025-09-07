# Overview

This is an Australian Rules Football (Aussie Rules Footy) game recreation inspired by the 1991 NES classic. The application is a full-stack web game built with React frontend and Express backend, featuring a complete game engine with physics simulation, AI players, team management, and classic retro-style gameplay mechanics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Single-page application built with React 18 and TypeScript
- **Canvas-based Game Engine**: Custom 2D game engine using HTML5 Canvas for real-time gameplay rendering
- **Component Structure**: Modular game components including MainMenu, TeamSelection, GameCanvas, and GameUI
- **State Management**: Zustand stores for game state (useFooty) and audio management (useAudio)
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Comprehensive Radix UI component library for consistent interface elements

## Backend Architecture
- **Express Server**: Node.js Express server with TypeScript
- **Modular Route Structure**: Centralized route registration with storage abstraction
- **In-Memory Storage**: Default MemStorage implementation with interface for easy database swapping
- **Development Setup**: Vite integration for hot module replacement and development tooling

## Game Engine Components
- **Physics Engine**: Custom collision detection, ball physics with gravity and bouncing
- **AI System**: Basic AI for computer-controlled players with ball-seeking and goal-oriented behavior
- **Audio Manager**: Sound effect and background music management with mute controls
- **Control System**: Keyboard input handling for player movement and game actions
- **Team Management**: Complete team roster with 18 AFL teams, colors, and player data

## Data Storage Solutions
- **Database Layer**: Drizzle ORM configured for PostgreSQL with migrations support
- **Schema Design**: User management schema with extensible structure for game data
- **Storage Interface**: Abstract storage layer allowing switching between in-memory and database storage
- **Session Management**: Express session handling with PostgreSQL session store

## External Dependencies
- **Database**: PostgreSQL via Neon Database serverless connection
- **UI Framework**: Radix UI primitives for accessible component foundation  
- **Animation**: React Three Fiber and Drei for potential 3D graphics enhancement
- **Development Tools**: Vite for bundling, TSX for TypeScript execution, ESBuild for production builds
- **Audio Support**: Web Audio API for game sounds and background music
- **Fonts**: Inter font family for consistent typography