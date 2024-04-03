defineCustomElement(
  'header-layout',
  () =>
    class HeaderLayout extends HTMLElement {
      connectedCallback() {
        this.header = document.getElementById('shopline-section-header');
        this.headerBounds = {};
        this.predictiveSearch = this.querySelector('predictive-search');
        this.headerLayout = this.querySelector('header');
        // always or on-scroll-up
        const headerStickyType = this.getAttribute('data-sticky-type');
        this.thresholdValue = 250;
        if (this.isSticky) {
          if (headerStickyType === 'always') {
            this.onScrollHandler = this.onScrollAlways.bind(this);
          } else if (headerStickyType === 'on-scroll-up') {
            this.onScrollHandler = this.onScrollUp.bind(this);
          }
          window.addEventListener('scroll', this.onScrollHandler, false);
        }
        this.addEventListener('click', this.setTopPosition);
        this.createObserver();
      }

      setTopPosition() {
        const headerContent = this.header.querySelector('header');
        let { top } = headerContent.getBoundingClientRect();
        top < 0 && this.scrollIntoView({ behavior: 'smooth' });
        top = top < 0 ? 0 : top;
        document.documentElement.style.setProperty('--header-top-position', `${parseFloat(top, 10)}px`);
      }

      get isAnnouncementBarSticky() {
        return Boolean(window.AnnouncementBarStickyTop && window.AnnouncementBarStickyTop.isAnnouncementBarSticky());
      }

      get isSticky() {
        return Boolean(this.headerLayout.className.indexOf('is-sticky') !== -1);
      }

      get isScrolling() {
        return Boolean(this.header.className.indexOf('shopline-section-header-scrolling') !== -1);
      }

      get AnnouncementBarHeight() {
        // Get it after it is needed to prevent the dom element from being different after the bulletin board configuration is refreshed
        const ele = document.querySelector('#shopline-section-announcement-bar');
        if (!ele) return 0;
        const rect = ele.getBoundingClientRect();
        const { height } = rect;
        return height;
      }

      disconnectedCallback() {
        this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
        window.removeEventListener('scroll', this.onScrollHandler);
        window.removeEventListener('click', this.setTopPosition);
      }

      createObserver() {
        const observer = new IntersectionObserver((entries, absr) => {
          this.headerBounds = entries[0].intersectionRect;
          absr.disconnect();
        });

        observer.observe(this.header);
      }

      onScrollUp() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (this.predictiveSearch && this.predictiveSearch.isOpen) return;
        // to botoom
        if (scrollTop > this.currentScrollTop && scrollTop > this.thresholdValue) {
          requestAnimationFrame(this.hide.bind(this));
          // to top
        } else if (scrollTop < this.currentScrollTop && scrollTop > this.thresholdValue) {
          requestAnimationFrame(this.reveal.bind(this));
        } else if (scrollTop <= this.thresholdValue) {
          requestAnimationFrame(this.reset.bind(this));
        }

        if (scrollTop > this.thresholdValue) {
          requestAnimationFrame(this.addScrollingClass.bind(this));
        } else {
          requestAnimationFrame(this.removeScrollingClass.bind(this));
        }

        this.currentScrollTop = scrollTop;
      }

      onScrollAlways() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

        if (scrollTop > this.thresholdValue) {
          this.isSticky && requestAnimationFrame(this.addStickyClass.bind(this));
          requestAnimationFrame(this.addScrollingClass.bind(this));
        } else {
          this.isSticky && requestAnimationFrame(this.removeSticyClass.bind(this));
          requestAnimationFrame(this.removeScrollingClass.bind(this));
        }
      }

      resetHeaderTop() {
        if (!this.isScrolling) {
          this.header.style.top = `0px`;
        }
      }

      addAnnouncementBarHeight() {
        if (this.isAnnouncementBarSticky) {
          this.header.style.top = `${this.AnnouncementBarHeight}px`;
        } else {
          this.header.style.top = `0px`;
        }
      }

      hide() {
        this.resetHeaderTop();
        this.header.classList.add('shopline-section-header-hidden', 'shopline-section-header-sticky');
      }

      reveal() {
        this.header.classList.add('shopline-section-header-sticky', 'animate');
        this.header.classList.remove('shopline-section-header-hidden');
        this.addAnnouncementBarHeight();
      }

      reset() {
        this.resetHeaderTop();
        this.header.classList.remove('shopline-section-header-hidden', 'shopline-section-header-sticky', 'animate');
      }

      addStickyClass() {
        this.header.classList.add('shopline-section-header-sticky--always');
        this.addAnnouncementBarHeight();
      }

      removeSticyClass() {
        this.resetHeaderTop();
        this.header.classList.remove('shopline-section-header-sticky--always');
      }

      addScrollingClass() {
        this.header.classList.add('shopline-section-header-scrolling');
        this.addAnnouncementBarHeight();
      }

      removeScrollingClass() {
        this.resetHeaderTop();
        this.header.classList.remove('shopline-section-header-scrolling');
      }
    },
);
