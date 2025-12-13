import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: 'student' | 'faculty' | 'super-admin' | 'husky-admin' | 'support';
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  courseEnrolled?: string;
  intake?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'husky_ai_token';
  private readonly USER_KEY = 'husky_ai_user';
  private apiBaseUrl = 'http://localhost:4000/api';

  currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setSession(res.token, res.user);
        })
      );
  }

  signupStudent(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    courseEnrolled?: string;
    intake?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/signup`, payload)
      .pipe(
        tap((res) => {
          this.setSession(res.token, res.user);
        })
      );
  }

  setSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser = user;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
