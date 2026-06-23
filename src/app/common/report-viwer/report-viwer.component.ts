import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { SessionProvider } from 'src/app/providers/session.provider';
import { UIService } from 'src/app/providers/ui.service';

@Component({
  selector: 'app-report-viwer',
  templateUrl: './report-viwer.component.html',
  styleUrls: ['./report-viwer.component.scss']
})
export class ReportViwerComponent implements OnInit {
  lang: string = "en";
  direction: boolean = true;
  i18nsub: Subscription;

  @Input() public pdfSrc: string = "";

  title: string = "";
  isIFrame: boolean = false;
  pdfSrcIFrame: SafeResourceUrl | undefined;

  pdfSrcFile: any = "../assets/images/attachAsset.pdf";
  page: number = 1;
  totalPages: number = 0;
  goToPageNumber: number | null = null;
  zoom: number = 1.0; // Normal size (100%), try 0.5 for 50%, 2.0 for 200%
  isAutoresize: boolean;

  constructor(
    public i18n: I18N,
    public dialogRef: MatDialogRef<ReportViwerComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private provider: DataProvider,
    private sanitizer: DomSanitizer,
    private ui: UIService) {
    if (data && data.pdfSrc) {
      this.pdfSrc = data.pdfSrc;
      this.pdfSrcIFrame = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    }
    if (data && data.title) {
      this.title = data.title;
    }
    if (data && data['isIFrame']) {
      this.isIFrame = data.isIFrame;
    }
  }

  async ngOnInit() {
    await this.provider.initCache();

    this.i18nsub = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
    this.loadReport();
  }

  ngOnDestroy() {
    if (this.i18nsub) {
      this.i18nsub.unsubscribe();
    }
  }

  loadReport() {
    const jsessionId = localStorage.getItem('cloud-session');
    this.pdfSrcFile = { url: this.pdfSrc, httpHeaders: { 'cloud-session': jsessionId, 'un': SessionProvider.user.username }, withCredentials: true };
  }


  onPdfLoad(pdf: PDFDocumentProxy) {
    this.totalPages = pdf.numPages;
  }

  goToPreviousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  goToNextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  goToPage() {
    if (this.goToPageNumber && this.goToPageNumber >= 1 && this.goToPageNumber <= this.totalPages) {
      this.page = this.goToPageNumber;
    }
  }

  goToFirstPage() {
    if (this.totalPages > 0) {
      this.page = 1;
    }
  }

  goToLastPage() {
    if (this.totalPages > 0) {
      this.page = this.totalPages;
    }
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom + 0.1, 4);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom - 0.1, 0.4);
  }

  zoomFull() {
    this.isAutoresize = (this.isAutoresize) ? null : true;
    this.zoom = 1;
  }

  downloadFile() {
    let pwa = window.open(this.pdfSrc);
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      this.ui.error('Please disable your Pop-up blocker and try again.');
    }
  }
}
