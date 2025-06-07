import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TuiAlertService, TuiButton, TuiCalendar, TuiDialogContext, TuiDialogService, TuiFormatNumberPipe, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table';
import { TUI_FALSE_HANDLER, tuiTakeUntilDestroyed, TuiTime } from '@taiga-ui/cdk';
import { timer, catchError, map, startWith, Subject, switchMap, BehaviorSubject, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiDataListWrapper, TuiFilterByInputPipe, TuiInputDate, TuiInputNumber, TuiStatus, TuiStringifyContentPipe, TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    TuiInputTimeModule,
    TuiTextfieldControllerModule,
    TuiUnfinishedValidator,
} from '@taiga-ui/legacy';
import { JobPositionsApiService } from './job-positions-api.service';
import { JobPositionsForms } from './job-positions-forms.service';
import { Department } from '../departments/departments.component';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { DepartmentsApiService } from '../departments/departments-api.service';

export interface JobPosition {
    jobPositionId: string;
    jobTitle: string;
    jobSalary: string;
    department: Department;
  }


@Component({
    selector: 'app-job-positions',
    standalone: true,
    imports: [NgIf, TuiTable, AsyncPipe, NgFor, TuiCurrencyPipe, TuiButton, TuiStatus, TuiTextfield, FormsModule, ReactiveFormsModule, TuiInputNumber, TuiTextarea, TuiTextareaLimit, TuiButtonLoading, TuiCalendar, TuiDataListWrapper, TuiComboBoxModule, TuiStringifyContentPipe, TuiFilterByInputPipe, TuiFormatNumberPipe ],
    templateUrl: './job-positions.component.html',
    styleUrl: './job-positions.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobPositionsComponent implements OnInit {
    @ViewChild('jobPositionDialog') jobPositionDialog!: TemplateRef<any>;
  
    jobPositionForm = this._jobPositionsForms.createJobPositionForm();
  
    destroyRef = inject(DestroyRef);
    private readonly dialogs = inject(TuiDialogService);
    private readonly alerts = inject(TuiAlertService);
    private currentDialogObserver: any;
  
  
    protected selectedReference: string | null = 'Выберите справочник...';
    protected readonly loading$ = new BehaviorSubject<boolean>(false);
    protected readonly error$ = new BehaviorSubject<string | null>(null);
    protected readonly jobPositions$ = new BehaviorSubject<JobPosition[]>([]);
    protected readonly departments$ = new BehaviorSubject<Department[]>([]);
    protected isEditMode = false;
    protected readonly trigger$ = new Subject<void>();
    protected readonly submitLoading$ = this.trigger$.pipe(
      switchMap(() =>
        timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
      )
    );
  
    protected readonly columns = [
      'jobTitle',
      'jobSalary',
      'departmentTitle',
      'actions',
    ];
  
    constructor(private readonly _jobPositionsApi: JobPositionsApiService, private readonly _jobPositionsForms: JobPositionsForms, private readonly _departmentsApi: DepartmentsApiService) {}
  
    ngOnInit(): void {
      this.loadJobPositions();
      this.loadDepartments();
    }
  
    protected loadDepartments(): void {
        this.loading$.next(true);
        this.error$.next(null);
    
        this._departmentsApi
          .getAll()
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => {
              this.error$.next('Ошибка при загрузке данных отделов');
              return of([]);
            }),
            finalize(() => this.loading$.next(false))
          )
          .subscribe((departments) => {
            this.departments$.next(departments);
          });
      }
  
    protected loadJobPositions(): void {
      this.loading$.next(true);
      this.error$.next(null);
  
      this._jobPositionsApi
        .getAll()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.error$.next('Ошибка при загрузке данных');
            return of([]);
          }),
          finalize(() => this.loading$.next(false))
        )
        .subscribe((jobPositions) => {
          this.jobPositions$.next(jobPositions);
        });
    }
  
    protected confirmJobPositionRemove(jobPositionId: string): void {
      const data: TuiConfirmData = {
        content: 'Вы действительно хотите удалить должность',
        yes: 'Подтвердить',
        no: 'Отменить',
      };
  
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Удалить должность',
          size: 'l',
          data,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap((confirmed) => {
            if (!confirmed) {
              return of(null);
            }
  
            this.loading$.next(true);
            return this._jobPositionsApi.delete(jobPositionId).pipe(
              catchError((error) => {
                this.alerts.open('Ошибка при удалении должности', {
                  appearance: 'negative',
                });
                return of(null);
              }),
              finalize(() => {
                this.loading$.next(false);
              })
            );
          })
        )
        .subscribe(() => {
          this.alerts
            .open('Должность успешно создана', { appearance: 'positive' })
            .subscribe();
          this.loadJobPositions();
        });
    }
  
    protected editJobPosition(
      content: PolymorpheusContent<TuiDialogContext>,
      jobPosition: JobPosition
    ): void {
      this.isEditMode = true;


      this.jobPositionForm.patchValue({
        jobPositionId: jobPosition.jobPositionId,
        jobTitle: jobPosition.jobTitle,
        jobSalary: jobPosition.jobSalary,
        department: jobPosition.department,
      });
      this.dialogs.open(content).subscribe((observer) => {
        this.currentDialogObserver = observer;
      });
    }
  
    public addJobPosition(
      content: PolymorpheusContent<TuiDialogContext>
    ): void {
      this.isEditMode = false;
      this.jobPositionForm.reset();
      this.dialogs.open(content).subscribe((observer) => {
        this.currentDialogObserver = observer;
      });
    }
  
    protected submit(observer: any): void {
      if (this.jobPositionForm.valid) {
        const formValue = this.jobPositionForm.getRawValue();
        this.loading$.next(true);
  
        const request$ = this.isEditMode
          ? this._jobPositionsApi.update(
              formValue.jobPositionId,
              {
                jobPositionId: formValue.jobPositionId,
                jobTitle: formValue.jobTitle,
                jobSalary: formValue.jobSalary,
                departmentId: formValue.department.departmentId,
              }
            )
          : this._jobPositionsApi.create({
            jobPositionId: formValue.jobPositionId,
              jobTitle: formValue.jobTitle,
              jobSalary: formValue.jobSalary,
              departmentId: formValue.department.departmentId,
            });
  
        request$
          .pipe(
            tuiTakeUntilDestroyed(this.destroyRef),
            catchError((error) => {
              this.alerts.open(
                `Ошибка при ${
                  this.isEditMode ? 'обновлении' : 'создании'
                } должности`,
                { appearance: 'negative' }
              );
              return of(null);
            }),
            finalize(() => {
              this.loading$.next(false);
            })
          )
          .subscribe(() => {
            this.alerts
              .open(
                `Должность успешно ${this.isEditMode ? 'обновлена' : 'создана'}`,
                { appearance: 'positive' }
              )
              .subscribe();
              observer.complete();
            this.loadJobPositions();
            this.currentDialogObserver?.complete();
            this.dialogs
            this.trigger$.next();
          });
      } else {
        Object.keys(this.jobPositionForm.controls).forEach((key) => {
          const control = this.jobPositionForm.get(key);
          if (control?.invalid) {
            control.markAsTouched();
          }
        });
      }
    }
    protected readonly stringify = (item: Department | null | undefined) =>
        item && typeof item === 'object' ? item.departmentTitle : item ? String(item) : '';
}
