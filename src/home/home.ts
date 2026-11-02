import '../styles/app.css';
import '../styles/home.css';
import {
  education,
  experience,
  lenses,
  person,
  research,
  skills,
  ventures,
} from './content';
import { mountHeroSim } from './hero-sim';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const labHref = `${import.meta.env.BASE_URL}lab.html`;

function workItem(v: { role: string; org: string; years: string; blurb: string }): string {
  return `
    <article class="work-item">
      <p class="work-item__meta">${escapeHtml(v.years)}</p>
      <h3 class="work-item__title">${escapeHtml(v.org)}</h3>
      <p class="work-item__role">${escapeHtml(v.role)}</p>
      <p class="work-item__blurb">${escapeHtml(v.blurb)}</p>
    </article>`;
}

function render(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) return;

  document.title = `${person.name} · Physics, Philosophy & Tech`;

  root.innerHTML = `
    <div class="site">
      <a class="skip-link" href="#intro">Skip to content</a>

      <header class="nav" id="top">
        <a class="nav__brand" href="#top" translate="no">${escapeHtml(person.name)}</a>
        <nav class="nav__links" aria-label="Primary">
          <a href="#mind">Mind</a>
          <a href="#work">Work</a>
          <a href="#research">Research</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a class="nav__cta" href="${labHref}">Lab</a>
      </header>

      <section class="hero" id="intro" aria-label="Introduction">
        <div class="hero__copy">
          <p class="hero__eyebrow">Physics · Philosophy · Tech</p>
          <h1 class="hero__name" translate="no">${escapeHtml(person.name)}</h1>
          <p class="hero__role">${escapeHtml(person.title)}</p>
          <p class="hero__lede">${escapeHtml(person.tagline)}</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#mind">Read the story</a>
            <a class="btn" href="${labHref}">Full lab</a>
          </div>
          <p class="hero__status" id="hero-status" aria-live="polite">Preparing viewport…</p>
        </div>
        <div class="hero__stage-wrap">
          <div class="hero__stage" id="hero-stage" aria-label="Interactive Unitree G1"></div>
          <div class="hero__toolbar" id="hero-toolbar" hidden></div>
        </div>
      </section>

      <section class="band" id="mind">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">01</span> Mind</p>
            <h2 class="band__title">Physics for how things move. Philosophy for why it matters.</h2>
          </div>
          <div class="band__main">
            <p class="band__body band__body--lead">
              At Reed I’m studying the physical world and the ideas we use to make sense of it:
              measurement, models, minds, and meaning. That double lens is how I approach
              technology: curious about mechanisms, careful about consequences.
            </p>
            <ul class="chip-row" aria-label="Lenses">
              ${lenses.map((f) => `<li class="chip">${escapeHtml(f)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>

      <section class="band" id="work">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">02</span> Work</p>
            <h2 class="band__title">Things I have built and run</h2>
            <p class="band__body band__body--side">
              Sustainable products, flood-resilient housing, and creative operations.
            </p>
          </div>
          <div class="band__main">
            <div class="work-list">
              ${ventures.map(workItem).join('')}
              ${experience.map(workItem).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="band" id="research">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">03</span> Research</p>
            <h2 class="band__title">Papers and competitions</h2>
          </div>
          <div class="band__main">
            <ul class="pub-list">
              ${research
                .map(
                  (r) => `
                <li class="pub-item">
                  <span class="pub-item__year">${escapeHtml(r.year)}</span>
                  <div>
                    <p class="pub-item__title">${
                      r.href
                        ? `<a href="${escapeHtml(r.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)}</a>`
                        : escapeHtml(r.title)
                    }</p>
                    <p class="pub-item__venue">${escapeHtml(r.venue)}</p>
                  </div>
                </li>`,
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>

      <section class="band band--lab" id="lab-cta">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">04</span> Lab</p>
            <h2 class="band__title">A humanoid you can run in the browser</h2>
          </div>
          <div class="band__main">
            <p class="band__body band__body--lead">
              Want the full controls? Open the laboratory page for the complete Unitree G1
              session: MuJoCo physics, a pretrained ONNX policy, and walk, run, dance, reset.
            </p>
            <a class="btn btn--primary" href="${labHref}">Open laboratory</a>
          </div>
        </div>
      </section>

      <section class="band" id="about">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">05</span> About</p>
            <h2 class="band__title">Education and skills</h2>
          </div>
          <div class="band__main about__grid">
            <div class="about__copy">
              <ul class="edu-list">
                ${education
                  .map(
                    (e) => `
                  <li class="edu-item">
                    <span class="edu-item__degree">${escapeHtml(e.degree)}</span>
                    <span class="edu-item__place">${escapeHtml(e.place)}</span>
                    <span class="edu-item__years">${escapeHtml(e.years)}</span>
                  </li>`,
                  )
                  .join('')}
              </ul>
              <p class="band__kicker about__skills-kicker">Skills</p>
              <ul class="chip-row" aria-label="Skills">
                ${skills.map((s) => `<li class="chip">${escapeHtml(s)}</li>`).join('')}
              </ul>
            </div>
            <figure class="about__portrait">
              <img
                src="${import.meta.env.BASE_URL}vk.jpg"
                alt="${escapeHtml(person.fullName)}"
                width="781"
                height="1024"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      <section class="band band--contact" id="contact">
        <div class="band__inner band__inner--editorial">
          <div class="band__head">
            <p class="band__kicker"><span class="band__num">06</span> Contact</p>
            <h2 class="band__title">Say hello</h2>
          </div>
          <div class="band__main">
            <p class="band__body band__body--lead">
              Ideas, collaborations, or just talking physics, philosophy, and building.
            </p>
            <div class="contact-row">
              <a class="btn btn--primary" href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email)}</a>
              <a class="btn" href="tel:+18573993586">${escapeHtml(person.phone)}</a>
              <a class="btn" href="${escapeHtml(person.links.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a class="btn" href="${escapeHtml(person.links.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>

      <footer class="site-footer">
        <span translate="no">${escapeHtml(person.fullName)}</span>
        <span class="site-footer__muted">Physics · Philosophy · Tech</span>
      </footer>
    </div>
  `;

  const stage = root.querySelector<HTMLElement>('#hero-stage')!;
  const status = root.querySelector<HTMLElement>('#hero-status')!;
  const toolbar = root.querySelector<HTMLElement>('#hero-toolbar')!;
  const reduced = prefersReducedMotion();

  const hero = mountHeroSim({ stage, status, toolbar, reducedMotion: reduced });

  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            void hero.activate();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: [0.45] },
    );
    io.observe(stage);
  }

  const bands = root.querySelectorAll<HTMLElement>('.band');
  if (!reduced && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            reveal.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    for (const band of bands) reveal.observe(band);
  } else {
    for (const band of bands) band.classList.add('is-visible');
  }

  window.addEventListener('beforeunload', () => hero.dispose());
}

render();
