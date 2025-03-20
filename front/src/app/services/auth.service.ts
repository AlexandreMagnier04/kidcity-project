import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Récupérer l'utilisateur et le token du localStorage au démarrage
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('token');

      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
      if (storedToken) {
        this.tokenSubject.next(storedToken);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données locales :', error);
      this.logout();
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenValue;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      map(response => response.user),  // Extraction de l'utilisateur
      tap(user => this.storeUser(user, response.token)),
      catchError(error => this.handleError(error))
    );
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, email, password }).pipe(
      map(response => response.user),
      tap(user => this.storeUser(user, response.token)),
      catchError(error => this.handleError(error))
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  requestPasswordReset(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auth/forgot-password`, { email }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private storeUser(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur HTTP :', error);
    return throwError(() => new Error(error?.error?.message || 'Une erreur est survenue.'));
  }
}
