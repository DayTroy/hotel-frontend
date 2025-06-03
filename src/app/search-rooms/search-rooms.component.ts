import { Component } from '@angular/core';
import {TUI_FALSE_HANDLER, TuiDay} from '@taiga-ui/cdk';
import {TuiTextfield, TuiButton, TuiLoader} from '@taiga-ui/core';
import {TuiInputDate, TuiInputNumber, TuiButtonLoading} from '@taiga-ui/kit';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { startWith } from 'rxjs/operators';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { RoomsApiService } from '../references/rooms/rooms-api.service';

interface Room {
  roomId: string;
  stage: string;
  roomCategory: {
    title: string;
    pricePerNight: number;
    capacity: number;
    description: string;
  };
}

@Component({
  selector: 'app-search-rooms',
  standalone: true,
  imports: [TuiTextfield, ReactiveFormsModule, FormsModule, TuiInputDate, TuiInputNumber, TuiButton, TuiLoader, TuiButtonLoading, NgIf, AsyncPipe, TuiCurrencyPipe, NgFor],
  templateUrl: './search-rooms.component.html',
  styleUrl: './search-rooms.component.scss'
})
export class SearchRoomsComponent {
  protected value: TuiDay | null = null;
  protected guests: number | null = null;
  protected isLoading: boolean = false;
  protected readonly availableRooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly error$ = new BehaviorSubject<string | null>(null);

  protected form: FormGroup = new FormGroup({
    guests: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(12)]),
    checkInDate: new FormControl(null, [Validators.required]),
    checkOutDate: new FormControl(null, [Validators.required]),
  });
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading')))
  );

  constructor(private readonly _roomsApi: RoomsApiService) {}

  submit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      this.trigger$.next();
      this.isLoading = true;
      this.error$.next(null);

      const params = {
        checkInDate: formValue.checkInDate.toJSON(),
        checkOutDate: formValue.checkOutDate.toJSON(),
        guests: formValue.guests
      };

      this._roomsApi.searchAvailableRooms(params).subscribe({
        next: (rooms) => {
          this.availableRooms$.next(rooms);
          this.isLoading = false;
        },
        error: (error) => {
          this.error$.next('Произошла ошибка при поиске номеров');
          this.isLoading = false;
        }
      });
    }
  }
}
