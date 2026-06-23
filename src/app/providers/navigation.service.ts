/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";

@Injectable({ providedIn: "root" })
export class NavigationService {
    private history: string[] = [];

    constructor(private router: Router, private location: Location) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.history.push(event.urlAfterRedirects);
            }
        });
    }

    back(): void {
        this.history.pop();
        if (this.history.length > 0) {
            this.location.back();
        } else {
            this.router.navigateByUrl("/"), { replaceUrl: true };
        }
    }
}