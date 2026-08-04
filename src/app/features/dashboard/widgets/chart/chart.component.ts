import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
  readonly title = input<string>('Chart');
}
