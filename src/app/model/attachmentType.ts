export class AttachmentTypeRec {
    attach_type_id:string;
    attach_desc:string;
    attach_desc_en:string;
    attach_type:string;

    fromJSON(json: any): AttachmentTypeRec{
        if (json) {
            this.attach_type_id=json.attach_type_id;
            this.attach_desc=json.attach_desc;
            this.attach_desc_en=json.attach_desc_en;
            this.attach_type=json.attach_type; 
        }
        return this;
    }

    toJSON(): any {
        return {
            attach_type_id :this.attach_type_id,
            attach_desc:this.attach_desc,
            attach_desc_en:this.attach_desc_en,
            attach_type:this.attach_type
        }
    }
}

export class AttachmentType {
    attach_id:string;
    attach_desc: {ar: string, en: string} = {'ar':'' , 'en':''};
}