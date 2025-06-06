import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { RouterLink } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
@Component({
    standalone: true,
    selector: "navsidebar",
    imports: [
        TuiButton,
        TuiChevron,
        TuiNavigation,
        TuiTextfield,
        ReactiveFormsModule,
        RouterLink,
        TuiIcon
    ],
    templateUrl: './navsidebar.component.html',
    styleUrl: './navsidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavSidebarComponent {
    logout(): void {
        
    }
}
