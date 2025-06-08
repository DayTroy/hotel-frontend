import { Component, OnInit, inject } from '@angular/core';
import { TuiSegmented } from '@taiga-ui/kit';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TuiDayRange } from '@taiga-ui/cdk';
import { TuiDay, tuiCeil } from '@taiga-ui/cdk';
import { TuiButton, TuiHint, TuiAlertService } from '@taiga-ui/core';
import { TuiPieChart, TuiBarChart, TuiAxes } from '@taiga-ui/addon-charts';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiAmountPipe, TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    TuiSegmented,
    NgFor,
    CommonModule,
    TuiInputDateRangeModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton,
    TuiPieChart,
    TuiBarChart,
    TuiAxes,
    TuiTable,
    TuiFormatNumberPipe,
    TuiCurrencyPipe,
    TuiHint,
    TuiAmountPipe,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  protected readonly buttons = ['Услуги', 'Уборка'];
  protected activeReportType = 0;
  protected showCharts = false;
  protected readonly columns = [
    'hotelServiceId',
    'hotelService',
    'hotelServiceCount',
    'totalAmount',
    'hotelServiceFraction',
  ];

  protected readonly cleaningColumns = [
    'id',
    'date',
    'count',
  ];

  protected readonly data = [
    {
      hotelServiceId: 1,
      hotelService: 'Проживание',
      hotelServiceCount: 120,
      totalAmount: 600000,
      hotelServiceFraction: 66.7,
    },
    {
      hotelServiceId: 2,
      hotelService: 'Завтрак',
      hotelServiceCount: 80,
      totalAmount: 100000,
      hotelServiceFraction: 19,
    },
    {
      hotelServiceId: 3,
      hotelService: 'SPA',
      hotelServiceCount: 30,
      totalAmount: 70000,
      hotelServiceFraction: 4.8,
    },
    {
      hotelServiceId: 4,
      hotelService: 'Прочие',
      hotelServiceCount: 50,
      totalAmount: 60000,
      hotelServiceFraction: 9.5,
    },
  ];

  protected readonly cleaningData = [
    {
      id: 1,
      date: '19.05.2025',
      count: 12,
    },
    {
      id: 2,
      date: '20.05.2025',
      count: 14,
    },
    {
      id: 3,
      date: '21.05.2025',
      count: 17,
    },
    {
      id: 4,
      date: '22.05.2025',
      count: 13,
    },
    {
      id: 5,
      date: '23.05.2025',
      count: 20,
    },
    {
      id: 6,
      date: '24.05.2025',
      count: 18,
    },
    {
      id: 7,
      date: '25.05.2025',
      count: 16,
    },
  ];

  protected readonly reportForm = new FormGroup({
    period: new FormControl(
      new TuiDayRange(
        TuiDay.currentLocal().append({ month: -1 }),
        TuiDay.currentLocal()
      )
    ),
  });

  protected readonly min = new TuiDay(2018, 2, 25);
  protected readonly max = new TuiDay(2040, 2, 20);
  protected readonly pie = [66.7, 19, 4.8, 9.5];
  protected readonly bar = [
    [
      12, 14, 17, 13, 20, 18, 16
    ],
  ];
  protected readonly pieLabels = this.data.map(item => item.hotelService);
  protected readonly labelsX = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  protected readonly labelsY = ['0', '3', '7', '10', '14', '17'];
  private readonly alerts = inject(TuiAlertService);

  protected onReportTypeChange(index: number): void {
    this.activeReportType = index;
    this.showCharts = false;
  }

  protected getHeight(max: number): number {
    return (max / tuiCeil(max, -3)) * 100;
  }

  generateReport(): void {
    this.showCharts = true;
  }

  async exportReport(): Promise<void> {
    if (this.activeReportType === 0) {
      try {
        const tableElement = document.getElementById('report-table');
        const chartElement = document.getElementById('report-pie-chart');
  
        if (!tableElement || !chartElement) {
          this.alerts.open('Элементы отчета не найдены.', { appearance: 'error' }).subscribe();
          return;
        }
  
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
  
        const tableCanvas = await html2canvas(tableElement, { scale: 2 });
        const tableImgData = tableCanvas.toDataURL('image/png');
        const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
        pdf.addImage(tableImgData, 'PNG', 0, 0, imgWidth, tableImgHeight);
  
        const chartCanvas = await html2canvas(chartElement, { scale: 2 });
        const chartImgData = chartCanvas.toDataURL('image/png');
        const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
  
        let currentHeight = tableImgHeight;
        if (currentHeight + chartImgHeight > pageHeight) {
          pdf.addPage();
          currentHeight = 0;
        }
  
        pdf.addImage(chartImgData, 'PNG', 0, currentHeight, imgWidth, chartImgHeight);
  
        pdf.save('Отчет по гостиничным услугам.pdf');
        this.alerts.open('Отчет успешно экспортирован.', { appearance: 'positive' }).subscribe();
  
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.alerts.open('Ошибка при генерации PDF.', { appearance: 'error' }).subscribe();
      }
      return
    }
    if (this.activeReportType === 1) {
      try {
        const tableElement = document.getElementById('cleaning-report-table');
        const chartElement = document.getElementById('cleaning-report-bar-chart');

        if (!tableElement || !chartElement) {
          this.alerts.open('Элементы отчета не найдены.', { appearance: 'error' }).subscribe();
          return;
        }

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;

        // Capture table
        const tableCanvas = await html2canvas(tableElement, { scale: 2 });
        const tableImgData = tableCanvas.toDataURL('image/png');
        const tableImgHeight = (tableCanvas.height * imgWidth) / tableCanvas.width;
        pdf.addImage(tableImgData, 'PNG', 0, 0, imgWidth, tableImgHeight);

        // Capture chart
        const chartCanvas = await html2canvas(chartElement, { scale: 2 });
        const chartImgData = chartCanvas.toDataURL('image/png');
        const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;

        let currentHeight = tableImgHeight;
        if (currentHeight + chartImgHeight > pageHeight) {
          pdf.addPage();
          currentHeight = 0;
        }

        pdf.addImage(chartImgData, 'PNG', 0, currentHeight, imgWidth, chartImgHeight);

        pdf.save('Отчет по уборке гостиничных номеров.pdf');
        this.alerts.open('Отчет успешно экспортирован.', { appearance: 'positive' }).subscribe();

      } catch (error) {
        console.error('Error generating PDF:', error);
        this.alerts.open('Ошибка при генерации PDF.', { appearance: 'error' }).subscribe();
      }
    }
  }
}
