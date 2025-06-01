import { Component } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { NgFor } from '@angular/common';
import {TuiCell} from '@taiga-ui/layout';
import { TuiStatus } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [TuiTextfield, FormsModule, TuiTable, TuiCell, TuiStatus, NgFor, TuiButton],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent {
  protected value = '';


  protected readonly data = [
    {
        checkbox: {
            title: 'Data point 1',
            subtitle: 'The first element',
        },
        title: {
            icon: '@tui.file',
            title: 'This is title',
            chip: 'Chip',
            subtitle: 'More information ・ Data',
        },
        cell: {
            name: 'John Cleese',
            email: 'silly@walk.uk',
        },
        status: {
            value: 'Success',
            color: 'var(--tui-status-positive)',
        },
        items: ['Some', 'items', 'displayed', 'here', 'and', 'can', 'overflow'],
        progress: 78,
        selected: false,
    },
    {
        checkbox: {
            title: 'Some title',
            subtitle: 'Some more text',
        },
        title: {
            icon: '@tui.heart',
            title: 'More info',
            chip: 'Chips can be here',
        },
        cell: {
            name: 'Eric Idle',
            email: 'cool@dude.com',
        },
        status: {
            value: 'Failure',
            color: 'var(--tui-status-negative)',
        },
        items: ['One', 'Item'],
        progress: 91,
        selected: false,
    },
    {
        checkbox: {
            title: 'And now',
            subtitle: 'Completely different',
        },
        title: {
            icon: '@tui.star',
            title: 'Wow',
        },
        cell: {
            name: 'Michael Palin',
            email: 'its@man.com',
        },
        status: {
            value: 'Pending',
            color: 'var(--tui-status-warning)',
        },
        items: [],
        progress: 32,
        selected: false,
    },
];


  protected readonly data2 = [
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
