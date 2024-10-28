import { Component } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [NavigationComponent],
})
export class HeaderComponent {
  user = {
    name: 'Juan Pérez',
    avatar: 'assets/avatar.png',
  };
}
