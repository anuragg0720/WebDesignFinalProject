import { Component, OnInit } from '@angular/core';
import { ContentService, ContentItem } from '../../services/content.service';
import { AdminService } from '../../services/admin.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  contentItems: ContentItem[] = [];
  loadingContent = false;
  contentError = '';

  users: User[] = [];
  students: User[] = [];
  loadingUsers = false;
  usersError = '';

  newItem: ContentItem = {
    title: '',
    body: '',
    imageUrl: '',
    tags: [],
    isPublished: true,
  };

  newFaculty = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };
  creatingFaculty = false;
  facultyError = '';
  facultySuccess = '';

  constructor(
    private contentService: ContentService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadContent();
    this.loadUsers();
    this.loadStudents();
  }

  // --- Content management ---

  loadContent() {
    this.loadingContent = true;
    this.contentError = '';
    this.contentService.list().subscribe({
      next: (items) => {
        this.contentItems = items;
        this.loadingContent = false;
      },
      error: () => {
        this.contentError = 'Failed to load content items.';
        this.loadingContent = false;
      },
    });
  }

  addContent() {
    if (!this.newItem.title.trim()) {
      return;
    }
    this.contentService.create(this.newItem).subscribe({
      next: (created) => {
        this.contentItems.unshift(created);
        this.newItem = {
          title: '',
          body: '',
          imageUrl: '',
          tags: [],
          isPublished: true,
        };
      },
      error: () => {
        this.contentError = 'Failed to create content item.';
      },
    });
  }

  deleteContent(item: ContentItem) {
    if (!item._id) return;
    if (!confirm(`Delete "${item.title}"?`)) {
      return;
    }
    this.contentService.delete(item._id).subscribe({
      next: () => {
        this.contentItems = this.contentItems.filter((c) => c._id !== item._id);
      },
      error: () => {
        this.contentError = 'Failed to delete content item.';
      },
    });
  }

  // --- Users / faculty management ---

  loadUsers() {
    this.loadingUsers = true;
    this.usersError = '';
    this.adminService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: () => {
        this.usersError = 'Failed to load users.';
        this.loadingUsers = false;
      },
    });
  }

  loadStudents() {
    this.adminService.getStudents().subscribe({
      next: (students: User[]) => {
        this.students = students;
      },
      error: () => {
        // keep silent, faculty dashboard shows its own error
      },
    });
  }

  createFaculty() {
    this.facultyError = '';
    this.facultySuccess = '';

    const { firstName, lastName, email, password } = this.newFaculty;
    if (!firstName || !lastName || !email || !password) {
      this.facultyError = 'All fields are required.';
      return;
    }

    this.creatingFaculty = true;

    this.adminService
      .createFaculty({ firstName, lastName, email, password })
      .subscribe({
        next: () => {
          this.facultySuccess = 'Faculty user created successfully.';
          this.newFaculty = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
          };
          this.creatingFaculty = false;

          // Optional: clear success state after a few seconds
          setTimeout(() => {
            this.facultySuccess = '';
          }, 4000);

          this.loadUsers();
        },
        error: (err) => {
          this.facultyError =
            err?.error?.message || 'Failed to create faculty user.';
          this.creatingFaculty = false;
        },
      });
  }
}
