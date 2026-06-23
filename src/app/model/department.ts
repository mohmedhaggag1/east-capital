import { TreeNode } from './data-manipulate';

export class Department extends TreeNode {
    department_id: string;
    parent_department_id:string;
    department_name?: {ar: string, en: string} = {'ar':'' , 'en':''};
    //children?: Department[];

    color?: string = "#0000ff";
    back_color?: string = "#000000";
    show?: boolean = true;
}