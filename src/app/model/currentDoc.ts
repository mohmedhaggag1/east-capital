import { FileUploadSetting } from "./attachmentsRec";

export class CurrentDoc {
  entry_id:number;
  file_id:number;
  file_name:string;
  file_type:string;
  file_guid:string;
  file_path:string;
  is_current:boolean;
  main_file_type:string;
  attach_type_id:string;
  download_pdf:string;
  download_original:string;
  file_mdf5:string;
  pdfSrc:string = "";
  annotSrc:string = "";
  readonly:boolean;
  canViewDoc:boolean;
  username:string;
  empName:{ar: string, en: string} = {'ar':'' , 'en':''};
  sentDate: string;
  sentTime: string;
  module_name:string; 
  moduleNameDescr:{ar: string, en: string} = {'ar':'' , 'en':''};
  attachTypeDescr:{ar: string, en: string} = {'ar':'' , 'en':''};
} 