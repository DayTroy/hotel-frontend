import { Component } from '@angular/core';
import { TuiSegmented } from '@taiga-ui/kit';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TuiDayRange } from '@taiga-ui/cdk';
import { TuiDay, tuiCeil } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';
import { TuiPieChart, TuiBarChart, TuiAxes } from '@taiga-ui/addon-charts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [TuiSegmented, NgFor, CommonModule, TuiInputDateRangeModule, ReactiveFormsModule, FormsModule, TuiButton, TuiPieChart, TuiBarChart, TuiAxes],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  protected readonly buttons = ['Услуги', 'Уборка'];
  protected active = 0;
  protected readonly testForm = new FormGroup({
    testValue: new FormControl(
      new TuiDayRange(new TuiDay(2018, 2, 10), new TuiDay(2018, 3, 20)),
    ),
  });

  protected readonly min = new TuiDay(2018, 2, 25);
  protected readonly max = new TuiDay(2040, 2, 20);
  protected readonly pie = [40, 30, 20, 10];

  protected readonly bar = [
    [14, 8281, 1069, 9034, 5797, 6918, 8495, 3234, 6204, 1392, 2088, 8637, 8779],
    [3952, 3671, 3781, 5323, 3537, 4107, 2962, 3320, 8632, 4755, 9130, 1195, 3574],
  ];

  protected readonly labelsX = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  protected readonly labelsY = ['0', '3', '7', '10', '14', '17'];

  protected getHeight(max: number): number {
    return (max / tuiCeil(max, -3)) * 100;
  }
}
