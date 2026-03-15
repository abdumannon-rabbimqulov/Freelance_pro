// ===========================
// Freelance Pro - Auth Handler
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Demo: Simulate login
            const email = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            if (email && password) {
                // Show loading
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // Save user data (demo)
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', 'Demo User');
                    
                    // Redirect to index
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
    
    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const phone = this.querySelector('input[type="tel"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const userType = this.querySelector('select').value;
            const termsAccepted = this.querySelector('#terms').checked;
            
            if (fullName && email && phone && password && userType && termsAccepted) {
                // Show loading
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // Save user data (demo)
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', fullName);
                    localStorage.setItem('userType', userType);
                    
                    // Redirect based on user type
                    if (userType === 'seller' || userType === 'both') {
                        window.location.href = 'seller-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            }
        });
    }
    
    // Social Login Handlers
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            alert(`${provider} orqali kirish funksiyasi ishlab chiqilmoqda...`);
        });
    });
    
    // Password visibility toggle (if needed)
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-secondary);';
        
        // Add toggle functionality if needed
        input.parentElement.style.position = 'relative';
    });
});

// Check if user is logged in (for protected pages)
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require authentication
    const protectedPages = ['seller-dashboard.html', 'buyer-orders.html'];
    
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    window.location.href = 'login.html';
}

// Update header based on login status
function updateHeader() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');
    
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && isLoggedIn) {
        // User is logged in - show user menu
        const loginBtn = headerActions.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.remove();
        }
        
        // Add user avatar if not exists
        if (!headerActions.querySelector('.user-menu')) {
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <div class="user-avatar">${userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                <span style="font-weight: 600; font-size: 0.9rem;">${userName || 'User'}</span>
                <i class="fas fa-chevron-down"></i>
            `;
            
            // Add dropdown functionality
            userMenu.addEventListener('click', function() {
                showUserDropdown(this);
            });
            
            headerActions.appendChild(userMenu);
        }
    }
}

// Show user dropdown menu
function showUserDropdown(element) {
    // Create dropdown if doesn't exist
    let dropdown = element.nextElementSibling;
    
    if (!dropdown || !dropdown.classList.contains('user-dropdown')) {
        dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            background: white;
            border-radius: 10px;
            box-shadow: 0 12px 24px rgba(0,0,0,0.08);
            padding: 10px;
            min-width: 200px;
            display: none;
            z-index: 1000;
        `;
        
        dropdown.innerHTML = `
            <a href="seller-dashboard.html" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; text-decoration: none; color: var(--color-text); border-radius: 8px; transition: background 0.2s;">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; text-decoration: none; color: var(--color-text); border-radius: 8px; transition: background 0.2s;">
                <i class="fas fa-user"></i>
                <span>Profil</span>
            </a>
            <a href="#" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; text-decoration: none; color: var(--color-text); border-radius: 8px; transition: background 0.2s;">
                <i class="fas fa-cog"></i>
                <span>Sozlamalar</span>
            </a>
            <hr style="margin: 10px 0; border: none; border-top: 1px solid var(--color-border-light);">
            <a href="#" onclick="logout(); return false;" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; text-decoration: none; color: var(--status-danger); border-radius: 8px; transition: background 0.2s;">
                <i class="fas fa-sign-out-alt"></i>
                <span>Chiqish</span>
            </a>
        `;
        
        element.parentElement.style.position = 'relative';
        element.parentElement.appendChild(dropdown);
        
        // Add hover effects
        const links = dropdown.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.background = 'var(--color-bg)';
            });
            link.addEventListener('mouseleave', function() {
                this.style.background = 'transparent';
            });
        });
    }
    
    // Toggle dropdown
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!element.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 0);
    } else {
        dropdown.style.display = 'none';
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeader);
} else {
    updateHeader();
}