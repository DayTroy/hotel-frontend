export interface Booking {
  bookingId: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomId: string;
  status: string;
  guests: any[];
  providedAmenities: any[];
  totalPrice: number;
}
