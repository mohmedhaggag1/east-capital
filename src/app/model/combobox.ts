export class ComboBoxRec {
  id: string;
  name: { ar: string, en: string } = { 'ar': '', 'en': '' };
  additional_data1: string;
  additional_data2: string;
  additional_data3: string;
  color?: string;
  selected?: boolean;
  icon?: string;
}

export class WherePart {
  value?: string;
  type?: string = 'string';
  constructor({ value, type }: { value: string; type: string }) {
    this.value = value;
    this.type = type;
  }
}