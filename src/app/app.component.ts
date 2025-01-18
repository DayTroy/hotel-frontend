import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiRoot } from '@taiga-ui/core';
import { LoginComponent } from './login/login.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [TuiRoot, LoginComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
