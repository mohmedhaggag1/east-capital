import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ThanksMessage } from 'src/app/model/thanksMessage';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';

@Component({
  selector: 'app-thanks-message',
  templateUrl: './thanks-message.component.html',
  styleUrls: ['./thanks-message.component.scss'],
})
export class ThanksMessageComponent implements OnInit {
  lang: string = "en";
  direction: boolean = true;
  sublang: Subscription;

  userRecord: any;
  thanksMessage = new ThanksMessage();

  constructor(public dialogRef: MatDialogRef<ThanksMessageComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private provider: DataProvider,
    public i18n: I18N) {
    if (typeof data.userRecord !== 'undefined') {
      this.userRecord = data.userRecord;
    }
    if (typeof data.thanksMessage !== 'undefined') {
      this.thanksMessage = data.thanksMessage;
    }
     
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
  }
  
  public decline() {
    this.dialogRef.close(false);
  }

  public accept() {
    this.dialogRef.close(true);
  }

  public dismiss() {
    this.dialogRef.close(null);
  }
}
