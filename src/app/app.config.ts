import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from "@taiga-ui/i18n";
import { of } from "rxjs";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), 
    provideRouter(routes), 
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    NG_EVENT_PLUGINS,
    {
      provide: TUI_LANGUAGE,
      useValue: of(TUI_RUSSIAN_LANGUAGE),
    },
  ]
};
