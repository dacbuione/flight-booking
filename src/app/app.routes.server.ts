import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side routes configuration
 * Defines how routes should be rendered on the server
 */
export const serverRoutes: ServerRoute[] = [
  // Routes with forms should use client-side rendering
  {
    path: 'auth/login',
    renderMode: RenderMode.Client
  },
  {
    path: 'flight-search',
    renderMode: RenderMode.Client
  },
  {
    path: 'flight-listing',
    renderMode: RenderMode.Client
  },
  {
    path: 'checkout/**',
    renderMode: RenderMode.Client
  },
  // Static routes can use prerendering
  {
    path: 'hotels/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => {
      return Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ]);
    }
  },
  {
    path: 'news/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => {
      return Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ]);
    }
  },
  {
    path: 'tours/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => {
      return Promise.resolve([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' }
      ]);
    }
  },
  // Home page has forms - render client-side
  {
    path: '',
    renderMode: RenderMode.Client
  },
  // Default fallback
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
