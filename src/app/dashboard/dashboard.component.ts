import { CommonModule } from '@angular/common';
import  { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {TuiTextfield } from '@taiga-ui/core';
import {
    TuiBreadcrumbs,
    TuiSelect,
    TuiTabs,
    TuiDataListWrapper
} from '@taiga-ui/kit';
import NavHeaderComponent from '../navheader/navheader.component';
import NavSidebarComponent from '../navsidebar/navsidebar.component';

interface Character {
    readonly id: number;
    readonly name: string;
}
@Component({
    selector: 'azim-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        NavHeaderComponent,
        NavSidebarComponent,
        FormsModule,
        TuiTabs,
        TuiTextfield,
        TuiDataListWrapper,
        TuiSelect
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DashboardComponent  {
    protected readonly breadcrumbs = ['Home', 'Angular', 'Repositories', 'Taiga UI'];
    protected readonly references = [
        'Гостиничные номера',
        'Типы гостинчиных номеров',
        'Сотрудника',
        'Отделы',
        'Дополнительные услуги',
        'Гости',
    ];

    protected value: string | null = 'Выберите справочник...';
}
