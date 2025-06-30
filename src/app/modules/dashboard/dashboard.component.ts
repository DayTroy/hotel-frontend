import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiNavigation } from '@taiga-ui/layout';
import NavHeaderComponent from '../../components/navheader/navheader.component';
import NavSidebarComponent from '../../components/navsidebar/navsidebar.component';

@Component({
    selector: 'azim-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        NavHeaderComponent,
        NavSidebarComponent,
        RouterOutlet,
        TuiNavigation
    ],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DashboardComponent {}
