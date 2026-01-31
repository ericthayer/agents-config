---
description: Guidelines for building production-ready React applications with Three.js and AI-powered tools.
---

**OBJECTIVE:**
Building production-ready React applications with [Three.js](https://threejs.org/manual/#en/creating-a-scene) and AI-powered APIs and tooling.

**REASON:**
Ensures high performance, proper resource management, and clean React integration when working with complex 3D scenes in a web environment.

**DESCRIPTION:**
This rule provides a comprehensive set of best practices for Three.js development within a React ecosystem, focusing on memory management, rendering optimization, and asset handling.

**INSTRUCTIONS:**

### Resource Management
- **Always dispose** of `Geometry`, `Material`, `Texture`, and `Renderer` objects in component cleanup to prevent WebGL memory leaks.
- Call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, and `renderer.dispose()` in the `useEffect` cleanup function.
- Dispose of post-processing passes and composers when unmounting.

### Performance Optimization
- **Cap pixel ratio** to `Math.min(window.devicePixelRatio, 2)` to balance quality and performance.
- Set `powerPreference: "high-performance"` in `WebGLRenderer` options.
- **Reuse objects** (Vector3, Color, etc.) instead of creating new instances in the animation loop.
- Use `BufferGeometry` instead of legacy `Geometry`.
- Limit particle counts and geometry complexity based on device capabilities.

### React Integration
- Use `useRef` for canvas elements and Three.js objects (scene, camera, renderer).
- Initialize Three.js in `useEffect` with proper cleanup in the return function.
- Cancel `requestAnimationFrame` on component unmount to prevent memory leaks.
- **Avoid storing Three.js objects in React state**; use refs instead.

### Responsive Design
- Handle window resize events to update camera aspect ratio and renderer size.
- Update post-processing composer and pass resolutions on resize.
- Debounce resize handlers if performing expensive recalculations.

### Animation Loop
- Use `requestAnimationFrame` for smooth 60fps rendering.
- Store the animation frame ID and cancel it in cleanup.
- Implement delta time for frame-rate independent animations when needed.

### Scene Organization
- Use `THREE.Group` to organize related objects for easier transformation and cleanup.
- Separate static and dynamic objects for optimization opportunities.
- Use meaningful names for objects to aid debugging (`object.name = "particleSystem"`).

### Asset Loading
- Use `GLTFLoader` for 3D models (preferred format for web).
- Implement `LoadingManager` for coordinated loading with progress tracking.
- Use `DRACOLoader` for compressed GLTF files to reduce file size.
- Handle loading errors gracefully with user feedback.
- Consider lazy loading non-critical 3D assets.

### Shaders and Materials
- Minimize dynamic lights; prefer baked lighting or environment maps (HDRI).
- Use `ShaderMaterial` for custom effects but keep shaders optimized.
- Avoid heavy branching and loops in fragment shaders.
- Use `MeshStandardMaterial` or `MeshPhysicalMaterial` for PBR workflows.
- Set `depthWrite: false` and `transparent: true` appropriately for particle systems.

### Post-Processing
- Use `EffectComposer` for post-processing effects.
- Order passes efficiently (RenderPass → effects → FXAA/SMAA last).
- Disable unused passes to save performance.
- Update pass resolutions on window resize.

### Interaction
- Throttle or debounce mouse/touch event handlers for expensive calculations.
- Use raycasting efficiently; limit the number of objects tested.
- Implement smooth camera controls with lerping for better UX.

### Framework Consideration
- For complex scenes, consider migrating to `@react-three/fiber` and `@react-three/drei` for declarative Three.js in React.
- These libraries provide React-friendly abstractions, automatic disposal, and helpful hooks.
