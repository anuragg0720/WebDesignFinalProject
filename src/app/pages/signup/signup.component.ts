import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: false,
})
export class SignupComponent {
  loading = false;
  error: string | null = null;

  model = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    courseEnrolled: '',
    intake: '',
  };

  constructor(private auth: AuthService, private router: Router) {}

  submit(form: any) {
    if (this.loading) return;
    this.error = null;

    // Normalize values
    const firstName = this.model.firstName.trim();
    const lastName = this.model.lastName.trim();
    const email = this.model.email.trim().toLowerCase();
    const password = this.model.password;
    const phone = this.model.phone.trim();

    // write normalized values back (so UI also shows cleaned)
    this.model.firstName = firstName;
    this.model.lastName = lastName;
    this.model.email = email;
    this.model.phone = phone;

    // Basic required checks
    if (!firstName || !lastName || !email || !password) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    // First name / last name: letters only (plus spaces and basic name chars)
    const namePattern = /^[A-Za-z\s'-]+$/;
    if (!namePattern.test(firstName) || !namePattern.test(lastName)) {
      this.error = 'First name and last name should contain only letters.';
      return;
    }

    // Northeastern email
    const neuPattern = /^[a-zA-Z0-9._%+-]+@northeastern\.edu$/;
    if (!neuPattern.test(email)) {
      this.error = 'Please use your @northeastern.edu email address.';
      return;
    }

    // Contact number: if provided, must be 10-digit numeric
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      this.error = 'Contact number must be a 10-digit number.';
      return;
    }

    // Password length
    if (password.length < 8) {
      this.error = 'Password must be at least 8 characters long.';
      return;
    }

    // Optional: template-level validation too
    if (form && form.invalid) {
      this.error = 'Please fix the highlighted fields.';
      return;
    }

    this.loading = true;
    this.auth.signupStudent(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Signup error', err);
        this.error =
          err?.error?.message || 'Could not create account. Please try again.';
        this.loading = false;
      },
    });
  }
}
