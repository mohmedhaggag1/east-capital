import { ComboBoxRec } from "./combobox";

export class StudentRequestAchievements {
    id?: number = 0;
    request_id?: number = 0;
    achievement_type?: string = '1';
    achievement_id?: string = '';
    comments?: string = '';
    comboxArr_achievement: ComboBoxRec[] = [];
}