document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profileIcon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Open sidebar
    profileIcon.addEventListener('click', () => {
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
    });

    // Close sidebar
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !profileIcon.contains(e.target)) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}); 