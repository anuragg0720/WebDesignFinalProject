import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
}


  onSubmit() {
    if (this.loading) {
      return;
    }
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.error = '';

    const emailPattern = /^[a-zA-Z0-9._%+-]+@northeastern\.edu$/;
    if (!emailPattern.test(this.email)) {
      this.error = 'Please use your @northeastern.edu email address.';
      return;
    }

    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
// After login, go to main landing/chat
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}