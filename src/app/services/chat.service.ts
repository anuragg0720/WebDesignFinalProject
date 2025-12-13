// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// What the UI uses
export interface ChatMessage {
  from: 'user' | 'assistant';
  text: string;
}

// What we send to backend as context
export interface ChatContextItem {
  role: 'user' | 'assistant';
  content: string;
}

// Shape of the backend response
export interface ChatResponse {
  reply?: string;
  answer?: string; // keep for safety
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiBaseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  sendMessage(
    message: string,
    context: ChatContextItem[] = []
  ): Observable<ChatResponse> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<ChatResponse>(
      `${this.apiBaseUrl}/chat`,
      { message, context },
      { headers }
    );
  }
}
