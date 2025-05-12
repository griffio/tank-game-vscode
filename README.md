# Tank Game

Prompt

```
Create a game using plain html/css and javascript
Scenerio
A top-down 2D single-player tank battle game with retro 8-bit graphics.
The assets folder contains a tank sprite with a tank body and tank turret
The turrent should rotate
W, A, S, D: Move the tank
Mouse: Aim the tank's turret

Left Click: Fire Armor Piercing (AP) ammo
Right Click: Fire High Explosive (HE) ammo

The tile assets are the game map - this should be a scrollable map area

The tank should use simple physics to accelerate and stop
```

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
