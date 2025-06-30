import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class BookingsForms {
  createBookingForm(): any {
    return new FormGroup<{
      bookingId: FormControl<string>;
      checkInDate: FormControl<Date | null>;
      checkOutDate: FormControl<Date | null>;
      guests: FormControl<any[] | null>;
      providedAmenities: FormControl<any[] | null>;
      roomId: FormControl<string | null>;
      status: FormControl<string | null>;
    }>({
      bookingId: new FormControl('', {
        nonNullable: true,
      }),
      checkInDate: new FormControl({value: null, disabled: true}, {
        nonNullable: true,
      }),
      checkOutDate: new FormControl({value: null, disabled: true}, {
        nonNullable: true,
      }),
      guests: new FormControl({value: null, disabled: true}, {
        nonNullable: true,
      }),
      providedAmenities: new FormControl({value: null, disabled: true}, {
        nonNullable: true,
      }),
      roomId: new FormControl({value: null, disabled: true}, {
        nonNullable: true,
      }),
      status: new FormControl('', {}),
    });
  }
}