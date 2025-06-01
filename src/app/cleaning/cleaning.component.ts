import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiIcon, TuiTextfield, TuiDialogService, TuiDialogContext } from '@taiga-ui/core';
import {TuiAppearance} from '@taiga-ui/core';
import { TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import {TuiCardLarge, TuiHeader} from '@taiga-ui/layout';
import type {PolymorpheusContent} from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-cleaning',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiIcon, TuiTextfield, TuiAppearance, TuiCardLarge, TuiButton, RouterLink, TuiHeader, TuiTextarea, TuiTextareaLimit],
  templateUrl: './cleaning.component.html',
  styleUrl: './cleaning.component.scss'
})
export class CleaningComponent {
  value = null
  private readonly dialogs = inject(TuiDialogService);
  cleaningTasks = [
    {
      id: 'CT-123456',
      roomId: 'R405',
      employeeId: 'EMP-123456',
      type: 'regular',
      status: 'Новый',
      description: 'Выполнить уборку',
      time: '12-12-2025',
    },
    {
      id: 'CT-123456',
      roomId: 'R405',
      employeeId: 'EMP-123456',
      type: 'regular',
      status: 'В работе',
      description: 'Выполнить уборку',
      time: '12-12-2025',
    },
    {
      id: 'CT-123456',
      roomId: 'R405',
      employeeId: 'EMP-123456',
      type: 'regular',
      status: 'Готов',
      description: 'Выполнить уборку',
      time: '12-12-2025',
    },
  ];

  openDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content).subscribe();
  }

  submit(): void {

  }
}
