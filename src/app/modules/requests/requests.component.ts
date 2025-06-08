import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TUI_CONFIRM, TuiConfirmData, TuiStatus } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { RequestsApiService } from './request-api.service';
import { BehaviorSubject, Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiThemeColorService } from '@taiga-ui/cdk';

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
  protected readonly columns = ['id', 'creationDate', 'status', 'contactNumber', 'comment', 'actions'];
  loading$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  protected readonly notFound$$ = new BehaviorSubject<boolean>(false);
  searchValue: string = '';
  private allRequests$$ = new BehaviorSubject<any[]>([]);
  requests$$ = this.allRequests$$.asObservable();
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

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
        this.allRequests$$.next(requests);
        this.requests$$ = this.allRequests$$.asObservable();
      });
  }

  confirmRequestRemove(requestId: string): void {
    const data: TuiConfirmData = {
      content: 'Вы действительно хотете удалить заявку? После удаления выбранной заявки, она станет недоступной для просмотра',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить заявку',
        size: 'l',
        data,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(null);
          }
          
          this.loading$$.next(true);
          return this._requestsApiService.deleteRequest(requestId).pipe(
            tap(() => {
              this.alerts.open('Заявка успешна удалена', { appearance: 'positive' }).subscribe();
            }),
            catchError(error => {
              this.alerts.open('Ошибка при удалении заявки', { appearance: 'negative' });
              console.error('Error deleting request:', error);
              return of(null);
            }),
            finalize(() => {
              this.loading$$.next(false);
            })
          );
        })
      )
      .subscribe(() => {
        this.loadRequests();
      });
  }

  onSearch(value: string) {
    if (!value) {
      this.requests$$ = this.allRequests$$.asObservable();
      this.notFound$$.next(false);
      return;
    }
    
    const filteredRequests = this.allRequests$$.value.filter(request => 
      request.requestId.toString().toLowerCase().includes(value.toLowerCase())
    );
    this.requests$$ = new BehaviorSubject(filteredRequests).asObservable();
    this.notFound$$.next(filteredRequests.length === 0);
  }
}
