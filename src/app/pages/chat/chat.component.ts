import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ChatMessage, ChatContextItem } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false,
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [
    { from: 'assistant', text: 'Hi! I am Husky AI. How can I help you today?' },
  ];
  input = '';
  loading = false;

  // minimal context history for the backend
  private context: ChatContextItem[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // <-- ADD THIS
  ) {}

  ngOnInit() {
    // Verify user is logged in
    if (!this.authService.isLoggedIn()) {
      console.error('❌ Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('✅ Chat component initialized. User:', this.authService.currentUser);
  }

  usePrompt(text: string) {
    this.input = text;
    this.send();
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) {
      console.log('⚠️ Cannot send: empty message or already loading');
      return;
    }

    console.log('📤 Sending message:', text);

    // Add user message
    this.messages.push({ from: 'user', text });
    this.context.push({ role: 'user', content: text });
    this.input = '';
    this.loading = true;

    // Force UI update
    this.cdr.detectChanges();

    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollToBottom(), 100);

    this.chatService.sendMessage(text, this.context).subscribe({
      next: (res) => {
        console.log('✅ Received response:', res);
        const replyText = res.reply || res.answer || 'No response from Husky AI.';

        // Add assistant message
        this.messages.push({ from: 'assistant', text: replyText });
        this.context.push({ role: 'assistant', content: replyText });
        this.loading = false;

        console.log('📊 Messages array:', this.messages);
        console.log('📊 Total messages:', this.messages.length);

        // Force UI update - THIS IS THE KEY FIX
        this.cdr.detectChanges();

        // Scroll to bottom after adding response
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('❌ Chat error:', error);
        
        let errorMessage = 'Something went wrong talking to Husky AI.';
        
        if (error.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Is the backend running?';
        }

        this.messages.push({
          from: 'assistant',
          text: errorMessage,
        });
        this.loading = false;

        // Force UI update even on error
        this.cdr.detectChanges();

        setTimeout(() => this.scrollToBottom(), 100);
      },
    });
  }

  private scrollToBottom() {
    const messagesDiv = document.getElementById('messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }
}