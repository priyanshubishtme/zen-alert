/**
 * animations.js — GSAP and ScrollTrigger animations.
 */

export function initLandingAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  const tl = gsap.timeline();
  
  if (document.querySelector('.loader')) {
    tl.fromTo('.loader', { opacity: 1 }, { opacity: 0, duration: 0.5, delay: 1, onComplete: () => {
      document.querySelector('.loader').classList.add('hidden');
    }});
  }
  
  if (document.querySelector('.landing-nav')) {
    tl.fromTo('.landing-nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  }
  
  if (document.querySelector('.hero-headline')) {
    tl.fromTo('.hero-headline', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4');
    tl.fromTo('.hero-description', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.6');
    tl.fromTo('.hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');
  }
  
  if (document.querySelector('.hero-trust-item')) {
    tl.fromTo('.hero-trust-item', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.4');
  }
  
  if (document.querySelector('.hero-preview')) {
    tl.fromTo('.hero-preview', { x: 40, opacity: 0, rotateY: 10 }, { x: 0, opacity: 1, rotateY: 0, duration: 1, ease: 'power3.out' }, '-=1');
  }

  // Scroll reveals
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => el.classList.add('visible'),
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true
        }
      }
    );
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.setTimeout(() => ScrollTrigger.refresh(), 500);

  // Pipeline steps staggered reveal
  if (document.querySelector('.pipeline')) {
    gsap.fromTo('.pipeline-step', 
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.pipeline',
          start: 'top 80%',
        }
      }
    );
  }

  // Magnetic buttons effect (optional)
  document.querySelectorAll('.hero-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
  });
}
