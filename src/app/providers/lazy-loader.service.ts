import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoaderService {

  private loadedScripts = new Set<string>();
  private loadedStyles = new Set<string>();

  loadScript(src: string): Promise<void> {
    if (this.loadedScripts.has(src)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  loadStyle(href: string): Promise<void> {
    if (this.loadedStyles.has(href)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      link.onload = () => {
        this.loadedStyles.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
}
