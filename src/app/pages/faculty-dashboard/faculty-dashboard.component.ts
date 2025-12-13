import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-faculty-dashboard',
  templateUrl: './faculty-dashboard.component.html',
  styleUrls: ['./faculty-dashboard.component.css'],
  standalone: false,
})
export class FacultyDashboardComponent implements OnInit {
  students: User[] = [];
  loading = false;
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.error = '';
    this.admin.getStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load students.';
        this.loading = false;
      },
    });
  }
}
