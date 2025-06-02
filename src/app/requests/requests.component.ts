import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiStatus } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { RequestsApiService } from './request-api.service';
import { BehaviorSubject, Observable, catchError, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [TuiTextfield, FormsModule, TuiTable, TuiStatus, NgFor, TuiButton, RouterLink, NgIf, AsyncPipe],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class RequestsComponent implements OnInit {
  destroyRef = inject(DestroyRef)
  protected value = '';
  protected data: Request[] = [];
  protected error: string | null = null;

  loading$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  requests$$: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

  constructor(
    private readonly _requestsApiService: RequestsApiService,
  ) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  protected loadRequests(): void {
    this.error = null;

    this._requestsApiService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          this.error = 'Ошибка при загрузке данных';
          console.error('Error loading requests:', error);
          return [];
        }),
        finalize(() => {
          this.loading$$.next(false);
        })
      )
      .subscribe(requests => {
        this.requests$$.next(requests);
      });
  }

  protected readonly columns = ['id', 'creationDate', 'status', 'contactNumber', 'comment', 'actions'];
}
