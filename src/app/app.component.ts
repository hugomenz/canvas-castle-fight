import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/layout-elements/footer/footer.component';
import { LeftSidebarComponent } from './components/layout-elements/left-sidebar/left-sidebar.component';
import { MainContentComponent } from './components/canvas/main-content/main-content.component';
import { RightSidebarComponent } from './components/layout-elements/right-sidebar/right-sidebar.component';
import { HeaderComponent } from './components/layout-elements/header/header.component';
import { BottomBarComponent } from './components/game-components/bottom-bar/bottom-bar.component';
import { ProgressBarComponent } from './components/game-components/progress-bar/progress-bar.component';
import { TopBarComponent } from './components/game-components/top-bar/top-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
    MainContentComponent,
    TopBarComponent,
    BottomBarComponent,
    ProgressBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'canvaworld';
}
