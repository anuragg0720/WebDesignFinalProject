import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FacultyDashboardComponent } from './pages/faculty-dashboard/faculty-dashboard.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DocsComponent } from './pages/docs/docs.component';

import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { ContentService } from './services/content.service';
import { AdminService } from './services/admin.service';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingComponent,
    ChatComponent,
    AdminDashboardComponent,
    FacultyDashboardComponent,
    SignupComponent,
    DocsComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
  providers: [
    AuthService,
    ChatService,
    ContentService,
    AdminService,
    AuthGuard,
    RoleGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
