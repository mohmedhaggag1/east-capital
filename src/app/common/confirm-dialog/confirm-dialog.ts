/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Inject, Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
    message: string,
    title: string,
    yes: string,
    no: string
}

@Component({
    selector: 'confirm-dialog',
    templateUrl: 'confirm-dialog.html',
})
export class ConfirmDialog {

    constructor(public dialogRef: MatDialogRef<ConfirmDialog>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }

}