export class StudentFinance {
    id: number;
    student_code: string;
    revenue_type_code: string;
    semester_code: string;
    academic_year_code: string;
    due_date: string;
    due_value: number;
    payment_flag: string;
    remain_value: number;
    request_id: number;
    payment_code: string;
    payment_way: string;
    payment_type: string;
    total_grants: number;

  constructor(json: any) {
    this.load(json)
  }

  public load(json: any): StudentFinance {
    if (json) {
      this.id = +json.id || null;
      this.student_code = json.student_code;
      this.revenue_type_code = json.revenue_type_code;
      this.semester_code = json.semester_code;
      this.academic_year_code = json.academic_year_code;
      this.due_date = json.due_date;
      this.due_value = +json.due_value || null;
      this.payment_flag = json.payment_flag;
      this.remain_value = +json.remain_value || null;
      this.request_id = +json.request_id || null;
      this.payment_code = json.payment_code;
      this.payment_way = json.payment_way;
      this.payment_type = json.payment_type;
      this.total_grants = +json.total_grants || null;
    }
    return this
  }
}
