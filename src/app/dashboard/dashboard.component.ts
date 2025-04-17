import {CommonModule, NgForOf, NgIf} from '@angular/common';
import  {ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {tuiAsPortal, TuiPortals, TuiRepeatTimes } from '@taiga-ui/cdk';
import {
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiLink,
    TuiTextfield,
    TuiTitle,
} from '@taiga-ui/core';
import {
    TuiBreadcrumbs,
    TuiFade,
    TuiTabs,
    TuiDataListWrapper
} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader, TuiNavigation} from '@taiga-ui/layout';
import NavHeaderComponent from '../navheader/navheader.component';
import NavSidebarComponent from '../navsidebar/navsidebar.component';
import {TuiSelectModule, TuiTextfieldControllerModule, TuiComboBoxModule} from '@taiga-ui/legacy';
@Component({
    standalone: true,
    imports: [
        CommonModule,
        NavHeaderComponent,
        NavSidebarComponent,
        FormsModule,
        ReactiveFormsModule,
        NgForOf,
        NgIf,
        TuiAppearance,
        TuiBreadcrumbs,
        TuiButton,
        TuiCardLarge,
        TuiDataList,
        TuiDropdown,
        TuiFade,
        TuiForm,
        TuiHeader,
        TuiLink,
        TuiNavigation,
        TuiRepeatTimes,
        TuiTabs,
        TuiTextfield,
        TuiTitle,
        TuiDataListWrapper,
        TuiSelectModule,
        TuiTextfieldControllerModule,
        TuiComboBoxModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class DashboardComponent extends TuiPortals {
    protected readonly breadcrumbs = ['Home', 'Angular', 'Repositories', 'Taiga UI'];
    protected readonly items = [
        {name: 'John', surname: 'Cleese'},
        {name: 'Eric', surname: 'Idle'},
        {name: 'Graham', surname: 'Chapman'},
        {name: 'Michael', surname: 'Palin'},
        {name: 'Terry', surname: 'Gilliam'},
        {name: 'Terry', surname: 'Jones'},
    ];
    protected value = '';
}
