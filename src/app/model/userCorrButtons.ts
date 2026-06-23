export class UserButtons {
    cntrlId: string;
    cntrlName: { ar: string, en: string } = { 'ar': '', 'en': '' };
    iconCls: string;
    step_action_id?: number;
    step_id?: number;
    icon_color: string = "#0000ff";
    icon_name: string;
    is_disabled: boolean = false;
    is_hidden: boolean = false;
}