import { Component } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { NgFor } from '@angular/common';
import { TuiStatus } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [TuiTextfield, FormsModule, TuiTable, TuiStatus, NgFor, TuiButton],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent {
  protected value = '';

  protected readonly data = [
    {
      id: 'REQ-4129807',
      creationDate: '2024-01-01',
      status: 'Новая',
      contactNumber: '+7 (999) 123-45-67',
      comment: 'Комментарий',
      actions: '213123',
    },
    {
      id: 'REQ-4129807',
      creationDate: '2024-01-01',
      status: 'Новая',
      contactNumber: '+7 (999) 123-45-67',
      comment: 'Комментарий',
      actions: '123123',
    },
    {
      id: 'REQ-4129807',
      creationDate: '2024-01-01',
      status: 'Новая',
      contactNumber: '+7 (999) 123-45-67',
      comment: 'Комментарий',
      actions: '123123',
    },
  ] as const;

  protected readonly columns = Object.keys(this.data[0]);
}
