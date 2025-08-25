import { Component } from '@angular/core';
import { UnitProductionPanelComponent } from '../../game-components/unit-production-panel/unit-production-panel.component';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [UnitProductionPanelComponent],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent {

}
