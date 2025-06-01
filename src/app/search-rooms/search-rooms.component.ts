import { Component } from '@angular/core';
import {TUI_FALSE_HANDLER, TuiDay} from '@taiga-ui/cdk';
import {TuiTextfield, TuiButton, TuiLoader} from '@taiga-ui/core';
import {TuiInputDate, TuiInputNumber, TuiButtonLoading} from '@taiga-ui/kit';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgIf, AsyncPipe } from '@angular/common';
import { startWith } from 'rxjs/operators';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-rooms',
  standalone: true,
  imports: [TuiTextfield, ReactiveFormsModule, FormsModule, TuiInputDate, TuiInputNumber, TuiButton, TuiLoader, TuiButtonLoading, NgIf, AsyncPipe],
  templateUrl: './search-rooms.component.html',
  styleUrl: './search-rooms.component.scss'
})
export class SearchRoomsComponent {
  protected value: TuiDay | null = null;
  protected guests: number | null = null;
  protected isLoading: boolean = false;

  protected form: FormGroup = new FormGroup({
    guests: new FormControl(null),
    checkInDate: new FormControl(null),
    checkOutDate: new FormControl(null),
  });
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading')))
  );

  submit() {
    this.trigger$.next();
    this.isLoading = true;
  }
}
