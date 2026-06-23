import { TreeNode } from './data-manipulate';

export class LkupSubject extends TreeNode {
    subject_id: number;
    parent_subject_id:number;
    subject_desc: {ar: string, en: string} = {'ar':'' , 'en':''};
    //children?: LkupSubject[];

    color?: string = "#0000ff";
    back_color?: string = "#000000";
    show?: boolean = true;
}
