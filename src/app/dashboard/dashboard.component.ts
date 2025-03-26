import {NgForOf, NgIf} from '@angular/common';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {tuiAsPortal, TuiPortals, TuiRepeatTimes} from '@taiga-ui/cdk';
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
} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader, TuiNavigation} from '@taiga-ui/layout';
import NavHeaderComponent from '../navheader/navheader.component';
import NavSidebarComponent from '../navsidebar/navsidebar.component';

@Component({
    standalone: true,
    imports: [
        NavHeaderComponent,
        NavSidebarComponent,
        FormsModule,
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
    ],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // Ignore portal related code, it is only here to position drawer inside the example block
    providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class DashboardComponent extends TuiPortals {
    protected readonly breadcrumbs = ['Home', 'Angular', 'Repositories', 'Taiga UI'];
}
