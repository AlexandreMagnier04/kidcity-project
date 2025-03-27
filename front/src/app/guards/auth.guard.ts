import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  canActivate(requiredRoles?: string[]): boolean {
    if (this.authService.isAuthenticated()) {
      // Vérifier les rôles si nécessaire
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = this.authService.getCurrentUser()?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
          // Rediriger vers une page d'accès refusé ou la page d'accueil
          this.router.navigate(['/']);
          return false;
        }
      }
      return true;
    }
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
    return false;
  }
}