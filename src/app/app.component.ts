import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiRoot } from '@taiga-ui/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [TuiRoot, RouterOutlet],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
