import { Pipe, PipeTransform } from '@angular/core';

type DateDisplayFormat = 'short' | 'medium' | 'long';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  private readonly formatOptions: Record<DateDisplayFormat, Intl.DateTimeFormatOptions> = {
    short:  { month: '2-digit', day: '2-digit', year: 'numeric' },
    medium: { month: 'short',   day: 'numeric', year: 'numeric' },
    long:   { month: 'long',    day: 'numeric', year: 'numeric', weekday: 'long' }
  };

  transform(value: string | Date | null | undefined, format: DateDisplayFormat = 'medium'): string {
    if (!value) return '—';
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-US', this.formatOptions[format]).format(date);
  }
}
