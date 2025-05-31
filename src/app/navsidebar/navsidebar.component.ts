import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {TuiButton, TuiTextfield} from '@taiga-ui/core';
import {TuiChevron,} from '@taiga-ui/kit';
import {TuiNavigation} from '@taiga-ui/layout';
@Component({
    standalone: true,
    selector: "navsidebar",
    imports: [
        TuiButton,
        TuiChevron,
        TuiNavigation,
        TuiTextfield,
        ReactiveFormsModule
    ],
    templateUrl: './navsidebar.component.html',
    styleUrl: './navsidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavSidebarComponent {
}
