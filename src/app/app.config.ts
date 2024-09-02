import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PoHttpRequestModule } from '@po-ui/ng-components';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import ptBr from '@angular/common/locales/pt';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';

registerLocaleData(ptBr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([BrowserAnimationsModule, PoHttpRequestModule]), provideAnimationsAsync(), provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: APP_BASE_HREF, useValue: window.location.pathname}
  ],
  
};