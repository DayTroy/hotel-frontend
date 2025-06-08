import { RoomCategory } from "./room-category.interface";

export interface Room {
  roomId: string;
  status: string;
  stage: string;
  roomCategory: RoomCategory;
}