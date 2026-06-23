import { AttachmentFileStatus } from "./attachmentFileStatus";

export class AttachmentTypeRec {
    attach_type_id: string;
    attach_desc: string;
    attach_desc_en: string;
    attach_type: string;

    fromJSON(json: any): AttachmentTypeRec {
        if (json) {
            this.attach_type_id = json.attach_type_id;
            this.attach_desc = json.attach_desc;
            this.attach_desc_en = json.attach_desc_en;
            this.attach_type = json.attach_type;
        }
        return this;
    }

    toJSON(): any {
        return {
            attach_type_id: this.attach_type_id,
            attach_desc: this.attach_desc,
            attach_desc_en: this.attach_desc_en,
            attach_type: this.attach_type
        }
    }
}

export class AttachmentType {
    attach_id: string;
    attach_type_id: string;
    additional_attach_id?: number;
    attach_desc: { ar: string, en: string } = { 'ar': '', 'en': '' };
    id: number;
    code: string;
    name_en: string;
    name_ar: string;

}

export class CurrentDoc {
    entry_id: number;
    file_id: number;
    file_name: string;
    file_type: string;
    file_guid: string;
    file_path: string;
    is_current: boolean;
    main_file_type: string;
    attach_type_id: string;
    additional_attach_id?: number;
    download_pdf: string;
    download_original: string;
    file_mdf5: string;
    pdfSrc: string = "";
    annotSrc: string = "";
    readonly: boolean;
    canViewDoc: boolean;
    username: string;
    empName: { ar: string, en: string } = { 'ar': '', 'en': '' };
    sentDate: string;
    sentTime: string;
    module_name: string;
    moduleNameDescr?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    attachTypeDescr?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    upFile: HTMLInputElement;
    attachTypeName: string;
    isFileLock?: boolean;
    attachmentFileStatusArr: AttachmentFileStatus[] = [];
}

export class NewDoc {
    file_name: string;
    file_type: string;
    file_guid: string;
    attach_type_id: string;
    file_mdf5: string;
    file_repository: string;
    module_name: string;
    branch_server_id: string;
    isDataFound: boolean;
    is_current: boolean;
    fileUploadSetting: FileUploadSetting = new FileUploadSetting();

    is_can_download?: boolean = true;
    is_can_share?: boolean = true;
    entry_id?: number;
}

export class FileUploadSetting {
    entry_id: number;
    department_id: string;
    is_local: number;
    server_name: string;
    server_port: string;
    service_name_upload: string;
    service_name_download: string;
    service_name_merge: string;
    service_name_download_with_annot: string;
    service_name_search_content: string;
    file_repository: string;
}

export class UploadAllowTypes {
    id?: number = 0;
    allow_type?: string = '';
    is_active?: boolean | false;
}


export class FileSearchCriteria {
    module_name: string;
    parent_entry_id: string;
}