// This Record used In Setting Screen  
import { TreeNode } from './data-manipulate';
 
export class ReceivingEmpSetting{
    entry_id:number;
    from_emp_no:number;
    from_emp_name: {ar: string, en: string}= {'ar':'' , 'en':''};
}


export class ReceivingEmpSettingView{
    from_emp_no:number; 
    to_emp_no:number;
}

 
// This Record Used in HlpReceivingEmployee Tree
export class ReceivingEmployeeTree extends TreeNode {
    id: string;
    parent_id:string;
    override name: {ar: string, en: string};
    override is_selected:boolean;
    color?: string = "#0000ff";
    back_color?: string = "#000000";
    show?: boolean = true;
}
