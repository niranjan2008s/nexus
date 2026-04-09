/**
 * Nexus AI - Core Application Controller
 * Manages UI transitions, navigation, and system state.
 */

const app = {
    dataLoaded: false,
    currentPath: 'dashboard',

    init() {
        this.setupBackground();
        console.log("Nexus AI Interface: INITIALIZED");
        
        // Ensure app starts hidden
        document.getElementById('app').classList.add('app-hidden');
    },

    /**
     * User Action: Load Demo Data
     * Required before dashboard access
     */
    loadDemoAndEnter() {
        const btn = document.getElementById('btn-load-demo');
        btn.innerHTML = '<span>Loading Encrypted Data...</span>';
        btn.disabled = true;

        setTimeout(() => {
            this.dataLoaded = true;
            graphEngine.init();
            graphEngine.build();
            
            // Visual transition
            document.getElementById('welcome-screen').classList.add('welcome-screen-hidden');
            setTimeout(() => {
                document.getElementById('welcome-screen').style.display = 'none';
                document.getElementById('app').classList.remove('app-hidden');
                document.getElementById('status-mode').innerText = '● Live Dataset Loaded';
                console.log("Nexus AI: Data Secured and Visualized.");
            }, 800);
        }, 1500);
    },

    /**
     * User Action: Enter Dashboard (if data loaded)
     */
    enterDashboard() {
        if (!this.dataLoaded) {
            alert("Security Protocol: Dataset must be initialized before entry.");
            return;
        }
        document.getElementById('welcome-screen').classList.add('welcome-screen-hidden');
        setTimeout(() => {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('app').classList.remove('app-hidden');
        }, 800);
    },

    /**
     * Navigation Handling
     */
    navigateTo(pageId) {
        // Toggle Pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) targetPage.classList.add('active');

        // Toggle Nav Items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-page') === pageId) nav.classList.add('active');
        });

        this.currentPath = pageId;
    },

    closeDetails() {
        document.getElementById('details-panel').style.display = 'none';
        graphEngine.resetFocus();
    },

    /**
     * Background Animation (Subtle Connection Particles)
     */
    setupBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    },

    /**
     * Utility for animating numeric counters
     */
    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = Math.floor(progress * (end - start) + start);
            obj.innerHTML = val;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

/**
 * Global Run Hooks (attached to buttons via index.html)
 */
function loadDemoAndEnter() { app.loadDemoAndEnter(); }
function enterDashboard() { app.enterDashboard(); }
function navigateTo(p) { app.navigateTo(p); }
function runAnalysis() { fraudEngine.runAnalysis(); }
function closeDetails() { app.closeDetails(); }

// Startup
window.onload = () => app.init();
