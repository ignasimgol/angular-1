import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date, format: number = 1): string {
    if (!value) return '';
    
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    switch (format) {
      case 1:
        return `${day}${month}${year}`;
      case 2:
        return `${day} / ${month} / ${year}`;
      case 3:
        return `${day}/${month}/${year}`;
      case 4:
        return `${year}-${month}-${day}`;
      default:
        return `${day}${month}${year}`;
    }
  }
}