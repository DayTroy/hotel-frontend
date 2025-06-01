import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { TuiTextfield } from '@taiga-ui/core';
import {
    TuiSelect,
    TuiTabs,
    TuiDataListWrapper
} from '@taiga-ui/kit';
import NavHeaderComponent from '../navheader/navheader.component';
import NavSidebarComponent from '../navsidebar/navsidebar.component';
import { TuiNavigation } from '@taiga-ui/layout';

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
        TuiSelect,
        RouterOutlet,
        TuiNavigation
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DashboardComponent {

}
