import { Component } from '@angular/core';
import { TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCard, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { RouterLink } from '@angular/router';
import { APP_MODULES } from '../../global.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TuiIcon,
    TuiCardLarge,
    TuiHeader,
    TuiButton,
    RouterLink,
    TuiTitle,
    TuiCard,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly modules = APP_MODULES;
}
