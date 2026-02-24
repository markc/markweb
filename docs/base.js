/* Base JS - Mobile-First App Shell + DCS Carousel
 * Adapted from SPE base.js with carousel panel switching
 * Copyright (C) 2015-2026 Mark Constable <mc@netserva.org> (MIT License)
 */
if (typeof Base === 'undefined') {
const Base = {
    key: 'markweb-docs-state',

    // Get/set persistent state
    state(updates) {
        const s = JSON.parse(localStorage.getItem(this.key) || '{}');
        if (!updates) return s;
        Object.assign(s, updates);
        localStorage.setItem(this.key, JSON.stringify(s));
        return s;
    },

    // Theme: toggle dark/light
    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        html.classList.replace(isDark ? 'dark' : 'light', isDark ? 'light' : 'dark');
        this.state({ theme: isDark ? 'light' : 'dark' });
        this.updateIcon();
    },

    // Update theme icon (sun/moon text)
    updateIcon() {
        const btn = document.getElementById('theme-icon');
        if (!btn) return;
        const isDark = document.documentElement.classList.contains('dark');
        btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
        btn.setAttribute('aria-label', isDark ? 'Light mode' : 'Dark mode');
    },

    // Color scheme — 5 schemes: crimson (default, no class), stone/ocean/forest/sunset
    setScheme(scheme) {
        const html = document.documentElement;
        ['stone', 'ocean', 'forest', 'sunset'].forEach(s => html.classList.remove('scheme-' + s));
        if (scheme && scheme !== 'crimson') html.classList.add('scheme-' + scheme);
        this.state({ scheme: scheme || 'crimson' });
        document.querySelectorAll('[data-scheme]').forEach(el =>
            el.classList.toggle('active', el.dataset.scheme === (scheme || 'crimson'))
        );
    },

    // Toast notification
    toast(msg, type = 'success', ms = 3000) {
        document.querySelector('.toast')?.remove();
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = msg;
        t.setAttribute('role', 'alert');
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms);
    },

    // Sidebar: toggle open/close
    toggleSidebar(side) {
        const sb = document.querySelector(`.sidebar-${side}`);
        if (!sb) return;
        const opening = !sb.classList.contains('open');
        document.querySelectorAll('.sidebar.open:not(.pinned)').forEach(s => s.classList.remove('open'));
        if (opening) {
            sb.classList.add('open');
            document.body.classList.add('sidebar-open');
            this.state({ [side + 'Open']: true });
        } else {
            sb.classList.remove('open', 'pinned');
            document.body.classList.remove(side + '-pinned');
            if (!document.querySelector('.sidebar.open')) document.body.classList.remove('sidebar-open');
            this.state({ [side + 'Open']: false, [side + 'Pinned']: false });
        }
    },

    // Sidebar: pin/unpin (desktop)
    pinSidebar(side) {
        const sb = document.querySelector(`.sidebar-${side}`);
        if (!sb) return;
        const pinning = !sb.classList.contains('pinned');
        sb.classList.toggle('pinned', pinning);
        sb.classList.toggle('open', pinning);
        document.body.classList.toggle(side + '-pinned', pinning);
        if (!pinning && !document.querySelector('.sidebar.open')) document.body.classList.remove('sidebar-open');
        this.state({ [side + 'Pinned']: pinning, [side + 'Open']: pinning });
    },

    // Close all non-pinned sidebars
    closeSidebars() {
        document.querySelectorAll('.sidebar.open:not(.pinned)').forEach(s => s.classList.remove('open'));
        if (!document.querySelector('.sidebar.pinned.open')) document.body.classList.remove('sidebar-open');
        this.state({ leftOpen: false, rightOpen: false });
    },

    // === Carousel Methods ===
    setPanel(side, index) {
        const sb = document.querySelector(`.sidebar-${side}`);
        if (!sb) return;
        const track = sb.querySelector('.carousel-track');
        const panels = sb.querySelectorAll('.carousel-panel');
        if (!track || index < 0 || index >= panels.length) return;

        track.style.transform = `translateX(-${index * 100}%)`;
        this.updateDots(side, index);
        this.state({ [side + 'Panel']: index });

        // Update chevron disabled states
        const prevBtn = sb.querySelector('.carousel-chevron[data-dir="prev"]');
        const nextBtn = sb.querySelector('.carousel-chevron[data-dir="next"]');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === panels.length - 1;
    },

    updateDots(side, active) {
        const sb = document.querySelector(`.sidebar-${side}`);
        if (!sb) return;
        sb.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === active);
        });
    },

    initCarousel(side) {
        const s = this.state();
        const index = s[side + 'Panel'] || 0;
        this.setPanel(side, index);
    },

    // Restore state on page load
    restore() {
        const s = this.state();
        const desktop = window.innerWidth >= 1280;

        ['left', 'right'].forEach(side => {
            const sb = document.querySelector(`.sidebar-${side}`);
            if (!sb) return;
            const pinned = s[side + 'Pinned'] && desktop;
            const open = pinned || (s[side + 'Open'] && desktop);
            sb.classList.toggle('pinned', pinned);
            sb.classList.toggle('open', open);
            document.body.classList.toggle(side + '-pinned', pinned);
            if (open) document.body.classList.add('sidebar-open');
        });

        // Restore carousels
        this.initCarousel('left');
        this.initCarousel('right');
    },

    // Initialize
    init() {
        this.updateIcon();
        this.restore();

        // Scheme active states
        const s = this.state();
        document.querySelectorAll('[data-scheme]').forEach(el =>
            el.classList.toggle('active', el.dataset.scheme === (s.scheme || 'crimson'))
        );

        // Event delegation for clicks
        document.addEventListener('click', e => {
            const t = e.target;

            // Theme toggle
            if (t.closest('.theme-toggle')) { this.toggleTheme(); return; }

            // Scheme selector
            const scheme = t.closest('[data-scheme]');
            if (scheme) { e.preventDefault(); this.setScheme(scheme.dataset.scheme); return; }

            // Sidebar toggle
            const menuBtn = t.closest('.menu-toggle[data-sidebar]');
            if (menuBtn) { this.toggleSidebar(menuBtn.dataset.sidebar); return; }

            // Pin toggle
            const pinBtn = t.closest('.pin-toggle[data-sidebar]');
            if (pinBtn) { this.pinSidebar(pinBtn.dataset.sidebar); return; }

            // Carousel chevron
            const chevron = t.closest('.carousel-chevron');
            if (chevron) {
                const sidebar = chevron.closest('.sidebar');
                const side = sidebar.classList.contains('sidebar-left') ? 'left' : 'right';
                const current = this.state()[side + 'Panel'] || 0;
                const dir = chevron.dataset.dir === 'prev' ? -1 : 1;
                this.setPanel(side, current + dir);
                return;
            }

            // Carousel dot
            const dot = t.closest('.carousel-dot');
            if (dot) {
                const sidebar = dot.closest('.sidebar');
                const side = sidebar.classList.contains('sidebar-left') ? 'left' : 'right';
                const index = parseInt(dot.dataset.index, 10);
                this.setPanel(side, index);
                return;
            }

            // Overlay click
            if (t.closest('.overlay')) { this.closeSidebars(); return; }

            // Sidebar group toggle (collapsible)
            const groupTitle = t.closest('.sidebar-group-title');
            if (groupTitle) {
                const group = groupTitle.closest('.sidebar-group');
                group?.classList.toggle('collapsed');
                return;
            }

            // Close non-pinned sidebars on outside click
            if (!t.closest('.sidebar') && !t.closest('.menu-toggle')) {
                document.querySelectorAll('.sidebar.open:not(.pinned)').forEach(sb => sb.classList.remove('open'));
                if (!document.querySelector('.sidebar.pinned.open')) document.body.classList.remove('sidebar-open');
            }
        });

        // Escape key closes sidebars
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.closeSidebars();
        });

        // Scroll listener for body.scrolled class
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    document.body.classList.toggle('scrolled', window.scrollY > 10);
                    ticking = false;
                });
                ticking = true;
            }
        });

        // System theme change
        matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => {
            if (!this.state().theme) {
                document.documentElement.classList.replace(e.matches ? 'light' : 'dark', e.matches ? 'dark' : 'light');
                this.updateIcon();
            }
        });

        // Responsive: hide pinned sidebars when viewport shrinks
        matchMedia('(min-width: 1280px)').addEventListener('change', e => {
            if (!e.matches) {
                document.querySelectorAll('.sidebar.open').forEach(sb => {
                    sb.classList.remove('open', 'pinned');
                });
                document.body.classList.remove('left-pinned', 'right-pinned', 'sidebar-open');
            } else {
                this.restore();
            }
        });

        // Remove preload class
        requestAnimationFrame(() => document.documentElement.classList.remove('preload'));
    }
};

// Auto-init
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => Base.init())
    : Base.init();

window.Base = Base;
}
