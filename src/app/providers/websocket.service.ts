import { Injectable } from '@angular/core';
import { Constants } from './Constants';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionProvider } from './session.provider';
import { Users } from '../model/users';
import { MatDialog } from '@angular/material/dialog';
import { I18N } from './i18n.provider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';

var refreshIntervalId;
var aliveIntervalId;
@Injectable({
    providedIn: 'root'
})

export class WebsocketService {
    constructor(
        public i18n: I18N,
        private _snackBar: MatSnackBar,
        private httpClient: HttpClient,
        public dialog: MatDialog,
        private cookieService: CookieService,
        private router: Router) { }

    numberOfRetry: number = 0;

    public checkUserSession() {
        refreshIntervalId = setInterval(() => {
            if (localStorage.getItem('login_guid')) {
                let url = Constants.baseUrl + '/cs?u=' + SessionProvider.user.username + '&id=' + localStorage.getItem('login_guid');
                this.httpClient.post(url, "", Constants.httpOptions)
                    .toPromise().then(resp => {
                        if (resp['status'] === 200) {
                            this.numberOfRetry = 0;
                        } else {
                            this.numberOfRetry += 1;
                            if (((typeof resp['status'] !== 'undefined') && (resp['status'] === 400)) || this.numberOfRetry === 3) {
                                this._snackBar.open('You are Login From Another Pc ', 'Sorry, Your Session is Expired');
                                this.numberOfRetry = 0;
                                clearInterval(refreshIntervalId);
                                this.logout();
                            }
                        }
                    }).catch(err => {
                        this.numberOfRetry += 1;
                        if ((
                            (typeof err['status'] !== 'undefined') &&
                            ((err['status'] === 400) || (err['status'] === 401))
                        ) || this.numberOfRetry === 3) {
                            this._snackBar.open('You are Login From Another Pc ', 'Sorry, Your Session is Expired');
                            this.numberOfRetry = 0;
                            clearInterval(refreshIntervalId);
                            this.logout();
                        }
                        // Disconnected or offline !!
                    });
            } else {
                clearInterval(refreshIntervalId);
            }
        }, 30 * 1000);
    }

    public logout() {
        this.dialog.closeAll();
        localStorage.removeItem('user');
        localStorage.removeItem('cloud-session');
        localStorage.removeItem('login_guid');
        localStorage.removeItem('imgProfile');
        localStorage.removeItem('fingerprint-record');
        Constants.httpOptions.headers['cloud-session'] = null;
        // Clear the authentication cookie
        this.cookieService.clearCookie(Constants.COOKIE_JSESSIONID_NAME);
        SessionProvider.user = new Users();
        SessionProvider.subject_user.next(SessionProvider.user);

        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
        }
        if (aliveIntervalId) {
            clearInterval(aliveIntervalId);
        }
        this.router.navigate(['login']).then(() => {
            window.location.reload();
        });
    }

    doLogOut() {
        let servletUrl = Constants.baseUrl + "/logout";
        let parameter: HttpParams = new HttpParams().append("userName", SessionProvider.user.username);
        let options: any = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            params: parameter,
            reportProgress: true as const,
            observe: 'body' as const,
            responseType: 'json' as const,
            withCredentials: false
        };
        this.httpClient.post<any>(servletUrl, "", options)
            .subscribe((response) => {
                try {
                    SessionProvider.user = new Users();
                    if (response['code'] === 200) {
                        this.logout();
                    }
                } catch (error) {
                    this.logout();
                }
            }, (exception) => {
                this.logout();
                console.trace(exception);
                // this._snackBar.open(this.i18n.get("EXCEPTION_WHILE_LOGOUT", "EXCEPTION WHILE LOGOUT"));
            });
    }
}