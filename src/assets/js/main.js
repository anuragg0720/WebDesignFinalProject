/* ============================= ISHA: UTILITY FUNCTIONS ============================= */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const AUTH_KEY = "auth.user";
  const setUser = (u) => localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  const getUser = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; } };
  const clearUser = () => localStorage.removeItem(AUTH_KEY);
  const logout = (redirect = "login.html") => { clearUser(); window.location.href = redirect; };

  const displayFromEmail = (email) => {
    const local = (email || "").split("@")[0];
    if (!local) return "Account";
    const parts = local.split(/[._-]+/).filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "Account";
  };

  /* ============================= ANURAG: AUTHENTICATION UI RENDER ============================= */


  const renderAuthUI = () => {
    const user = getUser();
    if (!user) return;

    $$('a[href="login.html"]').forEach(a => {
      const li = a.closest("li");
      if (li && li.classList.contains("nav-item")) {
        const wrapper = document.createElement("li");
        wrapper.className = "nav-item dropdown";
        const name = user.displayName || displayFromEmail(user.email);
        wrapper.innerHTML = `
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle me-1"></i><span class="account-name">${name}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><span class="dropdown-item-text small text-secondary">${user.email}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutLink"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
          </ul>`;
        li.parentElement.replaceChild(wrapper, li);

        new bootstrap.Dropdown(wrapper.querySelector('[data-bs-toggle="dropdown"]'));
        wrapper.querySelector("#logoutLink")?.addEventListener("click", (e) => {
          e.preventDefault();
          logout("login.html");
        });
      } else {
        a.textContent = (user.displayName || displayFromEmail(user.email));
        a.href = "#";
        a.classList.add("disabled");
        const body = a.closest(".offcanvas-body");
        if (body && !body.querySelector("#logoutLinkOffcanvas")) {
          const btn = document.createElement("button");
          btn.id = "logoutLinkOffcanvas";
          btn.type = "button";
          btn.className = "btn btn-outline-secondary w-100 mt-3";
          btn.innerHTML = '<i class="bi bi-box-arrow-right me-2"></i>Logout';
          btn.addEventListener("click", () => logout("login.html"));
          body.appendChild(btn);
        }
      }
    });
  };

/* ============================= ANANYA: DOM CONTENT LOADED & FORM BINDINGS ============================= */

  document.addEventListener('DOMContentLoaded', () => {
    $$('.brand').forEach(el => (el.textContent = 'HUSKY AI'));
    const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

    $$( '[data-bs-toggle="tooltip"]' ).forEach(el => new bootstrap.Tooltip(el));

    const globalToastEl = $('#globalToast');
    if (globalToastEl) window.globalToast = new bootstrap.Toast(globalToastEl, { delay: 2000 });

    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!newsletterForm.checkValidity()) {
          e.stopPropagation();
        } else {
          $('#globalToast .toast-body').textContent = 'Subscribed! Check your inbox.';
          window.globalToast?.show();
          newsletterForm.reset();
          newsletterForm.classList.remove('was-validated');
        }
        newsletterForm.classList.add('was-validated');
      });
    }

    const demoForm = $('#demoForm');
    if (demoForm) {
      demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!demoForm.checkValidity()) {
          e.stopPropagation();
        } else {
          $('#globalToast .toast-body').textContent = 'Thanks! We will email you shortly.';
          window.globalToast?.show();
          bootstrap.Modal.getInstance($('#demoModal'))?.hide();
          demoForm.reset();
          demoForm.classList.remove('was-validated');
        }
        demoForm.classList.add('was-validated');
      });
    }
  

  /* ============================= DEEPA: LOGIN FORM LOGIC & LOGOUT BINDINGS ============================= */

    const loginForm = $('#loginForm');
    if (loginForm) {
      const email = $('#email');
      const pwd = $('#password');
      const loginBtn = $('#loginBtn');
      const spinner = loginBtn?.querySelector('.spinner-border');
      const btnText = loginBtn?.querySelector('.btn-text');
      const loginToastEl = $('#loginToast');
      const loginToast = loginToastEl ? new bootstrap.Toast(loginToastEl, { delay: 1200 }) : null;
      const loginAlert = $('#loginAlert');
      const togglePwd = $('#togglePwd');
      const pwdStrength = $('#pwdStrength');

      const isNEUEmail = (value) => /^[A-Za-z0-9._%+-]+@northeastern\.edu$/i.test((value || "").trim());
      const setNEUEmailValidity = () => {
        if (!email.value) { email.setCustomValidity(""); return; } 
        if (isNEUEmail(email.value)) {
          email.setCustomValidity("");
          email.classList.remove("is-invalid");
        } else {
          email.setCustomValidity("Use your @northeastern.edu email address.");
        }
      };
      email?.addEventListener("input", setNEUEmailValidity);
      setNEUEmailValidity();

      togglePwd?.addEventListener('click', () => {
        const isPwd = pwd.type === 'password';
        pwd.type = isPwd ? 'text' : 'password';
        togglePwd.innerHTML = isPwd ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
      });

      const evaluatePwd = (val) => {
        let score = 0;
        if (val.length >= 8) score += 25;
        if (/[a-z]/.test(val)) score += 25;
        if (/[A-Z]/.test(val)) score += 25;
        if (/[0-9]/.test(val)) score += 25;
        return score;
      };
      pwd?.addEventListener('input', () => {
        const v = pwd.value || '';
        const s = evaluatePwd(v);
        if (pwdStrength) {
          pwdStrength.style.width = s + '%';
          pwdStrength.classList.toggle('bg-danger', s < 50);
          pwdStrength.classList.toggle('bg-warning', s >= 50 && s < 75);
          pwdStrength.classList.toggle('bg-success', s >= 75);
        }
      });

      const validPwd = (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val);

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setNEUEmailValidity(); 
        const emailOk = email.checkValidity();
        const pwdOk = validPwd(pwd.value);

        if (!emailOk || !pwdOk) {
          e.stopPropagation();
          pwd.classList.toggle('is-invalid', !pwdOk);
          loginAlert?.classList.remove('d-none');
          loginAlert.textContent = !emailOk
            ? 'Use your @northeastern.edu email address.'
            : 'Please fix the errors and try again.';
          return;
        }

        const user = {
          email: email.value.trim(),
          displayName: displayFromEmail(email.value.trim()),
          loggedInAt: new Date().toISOString()
        };
        setUser(user);

        if (loginToastEl) {
          loginToastEl.querySelector('.toast-body').textContent = `Welcome, ${user.displayName}! Redirecting…`;
        }
        loginAlert?.classList.add('d-none');
        spinner?.classList.remove('d-none');
        btnText?.classList.add('d-none');
        loginBtn?.setAttribute('disabled', 'true');
        loginToast?.show();

        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
      });
    }

    const bindLogout = () => {
      const selectors = ['#logoutBtn', '.logout-btn', '[data-logout]', 'a[href="#logout"]'];
      selectors.forEach(sel => {
        $$(sel).forEach(el => {
          el.addEventListener('click', (e) => {
            e.preventDefault();
            logout('login.html'); 
          });
        });
      });
    };
    bindLogout();

    renderAuthUI();
  });
  })();
