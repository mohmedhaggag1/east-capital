export class EssaySettings {
    id?: number = 0;
    text_max_length?: number = 0;
    can_upload_files?: number = 0;
    is_active?: number = 0;
    essayInstructionsArr: EssayInstructions[] = [];
}

export class EssayInstructions {
    id?: number = 0;
    essay_settings_id?: number = 0;
    instruction_ar?: string = '';
    instruction_en?: string = '';
    icon?: string = '';
    color?: string = '';
    ordered?: number = 0;
}