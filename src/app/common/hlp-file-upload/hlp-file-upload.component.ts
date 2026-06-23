/**
 * @author Mohammad Zidan
 * <a href="mailto:mohamed.zidan@esmartsoft.com.eg">mohamed.zidan@esmartsoft.com.eg</a>
 */
import { Component, OnInit, Inject } from '@angular/core';
import { HttpHeaders, HttpParams, HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import * as sparkmd5 from 'spark-md5';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SmartResponse, SmartRequest } from 'src/app/model/smart-communication';
import { Constants } from 'src/app/providers/Constants';
import { DataProvider } from 'src/app/providers/DataProvider';
import { UIService } from 'src/app/providers/ui.service';
import { FileUploadSetting, NewDoc, UploadAllowTypes } from 'src/app/model/attachmentsRec';
import { I18N } from 'src/app/providers/i18n.provider';
import { Manipulate } from 'src/app/model/data-manipulate';

@Component({
  selector: 'app-hlp-file-upload',
  templateUrl: './hlp-file-upload.component.html',
  styleUrls: ['./hlp-file-upload.component.scss']
})
export class HlpFileUploadComponent implements OnInit {

  sublang: Subscription;
  lang: string = "en";
  direction: boolean = true;

  prsentageVal: number = 0;
  fileMd5Hash: string[] = [];
  inserDataList: NewDoc[] = [];
  uploadMsg: string = "";
  moduleName: string = "";
  isUploadMultiple: boolean = false;
  upFile: HTMLInputElement;
  loading: boolean = false; // Flag variable
  attach_type_id: string;
  fileUploadSetting = new FileUploadSetting();
  filesName: string = "";

  uploadAllowTypesArr: UploadAllowTypes[] = [];
  allowedTypes: string[] = [];

  // Inject service
  constructor(
    private provider: DataProvider,
    private httpClient: HttpClient,
    public dialogRef: MatDialogRef<HlpFileUploadComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    public i18n: I18N,
    private ui: UIService
  ) {
    this.moduleName = data.moduleName;
    this.isUploadMultiple = data.isUploadMultiple;
    this.attach_type_id = data.attach_type_id;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('100%');
    await this.provider.initCache();

    this.sublang = this.i18n.observeLanguage().subscribe({
      next: (lang) => {
        this.lang = lang;
        this.direction = this.provider.getDirection(this.lang);
      }
    });
    this.lang = I18N.lang;
    this.direction = this.provider.getDirection(this.lang);

    this.loading = false;
    this.prsentageVal = 0;
    this.uploadMsg = "";
    this.getUploadallowtypes();
  }

  ngOnDestroy() {
    if (this.sublang) {
      this.sublang.unsubscribe();
    }
  }

  getUploadallowtypes() {
    let servletUrl: string = Constants.baseUrl + '/crd/uploadallowtypes';
    const formData = new FormData();
    formData.append('transaction', 'select_list');
    formData.append('isActiveOnly', 'true');
    this.eSendForm(this, 'select_all_upload_allow_types', servletUrl, formData);
  }

  // On file Select
  onChange(file: HTMLInputElement) {
    this.upFile = file;
    if (this.isUploadMultiple === false) {
      if (this.upFile.files.length > 1) {
        this.ui.error(this.i18n.get("corr.uploadFiles.errSelectOneFile", "errSelectOneFile"));
      }
    }
    for (let i = 0; i < file.files.length; i++) {
      if (i > 0) {
        this.filesName += '<br>';
      }
      this.filesName = file.files[i].name;
    }
  }

  async onUpload() {
    this.fileMd5Hash.length = 0;
    if ((typeof this.upFile === null) || (typeof this.upFile === "undefined") || (this.upFile.files.length === 0)) {
      this.ui.error(this.i18n.get("corr.uploadFiles.errSelectFile", "errSelectFile"));
      return;
    } else if (this.isUploadMultiple === false) {
      if (this.upFile.files.length === 0) {
        this.ui.error(this.i18n.get("corr.uploadFiles.errSelectFile", "errSelectFile"));
        return;
      }
      if (this.upFile.files.length > 1) {
        this.ui.error(this.i18n.get("corr.uploadFiles.errSelectFile", "errSelectFile"));
        return;
      }
    }
    for (let i = 0; i < this.upFile.files.length; i++) {
      this.loading = false;
      this.prsentageVal = 0;
      this.uploadMsg = "";

      const extension = this.getFileExtension(this.upFile.files[i].name);
      if (!this.allowedTypes.includes(extension)) {
        this.ui.error(this.i18n.get("corr.ERROR_THE_FILE_EXTENSION_IS_NOT_ALLOWED", "Error: The specified file type is not allowed:") + extension);
        return;
      }

      //let thisis = this;
      var fileMd5HashRec = await this.computeChecksumMd5(this.upFile.files[i]);
      this.fileMd5Hash.push(fileMd5HashRec.toUpperCase());
    }
    console.log(this.fileMd5Hash);
    this.uplaodDocument();
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop().toLowerCase() || '';
  }

  uplaodDocument() {
    //1- Call to Fast Check one or more File MD5 and make decision to Upload or Skip File
    let servletUrl: string = Constants.baseUrl + '/checkfilemd5';
    const formData = new FormData();
    formData.append('lang', this.lang);
    for (let i = 0; i < this.fileMd5Hash.length; i++) {
      let spret = "";
      if (i < 9) {
        spret = "0";
      }
      formData.append('file_md5_' + spret + (i + 1), this.fileMd5Hash[i]);
    }
    formData.append('defaultUploadSys', Constants.defualtUploadSys);
    formData.append('transaction', 'select');
    this.eSendForm(this, 'check_file_md5', servletUrl, formData);

  }

  uploadOnServer(result) {
    // 2-  Take the result and Check the uplaod setting to Upload on internal Server or External Server
    this.inserDataList.length = 0;
    console.log("## Start Call uploadAndInsertErpFile ");
    this.fileUploadSetting = result["fileUploadSettingRec"];
    let checkedFileList = result["checkFileList"];

    let servletUrl: string = "";
    const formData = new FormData();

    // External Server --
    servletUrl = this.fileUploadSetting.server_name + "" + this.fileUploadSetting.server_port + "" + this.fileUploadSetting.service_name_upload;
    formData.append('lang', this.lang);
    let ttlFilesNotFound = 0;

    for (let i = 0; i < this.upFile.files.length; i++) {

      let inserData: NewDoc = new NewDoc();
      inserData.file_guid = this.provider.getGuid();
      inserData.file_name = this.upFile.files[i].name;
      inserData.file_type = this.upFile.files[i].type;
      inserData.file_mdf5 = this.fileMd5Hash[i];
      inserData.module_name = this.moduleName;
      inserData.isDataFound = checkedFileList[i].isDataFound;
      if (checkedFileList[i].isDataFound) {
        inserData.file_guid = checkedFileList[i].file_guid;
      }
      inserData.branch_server_id = this.fileUploadSetting.department_id;
      inserData.file_repository = this.fileUploadSetting.file_repository + "/" + this.moduleName;
      inserData.fileUploadSetting = this.fileUploadSetting;
      if (this.isUploadMultiple === false) {
        inserData.is_current = true;
        inserData.attach_type_id = this.attach_type_id;
      } else {
        inserData.is_current = false;
      }

      if (checkedFileList[i].isDataFound === false) {
        ttlFilesNotFound += 1;
        // check isDataFound
        let spret = "";
        if (i < 9) {
          spret = "0";
        }
        formData.append('file_guid_' + spret + (i + 1), inserData.file_guid);
        formData.append('file_upload_' + spret + (i + 1), this.upFile.files[i]);
        formData.append('file_name', inserData.file_name);
        formData.append('file_repository', inserData.file_repository);
        formData.append('file_type', inserData.file_type);
        formData.append('module_name', this.moduleName);
        formData.append('ess_sys_req', 'false');
      }
      this.inserDataList.push(inserData);
    }
    if (ttlFilesNotFound > 0) {
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


  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(null);
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

  eSendPost(
    handler: any,
    key: string,
    servletUrl: string, // URL to web api
    request: SmartRequest,
    httpHeaders: HttpHeaders,
    parameters: HttpParams
  ) {
    request.lang = this.lang;
    const options = {
      headers: httpHeaders,
      observe: 'body' as const,
      responseType: 'json' as const,
      params: parameters,
      withCredentials: true
    };
    this.httpClient.post<SmartResponse>(servletUrl, request, options).toPromise()
      .then(response => {
        try {
          handler.eResponseSuccess(key, response);
        } catch (error) {
          console.error("Response is success but 'responseSuccess' implementation throws error => " + error);
        }
      })
      .catch(exception => {
        handler.eResponseFailure(key, exception);
      });
  }

  eResponse(key: string, smartResponse: SmartResponse) {
    // Common Reselt between GET POST sendFORM
    if (key === "check_file_md5") {
      let record = smartResponse.resultset[0];
      this.uploadOnServer(record);
    } else if (key === "upload_file") {
      // Inser Into ERPFiles && InoutBoundFiles
      this.insertDocument();
    } else if (key === "inser_erp_files") {
      this.uploadMsg = this.i18n.get("corr.uploadFiles.uploadSuccess", "uploadSuccess");
      this.prsentageVal = 100;
      this.ui.success(this.i18n.get("corr.uploadFiles.uploadSuccess", "uploadSuccess"));
      this.dialogRef.close(this.inserDataList);
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
    } catch (error) {
      console.error("Response is success but 'response' implementation in component  throws error => " + error);
    }
  }

  eFailure(key: string, exception: any) {
    console.log("key >> " + key + " ,  exception " + JSON.stringify(exception, null, 4));
    if (key === "upload_file") {
      try {
        this.uploadMsg = "";
        this.prsentageVal = 0;
        this.loading = false;
        let error = exception['error'];
        let errorKey = error['errors'][0];
        this.ui.error(errorKey);//this.i18n.get('corr.error.' + errorKey, errorKey)
      } catch (error) {
        this.ui.error(JSON.stringify(exception, null, 4));
      }

    } else if (key === "inser_erp_files") {
      try {
        let error = exception['error'];
        let errorKey = error['errors'][0];
        this.ui.error(errorKey);//this.i18n.get('corr.error.' + errorKey, errorKey)
      } catch (error) {
        this.ui.error(JSON.stringify(exception, null, 4));
      }
    } else if (key === "check_file_md5") {
      try {
        let error = exception['error'];
        let errorKey = error['errors'][0];
        this.ui.error(errorKey);//this.i18n.get('corr.error.' + errorKey, errorKey)
      } catch (error) {
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
      ////console.log("event Sent => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.UploadProgress) {
      //An upload progress event was received.
      //console.log("event UploadProgress => " + key + "=>" + JSON.stringify(event, null, 4));
      if (key === "upload_file") {
        this.uploadMsg = this.i18n.get("corr.uploadFiles.uploadStart", "uploadStart");
        this.prsentageVal = Math.round((event.loaded / event.total) * 100);
      }
    }
    if (event.type === HttpEventType.ResponseHeader) {
      //The response status code and headers were received.
      //console.log("event ResponseHeader => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.DownloadProgress) {
      //A download progress event was received.
      //console.log("event DownloadProgress => " + key + "=>" + JSON.stringify(event, null, 4));
    }
    if (event.type === HttpEventType.Response) {
      //The full response including the body was received.
      let smartResponse = <SmartResponse>event.body;
      this.eResponseSuccess(key, smartResponse);
    }
    if (event.type === HttpEventType.User) {
      //A custom event from an interceptor or a backend.
      //console.log("event User => " + key + "=>" + JSON.stringify(event, null, 4));
    }
  }
}