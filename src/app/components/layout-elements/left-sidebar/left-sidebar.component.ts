import { Component } from '@angular/core';
import { UnitProductionPanelComponent } from '../../game-components/unit-production-panel/unit-production-panel.component';
import { MinimapComponent } from '../../game-components/minimap/minimap.component';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [UnitProductionPanelComponent, MinimapComponent],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent {

}
