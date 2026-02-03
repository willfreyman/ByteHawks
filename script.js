document.addEventListener('DOMContentLoaded', function() {
    // Performance monitoring and optimization
    const performanceConfig = {
        lowPerformanceMode: false,
        animationsDisabled: false,
        lastFrameTime: performance.now(),
        frameCount: 0,
        fps: 60,
        memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        performanceConfig.animationsDisabled = true;
    }

    // Performance monitoring
    function monitorPerformance() {
        const now = performance.now();
        performanceConfig.frameCount++;

        if (now - performanceConfig.lastFrameTime >= 1000) {
            performanceConfig.fps = performanceConfig.frameCount;
            performanceConfig.frameCount = 0;
            performanceConfig.lastFrameTime = now;

            // Enable low performance mode if FPS drops below 30
            if (performanceConfig.fps < 30 && !performanceConfig.lowPerformanceMode) {
                enableLowPerformanceMode();
            }
        }

        // Check memory usage if available
        if (performance.memory && performance.memory.usedJSHeapSize > performanceConfig.memoryWarningThreshold) {
            enableLowPerformanceMode();
        }
    }

    function enableLowPerformanceMode() {
        performanceConfig.lowPerformanceMode = true;
        console.log('Low performance mode enabled');

        // Disable heavy animations
        document.body.classList.add('low-performance-mode');

        // Stop particle animations
        clearInterval(mouseParticleInterval);

        // Reduce animation frame rates
        if (gridAnimationId) {
            cancelAnimationFrame(gridAnimationId);
        }
    }

    // Monitor performance every 2 seconds
    setInterval(monitorPerformance, 2000);

    // Grid Background Effect (optimized)
    const canvas = document.getElementById("grid-background");
    let gridAnimationId = null;
    if (canvas) {
        const ctx = canvas.getContext("2d");

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = 600; // Hero height

        let mouse = { x: -9999, y: -9999 };
        const squareSize = 60;
        const grid = [];

        function initGrid() {
            grid.length = 0;
            for (let x = 0; x < width; x += squareSize) {
                for (let y = 0; y < height; y += squareSize) {
                    grid.push({
                        x,
                        y,
                        alpha: 0,
                        fading: false,
                        lastTouched: 0,
                    });
                }
            }
        }

        function getCellAt(x, y) {
            return grid.find(cell =>
                x >= cell.x && x < cell.x + squareSize &&
                y >= cell.y && y < cell.y + squareSize
            );
        }

        window.addEventListener("resize", () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = 600;
            initGrid();
        });

        window.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX;
            mouse.y = e.clientY - rect.top;

            const cell = getCellAt(mouse.x, mouse.y);
            if (cell && cell.alpha === 0) {
                cell.alpha = 1;
                cell.lastTouched = Date.now();
                cell.fading = false;
            }
        });

        function drawGrid() {
            if (performanceConfig.lowPerformanceMode || performanceConfig.animationsDisabled) {
                return; // Skip animation in low performance mode
            }

            ctx.clearRect(0, 0, width, height);
            const now = Date.now();
            let activeCells = 0;

            for (let i = 0; i < grid.length; i++) {
                const cell = grid[i];

                if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 500) {
                    cell.fading = true;
                }

                if (cell.fading) {
                    cell.alpha -= 0.02;
                    if (cell.alpha <= 0) {
                        cell.alpha = 0;
                        cell.fading = false;
                    }
                }

                if (cell.alpha > 0) {
                    activeCells++;
                    // Skip rendering if too many cells are active (performance optimization)
                    if (activeCells > 20 && performanceConfig.fps < 45) {
                        continue;
                    }

                    const centerX = cell.x + squareSize / 2;
                    const centerY = cell.y + squareSize / 2;

                    const gradient = ctx.createRadialGradient(
                        centerX, centerY, 5,
                        centerX, centerY, squareSize
                    );
                    gradient.addColorStop(0, `rgba(0, 255, 136, ${cell.alpha})`);
                    gradient.addColorStop(1, `rgba(0, 255, 136, 0)`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1.3;
                    ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, squareSize - 1, squareSize - 1);
                }
            }

            gridAnimationId = requestAnimationFrame(drawGrid);
        }

        initGrid();
        if (!performanceConfig.animationsDisabled) {
            drawGrid();
        }
    }
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Add smooth page load animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            hamburger.classList.remove('active');
            navMenu.classList.remove('active');

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    function highlightNavLink() {
        let scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // Enhanced scroll animations with staggered effects
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = index * 50; // Stagger delay

                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(40px) scale(0.95)';
                entry.target.style.filter = 'blur(5px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    entry.target.style.filter = 'blur(0)';
                }, delay);

                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe different element groups with different animations
    const animateElements = document.querySelectorAll('.stat-card, .mentor-card, .value-card, .resource-category, .tier, .sponsor-logo');
    animateElements.forEach(element => {
        fadeInObserver.observe(element);
    });

    // Special animation for section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    const titleObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInDown 1s cubic-bezier(0.22, 1, 0.36, 1) forwards';
                titleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sectionTitles.forEach(title => {
        title.style.opacity = '0';
        titleObserver.observe(title);
    });

    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-background');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }

    // Remove floating animation from stats - keep them static
    // const statNumbers = document.querySelectorAll('.stat-number');
    // const statObserver = new IntersectionObserver(function(entries) {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             entry.target.style.animation = 'float 3s ease-in-out infinite';
    //             statObserver.unobserve(entry.target);
    //         }
    //     });
    // }, { threshold: 0.5 });

    // statNumbers.forEach(stat => {
    //     statObserver.observe(stat);
    // });

    // Smooth navbar hide/show with enhanced animation
    const header = document.querySelector('.navbar');
    let lastScrollTop = 0;
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const searchInput = document.querySelector('.floating input');
        const isSearchActive = searchInput && (searchInput === document.activeElement || searchInput.value.trim() !== '');

        // Don't hide navbar if search is active
        if (isSearchActive) {
            header.style.transform = 'translateY(0)';
            if (scrollTop > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                header.style.backdropFilter = 'blur(10px)';
            }
        } else if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down (only hide if search is not active)
            header.style.transform = 'translateY(-100%)';
            header.style.boxShadow = 'none';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
            if (scrollTop > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.boxShadow = 'var(--shadow)';
                header.style.backdropFilter = 'none';
            }
        }

        lastScrollTop = scrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });

    header.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

    // Add smooth hover effect for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.className = 'ripple';

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add simple hover effect for cards (no rotation)
    const cards = document.querySelectorAll('.stat-card, .mentor-card, .value-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            // Simple scale effect without rotation
            this.style.transform = `translateY(-5px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Counter animation for stats
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    }

    // Smooth scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollIndicator.style.width = scrollPercent + '%';
    });

    // Mouse Trail Effect (optimized with cleanup)
    let mouseParticles = [];
    const maxParticles = 5; // Limit number of particles
    let mouseParticleInterval = null;

    const createTrailParticle = (x, y) => {
        if (performanceConfig.lowPerformanceMode || performanceConfig.animationsDisabled) {
            return; // Skip in low performance mode
        }

        // Clean up old particles
        if (mouseParticles.length >= maxParticles) {
            const oldParticle = mouseParticles.shift();
            if (oldParticle && oldParticle.parentNode) {
                oldParticle.remove();
            }
        }

        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);
        mouseParticles.push(particle);

        const size = Math.random() * 10 + 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        const colors = ['#ff6f00', '#1a237e', '#4caf50'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        setTimeout(() => {
            particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0)`;
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            const index = mouseParticles.indexOf(particle);
            if (index > -1) {
                mouseParticles.splice(index, 1);
            }
            particle.remove();
        }, 1000);
    };

    let mouseTimer;
    let lastMouseMove = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMouseMove < 100) return; // Throttle to max 10 times per second
        lastMouseMove = now;

        if (mouseTimer) clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => {
            createTrailParticle(e.clientX, e.clientY);
        }, 50);
    });


    // Magnetic Button Effect (optimized)
    if (!performanceConfig.animationsDisabled) {
        const magneticElements = document.querySelectorAll('.btn, .tier-card, .mentor-card, .stat-card');
        magneticElements.forEach(elem => {
            let rafId = null;
            elem.addEventListener('mousemove', function(e) {
                if (performanceConfig.lowPerformanceMode) return;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const distance = Math.sqrt(x * x + y * y);
                    const maxDistance = Math.max(rect.width, rect.height);
                    const strength = Math.min(distance / maxDistance, 1);

                    this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(${1 + (1 - strength) * 0.05})`;
                });
            });

            elem.addEventListener('mouseleave', function() {
                if (rafId) cancelAnimationFrame(rafId);
                this.style.transform = '';
            });
        });
    }

    // Removed click ripple effect

    // Removed glitch effect to prevent wiggling on hover

    // Interactive Background Particles
    const interactiveSection = document.querySelector('.hero-mission');
    if (interactiveSection) {
        interactiveSection.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const shapes = this.querySelectorAll('.shape, .particle');
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                shape.style.transform = `translate(${x * speed * 20}px, ${y * speed * 20}px)`;
            });
        });
    }

    // Hover Reveal Effect
    const revealElements = document.querySelectorAll('.achievement-list li, .tier-benefits li');
    revealElements.forEach(elem => {
        elem.addEventListener('mouseenter', function() {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.className = 'hover-reveal';
            ripple.style.width = Math.max(rect.width, rect.height) * 2 + 'px';
            ripple.style.height = ripple.style.width;
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // 3D Tilt Effect (optimized)
    if (!performanceConfig.animationsDisabled) {
        const tiltElements = document.querySelectorAll('.program-section, .sponsor-logo, .collage-item');
        tiltElements.forEach(elem => {
            let rafId = null;
            elem.addEventListener('mousemove', function(e) {
                if (performanceConfig.lowPerformanceMode) return;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const rect = this.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;

                    const tiltX = (y - 0.5) * 10;
                    const tiltY = (x - 0.5) * -10;

                    this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
                });
            });

            elem.addEventListener('mouseleave', function() {
                if (rafId) cancelAnimationFrame(rafId);
                this.style.transform = '';
            });
        });
    }

    // Process Slider Functionality
    const processSlider = {
        currentStep: 1,
        totalSteps: 4,
        isAutoPlaying: false,
        autoPlayInterval: null,
        autoPlayDuration: 5000,

        init() {
            this.slides = document.querySelectorAll('.process-slide');
            this.dots = document.querySelectorAll('.progress-dot');
            this.progressFill = document.getElementById('progressFill');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');
            this.autoplayBtn = document.getElementById('autoplayBtn');
            this.autoplayFill = document.querySelector('.autoplay-fill');

            if (!this.slides.length) return;

            this.bindEvents();
            this.updateProgress();
            // Don't auto-start - only start when user clicks play button
        },

        bindEvents() {
            // Navigation buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.goToPrevious());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.goToNext());
            }

            // Progress dots
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const step = parseInt(dot.dataset.step);
                    this.goToStep(step);
                });
            });

            // Autoplay toggle
            if (this.autoplayBtn) {
                this.autoplayBtn.addEventListener('click', () => this.toggleAutoPlay());
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.target.closest('#process')) {
                    if (e.key === 'ArrowLeft') this.goToPrevious();
                    if (e.key === 'ArrowRight') this.goToNext();
                    if (e.key === ' ') {
                        e.preventDefault();
                        this.toggleAutoPlay();
                    }
                }
            });

            // Touch/swipe support
            let touchStartX = 0;
            let touchEndX = 0;
            const slider = document.querySelector('.process-slider');

            if (slider) {
                slider.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                });

                slider.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe();
                });
            }

            this.handleSwipe = () => {
                const swipeThreshold = 50;
                const diff = touchEndX - touchStartX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        this.goToPrevious();
                    } else {
                        this.goToNext();
                    }
                }
            };
        },

        goToStep(step) {
            if (step < 1 || step > this.totalSteps) return;

            // Update slides
            this.slides.forEach(slide => {
                slide.classList.remove('active', 'prev');
                const slideStep = parseInt(slide.dataset.step);

                if (slideStep === step) {
                    slide.classList.add('active');
                    // Reset animations
                    this.resetSlideAnimations(slide);
                } else if (slideStep < step) {
                    slide.classList.add('prev');
                }
            });

            // Update dots
            this.dots.forEach(dot => {
                dot.classList.remove('active', 'completed');
                const dotStep = parseInt(dot.dataset.step);

                if (dotStep === step) {
                    dot.classList.add('active');
                } else if (dotStep < step) {
                    dot.classList.add('completed');
                }
            });

            this.currentStep = step;
            this.updateProgress();
            this.updateButtons();

            // Reset autoplay progress
            if (this.isAutoPlaying) {
                this.restartAutoPlay();
            }
        },

        goToPrevious() {
            if (this.currentStep > 1) {
                this.goToStep(this.currentStep - 1);
            } else {
                // Loop to last step
                this.goToStep(this.totalSteps);
            }
        },

        goToNext() {
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            } else {
                // Loop to first step
                this.goToStep(1);
            }
        },

        updateProgress() {
            const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
            if (this.progressFill) {
                this.progressFill.style.width = progressPercentage + '%';
            }
        },

        updateButtons() {
            // Update button states if needed
            if (this.prevBtn) {
                this.prevBtn.classList.toggle('disabled', false);
            }
            if (this.nextBtn) {
                this.nextBtn.classList.toggle('disabled', false);
            }
        },

        resetSlideAnimations(slide) {
            // Re-trigger animations by removing and re-adding classes
            const animatedElements = slide.querySelectorAll('.slide-title, .slide-description p, .slide-features li, .slide-image');
            animatedElements.forEach(el => {
                const animation = window.getComputedStyle(el).animation;
                el.style.animation = 'none';
                void el.offsetWidth; // Trigger reflow
                el.style.animation = '';
            });
        },

        toggleAutoPlay() {
            if (this.isAutoPlaying) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        },

        startAutoPlay() {
            if (this.isAutoPlaying) return;

            this.isAutoPlaying = true;

            // Update button icon
            if (this.autoplayBtn) {
                const playIcon = this.autoplayBtn.querySelector('.play-icon');
                const pauseIcon = this.autoplayBtn.querySelector('.pause-icon');
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            }

            // Start progress animation
            if (this.autoplayFill) {
                this.autoplayFill.style.transition = `width ${this.autoPlayDuration}ms linear`;
                this.autoplayFill.style.width = '100%';
            }

            // Set interval for next slide
            this.autoPlayInterval = setInterval(() => {
                this.goToNext();

                // Reset and restart progress animation
                if (this.autoplayFill) {
                    this.autoplayFill.style.transition = 'none';
                    this.autoplayFill.style.width = '0%';

                    setTimeout(() => {
                        this.autoplayFill.style.transition = `width ${this.autoPlayDuration}ms linear`;
                        this.autoplayFill.style.width = '100%';
                    }, 50);
                }
            }, this.autoPlayDuration);
        },

        stopAutoPlay() {
            this.isAutoPlaying = false;

            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }

            // Update button icon
            if (this.autoplayBtn) {
                const playIcon = this.autoplayBtn.querySelector('.play-icon');
                const pauseIcon = this.autoplayBtn.querySelector('.pause-icon');
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }

            // Reset progress animation
            if (this.autoplayFill) {
                this.autoplayFill.style.transition = 'none';
                this.autoplayFill.style.width = '0%';
            }
        },

        restartAutoPlay() {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    };

    // Initialize process slider if on the page
    if (document.querySelector('.process-slider')) {
        processSlider.init();
    }

    // Remove hover pause functionality - now only click activated via the autoplay button

    // Search Functionality
    const searchSystem = {
        searchInput: null,
        resultsContainer: null,
        backdrop: null,
        searchIndex: [],
        fuse: null,
        selectedIndex: -1,

        init() {
            this.searchInput = document.getElementById('searchInput');
            this.resultsContainer = document.getElementById('searchResults');
            this.backdrop = document.getElementById('searchBackdrop');

            if (!this.searchInput || !this.resultsContainer) return;

            this.buildSearchIndex();
            this.setupFuse();
            this.bindEvents();
        },

        buildSearchIndex() {
            // Build index from page content
            this.searchIndex = [
                // Main sections
                {
                    id: 'about',
                    title: 'About Our Team',
                    content: 'Northfield Nightbots grassroots team founded January 2025 by Habib Seid. Rookie of the Year award Colorado Regionals. 40+ dedicated students.',
                    icon: '🤖',
                    keywords: ['team', 'about', 'story', 'rookie', 'award', 'habib']
                },
                {
                    id: 'first',
                    title: 'FIRST Robotics Competition',
                    content: 'FRC challenges high school students to design and build robots for competition. STEM education through hands-on experience.',
                    icon: '🏆',
                    keywords: ['first', 'frc', 'competition', 'robotics']
                },
                {
                    id: 'mentors',
                    title: 'Mentors & Coaches',
                    content: 'Anna Noble Biology Teacher, Yukta Thadi Engineering Teacher, Taed FIRST mentor with 40 years experience.',
                    icon: '👥',
                    keywords: ['mentors', 'coaches', 'anna', 'yukta', 'taed']
                },
                {
                    id: 'support',
                    title: 'Support Us - Sponsorship',
                    content: 'Sponsorship levels: Soar $5000+, Glide $1000+, Ascend $500+, Rise $250+. Tax-deductible donations.',
                    icon: '💰',
                    keywords: ['donate', 'sponsor', 'support', 'sponsorship']
                },
                {
                    id: 'process',
                    title: 'Our Process',
                    content: 'Design, Build, Program, Compete. From CAD modeling to competition day.',
                    icon: '⚙️',
                    keywords: ['process', 'design', 'build', 'program', 'cad']
                },
                {
                    id: 'resources',
                    title: 'Resources & Join',
                    content: 'Join our team, access resources, volunteer opportunities. Application forms and team information.',
                    icon: '📚',
                    keywords: ['resources', 'join', 'application', 'volunteer']
                },
                // Specific actions
                {
                    id: 'donate-action',
                    title: 'Make a Donation',
                    content: 'Support Northfield Robotics with a tax-deductible donation',
                    icon: '💳',
                    keywords: ['donate', 'givebutter', 'donation'],
                    action: () => window.open('https://givebutter.com/ofnP7x', '_blank')
                },
                {
                    id: 'sponsorship-packet',
                    title: 'View Sponsorship Packet',
                    content: 'Detailed information about sponsorship levels and benefits',
                    icon: '📋',
                    keywords: ['packet', 'sponsorship', 'sponsor'],
                    action: () => window.location.href = 'sponsorship-packet.html'
                },
                {
                    id: 'contact',
                    title: 'Contact Us',
                    content: 'Email: northfieldnightbots@gmail.com',
                    icon: '📧',
                    keywords: ['contact', 'email', 'reach'],
                    action: () => window.location.href = 'mailto:northfieldnightbots@gmail.com'
                },
                {
                    id: 'join-team',
                    title: 'Join Our Team',
                    content: 'Application form to join the Nightbots robotics team',
                    icon: '🚀',
                    keywords: ['join', 'application', 'apply', 'member'],
                    action: () => window.open('https://forms.gle/yYV9XBrpBBrwzDuo9', '_blank')
                }
            ];
        },

        setupFuse() {
            // Configure Fuse.js for fuzzy search
            const options = {
                keys: [
                    { name: 'title', weight: 0.5 },
                    { name: 'content', weight: 0.3 },
                    { name: 'keywords', weight: 0.2 }
                ],
                threshold: 0.3,
                includeScore: true,
                includeMatches: true,
                minMatchCharLength: 2
            };

            this.fuse = new Fuse(this.searchIndex, options);
        },

        bindEvents() {
            // Search input
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            // Keyboard navigation
            this.searchInput.addEventListener('keydown', (e) => {
                this.handleKeyboard(e);
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideResults();
                }
            });

            // Click backdrop to close
            if (this.backdrop) {
                this.backdrop.addEventListener('click', () => {
                    this.hideResults();
                });
            }

            // Focus shortcut (Ctrl/Cmd + K)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.searchInput.focus();
                    this.searchInput.select();
                }
            });
        },

        handleSearch(query) {
            if (query.length < 2) {
                this.hideResults();
                return;
            }

            // Check for shortcuts
            if (query.startsWith('@')) {
                this.showMentorResults(query.slice(1));
                return;
            }

            if (query.startsWith('#')) {
                this.showActionResults(query.slice(1));
                return;
            }

            // Regular search
            const results = this.fuse.search(query).slice(0, 8);
            this.displayResults(results, query);
        },

        showMentorResults(query) {
            const mentors = [
                { title: 'Anna Noble', content: 'Biology Teacher & Coach', icon: '👩‍🏫', id: 'mentors' },
                { title: 'Yukta Thadi', content: 'Engineering Teacher & Coach', icon: '👩‍🏫', id: 'mentors' },
                { title: 'Taed', content: 'FIRST Mentor - 40 years experience', icon: '👨‍🏫', id: 'mentors' }
            ];

            const filtered = query ? mentors.filter(m =>
                m.title.toLowerCase().includes(query.toLowerCase())
            ) : mentors;

            this.displayCustomResults(filtered, 'Mentors & Coaches');
        },

        showActionResults(query) {
            const actions = [
                { title: 'Donate Now', content: 'Make a donation via GiveButter', icon: '💰',
                  action: () => window.open('https://givebutter.com/ofnP7x', '_blank') },
                { title: 'View Sponsorship Packet', content: 'See sponsorship levels', icon: '📋',
                  action: () => window.location.href = 'sponsorship-packet.html' },
                { title: 'Join Team', content: 'Fill out application form', icon: '🚀',
                  action: () => window.open('https://forms.gle/yYV9XBrpBBrwzDuo9', '_blank') }
            ];

            const filtered = query ? actions.filter(a =>
                a.title.toLowerCase().includes(query.toLowerCase())
            ) : actions;

            this.displayCustomResults(filtered, 'Quick Actions');
        },

        displayResults(results, query) {
            if (results.length === 0) {
                this.showNoResults();
                return;
            }

            let html = '';
            results.forEach((result, index) => {
                const item = result.item;
                const highlighted = this.highlightMatch(item.content, query);

                html += `
                    <div class="search-result-item ${index === this.selectedIndex ? 'selected' : ''}"
                         data-index="${index}" data-id="${item.id}">
                        <div class="result-icon">${item.icon || '📄'}</div>
                        <div class="result-content">
                            <h4>${item.title}</h4>
                            <p>${highlighted}</p>
                        </div>
                        <div class="result-action">→</div>
                    </div>
                `;
            });

            html += `
                <div class="search-shortcuts">
                    <code>Enter</code> to select • <code>↑↓</code> to navigate • <code>Esc</code> to close
                </div>
            `;

            this.resultsContainer.innerHTML = html;
            this.showResults();
            this.bindResultClicks();
        },

        displayCustomResults(items, title) {
            if (items.length === 0) {
                this.showNoResults();
                return;
            }

            let html = `<div style="padding: 0.5rem 1rem; font-size: 0.8rem; color: #666; border-bottom: 1px solid #f0f0f0;">${title}</div>`;

            items.forEach((item, index) => {
                html += `
                    <div class="search-result-item ${index === this.selectedIndex ? 'selected' : ''}"
                         data-index="${index}" data-id="${item.id || ''}" data-action="${item.action ? 'true' : 'false'}">
                        <div class="result-icon">${item.icon}</div>
                        <div class="result-content">
                            <h4>${item.title}</h4>
                            <p>${item.content}</p>
                        </div>
                        <div class="result-action">→</div>
                    </div>
                `;
            });

            this.resultsContainer.innerHTML = html;
            this.showResults();
            this.bindResultClicks(items);
        },

        highlightMatch(text, query) {
            if (!text || !query) return text;

            const regex = new RegExp(`(${query})`, 'gi');
            return text.substring(0, 150).replace(regex, '<mark>$1</mark>');
        },

        bindResultClicks(customItems = null) {
            const items = this.resultsContainer.querySelectorAll('.search-result-item');
            items.forEach((item, index) => {
                item.addEventListener('click', () => {
                    if (customItems && customItems[index] && customItems[index].action) {
                        customItems[index].action();
                        this.hideResults();
                        this.searchInput.value = '';
                    } else {
                        const id = item.dataset.id;
                        if (id) this.navigateToResult(id);
                    }
                });
            });
        },

        handleKeyboard(e) {
            const items = this.resultsContainer.querySelectorAll('.search-result-item');

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                    this.updateSelection();
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                    this.updateSelection();
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                        items[this.selectedIndex].click();
                    }
                    break;

                case 'Escape':
                    this.hideResults();
                    this.searchInput.blur();
                    break;
            }
        },

        updateSelection() {
            const items = this.resultsContainer.querySelectorAll('.search-result-item');
            items.forEach((item, index) => {
                item.classList.toggle('selected', index === this.selectedIndex);
            });
        },

        navigateToResult(id) {
            this.hideResults();
            this.searchInput.value = '';
            this.searchInput.blur();

            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('search-highlight');
                setTimeout(() => {
                    element.classList.remove('search-highlight');
                }, 2000);
            }
        },

        showResults() {
            this.resultsContainer.classList.add('active');
            if (this.backdrop) this.backdrop.classList.add('active');
            this.selectedIndex = -1;
        },

        hideResults() {
            this.resultsContainer.classList.remove('active');
            if (this.backdrop) this.backdrop.classList.remove('active');
            this.selectedIndex = -1;
        },

        showNoResults() {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
                    <div>No results found</div>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                        Try <code>@</code> for mentors or <code>#</code> for actions
                    </div>
                </div>
            `;
            this.showResults();
        },

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Initialize search system
    searchSystem.init();

    // Cleanup function for long-running sessions
    function performCleanup() {
        // Clear old particles
        mouseParticles.forEach(p => {
            if (p && p.parentNode) p.remove();
        });
        mouseParticles = [];

        // Clear any orphaned trail particles
        document.querySelectorAll('.trail-particle').forEach(p => {
            if (p.parentNode) p.remove();
        });

        // Garbage collection hint
        if (window.gc) {
            window.gc();
        }
    }

    // Run cleanup every 5 minutes to prevent memory buildup
    setInterval(performCleanup, 5 * 60 * 1000);

    // Visibility change handler to pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when tab is hidden
            if (gridAnimationId) {
                cancelAnimationFrame(gridAnimationId);
                gridAnimationId = null;
            }
        } else {
            // Resume animations when tab is visible
            if (!performanceConfig.animationsDisabled && !gridAnimationId && canvas) {
                drawGrid();
            }
        }
    });

    // Lazy load YouTube iframes
    function loadYouTubeVideos() {
        const iframes = document.querySelectorAll('iframe[data-src]');
        const iframeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    const src = iframe.getAttribute('data-src');
                    if (src && !iframe.src) {
                        iframe.src = src;
                        iframe.removeAttribute('data-src');
                    }
                    iframeObserver.unobserve(iframe);
                }
            });
        }, {
            rootMargin: '100px' // Start loading 100px before visible
        });

        iframes.forEach(iframe => {
            iframeObserver.observe(iframe);
        });
    }

    loadYouTubeVideos();

    console.log('Northfield Nightbots website initialized with performance optimizations!');
});