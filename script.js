const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const year = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const siteConfig = window.siteConfig || {
  gaMeasurementId: 'G-XXXXXXXXXX',
  formspreeEndpoint: 'https://formspree.io/f/your-form-id',
  emailAddress: 'prashant.kant94@gmail.com'
};

function pushAnalyticsEvent(eventName, payload = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (contactForm) {
  const defaultEndpoint = contactForm.dataset.endpoint || siteConfig.formspreeEndpoint;
  const defaultEmail = contactForm.dataset.email || siteConfig.emailAddress;

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = contactForm.querySelector('.form-status');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    pushAnalyticsEvent('inquiry_submit', {
      route: payload.route || 'unknown',
      date: payload.date || 'unknown',
      source: 'website'
    });

    const endpoint = defaultEndpoint && defaultEndpoint.includes('formspree.io/f/') && !defaultEndpoint.includes('your-form-id')
      ? defaultEndpoint
      : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });

        if (status) {
          status.textContent = 'Inquiry received. Our team will contact you shortly.';
        }
      } else {
        const subject = encodeURIComponent(`Alloy Aviation inquiry from ${payload.name || 'Website Visitor'}`);
        const body = encodeURIComponent(
          `Name: ${payload.name || ''}\nEmail: ${payload.email || ''}\nRoute: ${payload.route || ''}\nDate: ${payload.date || ''}\n\nDetails:\n${payload.details || ''}`
        );

        if (status) {
          status.textContent = 'Your email client has opened. Please send the message to complete the inquiry.';
        }

        window.location.href = `mailto:${defaultEmail}?subject=${subject}&body=${body}`;
      }

      if (submitButton) {
        submitButton.textContent = 'Request sent';
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      if (status) {
        status.textContent = 'There was an issue sending your inquiry. Please email prashant.kant94@gmail.com directly.';
      }
      if (submitButton) {
        submitButton.textContent = 'Try again';
        submitButton.disabled = false;
      }
      return;
    }

    contactForm.reset();
  });
}
