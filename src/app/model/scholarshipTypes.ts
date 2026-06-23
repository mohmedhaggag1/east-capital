export class ScholarshipTypes {
    id?: number = 0;
    name_ar?: string = '';
    name_en?: string = '';
    type_order?: number = 0;
    is_active?: boolean = true;
    class_type?: string = '1';
    attachment_reference_no?: number = 0;
    name: { ar: string, en: string } = { 'ar': '', 'en': '' };
}