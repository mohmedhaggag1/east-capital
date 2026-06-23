import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';

@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styleUrls: ['./delete-confirm.component.scss']
})
export class DeleteConfirmComponent implements OnInit {
  lang: string = "en";
  direction: boolean = true;
  sublang: Subscription;

  message: string = "";
  title: string = "";
  yes: string = "";
  no: string = "";

  constructor(public dialogRef: MatDialogRef<DeleteConfirmComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data,
    private provider: DataProvider,
    public i18n: I18N) {
    if (typeof data.message !== 'undefined') {
      this.message = data.message;
    }
    if (typeof data.title !== 'undefined') {
      this.title = data.title;
    }
    if (typeof data.yes !== 'undefined') {
      this.yes = data.yes;
    }
    if (typeof data.no !== 'undefined') {
      this.no = data.no;
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
