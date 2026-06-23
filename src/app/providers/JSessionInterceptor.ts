import { Injectable } from '@angular/core';

import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionProvider } from './session.provider';

@Injectable({
    providedIn: 'root'
})
export class JSessionInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jsessionId = localStorage.getItem('cloud-session');
        if (!jsessionId) return next.handle(req);
        let headers = req.headers.append('cloud-session', jsessionId).append('un', SessionProvider.user.username);
        return next.handle(req.clone({ headers: headers }));
    }
} 