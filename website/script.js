document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .tier-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Mouse follow glow effect
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        const glow = document.querySelector('.background-glow');
        if (glow) {
            glow.style.background = `
                radial-gradient(circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                radial-gradient(circle at ${window.innerWidth - x}px ${window.innerHeight - y}px, rgba(168, 85, 247, 0.15) 0%, transparent 40%)
            `;
        }
    });
});
