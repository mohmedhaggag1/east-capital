export class Academy {
    id?: number = 0;
    code?: string = '';
    name_ar?: string = '';
    name_en?: string = '';
    is_active_portal?: number = 0;

}

export class AcademyView {
    name: { ar: string, en: string } = { 'ar': '', 'en': '' };
}