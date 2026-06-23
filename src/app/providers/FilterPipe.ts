import { Pipe, PipeTransform } from '@angular/core';
import { ComboBoxRec } from '../model/combobox';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: ComboBoxRec[], searchText: string, lang: string): ComboBoxRec[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it => {
      const value = it.name && it.name[lang];
      return value ? value.toLowerCase().includes(searchText) : false;
    });
  }
}
