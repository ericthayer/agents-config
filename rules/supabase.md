---
description: Best practices for integrating Supabase for auth, database, and asset storage.
---

**OBJECTIVE:**
Implementing a secure, type-safe, and efficient integration with Supabase for data management and authentication.

**REASON:**
Ensures centralized client management, leverages TypeScript for end-to-end safety, and optimizes the handling of large 3D assets via Supabase Storage.

**DESCRIPTION:**
Guidelines for client initialization, authentication state management, and asset coordination between Supabase and Three.js.

**INSTRUCTIONS:**

### Environment Configuration
- **Standard Naming**: Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` files.
- **Validation**: Ensure these variables are present and valid before initializing the client to prevent silent runtime failures.

### Client Management
- **Singleton Pattern**: Initialize the Supabase client once in a dedicated file (e.g., `src/lib/supabase.ts`) and export it as a singleton.
- **Type Safety**: Generate TypeScript types using the Supabase CLI (`supabase gen types typescript --project-id ...`) and pass them to the `createClient` function for full IntelliSense support.

### Authentication
- **Auth Context**: Wrap the application (or relevant branches) in a `SupabaseAuthProvider` to manage user sessions and profiles.
- **Protecting Routes**: Use specialized hooks (e.g., `useAuth`) to handle redirects for protected versus public views.
- **Loading States**: Always account for the initial session check to avoid "flash of unauthenticated content."

### Database & RLS
- **RLS is Mandatory**: Never disable Row Level Security (RLS) in production. Always define specific policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- **Relational Integrity**: Use Foreign Key constraints and appropriate indexes to maintain data quality and query performance.

### Asset Storage (Three.js Specific)
- **Bucket Organization**: Store 3D models (`.glb`, `.gltf`) and textures (`.webp`, `.ktx2`) in dedicated Supabase Storage buckets.
- **Signed URLs**: Use signed URLs for private assets or assets requiring temporary access.
- **Caching**: Leverage Supabase's built-in CDN for public storage buckets to minimize latency when loading 3D scenes.

### Error Handling
- **User-Friendly Messages**: Transform Supabase error codes into human-readable feedback.
- **Retry Logic**: Implement exponential backoff for network-related failures, especially when uploading or downloading large assets.
