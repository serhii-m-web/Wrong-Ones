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

  const unlockScroll = (): void => {
    document.body.classList.remove('is-scroll-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  };

  const setOpen = (isOpen: boolean): void => {
    burger.classList.toggle('is-open', isOpen);
    header.classList.toggle('is-menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  };

  burger.addEventListener('click', () => {
    setOpen(!burger.classList.contains('is-open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && burger.classList.contains('is-open')) {
      setOpen(false);
    }
  });
}

function init(): void {
  document.documentElement.classList.add('js');

  const year = String(new Date().getFullYear());
  document.querySelectorAll<HTMLElement>('[data-year]').forEach((el) => {
    el.textContent = year;
  });

  initHeaderBurger();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

