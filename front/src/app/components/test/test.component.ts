import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-test',
  template: `
    <div>
      <h2>Test d'authentification</h2>
      <div *ngIf="!isLoggedIn">
        <button (click)="login()">Se connecter (demo)</button>
        <button (click)="register()">S'inscrire (test)</button>
      </div>
      <div *ngIf="isLoggedIn">
        <p>Connecté en tant que: {{ currentUserName }}</p>
        <p>Kidcoins: {{ kidcoins }}</p>
        <button (click)="logout()">Se déconnecter</button>
      </div>
      <div *ngIf="errorMessage" style="color: red;">
        {{ errorMessage }}
      </div>
    </div>
  `
})
export class TestComponent implements OnInit {
  isLoggedIn = false;
  currentUserName = '';
  kidcoins = 0;
  errorMessage = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUserName = user.username;
        this.kidcoins = user.kidcoins;
      }
    });
  }

  login(): void {
    this.authService.login('demo@kidcity.com', 'password').subscribe({
      next: (user) => {
        console.log('Connecté:', user);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Erreur de connexion:', error);
      }
    });
  }

  register(): void {
    this.authService.register('test', 'test@example.com', 'password').subscribe({
      next: (user) => {
        console.log('Inscrit:', user);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Erreur d\'inscription:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    console.log('Déconnecté');
  }
}