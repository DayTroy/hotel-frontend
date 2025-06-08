import { Employee } from "./employee.interface";
import { Room } from "./room.interface";

export interface CleaningTask {
    cleaningId: string;
    room?: Room;
    employee: Employee;
    roomNumber?: string;
    status: string;
    cleaningType: string,
    scheduledDate: Date,
    description: string,
  }