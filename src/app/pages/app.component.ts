import { Component } from '@angular/core';
import { AuthService, User } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  title = 'Husky AI';

  constructor(public auth: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  get displayName(): string {
    return this.currentUser?.displayName || this.currentUser?.email || '';
  }

  get isAdmin(): boolean {
    const role = this.currentUser?.role;
    return role === 'super-admin' || role === 'husky-admin';
  }

  get isFaculty(): boolean {
    const role = this.currentUser?.role;
    return role === 'faculty';
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
