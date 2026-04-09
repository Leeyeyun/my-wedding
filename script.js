/**
 * Modern Minimal Wedding Invitation - Script
 */

(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // ── Helpers ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return { year, month, day, dayName, date: d };
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h < 12 ? '오전' : '오후';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour12}시${m > 0 ? ' ' + m + '분' : ''}`;
  }

  function formatCeremonyTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h < 12 ? '오전' : h === 12 ? '낮' : '오후';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour12}시${m > 0 ? ' ' + m + '분' : ''}`;
  }

  function getWeddingDateTime(c) {
    return new Date(`${c.wedding.date}T${c.wedding.time}:00`);
  }

  function toTitleCase(text) {
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  function getDisplayName(nameEn) {
    const parts = nameEn.trim().split(/\s+/).filter(Boolean);
    const displayParts = parts.length > 1 ? parts.slice(1) : parts;
    return toTitleCase(displayParts.join(' '));
  }

  function getNameWithoutSurname(name) {
    return name.length > 1 ? name.slice(1) : name;
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Image Loading ──
  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  // ── Toast ──
  let toastTimer = null;
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(toastTimer);
    toast.classList.remove('show');
    requestAnimationFrame(() => {
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    });
  }

  // ── Copy to clipboard ──
  async function copyToClipboard(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg || '복사되었습니다');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg || '복사되었습니다');
    }
  }

  // ── Build Page ──
  async function init() {
    if (typeof CONFIG === 'undefined') return;

    window.scrollTo(0, 0);

    const c = CONFIG;
    const dateInfo = formatDate(c.wedding.date);
    const timeText = formatTime(c.wedding.time);

    // Build non-image sections immediately
    buildHero(c, dateInfo, timeText);
    initHeroMotion();
    buildInvitation(c, dateInfo, timeText);
    buildPoster(c, dateInfo);
    buildCalendarCountdown(c, dateInfo);
    buildLocation(c);
    buildAttendance(c);
    buildSnap(c);
    buildAccount(c);
    initRsvpModal(c);
    initScrollAnimations();
    initPosterAnimation();
    initModal();
    initIntroSequence();

    // Show loading state for image-dependent sections
    showLoadingState();

    // Load images asynchronously
    const galleryImages = await loadImagesFromFolder('gallery');

    // Render image-dependent sections
    buildGallery(galleryImages);

    // Remove loading state
    hideLoadingState();

    // Re-observe newly added elements for scroll animations
    reobserveAnimations();
  }

  // ── Loading State ──
  function showLoadingState() {
    const galleryShowcase = $('.gallery-showcase');
    if (galleryShowcase) galleryShowcase.classList.add('loading');
  }

  function hideLoadingState() {
    const galleryShowcase = $('.gallery-showcase');
    if (galleryShowcase) galleryShowcase.classList.remove('loading');
  }

  // ── Hero ──
  function buildHero(c, dateInfo, timeText) {
    const heroImg = $('.hero-image');
    if (heroImg) {
      heroImg.src = 'images/hero/1.jpg';
      heroImg.alt = `${c.groom.name} & ${c.bride.name}`;
    }

    const heroDate = $('.hero-date-stack');
    if (heroDate) {
      const dateParts = [
        String(dateInfo.year).slice(-2),
        String(dateInfo.month).padStart(2, '0'),
        String(dateInfo.day).padStart(2, '0')
      ];
      heroDate.innerHTML = [
        `<span class="hero-date-part hero-date-part-left">${dateParts[0]}</span>`,
        `<span class="hero-date-part hero-date-part-right">${dateParts[1]}</span>`,
        `<span class="hero-date-part hero-date-part-left">${dateParts[2]}</span>`
      ].join('');
      heroDate.setAttribute(
        'aria-label',
        `${dateInfo.year}년 ${dateInfo.month}월 ${dateInfo.day}일 ${dateInfo.dayName}요일 ${timeText}`
      );
    }

    const heroMetaDate = $('.hero-date');
    if (heroMetaDate) {
      heroMetaDate.textContent = `${dateInfo.year}. ${String(dateInfo.month).padStart(2, '0')}. ${String(dateInfo.day).padStart(2, '0')}. ${dateInfo.dayName}요일 ${timeText}`;
    }

    const heroVenue = $('.hero-venue');
    if (heroVenue) {
      heroVenue.textContent = c.wedding.hall
        ? `${c.wedding.venue} ${c.wedding.hall}`
        : c.wedding.venue;
    }
  }

  function initHeroMotion() {
    const hero = $('.hero');
    if (!hero) return;

    let ticking = false;

    function updateHeroProgress() {
      ticking = false;
      const rect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollable = Math.max(hero.offsetHeight - viewportHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      hero.style.setProperty('--hero-progress', progress.toFixed(3));
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeroProgress);
    }

    updateHeroProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  async function initIntroSequence() {
    const hero = $('.hero');
    const typingEl = $('.hero-kicker', hero);
    if (!hero || !typingEl) return;

    const text = typingEl.textContent || '';
    window.scrollTo(0, 0);
    hero.classList.add('hero-intro');
    typingEl.classList.add('is-typing');
    typingEl.textContent = '';
    document.documentElement.classList.add('intro-active');
    document.body.classList.add('intro-active');

    for (const char of text) {
      typingEl.textContent += char;
      await wait(char === ' ' ? 40 : 90);
    }

    typingEl.classList.remove('is-typing');
    await wait(1000);

    hero.classList.remove('hero-intro');
    document.documentElement.classList.remove('intro-active');
    document.body.classList.remove('intro-active');
    resetScrollAnimations();
    initScrollAnimations();
    initPosterAnimation();
    await wait(800);

    hero.classList.add('hero-dates-revealed');
    await wait(800);

    hero.classList.add('hero-info-revealed');
  }

  // ── Invitation ──
  function buildInvitation(c, dateInfo, timeText) {
    const msg = $('.invitation-message');
    if (msg) {
      msg.textContent = c.invitation.message;
    }

    const parents = $('.invitation-parents');
    if (parents) {
      function parentLine(side) {
        const fatherName = side.father;
        const motherName = side.mother;
        const fatherDec = side.fatherDeceased ? ' class="deceased"' : '';
        const motherDec = side.motherDeceased ? ' class="deceased"' : '';
        return `<span${fatherDec}>${fatherName}</span> <span class="dot"></span> <span${motherDec}>${motherName}</span><span style="color:#999;margin-left:4px">의 ${side === c.groom ? '아들' : '딸'}</span> <strong>${side.name}</strong>`;
      }
      parents.innerHTML = `
        <div class="parent-line">${parentLine(c.groom)}</div>
        <div class="parent-line">${parentLine(c.bride)}</div>
      `;
    }
  }

  function buildPoster(c, dateInfo) {
    const section = $('.poster-section');
    const image = $('.poster-image');
    const groomName = $('.poster-name-groom');
    const brideName = $('.poster-name-bride');
    const monthDay = $('.poster-date-month-day');
    const year = $('.poster-date-year');
    const dateBlock = $('.poster-date-block');
    if (!section || !image || !groomName || !brideName || !monthDay || !year || !dateBlock) return;

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];

    groomName.textContent = getDisplayName(c.groom.nameEn).toUpperCase();
    brideName.textContent = getDisplayName(c.bride.nameEn).toUpperCase();
    monthDay.innerHTML = buildPosterDateMarkup(`${monthNames[dateInfo.month - 1]} ${dateInfo.day}`);
    year.innerHTML = buildPosterDateMarkup(String(dateInfo.year));
    dateBlock.setAttribute('aria-label', `${monthNames[dateInfo.month - 1]} ${dateInfo.day}, ${dateInfo.year}`);

    image.alt = c.poster?.alt || '포스터 이미지';
    image.onload = () => {
      section.classList.remove('is-empty');
    };
    image.onerror = () => {
      section.classList.add('is-empty');
      image.removeAttribute('src');
    };
    image.src = 'images/poster/1.jpg';
  }

  function buildPosterDateMarkup(text) {
    let charIndex = 0;

    return [...text].map(char => {
      if (char === ' ') {
        return '<span class="poster-date-space" aria-hidden="true"></span>';
      }

      const markup = `<span class="poster-date-char-slot" style="--char-index:${charIndex}"><span class="poster-date-char">${char}</span></span>`;
      charIndex += 1;
      return markup;
    }).join('');
  }

  // ── Calendar & Countdown ──
  function buildCalendarCountdown(c, dateInfo) {
    const monthText = $('#calendar-section-month');
    if (monthText) {
      monthText.textContent = `${dateInfo.month}월`;
    }

    const summaryText = $('#calendar-section-summary');
    if (summaryText) {
      summaryText.textContent = `${dateInfo.year}년 ${dateInfo.month}월 ${dateInfo.day}일 ${dateInfo.dayName}요일 ${formatCeremonyTime(c.wedding.time)}`;
    }

    buildCalendarGrid(c, dateInfo);
    initCalendarCountdown(c);
  }

  function buildCalendarGrid(c, dateInfo) {
    const daysEl = $('#calendar-section-days');
    if (!daysEl) return;

    const year = dateInfo.year;
    const monthIndex = dateInfo.month - 1;
    const weddingDay = dateInfo.day;
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push('<span class="calendar-countdown__day is-empty"></span>');
    }

    for (let day = 1; day <= lastDate; day++) {
      const weekdayIndex = (firstDay + day - 1) % 7;
      const classes = ['calendar-countdown__day'];
      if (weekdayIndex === 0) classes.push('is-sunday');
      if (weekdayIndex === 6) classes.push('is-saturday');
      if (day === weddingDay) classes.push('is-wedding-day');
      cells.push(`<span class="${classes.join(' ')}">${day}</span>`);
    }

    daysEl.innerHTML = cells.join('');
  }

  function initCalendarCountdown(c) {
    const target = getWeddingDateTime(c);
    const dayMs = 1000 * 60 * 60 * 24;
    const groomName = getNameWithoutSurname(c.groom.name);
    const brideName = getNameWithoutSurname(c.bride.name);

    function update() {
      const now = new Date();
      const diff = target - now;
      const messageEl = $('#calendar-countdown-message');

      if (diff <= 0) {
        if (messageEl) {
          messageEl.innerHTML = `${groomName} <span class="calendar-countdown__message-heart">♥</span> ${brideName}의 결혼식이 <span class="calendar-countdown__message-highlight calendar-countdown__message-strong">오늘</span>입니다.`;
        }
        return;
      }

      const days = Math.floor(diff / dayMs);
      if (messageEl) {
        messageEl.innerHTML = `${groomName} <span class="calendar-countdown__message-heart">♥</span> ${brideName}의 결혼식이 <span class="calendar-countdown__message-highlight"><strong class="calendar-countdown__message-strong">${days}일</strong></span> 남았습니다.`;
      }
    }

    update();
    setInterval(update, 1000);
  }

  // ── Gallery (rendered after auto-detection) ──
  let galleryAllImages = [];
  let currentGalleryIndex = 0;
  let gallerySwiper = null;
  let modalSwiper = null;

  function buildGallery(images) {
    const section = $('.gallery');
    const track = $('.gallery-main-track');
    const thumbs = $('.gallery-thumbs');
    const counter = $('.gallery-main-counter');
    const prevBtn = $('.gallery-nav-prev');
    const nextBtn = $('.gallery-nav-next');
    const swiperEl = $('.gallery-main-swiper');
    if (!section || !track || !thumbs || !counter || !prevBtn || !nextBtn || !swiperEl) return;

    galleryAllImages = images;
    currentGalleryIndex = 0;

    if (images.length === 0) {
      section.style.display = 'none';
      return;
    }

    track.innerHTML = images.map((src, i) =>
      `<div class="swiper-slide">
        <button class="gallery-main-slide" type="button" data-index="${i}" aria-label="갤러리 사진 ${i + 1}">
          <img src="${src}" alt="Gallery photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
        </button>
      </div>`
    ).join('');

    const previewCount = Math.min(images.length, 15);
    thumbs.innerHTML = images.slice(0, previewCount).map((src, i) =>
      `<button class="gallery-thumb" type="button" data-index="${i}" aria-label="미리보기 사진 ${i + 1}">
        <img src="${src}" alt="Thumbnail ${i + 1}" loading="lazy">
      </button>`
    ).join('');

    const hasMultipleImages = images.length > 1;
    prevBtn.style.display = hasMultipleImages ? '' : 'none';
    nextBtn.style.display = hasMultipleImages ? '' : 'none';

    function updateGallery(index = currentGalleryIndex) {
      currentGalleryIndex = index;
      counter.textContent = `${currentGalleryIndex + 1} / ${images.length}`;

      $$('.gallery-thumb', thumbs).forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === currentGalleryIndex);
      });
    }

    if (gallerySwiper) {
      gallerySwiper.destroy(true, true);
    }

    gallerySwiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      speed: 800,
      allowTouchMove: hasMultipleImages,
      rewind: hasMultipleImages,
      navigation: {
        prevEl: prevBtn,
        nextEl: nextBtn
      },
      on: {
        init(swiper) {
          updateGallery(swiper.realIndex);
        },
        slideChange(swiper) {
          updateGallery(swiper.realIndex);
        }
      }
    });

    $$('.gallery-main-slide', swiperEl).forEach(slide => {
      slide.addEventListener('click', () => {
        openModal(images, Number(slide.dataset.index));
      });
    });

    $$('.gallery-thumb', thumbs).forEach(thumb => {
      thumb.addEventListener('click', () => {
        const nextIndex = Number(thumb.dataset.index);
        gallerySwiper?.slideTo(nextIndex);
      });
    });

    updateGallery();
  }

  // ── Photo Modal ──
  let currentModalImages = [];
  let currentModalIndex = 0;

  function initModal() {
    const overlay = $('.modal-overlay');
    if (!overlay) return;

    const closeBtn = $('.modal-close');

    closeBtn?.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    });
  }

  function openModal(images, index) {
    currentModalImages = images;
    currentModalIndex = index;

    const overlay = $('.modal-overlay');
    const swiperEl = $('.modal-swipe-area');
    const track = $('.modal-track');
    const prevBtn = $('.modal-prev');
    const nextBtn = $('.modal-next');
    if (!overlay || !swiperEl || !track || !prevBtn || !nextBtn) return;

    track.innerHTML = images.map((src, i) =>
      `<div class="swiper-slide modal-slide">
        <img class="modal-image" src="${src}" alt="Photo ${i + 1}" loading="${i === index ? 'eager' : 'lazy'}">
      </div>`
    ).join('');

    if (modalSwiper) {
      modalSwiper.destroy(true, true);
    }

    modalSwiper = new Swiper(swiperEl, {
      initialSlide: index,
      slidesPerView: 1,
      speed: 650,
      rewind: images.length > 1,
      allowTouchMove: images.length > 1,
      navigation: {
        prevEl: prevBtn,
        nextEl: nextBtn
      },
      pagination: {
        el: '.modal-counter',
        clickable: true,
        bulletClass: 'modal-dot',
        bulletActiveClass: 'is-active'
      },
      on: {
        init(swiper) {
          currentModalIndex = swiper.realIndex;
        },
        slideChange(swiper) {
          currentModalIndex = swiper.realIndex;
        }
      }
    });

    prevBtn.style.display = images.length > 1 ? '' : 'none';
    nextBtn.style.display = images.length > 1 ? '' : 'none';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = $('.modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateModal(dir) {
    if (!modalSwiper) return;
    if (dir > 0) modalSwiper.slideNext();
    else modalSwiper.slidePrev();
  }

  // ── Location ──
  function buildLocation(c) {
    const venueName = $('.location-venue-name');
    const venueHall = $('.location-venue-hall');
    const address = $('.location-address');
    const tel = $('.location-tel');
    const mapCard = $('.location-map-card');
    const mapFallbackImg = $('.location-map-fallback-image');
    const mapEmpty = $('.location-map-empty');
    const mapEl = $('#map');
    const subwayGuide = $('#location-guide-subway');
    const busGuide = $('#location-guide-bus');
    const parkingGuide = $('#location-guide-parking');

    if (venueName) venueName.textContent = c.wedding.venue;
    if (venueHall) venueHall.textContent = c.wedding.hall;
    if (address) address.textContent = c.wedding.address;
    if (tel && c.wedding.tel) {
      tel.innerHTML = `<a href="tel:${c.wedding.tel}">${c.wedding.tel}</a>`;
    }

    if (mapFallbackImg) {
      mapFallbackImg.src = 'images/location/1.jpg';
      mapFallbackImg.alt = `${c.wedding.venue} 약도`;
    }

    const copyBtn = $('#btn-copy-address');
    copyBtn?.addEventListener('click', () => {
      copyToClipboard(c.wedding.address, '주소가 복사되었습니다');
    });

    renderLocationGuide(subwayGuide, c.wedding.transport?.subway);
    renderLocationGuide(busGuide, c.wedding.transport?.bus);
    renderLocationGuide(parkingGuide, [{
      html: [
        c.information?.primary
          ? `<span class="location-guide-parking-primary">${c.information.primary}</span>`
          : '',
        c.information?.secondary
          ? `<span class="location-guide-parking-note">${c.information.secondary
              .split('\n')
              .map(line => `<span>${line}</span>`)
              .join('')}</span>`
          : ''
      ].filter(Boolean).join('<br>')
    }]);

    const lat = Number(c.wedding.coordinates?.lat);
    const lng = Number(c.wedding.coordinates?.lng);
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

    const naverLink = $('#link-naver-map');
    const tmapLink = $('#link-tmap');
    const kakaoNaviLink = $('#link-kakao-navi');

    if (naverLink && c.wedding.mapLinks?.naver) {
      naverLink.href = c.wedding.mapLinks.naver;
    }
    if (tmapLink && c.wedding.mapLinks?.tmap) {
      tmapLink.href = c.wedding.mapLinks.tmap;
    } else if (tmapLink) {
      tmapLink.removeAttribute('href');
      tmapLink.classList.add('is-disabled');
    }
    if (kakaoNaviLink) {
      kakaoNaviLink.removeAttribute('href');

      const kakaoKey = c.wedding.kakaoNavi?.javascriptKey;
      const canUseKakaoNavi =
        !!kakaoKey &&
        !!window.Kakao &&
        hasCoordinates;

      if (!canUseKakaoNavi) {
        kakaoNaviLink.classList.add('is-disabled');
      } else {
        kakaoNaviLink.classList.remove('is-disabled');

        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
        }

        kakaoNaviLink.addEventListener('click', (event) => {
          event.preventDefault();
          window.Kakao.Navi.start({
            name: c.wedding.navigationName || (
              c.wedding.hall
                ? `${c.wedding.venue} ${c.wedding.hall}`
                : c.wedding.venue
            ),
            x: lng,
            y: lat,
            coordType: 'wgs84',
          });
        });
      }
    }

    if (!mapCard || !mapEl) return;

    if (window.__naverMapAuthFailed || !window.naver?.maps || !hasCoordinates) {
      mapCard.classList.add('is-fallback');
      return;
    }

    const center = new naver.maps.LatLng(lat, lng);
    const map = new naver.maps.Map('map', {
      center,
      zoom: c.wedding.naverMap?.zoom || 16
    });

    new naver.maps.Marker({
      position: center,
      map,
      title: c.wedding.venue
    });

    mapCard.classList.add('has-live-map');
    if (mapEmpty) {
      mapEmpty.style.display = 'none';
    }
  }

  function renderLocationGuide(container, items) {
    if (!container) return;
    if (!items || items.length === 0) {
      container.parentElement.style.display = 'none';
      return;
    }

    container.innerHTML = items
      .map(item => {
        if (typeof item === 'string') {
          return `<div class="location-guide-item">${item}</div>`;
        }

        if (item && typeof item === 'object') {
          if (item.html) {
            return `<div class="location-guide-item">${item.html}</div>`;
          }

          const dotStyle = item.lineColor ? ` style="background:${item.lineColor}"` : '';
          return `
            <div class="location-guide-item location-guide-item-line">
              <span class="location-line-dot"${dotStyle}></span>
              <span>${item.text || ''}</span>
            </div>
          `;
        }

        return '';
      })
      .join('');
  }

  // ── Attendance / RSVP ──
  function buildAttendance(c) {
    const title = $('.attendance-title');
    const message = $('.attendance-message');
    const link = $('#attendance-link');

    if (title) {
      title.textContent = c.attendance?.title || '참석 여부 전달';
    }
    if (message) {
      message.textContent = c.attendance?.message || '';
    }
    if (!link) return;
    const buttonLabel = c.attendance?.buttonLabel || '참석 여부 전달';
    link.textContent = buttonLabel;
    link.classList.remove('is-placeholder');
  }

  function initRsvpModal(c) {
    const openBtn = $('#attendance-link');
    const overlay = $('#rsvp-sheet-overlay');
    const closeBtn = $('#rsvp-sheet-close');
    const form = $('#rsvp-form');
    const submitBtn = $('#rsvp-submit');
    const privacyLink = $('#rsvp-privacy-link');
    if (!openBtn || !overlay || !closeBtn || !form || !submitBtn || !privacyLink) return;

    const privacyNoticeUrl = c.attendance?.privacyNoticeUrl;
    if (privacyNoticeUrl) {
      privacyLink.href = privacyNoticeUrl;
      privacyLink.style.visibility = 'visible';
    } else {
      privacyLink.href = '#';
      privacyLink.style.visibility = 'hidden';
    }

    function openSheet() {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('sheet-open');
    }

    function closeSheet() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('sheet-open');
    }

    openBtn.addEventListener('click', openSheet);
    closeBtn.addEventListener('click', closeSheet);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeSheet();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('active')) {
        closeSheet();
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const endpoint = c.attendance?.sheetEndpoint;
      if (!endpoint) {
        showToast('구글 스프레드시트 연동 URL을 넣어주세요');
        return;
      }

      const formData = new FormData(form);
      const payload = {
        timestamp: new Date().toISOString(),
        side: formData.get('side') || '',
        attendance: formData.get('attendance') || '',
        meal: formData.get('meal') || '',
        name: (formData.get('name') || '').toString().trim(),
        companion: (formData.get('companion') || '').toString().trim(),
        note: (formData.get('note') || '').toString().trim(),
        consent: !!formData.get('consent')
      };

      submitBtn.disabled = true;
      submitBtn.textContent = '전달 중...';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        form.reset();
        showToast('참석 여부가 전달되었습니다');
        closeSheet();
      } catch (error) {
        console.error(error);
        showToast('전달에 실패했습니다. 다시 시도해 주세요');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '전달';
      }
    });
  }

  // ── Snap Upload ──
  function buildSnap(c) {
    const section = $('.snap-section');
    if (!section) return;

    const title = $('.snap-title', section);
    const description = $('.snap-description', section);
    const availability = $('.snap-availability', section);
    const uploadLink = $('#snap-upload-link');

    if (title) {
      title.textContent = c.snap?.title || 'CAPTURE OUR MOMENTS';
    }
    if (description) {
      description.textContent = c.snap?.description || '';
    }
    if (availability) {
      availability.textContent = c.snap?.availabilityText || '';
    }

    const snapImage = $('.snap-polaroid-image', section);
    if (snapImage) {
      snapImage.src = 'images/snap/1.jpg';
      snapImage.addEventListener('error', () => {
        snapImage.closest('.snap-polaroid')?.classList.add('is-empty');
        snapImage.removeAttribute('src');
      }, { once: true });
    }

    if (!uploadLink) return;

    const availableAt = c.snap?.uploadAvailableAt
      ? new Date(c.snap.uploadAvailableAt)
      : null;
    const isAvailable = !availableAt || Date.now() >= availableAt.getTime();
    const href = c.snap?.uploadLink;
    uploadLink.textContent = c.snap?.buttonLabel || '사진 업로드';

    if (href && isAvailable) {
      uploadLink.href = href;
      uploadLink.classList.remove('is-disabled');
      return;
    }

    uploadLink.href = '#';
    uploadLink.classList.add('is-disabled');
    uploadLink.addEventListener('click', (event) => {
      event.preventDefault();
      const message = isAvailable
        ? '사진 업로드 링크를 준비 중입니다'
        : '예식 당일부터 업로드 가능합니다';
      showToast(message);
    });
  }

  // ── Account ──
  function buildAccount(c) {
    buildAccountGroup('groom', c.accounts.groom, `신랑측 계좌번호`);
    buildAccountGroup('bride', c.accounts.bride, `신부측 계좌번호`);
  }

  function buildAccountGroup(side, accounts, label) {
    const group = $(`#account-${side}`);
    if (!group) return;

    const toggle = $('.account-group-toggle', group);
    const list = $('.account-list', group);

    if (toggle) {
      const labelEl = toggle.querySelector('.toggle-label');
      if (labelEl) labelEl.textContent = label;

      toggle.addEventListener('click', () => {
        group.classList.toggle('open');
      });
    }

    if (list) {
      list.innerHTML = accounts.map(acc =>
        `<div class="account-item">
          <div class="account-info">
            <div class="account-role">${acc.role}</div>
            <div class="account-detail">
              <span class="account-name">${acc.name}</span>
              ${acc.bank} ${acc.number}
            </div>
          </div>
          <button class="btn-copy-account" data-copy="${acc.bank} ${acc.number} ${acc.name}">복사</button>
        </div>`
      ).join('');

      $$('.btn-copy-account', list).forEach(btn => {
        btn.addEventListener('click', () => {
          copyToClipboard(btn.dataset.copy, '계좌번호가 복사되었습니다');
        });
      });
    }
  }

  // ── Scroll Animations ──
  let scrollObserver = null;
  let snapBgObserver = null;
  let snapCardObserver = null;
  let posterAnimationBound = false;
  let posterAnimationTicking = false;
  let lastPosterScrollY = 0;

  function initScrollAnimations() {
    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.fade-in:not(.poster-section):not(.snap-section)').forEach(el => scrollObserver.observe(el));

    if (snapBgObserver) {
      snapBgObserver.disconnect();
    }
    if (snapCardObserver) {
      snapCardObserver.disconnect();
    }

    snapBgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio >= 0.3) {
            entry.target.classList.add('visible');
            snapBgObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: [0.3] }
    );

    snapCardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio >= 0.5) {
            entry.target.classList.add('snap-card-visible');
            snapCardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: [0.5] }
    );

    const snapSection = $('.snap-section');
    if (snapSection) {
      if (!snapSection.classList.contains('visible')) {
        snapBgObserver.observe(snapSection);
      }
      if (!snapSection.classList.contains('snap-card-visible')) {
        snapCardObserver.observe(snapSection);
      }
    }
  }

  function updatePosterAnimation() {
    const poster = $('.poster-section');
    if (!poster) return;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rect = poster.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
    const visibleRatio = visibleHeight / Math.max(rect.height, 1);

    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const isScrollingUp = currentScrollY < lastPosterScrollY;

    if (visibleRatio >= 0.3) {
      poster.classList.add('poster-active');
    }

    if (isScrollingUp && visibleRatio <= 0.2 && rect.top > 0) {
      poster.classList.remove('poster-active');
    }

    lastPosterScrollY = currentScrollY;
  }

  function requestPosterAnimationUpdate() {
    if (posterAnimationTicking) return;
    posterAnimationTicking = true;
    window.requestAnimationFrame(() => {
      posterAnimationTicking = false;
      updatePosterAnimation();
    });
  }

  function initPosterAnimation() {
    lastPosterScrollY = window.scrollY || window.pageYOffset || 0;

    if (!posterAnimationBound) {
      window.addEventListener('scroll', requestPosterAnimationUpdate, { passive: true });
      window.addEventListener('resize', requestPosterAnimationUpdate);
      posterAnimationBound = true;
    }

    requestPosterAnimationUpdate();
  }

  function resetScrollAnimations() {
    $$('.fade-in').forEach(el => el.classList.remove('visible'));
    $('.poster-section')?.classList.remove('poster-active');
    $('.snap-section')?.classList.remove('snap-card-visible');
  }

  function reobserveAnimations() {
    if (!scrollObserver) return;
    $$('.fade-in:not(.visible)').forEach(el => scrollObserver.observe(el));
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
