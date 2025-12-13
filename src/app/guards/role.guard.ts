import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[] | undefined;
    const user = this.auth.getCurrentUser();
    if (!allowedRoles || !user) {
      this.router.navigate(['/']);
      return false;
    }
    if (!allowedRoles.includes(user.role)) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
