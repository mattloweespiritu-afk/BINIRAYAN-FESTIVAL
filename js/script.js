document.addEventListener('DOMContentLoaded', () => {
  // Shared startup: each function safely exits when its page does not need it.
  initMobileMenu();
  initNavbarScroll();
  initHeroAudio();
  initCountdown();
  initSmoothScroll();
  initActiveNav();
  initGalleryFilters();
  initGalleryLightbox();
  initContactForm();
});

function initMobileMenu() {
  // Navbar guide: controls the small-screen sidebar menu.
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  const openMenu = () => {
    sidebar.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
  };

  const closeMenu = () => {
    sidebar.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  };

  menuBtn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  sidebar.addEventListener('click', e => { if (e.target === sidebar) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

function initNavbarScroll() {
  // Navbar guide: gives the fixed navbar a lighter feel while scrolling.
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let scrollTimeout;

  const removeBackground = () => {
    navbar.classList.add('bg-transparent');
    navbar.classList.remove('bg-charcoal');
    navbar.style.opacity = '1';
  };

  const addBackground = () => {
    navbar.classList.remove('bg-transparent');
    navbar.classList.add('bg-charcoal');
    navbar.style.opacity = window.scrollY === 0 ? '0.75' : '1';
  };

  const setInitialState = () => {
    addBackground();
  };

  setInitialState();

  window.addEventListener('scroll', () => {
    removeBackground();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(addBackground, 150);
  });
}

function initHeroAudio() {
  // Home hero guide: syncs hidden music with the looping hero video.
  const hero = document.getElementById('hero-section');
  const video = document.getElementById('hero-video');
  const audio = document.getElementById('hero-audio');
  if (!hero || !video || !audio) return;

  let heroIsVisible = true;
  let previousVideoTime = 0;
  let firstStartDone = false;

  const resetAudio = () => {
    audio.currentTime = 0;
  };

  const resetHeroMedia = () => {
    video.currentTime = 0;
    resetAudio();
    previousVideoTime = 0;
  };

  const playHeroAudio = (reset = false) => {
    if (!heroIsVisible || video.paused) return;
    if (reset) resetAudio();
    audio.volume = 0.75;
    audio.play().catch(() => {});
  };

  const startHeroMedia = (reset = false) => {
    if (!heroIsVisible) return;
    if (reset) resetHeroMedia();

    video.play().catch(() => {});
    playHeroAudio(reset);
  };

  const startHeroMediaFromBeginning = () => {
    if (firstStartDone) return;
    firstStartDone = true;
    startHeroMedia(true);
  };

  const pauseHeroAudio = () => {
    audio.pause();
  };

  const syncWithHeroVisibility = entries => {
    const entry = entries[0];
    heroIsVisible = entry.isIntersecting && entry.intersectionRatio > 0.45;

    if (heroIsVisible) {
      startHeroMedia();
    } else {
      pauseHeroAudio();
    }
  };

  const syncAudioWithVideoLoop = () => {
    const videoLoopedBack = video.currentTime < previousVideoTime;
    previousVideoTime = video.currentTime;

    if (videoLoopedBack && heroIsVisible) {
      playHeroAudio(true);
    }
  };

  const observer = new IntersectionObserver(syncWithHeroVisibility, {
    threshold: [0, 0.45, 1],
  });

  observer.observe(hero);
  video.addEventListener('loadedmetadata', startHeroMediaFromBeginning);
  video.addEventListener('canplay', startHeroMediaFromBeginning);
  video.addEventListener('play', () => playHeroAudio(video.currentTime < 0.25));
  video.addEventListener('pause', pauseHeroAudio);
  video.addEventListener('ended', pauseHeroAudio);
  video.addEventListener('timeupdate', syncAudioWithVideoLoop);
  audio.addEventListener('ended', () => playHeroAudio(true));
  window.addEventListener('load', startHeroMediaFromBeginning);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      firstStartDone = false;
      startHeroMediaFromBeginning();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroIsVisible) startHeroMedia();
  });

  startHeroMediaFromBeginning();
}

function initCountdown() {
  // Body guide: updates the home-page festival countdown cards.
  if (!document.getElementById('countdown')) return;

  const days = document.getElementById('days');
  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');
  const message = document.getElementById('countdown-message');

  const getTargetTime = () => {
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(`${year}-12-01T00:00:00+08:00`);
    if (now > target) target = new Date(`${year + 1}-12-01T00:00:00+08:00`);
    return target.getTime();
  };

  const updateCountdown = () => {
    const gap = getTargetTime() - Date.now();
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    if (gap <= 0) {
      days.textContent = '00';
      hours.textContent = '00';
      minutes.textContent = '00';
      seconds.textContent = '00';
      if (message) message.textContent = 'Binirayan Festival has started!';
      return;
    }

    days.textContent = String(Math.floor(gap / day)).padStart(2, '0');
    hours.textContent = String(Math.floor((gap % day) / hour)).padStart(2, '0');
    minutes.textContent = String(Math.floor((gap % hour) / minute)).padStart(2, '0');
    seconds.textContent = String(Math.floor((gap % minute) / 1000)).padStart(2, '0');

    if (message) {
      const year = new Date(getTargetTime()).getFullYear();
      message.textContent = `Countdown to Binirayan Festival ${year}`;
    }
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initSmoothScroll() {
  // Body guide: supports links that jump to page sections, such as #festival-map.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initActiveNav() {
  // Navbar guide: highlights the current page link based on the file name.
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const page = href.split('/').pop().toLowerCase();
    if (page === currentPage) {
      link.classList.add('text-gold', 'active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initGalleryFilters() {
  // Gallery guide: shows or hides gallery cards based on their data-category.
  const buttons = [...document.querySelectorAll('.gallery-filter-btn')];
  const items = [...document.querySelectorAll('.gallery-item')];
  if (!buttons.length || !items.length) return;

  const setFilter = filter => {
    buttons.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.classList.toggle('bg-deepRed', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-white', !active);
      btn.classList.toggle('text-brown', !active);
      btn.classList.toggle('border', !active);
      btn.classList.toggle('border-gold/20', !active);
    });

    items.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !show);
    });
  };

  buttons.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
}

function initGalleryLightbox() {
  // Gallery guide: opens selected gallery items in a keyboard-friendly viewer.
  const items = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  const image = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');
  const counter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let activeItems = items;
  let currentIndex = 0;

  const render = () => {
    const item = activeItems[currentIndex];
    image.src = item.dataset.image;
    image.alt = item.dataset.title;
    title.textContent = item.dataset.title;
    caption.textContent = item.dataset.caption;
    counter.textContent = `${currentIndex + 1} / ${activeItems.length}`;
  };

  const open = item => {
    activeItems = items.filter(el => !el.classList.contains('hidden'));
    currentIndex = Math.max(activeItems.indexOf(item), 0);
    render();
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  };

  const close = () => {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  };

  const move = step => {
    currentIndex = (currentIndex + step + activeItems.length) % activeItems.length;
    render();
  };

  items.forEach(item => item.addEventListener('click', () => open(item)));
  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => move(-1));
  nextBtn?.addEventListener('click', () => move(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  });
}

function initContactForm() {
  // Contact guide: validates the demo inquiry form before showing success.
  if (!window.location.pathname.toLowerCase().includes('contact')) return;
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = form.querySelector('input[type="text"]');
    const email = form.querySelector('input[type="email"]');
    const message = form.querySelector('textarea');
    const emailValid = /^\S+@\S+\.\S+$/.test(email.value.trim());

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      alert('Please fill out your name, email, and message.');
      return;
    }

    if (!emailValid) {
      alert('Please enter a valid email address.');
      return;
    }

    alert('Message submitted successfully for this project.');
    form.reset();
  });
}
