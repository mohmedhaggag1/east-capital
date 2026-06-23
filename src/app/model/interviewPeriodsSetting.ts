export class InterviewPeriodsSetting {
    id?: number = 0;
    semester_open_id?: string = '';
    semester_open_name: { ar: string, en: string } = { 'ar': '', 'en': '' };
    academy_code?: string = '';
    academy_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    from_time?: string = '';
    to_time?: string = '';
    working_hours?: number = 0;
    interview_duration?: number = 0;
    break_after_interview?: number = 1;
    number_interviews_in_day?: number = 0;
    allow_period_to_edit?: number = 0;
    insert_user_name?: string = '';
    insert_timestamp?: string = '';
    last_update_timestamp?: string = '';
    last_update_user_name?: string = '';
    is_active?: boolean | false = true;
}

export class InterviewPeriodsEvaluationDegrees {
    id?: number = 0;
    interview_periods_setting_id?: number = 0;
    degree_name_ar?: string = '';
    degree_name_en?: string = '';
    from_degree?: number = 0;
    to_degree?: number = 0;
    color?: string = '#ffffff';
    ordered?: number = 0;
}

export class InterviewPeriodsEvaluationTerms {
    id?: number = 0;
    interview_periods_setting_id?: number = 0;
    evaluation_ratings_id?: string = '';
    evaluation_term?: string = '';
    college_degree?: number = 0;
    success_degree?: number = 0;
    relative_weight?: number = 0;
    staffArr: InterviewPeriodsEvaluationStaff[] = [];
}

export class InterviewPeriodsEvaluationStaff {
    id?: number = 0;
    interview_periods_evaluation_terms_id?: number = 0;
    staff_id?: number = 0;
    staff_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
}

export class GenerateInterviewSlotesMast {
    id?: number = 0;
    semester_open_id?: string = '';
    semester_open_name: { ar: string, en: string } = { 'ar': '', 'en': '' };
    academy_code?: string = '';
    academy_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    calendar_setting_id?: string = '';
    calendar_setting_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    from_date?: string = '';
    to_date?: string = '';
    insert_user_name?: string = '';
    insert_timestamp?: string = '';
    last_update_timestamp?: string = '';
    last_update_user_name?: string = '';
}

export class InterviewSlotesViews {
    interview_date?: string = '';
    sloteArr: InterviewSlotes[] = [];
}

export class InterviewSlotes {
    id?: number = 0;
    generate_interview_slotes_mast_id?: number = 0;
    interview_date?: string = '';
    from_time?: string = '';
    to_time?: string = '';
    is_published?: number = 0;
    taken_by_student_code?: string = '';
    student_name?: { ar: string, en: string } = { 'ar': '', 'en': '' };
    taken_by_timestamp?: string = '';
    meeting_details?: string = '';
    insert_user_name?: string = '';
    insert_timestamp?: string = '';
    del_flag?: string = '';
    del_reason?: string = '';
    delete_user_name?: string = '';
    delete_timestamp?: string = '';
}