# Tank Game

A 2D top-down tank battle game built with HTML5 Canvas and JavaScript.

## Features

- Smooth tank movement with realistic physics
- Independent turret rotation following mouse position
- Two types of ammunition:
  - AP (Armor Piercing) - Left click, faster speed
  - HE (High Explosive) - Right click, slower speed
- Realistic shooting mechanics:
  - 2-second reload time between shots
  - Muzzle flash effects
  - Sound effects for shooting and reloading
- Large scrollable map with tile-based terrain
- Sprite-based graphics with proper rotations

## Controls

- **W**: Move forward
- **S**: Move backward (half speed)
- **A**: Rotate tank left
- **D**: Rotate tank right
- **Mouse Movement**: Aim turret
- **Left Click**: Fire AP round
- **Right Click**: Fire HE round

## Technical Features

- Sprite-based rendering system
- Particle system for effects
- Physics-based movement with acceleration and friction
- Audio system with multiple sound effects
- Smooth camera following with bounds checking
- Efficient tile-based map rendering
- Performance-optimized collision detection

## Assets Required

- `tank-body.png`: Tank body sprite
- `tank-turret.png`: Tank turret sprite
- `tank-shot.wav`: Firing sound effect
- `reload.wav`: Reload sound effect
