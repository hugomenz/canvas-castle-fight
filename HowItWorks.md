# Canvas Castle Fight - How It Works

## Game Vision & Core Concept

Canvas Castle Fight is a real-time strategy game built on HTML5 Canvas where two players compete to destroy each other's castle while building their own army and defenses. The game combines resource management, strategic building placement, and tactical combat in a fast-paced, engaging experience.

## Core Game Mechanics

### 1. Resource Management System
- **Wood (🌳)**: Primary building material for structures
- **Food (🍗)**: Required for unit production and maintenance
- **Gold (💰)**: Currency for advanced buildings and upgrades
- **Upgrade Points (🌟)**: Special resource for technology advancement

Resources are automatically generated over time through the progress bar system, creating a steady flow that players must manage efficiently.

### 2. Building System
Players can construct various buildings on their side of the battlefield:

- **Arquería (Archery Range)**: Trains ranged units (Cost: 50 wood, 30 gold)
- **Establo (Stable)**: Produces cavalry units (Cost: 60 wood, 20 food, 40 gold)
- **Cuartel (Barracks)**: Trains infantry units (Cost: 70 wood, 10 food, 50 gold)

Each building has specific size requirements and must be placed strategically within the player's territory.

### 3. Grid-Based Battlefield
- **Grid System**: 25 rows × 50 columns with 16px cells
- **Player Zones**: Each player controls one side of the battlefield
- **Symmetrical Layout**: Ensures fair gameplay with mirrored starting positions
- **Placement Validation**: Prevents overlapping buildings and maintains zone restrictions

### 4. Player Structures
Each player starts with:
- **Castle**: Main structure that must be protected (5×5 size)
- **Two Towers**: Defensive structures positioned strategically (2×2 size each)

## Game Flow

1. **Resource Generation**: Automatic resource accumulation every few seconds
2. **Building Phase**: Players spend resources to construct military buildings
3. **Unit Production**: Buildings produce units that automatically advance toward the enemy
4. **Combat Resolution**: Units engage in battle when they meet
5. **Victory Condition**: Destroy the enemy castle to win

## Technical Architecture

### Angular Components Structure
- **Layout Components**: Header, footer, and sidebars for UI organization
- **Game Components**: 
  - Top bar for resource display
  - Progress bar for resource generation timing
  - Bottom bar for building selection
- **Canvas Components**: Main game area with base canvas and overlay for interactions
- **Core Services**: GameService manages state, resources, and game logic

### Service Layer
- **GameService**: Central game state management using RxJS observables
- **Resource Management**: Real-time updates and validation
- **Building Selection**: Reactive building placement system

## User Experience Design

The interface is designed for clarity and quick decision-making:
- **Resource Display**: Always visible at the top
- **Building Selection**: Easy-access bottom panel with visual costs
- **Visual Feedback**: Color-coded buildings and clear selection states
- **Responsive Layout**: Adapts to different screen sizes while maintaining game area

## Strategic Depth

Players must balance multiple concerns:
- **Economy vs Military**: Investing in immediate military or long-term economy
- **Unit Composition**: Different buildings produce different unit types
- **Timing**: When to build, when to attack, when to defend
- **Positioning**: Optimal placement of buildings for tactical advantage

## Future Vision

The game is designed to expand into a comprehensive RTS experience with:
- Advanced unit types and abilities
- Technology trees for upgrades
- Multiple game modes and maps
- Multiplayer capabilities
- AI opponents with different difficulty levels
- Tournament and ranking systems

This foundation provides a solid base for a competitive, skill-based strategy game that's easy to learn but difficult to master.