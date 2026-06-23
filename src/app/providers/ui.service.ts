import { Injectable } from '@angular/core'; 
import { MatDialog } from '@angular/material/dialog';
import { I18N } from './i18n.provider';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialog } from '../common/confirm-dialog/confirm-dialog';

@Injectable({
    providedIn: 'root'
})
@Injectable()
export class UIService {


    // static toastOptions = {
    //     "positionClass": "toast-bottom-center",
    //     opacity: 1,
    //     enableHtml: true,
    //     timeOut: 20000
    // }

    constructor(public i18n: I18N, public dialog: MatDialog, private toastr: ToastrService) {
        toastr.toastrConfig.autoDismiss = true;
        toastr.toastrConfig.countDuplicates = true;
        toastr.toastrConfig.enableHtml = true;
        toastr.toastrConfig.maxOpened = 6;
        toastr.toastrConfig.preventDuplicates = true;
        toastr.toastrConfig.resetTimeoutOnDuplicate = true;
        toastr.toastrConfig.positionClass = 'toast-bottom-right';
        // toastr.toastrConfig.timeOut = 500000;

    }

    public info(message: string, title: string = null) {
        this.toastr.info(this.i18n.get(message, message), (title)? this.i18n.get(title, title) : null);
    }

    public warning(message: string, title: string = null) {
        this.toastr.warning(this.i18n.get(message, message), (title)? this.i18n.get(title, title) : null);
    }

    public success(message: string, title: string = null) {
        this.toastr.success(this.i18n.get(message, message), (title)? this.i18n.get(title, title) : null);
    }

    public error(message: string, title: string = null) {
        this.toastr.error(this.i18n.get(message, message), (title)? this.i18n.get(title, title) : null, {
            positionClass: 'toast-bottom-center'
        });
    }

    public confirm(message: string, title: string, yes: string, no: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const dialogRef = this.dialog.open(ConfirmDialog, {
                closeOnNavigation: true,
                data: {message: message, title: title, yes: yes, no: no}
            });
          
            dialogRef.afterClosed().subscribe(result => {
                resolve(result);
                return result;
            });
        })
    }

}