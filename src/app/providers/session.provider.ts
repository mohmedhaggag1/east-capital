import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Users } from '../model/users';

@Injectable({
    providedIn: 'root'
})
export class SessionProvider {
    public static s: any = null;
    public static user: Users = new Users();
    public static subject_user = new Subject<Users>();

    constructor(private router: Router) {
    }

    isLoggedIn() {
        try {
            let id = SessionProvider.user.id || SessionProvider.user['user_id'];
            if (id > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}
