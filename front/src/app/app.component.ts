import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  // Afficher le header seulement si l'utilisateur est authentifié
  // Vous pouvez le configurer selon vos besoins
  showHeader = true;
}