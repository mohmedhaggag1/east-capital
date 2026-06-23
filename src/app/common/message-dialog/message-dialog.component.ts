import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ThanksMessage } from 'src/app/model/thanksMessage';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent implements OnInit {
  lang: string = "en";
  direction: boolean = true;
  i18nsub: Subscription;

  record = new ThanksMessage();
  yes: string = "";
  no: string = "";
  show_checkbox: boolean = false;
  accept_terms: boolean = false;
  htmlSafe: SafeHtml;

  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private provider: DataProvider,
    public i18n: I18N,
    private sanitizer: DomSanitizer) {
    if (typeof data.thanksMessage !== 'undefined') {
      this.record = data.thanksMessage;
      if (this.lang === 'en') {
        this.htmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.record.message_en);
      } else {
        this.htmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.record.message_ar);
      }
    }
    if (typeof data.yes !== 'undefined') {
      this.yes = data.yes;
    }
    if (typeof data.no !== 'undefined') {
      this.no = data.no;
    }

    if (typeof data.show_checkbox !== 'undefined') {
      this.show_checkbox = data.show_checkbox;
    }
  }

  ngOnInit() {
    this.i18nsub = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);

  }

  ngOnDestroy() {
    if (this.i18nsub) {
      this.i18nsub.unsubscribe();
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
