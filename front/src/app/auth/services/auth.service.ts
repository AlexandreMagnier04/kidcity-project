import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  email: string;
  name?: string;
  surname?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Ajustez l'URL selon votre configuration
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (userData && token) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      this.autoLogout(this.getTokenExpirationDate(token));
    }
  }

  register(name: string, surname: string, email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      surname,
      email,
      password
    }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthentication(response: AuthResponse) {
    const { accessToken, refreshToken, user } = response;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } else {
      // Si l'utilisateur n'est pas inclus dans la réponse, récupérez-le
      this.getProfile().subscribe(profile => {
        localStorage.setItem('user', JSON.stringify(profile));
        this.currentUserSubject.next(profile);
      });
    }

    // Configurez l'expiration automatique
    const expirationDate = this.getTokenExpirationDate(accessToken);
    this.autoLogout(expirationDate);
  }

  private getTokenExpirationDate(token: string): Date {
    // Décoder le JWT pour obtenir l'expiration
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return new Date(payload.exp * 1000);
  }

  private autoLogout(expirationDate: Date) {
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken().subscribe();
    }, expiresIn - 60000); // Rafraîchir 1 minute avant l'expiration
  }

  private handleError(error: any) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.status) {
      // Erreur retournée par le serveur
      errorMessage = `Erreur ${error.status}: ${error.error?.message || error.statusText}`;
    }
    
    return throwError(() => errorMessage);
  }
}