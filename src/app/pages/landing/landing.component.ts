import { Component, OnInit } from '@angular/core';
import { ContentService, ContentItem } from '../../services/content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: false
})
export class LandingComponent implements OnInit {
  content: ContentItem[] = [];

  constructor(
    private contentService: ContentService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.contentService.list().subscribe((items) => (this.content = items));
  }
}
