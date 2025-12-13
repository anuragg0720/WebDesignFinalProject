import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface FacultyPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiBaseUrl = 'http://localhost:4000/api/admin';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiBaseUrl}/users`, {
      headers: this.authHeaders(),
    });
  }

  getStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiBaseUrl}/students`, {
      headers: this.authHeaders(),
    });
  }

  createFaculty(payload: FacultyPayload): Observable<User> {
    return this.http.post<User>(`${this.apiBaseUrl}/faculty`, payload, {
      headers: this.authHeaders(),
    });
  }
}
