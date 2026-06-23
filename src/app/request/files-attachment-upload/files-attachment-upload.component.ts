/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CurrentDoc, AttachmentType, NewDoc, UploadAllowTypes, FileSearchCriteria } from 'src/app/model/attachmentsRec';
import { Manipulate } from 'src/app/model/data-manipulate';
import { SmartResponse } from 'src/app/model/smart-communication';
import { Constants } from 'src/app/providers/Constants';
import { DataProvider } from 'src/app/providers/DataProvider';
import { I18N } from 'src/app/providers/i18n.provider';
import * as sparkmd5 from 'spark-md5';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UIService } from 'src/app/providers/ui.service';
import { StudentRequest } from '../../model/studentRequest';
import { Router } from '@angular/router';
import { SessionProvider } from '../../providers/session.provider';


var refreshStdRequest;
@Component({
  selector: 'app-files-attachment-upload',
  templateUrl: './files-attachment-upload.component.html',
  styleUrls: ['./files-attachment-upload.component.scss'],
})
export class FilesAttachmentUploadComponent implements OnInit {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  activeMask: boolean = false;
  ttlRequest: number = 0;

  attachmentDataSource = new MatTableDataSource<CurrentDoc>();
  selectedType: string;
  scanType: string;
  attachmentList: CurrentDoc[] = [];
  attachmentTableColumns: string[] = ['attachemt_type_select'];
  selectedRow: CurrentDoc = new CurrentDoc();
  attachmentTypeArr: AttachmentType[] = [];
  selectedDeleteRow = new CurrentDoc();
  studentAc: StudentRequest = new StudentRequest();
  // Variable to store shortLink from api response
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  file: File = null; // Variable to store file
  fileMd5Hash: string[] = [];
  inserDataList: NewDoc[] = [];
  isUploadMultiple: boolean = true;
  prsentageVal: number = 0;
  uploadMsg: string = "";

  test: SafeUrl;

  showVideo: boolean = false;
  showAudio: boolean = false;
  showPdf: boolean = true;

  uploadAllowTypesArr: UploadAllowTypes[] = [];
  allowedTypes: string[] = [];

  @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;

  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private ui: UIService,
    public i18n: I18N,
    public sanitizer: DomSanitizer,
    private provider: DataProvider,
    private router: Router,
    private session: SessionProvider,
  ) {

  }

  ngOnInit() {
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });

    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);
    this.getUploadallowtypes();
    this.getRegistrationData();
    refreshStdRequest = setInterval(() => {
      this.getRegistrationData();
    }, 30 * 1000);
  }

  // ngOnChanges() {
  //   this.loadAttachments();
  // }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
    if (refreshStdRequest) {
      clearInterval(refreshStdRequest);
    }
  }

  getRegistrationData() {
    let servletUrl: string = Constants.baseUrl + '/registration';
    const formData = new FormData();
    formData.append('transaction', 'select');
    this.eSendForm(this, 'select_registration_data', servletUrl, formData);
  }

  loadAttachmentType() {
    let servletUrl: string = Constants.baseUrl + '/AcademyDocument';
    const formData = new FormData();
    formData.append('degreeTypeCode', '' + this.studentAc.pre_university_degree);//main_category_flag);
    formData.append('transaction', 'select_list');
    this.eSendForm(this, 'attachment_type_select', servletUrl, formData);
  }

  // On file Select
  onChange(fileInput: HTMLInputElement, row: CurrentDoc) {
    if (!fileInput.files) {
      console.error('fileInput.files is not defined');
      return;
    }

    // Initialize row.upFile if it is null
    if (!row.upFile) {
      row.upFile = document.createElement('input');
      row.upFile.type = 'file';
    }

    const dataTransfer = new DataTransfer();

    // Add existing files in upFile if it has a files property
    if (row.upFile.files.length > 0) {
      for (let existingFile of row.upFile.files) {
        dataTransfer.items.add(existingFile);
      }
    }

    // Add new files from fileInput if they do not already exist
    for (let newFile of fileInput.files) {
      let fileExists = false;
      for (let existingFile of dataTransfer.files) {
        if (existingFile.name === newFile.name && existingFile.size === newFile.size && existingFile.type === newFile.type) {
          fileExists = true;
          break;
        }
      }
      if (!fileExists) {
        dataTransfer.items.add(newFile);
      }
    }

    // Assign the new FileList to upFile
    row.upFile.files = dataTransfer.files;
    if (row.attach_type_id) {
      row.entry_id = +this.studentAc.attachment_reference_no;
      row.module_name = "studentReg";
    } else {
      row.entry_id = row.additional_attach_id;
      row.module_name = "other";
    }

  }

  deleteRowFile(row: CurrentDoc, file: File) {
    if (!row.upFile || !row.upFile.files) {
      console.error('upFile or upFile.files is not defined');
      return;
    }

    const dataTransfer = new DataTransfer();

    // Add all files except the one to be deleted
    for (let i = 0; i < row.upFile.files.length; i++) {
      if (row.upFile.files[i] !== file) {
        dataTransfer.items.add(row.upFile.files[i]);
      }
    }

    // Assign the new FileList to upFile
    row.upFile.files = dataTransfer.files;
  }

  triggerFileInputClick(index: number) {
    const fileInput = this.fileInputs.toArray()[index];
    if (fileInput) {
      fileInput.nativeElement.value = null;
      fileInput.nativeElement.click();
    }
  }

  downloadRecord(selectedRow: CurrentDoc) {
    if (typeof selectedRow.download_pdf === 'undefined') {
      this.ui.error(this.i18n.get("corr.uploadFiles.errorNoDoc", "errorNoDoc"));
    } else {
      let servletUrl: string = selectedRow.download_pdf;
      let pwa = window.open(servletUrl);
      if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        this.ui.error('Please disable your Pop-up blocker and try again.');
      }
    }
  }

  insertDocInoutBound(newDocs: NewDoc[]) {
    if (newDocs == null) {
      this.ui.error(this.i18n.get("corr.uploadFiles.ERROR_UPLOADING_FILES", "ERROR_UPLOADING_FILES"));
      return;
    }
    let servletUrl: string = Constants.baseUrl + '/AttachmentsServlet';
    const formData = new FormData();
    formData.append('parentEntryId', this.studentAc.attachment_reference_no);
    formData.append('moduleName', "studentReg");
    formData.append('new_docs', JSON.stringify(newDocs));
    formData.append('transaction', 'insert');
    this.eSendForm(this, 'save_attachments', servletUrl, formData);
  }

  deleteDocumentRecord(selectedRow: CurrentDoc) {
    this.selectedDeleteRow = selectedRow;
    let servletUrl: string = Constants.baseUrl + '/AttachmentsServlet';
    const formData = new FormData();
    formData.append('fileId', '' + selectedRow.file_id);
    formData.append('transaction', 'delete');
    this.eSendForm(this, 'attachment_delete', servletUrl, formData);
  }

  loadAttachments() {
    if (this.studentAc.attachment_reference_no) {
      let servletUrl: string = Constants.baseUrl + '/AttachmentsServlet';
      const formData = new FormData();
      let fileSearchCriteriaArr: FileSearchCriteria[] = [];
      fileSearchCriteriaArr.push({ module_name: 'studentReg', parent_entry_id: this.studentAc.attachment_reference_no });
      for (let item of this.attachmentTypeArr) {
        if (item.additional_attach_id > 0) {
          fileSearchCriteriaArr.push({ module_name: 'other', parent_entry_id: item.additional_attach_id.toString() });
        }
      }
      formData.append('fileSearchCriteriaArr', JSON.stringify(fileSearchCriteriaArr));
      formData.append('transaction', 'select_tree'); // select_list
      this.eSendForm(this, 'load_attachments', servletUrl, formData);
    } else {
      this.doClear();
    }
  }

  getUploadallowtypes() {
    let servletUrl: string = Constants.baseUrl + '/crd/uploadallowtypes';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('isActiveOnly', 'true');
    this.eSendForm(this, 'select_all_upload_allow_types', servletUrl, formData);
  }

  doClear() {
    this.selectedRow = new CurrentDoc();
    this.selectedRow.pdfSrc =
      "../../../assets/images/attachAsset.pdf";
    this.selectedRow.readonly = true;
    this.attachmentList = [];
    this.attachmentDataSource = new MatTableDataSource<CurrentDoc>();
  }

  refreshTable() {
    this.attachmentDataSource.paginator = null;
    this.attachmentDataSource = new MatTableDataSource<CurrentDoc>();

    for (let item of this.attachmentTypeArr) {
      let x = new CurrentDoc();
      x.attach_type_id = item.attach_type_id;
      x.additional_attach_id = item.additional_attach_id;
      x.attachTypeDescr = item.attach_desc;
      this.attachmentDataSource.data.push(x);
    }

  }

  viewDocumentRecord(selectedRow: CurrentDoc, templateRef: TemplateRef<any>) {
    this.selectedRow = selectedRow;
    if (selectedRow.main_file_type.includes("audio")) {
      this.showVideo = false;
      this.showAudio = true;
      this.showPdf = false;
    } else if (selectedRow.main_file_type.includes("video")) {
      this.showVideo = true;
      this.showAudio = false;
      this.showPdf = false;
      console.log(selectedRow);
    } else {
      this.showVideo = false;
      this.showAudio = false;
      this.showPdf = true;
    }
    const dialogRef = this.dialog.open(templateRef, { disableClose: true, width: "100vw", maxWidth: '100vw', height: "100vh" });
    dialogRef.afterClosed().subscribe(dialogResult => {
    });
  }

  ttlFileOnType(row: CurrentDoc): number {
    if (row.additional_attach_id > 0) {
      return this.attachmentList.filter(x => x.entry_id == row.additional_attach_id).length;
    } else {
      return this.attachmentList.filter(x => x.attach_type_id == row.attach_type_id).length;
    }

  }

  updateStudentTimeStamp() {
    let servletUrl: string = Constants.baseUrl + '/student/timestamp';
    const formData = new FormData();
    formData.append('transaction', 'update');
    this.eSendForm(this, 'update_student_timestamp', servletUrl, formData);
  }

  eSendForm(
    handler: any,
    key: string,
    backendURL: string,
    formData: FormData) {
    formData.append('lang', this.lang);
    const options = {
      reportProgress: true as const,
      observe: 'events' as const,
      withCredentials: true
    }

    if (!(key === 'select_registration_data' || key === 'attachment_type_select' || key === 'load_attachments')) {
      this.ttlRequest += 1;
      this.activeMask = true;
    }

    this.httpClient.post<SmartResponse>(backendURL, formData, options)
      .subscribe((event) => {
        try {
          handler.eResponseEvent(key, event);
        } catch (error) {
          console.error("Response is success but 'responseEvent' implementation throws error => " + error);
        }
      }, (exception) => {
        handler.eResponseFailure(key, exception);
      });
  }

  /*Common Reselt between GET POST sendFORM*/
  eResponse(key: string, smartResponse: SmartResponse) {
    //console.log("Transaction '"+key+"' SUCCESS => \n" + JSON.stringify(smartResponse, null, 4));
    if (key === "check_file_md5") {
      let record = smartResponse.resultset[0];
      this.uploadOnServer(record);
    } else if (key === "select_registration_data") {
      let data = smartResponse.resultset[0];
      this.studentAc = data['masterRecordData'];
      if (this.attachmentTypeArr.length === 0) {
        this.loadAttachmentType();
      }

      if (this.studentAc.request_status === 1) {
        this.ui.warning(this.i18n.get('corr.ERROR_REQUEST_IS_CLOSED', 'ERROR_REQUEST_IS_CLOSED'));
        if (refreshStdRequest) {
          clearInterval(refreshStdRequest);
        }
      }
    } else if (key === "upload_file") {
      // Inser Into ERPFiles && InoutBoundFiles
      if (smartResponse.response.code == 200) {
        this.insertDocument();
      } else {
        this.ui.warning(this.i18n.get('Error While Upload Please try Again ' + smartResponse.response.code));
      }
    } else if (key === "inser_erp_files") {
      this.uploadMsg = this.i18n.get("corr.uploadFiles.uploadSuccess", "uploadSuccess");
      this.prsentageVal = 100;
      this.ui.success(this.i18n.get("corr.uploadFiles.uploadSuccess", "uploadSuccess"));
      this.insertDocInoutBound(this.inserDataList);
    } else if (key === "attachment_type_select") {
      this.attachmentTypeArr = Manipulate.set_fill(new AttachmentType(), smartResponse.resultset);
      this.refreshTable();
      this.loadAttachments();
    } else if (key === "save_attachments") {
      this.attachmentList.splice(0);
      this.attachmentList = Manipulate.set_fill(new CurrentDoc(), smartResponse.resultset["inoutBoundFilesArr"]);
      this.uploadMsg = "";
      this.prsentageVal = 0;
      this.loading = false;
      this.moveToSelectedTab(1);
      this.loadAttachmentType();
      this.updateStudentTimeStamp();
    } else if (key === "attachment_delete") {
      this.attachmentList.splice(this.attachmentList.indexOf(this.selectedDeleteRow), 1);
    } else if (key === "load_attachments") {
      if (typeof smartResponse.resultset['inoutBoundFilesArr'] != 'undefined') {
        this.attachmentList = smartResponse.resultset['inoutBoundFilesArr'];
      } else {
        this.attachmentList = [];
      }
      for (let element of this.attachmentList) {
        if (element.module_name === "other") {
          let atype = this.attachmentTypeArr.find(x => x.additional_attach_id == element.entry_id);
          element.attachTypeDescr = atype.attach_desc;
        }
      }
    } else if (key === "select_all_upload_allow_types") {
      this.allowedTypes = [];
      this.uploadAllowTypesArr = Manipulate.set_fill(new UploadAllowTypes(), smartResponse.resultset);
      this.uploadAllowTypesArr.forEach(element => {
        this.allowedTypes.push(element.allow_type);
      });
    }
  }


  eResponseSuccess(key: string, smartResponse: SmartResponse) {
    try {
      this.eResponse(key, smartResponse);
      if (!(key === 'select_registration_data' || key === 'attachment_type_select' || key === 'load_attachments')) {
        this.ttlRequest = this.ttlRequest - 1;
        if (this.ttlRequest <= 0) {
          this.ttlRequest = 0;
          setTimeout(() => {
            this.activeMask = false;
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Response is success but 'response' implementation in component  throws error => " + error);
      if (!(key === 'select_registration_data' || key === 'attachment_type_select' || key === 'load_attachments')) {
        this.ttlRequest = this.ttlRequest - 1;
        if (this.ttlRequest <= 0) {
          this.ttlRequest = 0;
          setTimeout(() => {
            this.activeMask = false;
          }, 1000);
        }
      }
    }
  }

  eFailure(key: string, exception: any) {
    console.log('key >> ' + key + ' ,  exception ' + JSON.stringify(exception, null, 4));
    if (!(key === 'select_registration_data' || key === 'attachment_type_select' || key === 'load_attachments')) {
      this.ttlRequest = this.ttlRequest - 1;
      if (this.ttlRequest <= 0) {
        this.ttlRequest = 0;
        setTimeout(() => {
          this.activeMask = false;
        }, 5000);
      }
    }
    if (key === "update_registration_data") {
      let error = exception['error'] || exception['errors'];
      let errorKey = error['errors'][0];
      this.ui.error(this.i18n.get('corr.' + errorKey, errorKey));
    } else if (key === "upload_file") {
      this.uploadMsg = "";
      this.prsentageVal = 0;
      this.loading = false;
      let error = exception['error'] || exception['errors'];
      if (error['errors']) {
        let errorKey = error['errors'][0];
        let errorKey2 = "";
        if (error['errors'][1]) {
          errorKey2 = error['errors'][1];
        }
        this.ui.error(this.i18n.get('corr.' + errorKey, errorKey) + " " + errorKey2);
      } else {
        this.ui.error(JSON.stringify(exception, null, 4));
      }
    } else {
      let error = exception['error'] || exception['errors'];
      if (error['errors']) {
        let errorKey = error['errors'][0];
        let errorKey2 = "";
        if (error['errors'][1]) {
          errorKey2 = error['errors'][1];
        }
        this.ui.error(this.i18n.get('corr.' + errorKey, errorKey) + " " + errorKey2);
      } else {
        this.ui.error(JSON.stringify(exception, null, 4));
      }

    }
  }

  eResponseFailure(key: string, exception: any) {
    try {
      this.eFailure(key, exception);
    } catch (error) {
      console.error("Response is success but 'response' implementation throws error => " + error);
    }
  }

  eResponseEvent(key: string, event: HttpEvent<any>) {
    if (event.type === HttpEventType.Sent) {
      //The request was sent out over the wire.
      console.log("event Sent => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      console.log("event UploadProgress => " + key + "=>" + JSON.stringify(event, null, 4));

      if (key === "upload_file") {
        this.uploadMsg = this.i18n.get("corr.uploadFiles.uploadStart", "uploadStart");
        this.prsentageVal = Math.round((event.loaded / event.total) * 100);
      }
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      console.log("event ResponseHeader => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      console.log("event DownloadProgress => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      console.log("event User => " + key + "=>" + JSON.stringify(event, null, 4));
    }
  }

  async onUploadFiles() {
    let isThereError: boolean = false;
    let ttlFilesNumber: number = 0;
    this.attachmentDataSource.data.forEach(element => {
      if ((typeof element.upFile !== 'undefined') && (typeof element.upFile.files !== 'undefined') && (element.upFile.files.length > 0)) {
        for (let file of element.upFile.files) {
          // 3 MiB for bytes. 
          if (file.size > Constants.file_uploade_max_size) {
            this.ui.error(file.name + " " + this.i18n.get("corr.uploadFiles.errFileUploadMaxSize", "Error: Select File upload max size is less than") + ' ' + (Constants.file_uploade_max_size / 1024 / 1024) + ' ' + this.i18n.get("corr.uploadFiles.MB", "MB"));
            isThereError = true;
          } else {
            ttlFilesNumber += 1;
          }
        }
      }
    });

    if (ttlFilesNumber === 0) {
      this.ui.error(this.i18n.get("corr.uploadFiles.errSelectFile", "errSelectFile"));
      isThereError = true;
    }
    if (!isThereError) {
      // Start Upload Files 
      this.fileMd5Hash.length = 0;

      for await (const element of this.attachmentDataSource.data) {
        if ((typeof element.upFile !== 'undefined') && (typeof element.upFile.files !== 'undefined') && (element.upFile.files.length > 0)) {
          for (let file of element.upFile.files) {
            this.loading = false;
            this.prsentageVal = 0;
            this.uploadMsg = "";

            const extension = this.getFileExtension(file.name);
            if (!this.allowedTypes.includes(extension)) {
              this.ui.error(this.i18n.get("corr.ERROR_THE_FILE_EXTENSION_IS_NOT_ALLOWED", "Error: The specified file type is not allowed:") + extension);
              return;
            }

            var fileMD5HashRec = await this.computeChecksumMd5(file);
            file['file_mdf5'] = fileMD5HashRec.toLocaleUpperCase();
            element.file_name = file.name;
            element.file_type = file.type;
            this.fileMd5Hash.push(fileMD5HashRec.toUpperCase());
          }
        }
      };

      this.CheckFilesIsExists();
    }
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop().toLowerCase() || '';
  }

  computeChecksumMd5(file: File): Promise<string> {
    let thisis = this;
    this.prsentageVal = 0;
    return new Promise((resolve, reject) => {
      let perc = 0;
      const chunkSize = 2097152; // Read in chunks of 2MB
      let totalParts = Math.ceil(file.size / chunkSize);
      let currentPart = 0;
      const spark = new sparkmd5.ArrayBuffer();
      const fileReader = new FileReader();

      let cursor = 0; // current cursor in file

      fileReader.onerror = function (): void {
        reject('MD5 computation failed - error reading the file');
      };

      // read chunk starting at `cursor` into memory
      function processChunk(chunk_start: number): void {
        perc = Math.round((currentPart / totalParts) * 100);
        thisis.prsentageVal = null;
        thisis.prsentageVal = perc;
        thisis.uploadMsg = thisis.i18n.get("corr.uploadFiles.analyzingFile", "analyzingFile");
        thisis.loading = true;
        const chunk_end = Math.min(file.size, chunk_start + chunkSize);
        fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
      }

      // when it's available in memory, process it
      // If using TS >= 3.6, you can use `FileReaderProgressEvent` type instead
      // of `any` for `e` variable, otherwise stick with `any`
      // See https://github.com/Microsoft/TypeScript/issues/25510
      fileReader.onload = function (e: any): void {
        currentPart += 1;
        spark.append(e.target.result); // Accumulate chunk to md5 computation
        cursor += chunkSize; // Move past this chunk

        if (cursor < file.size) {
          // Enqueue next chunk to be accumulated
          processChunk(cursor);
        } else {
          // Computation ended, last chunk has been processed. Return as Promise value.
          // This returns the base64 encoded md5 hash, which is what
          // Rails ActiveStorage or cloud services expect
          //resolve(btoa(spark.end(true)));

          // If you prefer the hexdigest form (looking like
          // '7cf530335b8547945f1a48880bc421b2'), replace the above line with:
          thisis.prsentageVal = 100;
          resolve(spark.end());
        }
      };

      processChunk(0);
    });
  }

  CheckFilesIsExists() {
    //1- Call to Fast Check one or more File MD5 and make decision to Upload or Skip File
    let servletUrl: string = Constants.baseUrl + '/checkfilemd5';
    const formData = new FormData();
    for (let i = 0; i < this.fileMd5Hash.length; i++) {
      let spret = "";
      if (i < 9) {
        spret = "0";
      }
      formData.append('file_md5_' + spret + (i + 1), this.fileMd5Hash[i]);
    }
    formData.append('transaction', 'select');
    formData.append('defaultUploadSys', Constants.defualtUploadSys);
    this.eSendForm(this, 'check_file_md5', servletUrl, formData);
  }


  uploadOnServer(result) {
    console.log('Start Upload uploadOnServer .... ');
    console.log(result);
    // 2-  Take the result and Check the uplaod setting to Upload on internal Server or External Server
    this.inserDataList.length = 0;
    let fileUploadSetting = result["fileUploadSettingRec"];
    let checkedFileList = result["checkFileList"];

    let servletUrl: string = "";
    const formData = new FormData();
    // External Server --
    servletUrl = fileUploadSetting.server_name + "" + fileUploadSetting.server_port + "" + fileUploadSetting.service_name_upload;
    formData.append('lang', this.lang);
    let ttlFilesNotFound = 0;
    let counter: number = 0;
    for (const item of this.attachmentDataSource.data) {
      if ((typeof item.upFile !== 'undefined') && (typeof item.upFile.files !== 'undefined') && (item.upFile.files.length > 0)) {
        for (let i = 0; i < item.upFile.files.length; i++) {
          let inserData: NewDoc = new NewDoc();
          inserData.file_guid = this.getGuid();
          inserData.file_name = item.upFile.files[i].name;
          inserData.file_type = item.upFile.files[i].type;
          inserData.attach_type_id = item.attach_type_id;
          inserData.file_mdf5 = item.upFile.files[i]['file_mdf5'];
          inserData.module_name = item.module_name;
          inserData.entry_id = item.entry_id;
          inserData.branch_server_id = fileUploadSetting.department_id;
          inserData.file_repository = fileUploadSetting.file_repository + "/" + item.module_name;
          inserData.is_current = false;
          const result = checkedFileList.filter(x => x['file_mdf5'] === item.upFile.files[i]['file_mdf5']);
          console.log(result[0]);
          inserData.isDataFound = result[0].isDataFound;
          if (result[0].isDataFound === false) {
            counter += 1;
            ttlFilesNotFound += 1;
            // check isDataFound
            let spret = "";
            if (i < 9) {
              spret = "0";
            }
            formData.append("file_guid_" + spret + counter + '' + (i + 1), inserData.file_guid);
            formData.append("file_upload_" + spret + counter + '' + (i + 1), item.upFile.files[i]);
            formData.append('file_repository', inserData.file_repository);
            formData.append('file_type', inserData.file_type);
          }
          this.inserDataList.push(inserData);
        }
      }
    }
    if (ttlFilesNotFound > 0) {
      formData.append('ess_sys_req', 'false');
      this.eSendForm(this, 'upload_file', servletUrl, formData);
    } else {
      this.insertDocument();
    }
  }

  insertDocument() {
    //3- Insert Into ERPFiles (File Path & File Name File Type & ... ) After Upload the File
    let servletUrl: string = Constants.baseUrl + '/checkfilemd5';
    const formData = new FormData();
    formData.append('lang', this.lang);
    formData.append('inoutBoundFiles', JSON.stringify(this.inserDataList));
    formData.append('transaction', 'insert');
    this.eSendForm(this, 'inser_erp_files', servletUrl, formData);
  }



  getGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  moveToSelectedTab(tabiIndex: number) {
    (<HTMLElement>document.querySelectorAll('.mat-tab-label')[tabiIndex]).click();
  }

}