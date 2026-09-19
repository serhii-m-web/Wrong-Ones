function initHeaderBurger(): void {
  const header = document.querySelector<HTMLElement>('#header');
  const burger = document.querySelector<HTMLButtonElement>('.site-header__burger');

  if (!header || !burger) return;

  let scrollY = 0;

  const lockScroll = (): void => {
    scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('is-scroll-locked');
  };

  const unlockScroll = (restorePosition = true): void => {
    document.body.classList.remove('is-scroll-locked');
    document.body.style.top = '';

    if (restorePosition) {
      window.scrollTo(0, scrollY);
    }
  };

  const setOpen = (isOpen: boolean, restorePosition = true): void => {
    burger.classList.toggle('is-open', isOpen);
    header.classList.toggle('is-menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll(restorePosition);
    }
  };

  burger.addEventListener('click', () => {
    setOpen(!burger.classList.contains('is-open'));
  });

  header.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      if (burger.classList.contains('is-open')) {
        // Don't restore the previous scroll — navigation / hash target handles position.
        setOpen(false, false);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && burger.classList.contains('is-open')) {
      setOpen(false);
    }
  });
}

function scrollToWaitlistForm(): void {
  const form = document.querySelector<HTMLFormElement>('#waitlist-form');

  if (!form) return;

  const header = document.querySelector<HTMLElement>('#header');
  const headerOffset = header ? header.getBoundingClientRect().height + 24 : 24;
  const top = form.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

  const input = form.querySelector<HTMLInputElement>('input[type="email"]');
  window.setTimeout(() => {
    input?.focus({ preventScroll: true });
  }, 400);
}

function isWaitlistHashLink(href: string): boolean {
  return href === '#waitlist-form' || href.endsWith('#waitlist-form');
}

function initWaitlistAnchors(): void {
  const scrollWhenReady = (): void => {
    scrollToWaitlistForm();
    // Recalculate after late image/layout shifts above the form.
    window.setTimeout(scrollToWaitlistForm, 350);
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href');

    if (!href || !isWaitlistHashLink(href)) return;

    link.addEventListener('click', (event) => {
      const form = document.querySelector('#waitlist-form');

      if (!form) {
        // On other pages let the browser navigate to index.html#waitlist-form.
        return;
      }

      event.preventDefault();
      history.pushState(null, '', '#waitlist-form');
      scrollWhenReady();
    });
  });

  if (window.location.hash === '#waitlist-form') {
    window.requestAnimationFrame(scrollWhenReady);
    window.addEventListener('load', scrollWhenReady, { once: true });
  }
}

function initComingForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-coming-form]');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    window.location.assign('./confirmation.html');
  });
}

function init(): void {
  document.documentElement.classList.add('js');

  const year = String(new Date().getFullYear());
  document.querySelectorAll<HTMLElement>('[data-year]').forEach((el) => {
    el.textContent = year;
  });

  initHeaderBurger();
  initWaitlistAnchors();
  initComingForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

