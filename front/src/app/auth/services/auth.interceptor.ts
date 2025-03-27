import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ne pas ajouter de token pour les requêtes d'authentification
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Pour toutes les autres requêtes, ajouter le token d'accès
  const token = authService.getToken();
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return handleRequest(authReq, next, authService);
  }

  return next(req);
};

function handleRequest(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
  return next(request).pipe(
    catchError(error => {
      // Si erreur 401 (non autorisé), tenter de rafraîchir le token
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            // Créer une nouvelle requête avec le nouveau token
            const newRequest = request.clone({
              headers: request.headers.set('Authorization', `Bearer ${response.accessToken}`)
            });
            return next(newRequest);
          }),
          catchError(refreshError => {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
}