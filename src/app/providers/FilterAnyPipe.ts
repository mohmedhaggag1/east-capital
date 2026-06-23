import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filterAny'
})
export class FilterAnyPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it => {
      return JSON.stringify(it).toLowerCase().includes(searchText);
    });
  }
}
