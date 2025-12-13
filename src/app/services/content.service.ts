import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ContentItem {
  _id?: string;
  title: string;
  body?: string;
  imageUrl?: string;
  tags?: string[];
  isPublished?: boolean;
}

@Injectable()
export class ContentService {
  private apiBaseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ContentItem[]>(`${this.apiBaseUrl}/content`);
  }

  create(item: ContentItem) {
    return this.http.post<ContentItem>(`${this.apiBaseUrl}/content`, item);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiBaseUrl}/content/${id}`);
  }
}
