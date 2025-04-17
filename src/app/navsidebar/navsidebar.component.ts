import { NgIf } from '@angular/common';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';
import {
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiTextfield,
} from '@taiga-ui/core';
import {
    TuiBadge,
    TuiChevron,
    TuiDataListDropdownManager,
    TuiFade,
    TuiTabs,
} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';

@Component({
    standalone: true,
    selector: "navsidebar",
    imports: [
        FormsModule,
        NgIf,
        RouterLink,
        RouterLinkActive,
        TuiAppearance,
        TuiBadge,
        TuiButton,
        TuiChevron,
        TuiDataList,
        TuiDataListDropdownManager,
        TuiDropdown,
        TuiFade,
        TuiNavigation,
        TuiTabs,
        TuiTextfield
    ],
    templateUrl: './navsidebar.component.html',
    styleUrl: './navsidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // Ignore portal related code, it is only here to position drawer inside the example block
    providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export default class NavSidebarComponent extends TuiPortals {
    protected expanded = signal(false);
    protected open = false;
    protected switch = false;
    protected readonly routes: any = {};

    protected handleToggle(): void {
        this.expanded.update((e) => !e);
    }
}
