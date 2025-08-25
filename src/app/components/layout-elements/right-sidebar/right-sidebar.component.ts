import { Component } from '@angular/core';
import { GameSettingsComponent } from '../../game-components/game-settings/game-settings.component';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [GameSettingsComponent],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent {

}
