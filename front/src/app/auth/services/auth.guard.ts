import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // Vérifier les rôles si nécessaire
      const requiredRoles = route.data['roles'] as Array<string>;
      if (requiredRoles) {
        const userRole = this.authService.getCurrentUser()?.role;
        if (!userRole || !requiredRoles.includes(userRole)) {
          // Rediriger vers une page d'accès refusé ou la page d'accueil
          return this.router.createUrlTree(['/']);
        }
      }
      return true;
    }
    
    // Rediriger vers la page de connexion avec l'URL de retour
    return this.router.createUrlTree(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
  }
}