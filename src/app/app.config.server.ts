import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Server-specific application configuration
 * Adds providers specifically for server-side rendering
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    
    // Provide mock implementations for browser-only APIs
    {
      provide: 'BROWSER_APIS',
      useValue: {
        localStorage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        },
        sessionStorage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        },
        window: {}
      }
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
