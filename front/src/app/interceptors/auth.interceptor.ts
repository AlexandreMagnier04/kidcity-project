import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer l'utilisateur actuel
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Dans un vrai système, vous auriez un token JWT ici
      // Pour l'instant, on simule avec l'ID utilisateur
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer mock-token-${currentUser.id}`
        }
      });
    }
    
    return next.handle(request);
  }
}

// N'oubliez pas de l'ajouter dans app.module.ts:
// providers: [
//   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
// ]