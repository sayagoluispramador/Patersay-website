/* ============================================
   MAIN JAVASCRIPT - PATERSAY WEBSITE
   ============================================ */

// main.js es compartido por index.html (raíz) y por pages/*.html (un nivel
// abajo). data-root en <body> indica cómo volver a la raíz desde la página
// actual ("." en el home, ".." en pages/*.html) para poder armar rutas a
// assets/ que funcionen sin importar la profundidad de la página.
const ROOT = document.body.getAttribute('data-root') || '.';

// ============================================
// REGIONS CONFIG
// Para agregar un nuevo país en el futuro basta con sumar un objeto aquí;
// el modal y el selector del header se generan dinámicamente a partir de esta lista.
//
// Las banderas se sirven como SVG propios (assets/flags/<code>.svg) en lugar de
// emoji de bandera: en Windows, la mayoría de navegadores no traen una fuente que
// resuelva los pares de "regional indicator" a la banderita a color, y en su lugar
// muestran el código de país en texto plano (p. ej. "AR"). Un SVG vendorizado se ve
// igual en cualquier sistema operativo.
// ============================================
const REGIONS = [
    { code: 'ar', name: 'Argentina', flag: `${ROOT}/assets/flags/ar.svg` },
    { code: 'co', name: 'Colombia', flag: `${ROOT}/assets/flags/co.svg` },
    { code: 'uy', name: 'Uruguay', flag: `${ROOT}/assets/flags/uy.svg` },
    { code: 've', name: 'Venezuela', flag: `${ROOT}/assets/flags/ve.svg` },
];

// ============================================
// ENVÍO DE EMAIL DEL FORMULARIO DE CONTACTO (Web3Forms)
// El sitio es estático (sin backend), así que no hay forma segura de llamar
// a un SMTP directamente desde el navegador. Web3Forms es una API pensada
// para exactamente este caso: el frontend hace un POST directo a su
// endpoint con un Access Key, y ellos reenvían el mensaje al email de
// destino configurado en su panel. El Access Key NO es un secreto: está
// diseñado para vivir en código de frontend, igual que una clave pública de
// Google Maps o Stripe (Web3Forms limita el abuso por dominio y por cuota,
// no por ocultar la clave).
//
// Para activar el envío real:
//   1. Entrar a https://web3forms.com
//   2. Ingresar el email de destino (sayagoluisp@gmail.com) — no requiere
//      contraseña ni crear una cuenta.
//   3. Web3Forms envía el Access Key a ese email al instante.
//   4. Pegar ese Access Key acá abajo, reemplazando el valor de ejemplo.
// Mientras el valor de ejemplo no se reemplace, el formulario mostrará el
// mensaje de error de envío (ver contactForm submit más abajo) en vez de
// simular un éxito falso.
const WEB3FORMS_ACCESS_KEY = 'dea88492-f8e9-4e31-892e-3839d13ee465';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// DOM Elements
const searchIcon = document.getElementById('searchIcon');
const searchModal = document.getElementById('searchModal');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const regionSelector = document.getElementById('regionSelector');
const regionModal = document.getElementById('regionModal');
const closeRegion = document.getElementById('closeRegion');
const regionFlag = document.getElementById('regionFlag');
const regionName = document.getElementById('regionName');
const regionOptionsContainer = document.getElementById('regionOptions');

const contactBtn = document.getElementById('contactBtn');
const contactModal = document.getElementById('contactModal');
const closeContact = document.getElementById('closeContact');
const contactForm = document.getElementById('contactForm');

const menuToggle = document.getElementById('menuToggle');
const navRight = document.getElementById('navRight');

const whatsappButton = document.getElementById('whatsappButton');
const whatsappModal = document.getElementById('whatsappModal');
const closeWhatsapp = document.getElementById('closeWhatsapp');
const whatsappForm = document.getElementById('whatsappForm');

// Botones de contacto que solo existen en algunas páginas: el home tiene
// heroContact/heroServices, las páginas de servicio tienen sus propios botones
// de hero con otros ids. Se usan de forma opcional (?.) más abajo para que
// main.js, compartido por todas las páginas, no falle si alguno no existe.
const heroContact = document.getElementById('heroContact');
const heroServices = document.getElementById('heroServices');
const ctaContact = document.getElementById('ctaContact');

// Modal de postulación de Careers: solo existe en pages/careers.html.
const careersModal = document.getElementById('careersModal');

const faqQuestions = document.querySelectorAll('.faq-question');

// Searchable content database
const searchDatabase = {
    'sap': { title: 'Consultoría SAP', section: 'services' },
    'erp': { title: 'ERP a Medida', section: 'services' },
    'rrhh': { title: 'Consultoría RRHH', section: 'services' },
    'web': { title: 'Desarrollo Web', section: 'services' },
    'desarrollo': { title: 'Desarrollo Web', section: 'services' },
    'aplicaciones': { title: 'Aplicaciones Móviles', section: 'services' },
    'apps': { title: 'Aplicaciones Móviles', section: 'services' },
    'móvil': { title: 'Aplicaciones Móviles', section: 'services' },
    'software': { title: 'Programación de Software', section: 'services' },
    'diseño': { title: 'Diseño de Páginas Web', section: 'services' },
    'consultoría': { title: 'Consultoría SAP', section: 'services' },
    'somos': { title: 'Quiénes Somos', section: 'about' },
    'acerca': { title: 'Quiénes Somos', section: 'about' },
    'metodología': { title: 'Nuestra Metodología', section: 'methodology' },
    'tecnologías': { title: 'Tecnologías', section: 'technologies' },
    'industrias': { title: 'Industrias', section: 'industries' },
    'preguntas': { title: 'Preguntas Frecuentes', section: 'faq' },
    'faq': { title: 'Preguntas Frecuentes', section: 'faq' },
};

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalFunc(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Search Modal
searchIcon.addEventListener('click', () => openModal(searchModal));
closeSearch.addEventListener('click', () => closeModalFunc(searchModal));

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    searchResults.innerHTML = '';

    if (query.length === 0) {
        return;
    }

    const results = [];
    for (const key in searchDatabase) {
        if (key.includes(query)) {
            results.push(searchDatabase[key]);
        }
    }

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = result.title;
        resultItem.addEventListener('click', () => {
            closeModalFunc(searchModal);
            searchInput.value = '';
            const section = document.getElementById(result.section);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                // La sección vive en el home (p. ej. estamos en una página de
                // servicio dentro de /pages/): navegar ahí con el ancla.
                window.location.href = `${ROOT}/index.html#${result.section}`;
            }
        });
        searchResults.appendChild(resultItem);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === searchModal) closeModalFunc(searchModal);
    if (e.target === regionModal) closeModalFunc(regionModal);
    if (e.target === contactModal) closeModalFunc(contactModal);
    if (e.target === whatsappModal) closeModalFunc(whatsappModal);
    if (e.target === careersModal) closeModalFunc(careersModal);
});

// Region Selector Modal
regionSelector.addEventListener('click', () => openModal(regionModal));
closeRegion.addEventListener('click', () => closeModalFunc(regionModal));

// Genera las opciones del modal a partir de REGIONS, para que agregar un país
// nuevo no requiera modificar esta lógica ni el HTML.
function renderRegionOptions() {
    regionOptionsContainer.innerHTML = '';
    REGIONS.forEach(region => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'region-option';
        button.dataset.region = region.code;
        button.innerHTML = `<img class="region-option-flag" src="${region.flag}" alt="" width="24" height="18"><span>${region.name}</span>`;
        button.addEventListener('click', () => selectRegion(region));
        regionOptionsContainer.appendChild(button);
    });
}

function renderSelectedFlag(region) {
    regionFlag.innerHTML = `<img src="${region.flag}" alt="${region.name}" width="20" height="15">`;
}

function selectRegion(region) {
    // Save to localStorage
    localStorage.setItem('selectedRegion', region.code);
    localStorage.setItem('selectedRegionName', region.name);

    // Update UI: la bandera reemplaza al globo y el nombre queda visible junto a ella
    renderSelectedFlag(region);
    regionName.textContent = region.name;

    // Close modal
    closeModalFunc(regionModal);

    trackEvent('region_selected', { region: region.code });
}

// Load saved region on page load (persiste entre recargas vía localStorage)
function loadSavedRegion() {
    const savedCode = localStorage.getItem('selectedRegion');
    const region = REGIONS.find(r => r.code === savedCode);
    if (region) {
        renderSelectedFlag(region);
        regionName.textContent = region.name;
    }
}

renderRegionOptions();

// Contact Modal
contactBtn.addEventListener('click', () => openModal(contactModal));
heroContact?.addEventListener('click', () => openModal(contactModal));
ctaContact?.addEventListener('click', () => openModal(contactModal));
closeContact.addEventListener('click', () => closeModalFunc(contactModal));

// Enlace "Contacto" del footer (Compañía): reutiliza el modal de contacto ya
// existente en vez de navegar a una página nueva, tal como pide el sitio.
document.getElementById('footerContact')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(contactModal);
});

// Contact Form Submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    if (submitBtn.disabled) return; // ya hay un envío en curso: evita doble envío

    const name = document.getElementById('name').value;
    const company = document.getElementById('company').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    // El mensaje es opcional; solo se valida el límite máximo (el atributo
    // maxlength ya lo impide desde la UI, esto es una validación de respaldo).
    if (message.length > 500) {
        showFormMessage('El mensaje no puede superar los 500 caracteres', 'error');
        return;
    }

    // Validate email
    if (!isValidEmail(email)) {
        showFormMessage('Por favor, ingresa un correo válido', 'error');
        return;
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    showFormMessage('', '');

    try {
        // Se envía como FormData (no JSON.stringify + Content-Type: application/json)
        // a propósito: un body JSON obliga al navegador a hacer un preflight
        // CORS (OPTIONS) antes del POST, y el preflight de Web3Forms no
        // devuelve los headers de CORS necesarios, así que el navegador
        // bloquea el envío antes de que llegue a salir. FormData es una
        // solicitud CORS "simple" (no dispara preflight) y es el formato que
        // Web3Forms documenta para integraciones vía fetch desde el navegador.
        //
        // Nota para testing automatizado: Web3Forms bloquea (sin CORS
        // headers) los requests cuyo User-Agent contiene "HeadlessChrome" u
        // otras señales de navegador automatizado, como protección
        // anti-abuso de su API gratuita. Si un test con Playwright/Puppeteer
        // en modo headless falla acá con un error de CORS, no es un bug del
        // sitio: hay que correr el navegador con un userAgent "normal" (sin
        // "Headless") para reproducir el comportamiento real de un usuario.
        const body = new FormData();
        body.append('access_key', WEB3FORMS_ACCESS_KEY);
        body.append('subject', 'Nueva consulta desde la página web PATERSAY');
        body.append('from_name', 'Sitio web PATERSAY');
        body.append('name', name);
        body.append('company', company);
        body.append('email', email);
        body.append('phone', phone);
        body.append('message', message || '(sin mensaje)');
        body.append('fecha_hora', new Date().toLocaleString('es-AR'));
        body.append('navegador', navigator.userAgent);
        // Honeypot: un bot que complete este campo oculto hace que Web3Forms
        // descarte el envío sin avisarle que fue detectado.
        body.append('botcheck', '');

        const response = await fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body,
        });
        const result = await response.json();

        console.log('[contactForm] Respuesta de Web3Forms:', { status: response.status, success: result.success });

        if (!response.ok || !result.success) {
            throw new Error(result.message || `Respuesta no exitosa (status ${response.status})`);
        }

        showFormMessage('Gracias por contactarnos. Hemos recibido tu consulta correctamente y nos pondremos en contacto contigo a la brevedad.', 'success');
        contactForm.reset();
        updateCharCount();

        setTimeout(() => {
            closeModalFunc(contactModal);
        }, 2500);
    } catch (error) {
        console.error('[contactForm] Error al enviar la consulta:', error);
        showFormMessage('No fue posible enviar tu consulta en este momento. Por favor, intenta nuevamente dentro de unos minutos.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Contador de caracteres del mensaje: permanece oculto y solo aparece cerca
// del límite máximo, para no mostrar información innecesaria en un campo
// que ahora es opcional.
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const MESSAGE_MAX_LENGTH = 500;
const CHAR_COUNT_THRESHOLD = 450;

messageInput.addEventListener('input', updateCharCount);

function updateCharCount() {
    const length = messageInput.value.length;

    if (length < CHAR_COUNT_THRESHOLD) {
        charCount.textContent = '';
        charCount.classList.remove('is-visible');
        return;
    }

    const atMax = length >= MESSAGE_MAX_LENGTH;
    charCount.textContent = atMax
        ? 'Alcanzaste el máximo de 500 caracteres.'
        : `${length}/${MESSAGE_MAX_LENGTH} caracteres`;
    charCount.classList.add('is-visible');
    charCount.classList.toggle('is-max', atMax);
}

// WhatsApp Button and Modal
whatsappButton.addEventListener('click', () => openModal(whatsappModal));
closeWhatsapp.addEventListener('click', () => closeModalFunc(whatsappModal));

// Botón "Contactar un especialista" del hero en las páginas de servicio
// (pages/*.html): reutiliza el modal de WhatsApp ya existente.
document.getElementById('heroWhatsapp')?.addEventListener('click', () => openModal(whatsappModal));

whatsappForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('wa-name').value;
    const company = document.getElementById('wa-company').value;
    const message = document.getElementById('wa-message').value;

    // Create WhatsApp message
    const fullMessage = `Hola, mi nombre es ${name}.\nEmpresa: ${company}\nMensaje: ${message}`;
    const whatsappNumber = '5491159072017'; // +54 9 11 5907-2017
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset form and close modal
    whatsappForm.reset();
    closeModalFunc(whatsappModal);
});

// Menu Toggle for Mobile
menuToggle.addEventListener('click', () => {
    navRight.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close menu when clicking on nav items
document.querySelectorAll('.nav-right button, .nav-right div').forEach(item => {
    item.addEventListener('click', () => {
        navRight.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Hero Section Buttons (solo existe en el home; en las páginas de servicio
// el hero tiene sus propios botones "Solicitar asesoría" / "Contactar un especialista")
heroServices?.addEventListener('click', () => {
    const servicesSection = document.getElementById('services');
    servicesSection?.scrollIntoView({ behavior: 'smooth' });
});

// FAQ Accordion
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        faqItem.classList.toggle('active');
    });
});

// ============================================
// CAREERS: modal de postulación compartido por las 20 tarjetas de área y por
// el botón "Postularme" del hero. Solo existe en pages/careers.html; el resto
// de las páginas no tiene estos elementos, por eso todo el bloque queda
// detrás del guard de careersModal.
// ============================================
if (careersModal) {
    const closeCareers = document.getElementById('closeCareers');
    const careersForm = document.getElementById('careersForm');
    const areaSelect = document.getElementById('c-area');
    const cvInput = document.getElementById('c-cv');
    const cvHint = document.getElementById('cvFileHint');
    const MAX_CV_SIZE_MB = 10;
    const ALLOWED_CV_TYPES = ['.pdf', '.doc', '.docx'];

    function openCareersModal(area) {
        if (areaSelect) {
            const match = area && Array.from(areaSelect.options).find(o => o.value === area);
            areaSelect.value = match ? area : '';
        }
        openModal(careersModal);
    }

    document.querySelectorAll('.area-apply-btn').forEach(btn => {
        btn.addEventListener('click', () => openCareersModal(btn.dataset.area));
    });
    document.getElementById('careersHeroApply')?.addEventListener('click', () => openCareersModal(''));

    closeCareers?.addEventListener('click', () => closeModalFunc(careersModal));

    function validateCvFile(file) {
        if (!file) return 'Adjuntá tu CV para continuar.';
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_CV_TYPES.includes(ext)) return 'Formato no permitido. Usá PDF, DOC o DOCX.';
        if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) return `El archivo supera los ${MAX_CV_SIZE_MB}MB permitidos.`;
        return null;
    }

    cvInput?.addEventListener('change', () => {
        const file = cvInput.files[0];
        const error = validateCvFile(file);
        if (error) {
            cvHint.textContent = error;
            cvInput.value = '';
            return;
        }
        cvHint.textContent = file.name;
    });

    function showCareersMessage(message, type) {
        const el = document.getElementById('careersFormMessage');
        el.textContent = message;
        el.className = `form-message ${type}`;
    }

    careersForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileError = validateCvFile(cvInput.files[0]);
        if (fileError) {
            showCareersMessage(fileError, 'error');
            return;
        }

        const formData = new FormData(careersForm);

        try {
            // Placeholder, igual que el formulario de contacto: en producción
            // esto debe enviarse a un backend propio (o a un proveedor de
            // email) que reciba el archivo de forma segura y notifique a
            // sayagoluisp@gmail.com sin exponer credenciales en el frontend.
            /*
            const response = await fetch('/api/careers/apply', {
                method: 'POST',
                body: formData,
            });
            */
            console.log('Postulación (demo):', Object.fromEntries(
                Array.from(formData.entries()).filter(([key]) => key !== 'cv')
            ));
            showCareersMessage('¡Postulación enviada! Te contactaremos pronto.', 'success');
            careersForm.reset();
            cvHint.textContent = 'Ningún archivo seleccionado';

            setTimeout(() => closeModalFunc(careersModal), 2000);
        } catch (error) {
            showCareersMessage('Error al enviar la postulación. Intentá nuevamente.', 'error');
            console.error('Error:', error);
        }
    });
}

// ============================================
// PÁGINAS LEGALES: índice generado automáticamente a partir de los <h2> del
// documento (Política de Privacidad / Términos de Servicio), y botón de
// descarga que dispara la impresión del navegador ("Guardar como PDF"),
// apoyada en la hoja de estilos @media print de css/styles.css.
// ============================================
const legalTocList = document.querySelector('.legal-toc ol');
if (legalTocList) {
    document.querySelectorAll('.legal-content h2').forEach((heading, idx) => {
        if (!heading.id) {
            const slug = heading.textContent
                .toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            heading.id = `sec-${idx + 1}-${slug}`;
        }
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        legalTocList.appendChild(li);
    });
}

document.getElementById('printLegalDoc')?.addEventListener('click', () => window.print());

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Analytics tracking (placeholder for Google Analytics)
function trackEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log(`Event tracked: ${eventName}`, eventData);
}

// ============================================
// SPLASH SCREEN
// Orquesta las 4 etapas (texto de bienvenida -> logo letra por letra -> espera -> salida).
// El script inline en el <head>/<body> ya ocultó la splash con display:none si el usuario
// prefiere movimiento reducido o si ya fue vista en esta sesión; en ese caso no hacemos nada.
// ============================================
function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (!splashScreen || splashScreen.style.display === 'none') {
        return;
    }

    const introText = document.getElementById('splashIntroText');
    const splashLogo = document.getElementById('splashLogo');
    const splashSubtitle = document.getElementById('splashSubtitle');
    const skipBtn = document.getElementById('splashSkip');
    const siteContent = document.getElementById('siteContent');

    const timers = [];
    const schedule = (fn, delay) => timers.push(setTimeout(fn, delay));
    let finished = false;

    function finishSplash() {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);

        splashScreen.classList.add('is-leaving');
        document.documentElement.classList.remove('splash-lock');

        if (siteContent) {
            siteContent.removeAttribute('aria-hidden');
            siteContent.removeAttribute('inert');
        }

        try {
            sessionStorage.setItem('patersaySplashShown', '1');
        } catch (e) { /* Modo privado o storage deshabilitado: no es crítico */ }

        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 700);
    }

    function skipSplash() {
        introText.classList.remove('animate-in', 'animate-out');
        splashLogo.classList.remove('animate-in');
        splashSubtitle.classList.remove('animate-in');
        finishSplash();
    }

    skipBtn.addEventListener('click', skipSplash);

    // Etapa 1: fade/blur in del texto de bienvenida
    schedule(() => skipBtn.classList.add('is-visible'), 350);
    introText.classList.add('animate-in');
    // Etapa 2: el texto se desvanece suavemente
    schedule(() => introText.classList.add('animate-out'), 1500);
    // Etapa 3: animación del logotipo letra por letra + subtítulo
    schedule(() => {
        introText.classList.remove('animate-in');
        splashLogo.classList.add('animate-in');
    }, 2100);
    schedule(() => splashSubtitle.classList.add('animate-in'), 2650);
    // Etapa 4: espera ~1s y transición final hacia el sitio
    schedule(finishSplash, 4100);

    document.addEventListener('keydown', function escToSkip(e) {
        if (e.key === 'Escape' && !finished) {
            skipSplash();
            document.removeEventListener('keydown', escToSkip);
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedRegion();
    initSplashScreen();
    console.log('PATERSAY website initialized');
});

// Prevent form submission on Enter in search
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModalFunc(searchModal);
        closeModalFunc(regionModal);
        closeModalFunc(contactModal);
        closeModalFunc(whatsappModal);
    }
});
