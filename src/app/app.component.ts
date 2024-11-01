import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent  {
  firstName: string | undefined;
  lastName: string | undefined;
  middleName: string | undefined;
  hasMiddleName: boolean = true;
  email: string | undefined;
  phoneNumber: string | undefined;
  password!: string;


  isLoginMode: boolean = false;

  // Добавьте этот метод
  toggleForm() {
    this.isLoginMode = !this.isLoginMode;
  }
}
