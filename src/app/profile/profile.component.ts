import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiAvatar } from '@taiga-ui/kit';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TuiAvatar, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  avatar$ = new BehaviorSubject("AI")


  ngOnInit(): void {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.avatar$
    .subscribe(value => console.log(value))
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatar$.next(e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
