import { NgIf } from '@angular/common';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {tuiAsPortal, TuiPortals} from '@taiga-ui/cdk';
import {TuiButton} from '@taiga-ui/core';
import {TuiBadge, TuiChevron, TuiFade} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';
@Component({
    standalone: true,
    selector: "navsidebar",
    imports: [
        NgIf,
        RouterLink,
        TuiBadge,
        TuiButton,
        TuiChevron,
        TuiFade,
        TuiNavigation,
    ],
    templateUrl: './navsidebar.component.html',
    styleUrl: './navsidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavSidebarComponent {
    protected expanded = signal(false);
    protected open = false;
    protected switch = false;
    protected readonly routes: any = {};

    protected handleToggle(): void {
        this.expanded.update((e) => !e);
    }
}
