import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiStatus } from '@taiga-ui/kit'; 

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [TuiTextfield, FormsModule, TuiTable, TuiStatus, NgFor, TuiButton, RouterLink],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent {
  protected value = '';

  protected readonly data = [
    {
      id: 'BKG-4129807',
      roomId: 'R512',
      status: 'Новая',
      dateIn: '2024-01-01',
      dateOut: '2024-02-01',
    },
    {
      id: 'BKG-4129807',
      roomId: 'R512',
      status: 'Новая',
      dateIn: '2024-01-01',
      dateOut: '2024-02-01',
    },
    {
      id: 'BKG-4129807',
      roomId: 'R512',
      status: 'Новая',
      dateIn: '2024-01-01',
      dateOut: '2024-02-01',
    },
  ] as const;

  protected readonly columns = Object.keys(this.data[0]);
}
