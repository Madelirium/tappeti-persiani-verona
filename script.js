const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");
const yearTarget = document.querySelector("#current-year");
const lazyMap = document.querySelector(".lazy-map");
const mapPlaceholder = document.querySelector("[data-map-placeholder]");
const cookieBanner = document.querySelector("[data-cookie-banner]");
const acceptCookieButtons = document.querySelectorAll("[data-accept-cookies]");
const rejectCookieButtons = document.querySelectorAll("[data-reject-cookies]");
const openCookieSettingsButtons = document.querySelectorAll("[data-open-cookie-settings]");
const COOKIE_CONSENT_KEY = "shahmansouri_cookie_consent_v1";
const isEnglishPage = document.documentElement.lang.toLowerCase().startsWith("en");

if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
}

function getCookieConsent() {
    try {
        return window.localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (error) {
        return null;
    }
}

function setCookieConsent(value) {
    try {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (error) {
        // ignore storage failures and keep UI usable
    }
}

function showCookieBanner() {
    if (cookieBanner) {
        cookieBanner.hidden = false;
    }
}

function hideCookieBanner() {
    if (cookieBanner) {
        cookieBanner.hidden = true;
    }
}

function loadMapIfNeeded() {
    if (!lazyMap) {
        return;
    }

    const src = lazyMap.dataset.src;

    if (src && !lazyMap.src) {
        lazyMap.src = src;
    }

    lazyMap.hidden = false;

    if (mapPlaceholder) {
        mapPlaceholder.hidden = true;
    }
}

function unloadMap() {
    if (lazyMap) {
        lazyMap.hidden = true;
        lazyMap.removeAttribute("src");
    }

    if (mapPlaceholder) {
        mapPlaceholder.hidden = false;
    }
}

function applyCookieConsent(state) {
    if (state === "accepted") {
        hideCookieBanner();
        loadMapIfNeeded();
        return;
    }

    unloadMap();

    if (state === "rejected") {
        hideCookieBanner();
        return;
    }

    showCookieBanner();
}

applyCookieConsent(getCookieConsent());

acceptCookieButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setCookieConsent("accepted");
        applyCookieConsent("accepted");
    });
});

rejectCookieButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setCookieConsent("rejected");
        applyCookieConsent("rejected");
    });
});

openCookieSettingsButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showCookieBanner();
    });
});

if (lazyMap && "IntersectionObserver" in window) {
    const mapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            if (getCookieConsent() === "accepted") {
                loadMapIfNeeded();
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "300px 0px"
    });

    mapObserver.observe(lazyMap);
}

if (navToggle && siteNav) {
    const closeNav = () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("nav-open", isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNav();
        }
    });
}

if (form && feedback) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const nome = String(formData.get("nome") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const messaggio = String(formData.get("messaggio") || "").trim();

        const subject = encodeURIComponent(
            isEnglishPage ? `Website enquiry - ${nome}` : `Richiesta dal sito - ${nome}`
        );
        const body = encodeURIComponent(
            isEnglishPage
                ? `Name: ${nome}\nEmail: ${email}\n\nMessage:\n${messaggio}`
                : `Nome: ${nome}\nEmail: ${email}\n\nMessaggio:\n${messaggio}`
        );

        feedback.textContent = isEnglishPage
            ? "Opening your email app with the pre-filled message."
            : "Sto aprendo il tuo client email con il messaggio precompilato.";
        window.location.href = `mailto:info@artigianatopersiano.it?subject=${subject}&body=${body}`;
    });
}
