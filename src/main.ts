const url = window.location.href;

const params = new URLSearchParams(window.location.search);
if (params.has('ref')) {
  localStorage.setItem('ref', params.get('ref')!);
}
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
