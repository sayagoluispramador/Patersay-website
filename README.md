# PATERSAY - Sitio Web Corporativo

Sitio web corporativo para PATERSAY, empresa de Servicios de Tecnología de la Información (IT Services).

## 📁 Estructura del Proyecto

```
patersay-website/
├── index.html            # Página principal
├── pages/                # Páginas de detalle, una por servicio (ver más abajo)
│   ├── sap-consulting.html
│   ├── web-design.html
│   ├── web-development.html
│   ├── mobile-apps.html
│   ├── software-development.html
│   ├── hr-consulting.html
│   ├── erp-custom.html
│   ├── business-systems.html
│   ├── tech/             # Páginas de detalle, una por tecnología (ver más abajo)
│   │   ├── sap.html, java.html, python.html, react.html, nodejs.html
│   │   ├── aws.html, azure.html, postgresql.html, mongodb.html
│   │   └── docker.html, kubernetes.html, cicd.html
│   ├── industries/       # Páginas de detalle, una por industria (ver más abajo)
│   │   ├── financiero.html, retail.html, manufactura.html, salud.html
│   │   └── educacion.html, telecomunicaciones.html, logistica.html, energia.html
│   ├── privacy-policy.html   # Política de Privacidad (ver más abajo)
│   ├── terms-of-service.html # Términos de Servicio (ver más abajo)
│   └── careers.html          # Trabaja con Nosotros / Careers (ver más abajo)
├── css/
│   └── styles.css       # Estilos responsivos (compartidos por index.html y pages/*.html)
├── js/
│   └── main.js          # JavaScript principal (compartido por todas las páginas)
├── assets/
│   ├── images/          # Imágenes del sitio
│   ├── icons/           # Iconos
│   ├── logos/           # Logos
│   ├── flags/           # Banderas SVG del selector de región
│   └── tech/            # Logotipos oficiales de tecnologías (sección "Tecnologías")
└── README.md            # Este archivo
```

## 🎨 Diseño: Minimal Executive 4.1

- **Color Principal**: Azul Corporativo (#0066cc)
- **Tipografía**: Inter (300, 400, 500, 600, 700)
- **Estilo**: Minimalista, profesional, ejecutivo
- **Acento**: Línea vertical azul + bordes en servicios

## 🆕 Actualización de Diseño (Julio 2026)

Resumen de las decisiones tomadas al reemplazar los iconos emoji, rediseñar el
selector de región y agregar la Splash Screen. No se agregó ninguna dependencia
de build/npm nueva: todo es HTML/CSS/JS nativo, igual que el resto del proyecto.

### Iconografía (Lucide)
- Se eligió **Lucide** (fork mantenido de Feather Icons, licencia ISC) por su
  estilo *outline*, trazo uniforme y look "corporativo" (es la librería que usan
  productos como Vercel o Linear).
- Los SVG se **vendorizan en línea dentro de `index.html`** (no como script ni
  CDN) en lugar de cargar la librería completa vía `<script>`: son ~12 iconos,
  cada uno pesa un par de líneas de `<path>`, y así no hay petición de red
  adicional, ni parpadeo (FOUC) mientras carga JS, ni dependencia runtime.
- Todos comparten la clase `.icon` (`css/styles.css`): mismo `stroke-width`
  (1.75px), `fill: none` y `stroke: currentColor`, de modo que heredan el color
  del texto/tema en vez de tener un color fijo por icono.
- Mapeo servicio → icono: SAP `database`, Diseño Web `layout-template`,
  Desarrollo Web `code-2`, Apps Móviles `smartphone`, Programación `terminal`,
  RRHH `users`, ERP `layout-grid`, Venta de Sistemas `shopping-cart`; más
  `search`, `mail`, `message-circle` (WhatsApp) y `globe` (región por defecto)
  en el header.

### Selector de región
- La lista de países vive en un único array `REGIONS` en `js/main.js` (código,
  nombre, ruta de bandera). El modal y el ícono del header se generan
  dinámicamente a partir de ese array, así que **sumar un país nuevo es agregar
  un objeto a `REGIONS`**, sin tocar el HTML ni la lógica de selección/persistencia.
- **Las banderas son SVG propios** (`assets/flags/ar.svg`, `co.svg`, `uy.svg`,
  `ve.svg`, vendorizados desde el proyecto MIT `flag-icons`) en vez de emoji de
  bandera (🇦🇷). Se probó el emoji primero y en Windows/Chromium se renderiza
  como el código de dos letras ("AR") en lugar de la banderita, porque el
  sistema no siempre trae una fuente que resuelva esos pares de "regional
  indicator" a un glifo a color. Un SVG propio se ve igual en cualquier
  sistema operativo y navegador.
- La selección persiste en `localStorage` (`selectedRegion`, `selectedRegionName`)
  y se restaura al recargar la página, reemplazando el ícono de globo por la
  bandera correspondiente y mostrando el nombre del país junto a ella (el
  nombre se oculta solo en viewports angostos, ≤360px, para no romper el header).

### Splash Screen
- 4 etapas en JS puro (`initSplashScreen` en `js/main.js`) orquestadas con
  `setTimeout` y clases CSS (`animate-in`/`animate-out`/`is-leaving`); toda la
  animación real (blur, fade, stagger de letras, zoom de salida) vive en
  `@keyframes` de `css/styles.css`, no en JS, para que el navegador pueda
  correrla en su hilo de composición (GPU) y mantener 60fps.
- Duración total ≈ 4.8s (dentro del rango pedido de 3–5s): texto de bienvenida
  (~2.2s in/hold/out) → logo "PATERSAY" letra por letra con `PATER` en azul
  corporativo `#0066cc` y `SAY` en `#1a1a1a` + subtítulo (~1.2s) → espera de
  ~1s → transición de salida (fade + zoom leve, 0.65s).
- Botón **"Saltar introducción"** visible desde el inicio; cancela los timers
  pendientes y dispara la misma transición de salida.
- **Un solo pintado por sesión**: un script inline y síncrono, ubicado justo
  después del markup de la splash (antes de que se pinte nada más), revisa
  `sessionStorage` y oculta la splash con `display:none` de inmediato si ya se
  mostró en esa pestaña — así no vuelve a aparecer en recargas ni en la
  navegación interna, solo en la primera visita de la sesión.
- **`prefers-reduced-motion`**: si el usuario lo activa, la splash se omite
  por completo (se entra directo al sitio) mediante ese mismo script inline y,
  como respaldo, una regla `@media (prefers-reduced-motion: reduce)` en CSS.
  La misma media query además reduce a casi cero la duración de *todas* las
  animaciones y transiciones del sitio (WhatsApp flotante, modales, hover),
  no solo la splash.
- **Sin CLS ni bloqueo**: la splash es un overlay `position: fixed` sobre un
  sitio que ya está completamente renderizado debajo, por lo que ocultarla no
  reacomoda ningún layout; y al no depender de ninguna librería externa, no
  añade peso de red ni retrasa el resto del sitio.
- Accesibilidad adicional: mientras la splash está visible, el resto del sitio
  (`#siteContent`) queda con `aria-hidden`/`inert` para que un lector de
  pantalla no navegue contenido tapado visualmente; `Escape` también permite
  saltarla.

> Nota sobre `ESTRUCTURA.md`: esa guía original sugiere guardar los iconos como
> archivos sueltos en `assets/icons/`. Se optó por vendorizarlos en línea en el
> HTML en su lugar (ver arriba); `assets/flags/` sí se creó como carpeta nueva
> para las 4 banderas SVG.

### Logotipos de "Tecnologías" e iconos de "Industrias"
- **Tecnologías**: cada logo es un SVG oficial vendorizado en `assets/tech/`
  (SAP, Python, React, Node.js, PostgreSQL, MongoDB, Docker y Kubernetes desde
  el proyecto MIT [simple-icons](https://simpleicons.org), con su color de
  marca oficial fijado en el propio archivo; Java, AWS y Azure desde
  [devicon](https://devicon.dev), que sí distribuye esos tres logos completos
  a color). "CI/CD" no es una marca, así que usa el icono `workflow` de Lucide
  en línea, igual que el resto de la iconografía del sitio. Se cargan con
  `loading="lazy"` porque están debajo del scroll inicial.
- **Industrias**: iconos Lucide en línea (outline, mismo `stroke-width` que el
  resto del sitio vía la clase `.icon`), heredando el azul corporativo por
  `color: #0066cc` en `.industry-item .icon`.
- Ambas cuadrículas usan `min-width: 0` en las tarjetas y en el texto para que
  nombres largos ("Telecomunicaciones") puedan ajustar su línea sin desbordar
  la tarjeta ni generar scroll horizontal; a 480px bajan a una sola columna
  por el mismo motivo (dos columnas no dejaban espacio para esas palabras).

### Botón flotante de contacto
Pasó de verde WhatsApp a un azul corporativo con efecto "glass" sutil
(`background` semitransparente + `backdrop-filter: blur()`, borde blanco de
baja opacidad, sombra suave). Mantiene posición, tamaño, la animación
`float` y el mismo comportamiento responsive; solo cambió su apariencia.

## 📄 Páginas de Servicio (`pages/*.html`)

Cada uno de los 8 servicios del home (`#services`) tiene su propia página de
detalle en `pages/`, con hero, descripción, "¿qué hacemos?", tarjetas de
servicios específicos, metodología de 8 pasos, beneficios, tecnologías,
sectores, casos de uso ilustrativos, FAQ y CTA final. Los botones "Más
información" del home son enlaces `<a>` reales a esas páginas (antes eran
botones sin destino) — es navegación estándar de sitio multi-página, sin
router ni SPA, consistente con el resto del proyecto (no hay framework de
frontend).

**Arquitectura reutilizada, no nueva:** cada página de servicio repite el
mismo header, modales (búsqueda, región, contacto, WhatsApp), footer y splash
screen que `index.html` (mismo `css/styles.css` y `js/main.js`, referenciados
con rutas relativas `../`). El contenido de cada sección reutiliza los
componentes visuales ya existentes:

| Sección de la página | Componente reutilizado |
|---|---|
| Hero | `.hero` / `.hero-mono-prism` (el mismo prisma azul del home) + un breadcrumb y badge de icono nuevos, chicos |
| Descripción general | `.about` / `.about-content` |
| "¿Qué hacemos?" | `.whatwedo-list` (nuevo, lista simple con acento de color, para no repetir el layout de tarjetas dos veces en la misma página) |
| Nuestros Servicios / Beneficios | `.services-grid` / `.service-card` (dos veces por página, con distinto set de iconos) |
| Metodología | `.methodology-grid` / `.methodology-step` (8 pasos en vez de los 4 del home) |
| Tecnologías / Sectores | `.tech-grid` / `.industries-grid` (mismos logos e iconos que el home, subconjunto relevante por servicio) |
| Casos de uso | `.case-grid` / `.case-card` + `.case-meta` (nuevo, filas Problema/Solución/Resultado) |
| FAQ | `.faq-grid` / `.faq-item` (el acordeón de `main.js` ya opera sobre cualquier `.faq-question` de la página, sin cambios) |
| CTA final | `.cta` |

Lo único agregado al sistema de diseño fueron piezas chicas que no existían:
`.service-breadcrumb`, `.hero-service-badge`, `.whatwedo-list/.whatwedo-item`,
`.case-meta` y dos utilidades `.section-alt-white`/`.section-alt-gray` para
mantener la alternancia de fondos blanco/gris cuando una misma sección
(`.services`, `.industries`, etc.) se repite varias veces en una página.

**`main.js` se hizo resiliente entre páginas:** algunos botones del home
(`heroContact`, `heroServices`, `ctaContact`) no existen —con esos IDs— en las
páginas de servicio, que tienen sus propios botones de hero. Los listeners
correspondientes ahora usan `?.addEventListener(...)` para no romper el resto
del script si el elemento no está presente en la página actual. También se
agregó `data-root` en `<body>` (`"."` en el home, `".."` en `pages/*.html`)
para que las rutas a `assets/` (como las banderas del selector de región)
funcionen sin importar la profundidad de la página, y para que el buscador
del header navegue de vuelta al home con el ancla correcta si la sección
buscada no existe en la página actual.

**Contenido:** redactado a partir de una investigación de cómo estructuran y
comunican sus servicios consultoras como SAP, Accenture o Deloitte (metodología
SAP Activate, terminología real de cada industria), sin copiar texto de
ninguna fuente — todo el copy es original de PATERSAY.

## 🧩 Páginas de Tecnología (`pages/tech/*.html`)

Cada una de las 12 tarjetas de la sección `#technologies` del home (SAP, Java,
Python, React, Node.js, AWS, Azure, PostgreSQL, MongoDB, Docker, Kubernetes,
CI/CD) es ahora un enlace `<a class="tech-item" href="pages/tech/{slug}.html">`
real, tanto en `index.html` como en las páginas de servicio que repiten esa
misma cuadrícula (`sap-consulting.html`, `web-design.html`,
`web-development.html`, `mobile-apps.html`, `software-development.html`,
`hr-consulting.html`, `erp-custom.html`, `business-systems.html`). Los logos
que no pertenecen a ninguna de las 12 tecnologías (Figma, Apple, Android,
Swift, Kotlin, Flutter) quedaron deliberadamente sin enlazar: no tienen página
propia.

Cada página de tecnología convierte esa tarjeta en un catálogo de
conocimiento + servicios con **11 secciones fijas**, en este orden: Hero
(logo, slogan, dos CTA) → ¿Qué es? → ¿Cómo funciona? → Servicios que ofrece
PATERSAY → Beneficios → Casos de Uso (ficticios, sin nombres de clientes
reales) → Industrias → Ventajas → Buenas Prácticas → Preguntas Frecuentes
(10 por página) → CTA final.

**Misma arquitectura que las páginas de servicio, mismos componentes
reutilizados** (`.hero`/`.hero-mono-prism`, `.about`, `.services-grid`/
`.service-card`, `.whatwedo-list`, `.case-grid`/`.case-card`,
`.industries-grid`, `.methodology-grid`/`.methodology-step` reutilizado como
lista numerada de "Ventajas", `.faq-grid`, `.cta`, `.section-alt-white`/
`.section-alt-gray` para la alternancia de fondos) — cero CSS nuevo, cero
dependencias nuevas. Al vivir un nivel más adentro (`pages/tech/`), usan
`data-root="../.."` y rutas relativas `../../` hacia `index.html`/`css`/`js`/
`assets`, y `../` para enlazar de vuelta a su página de servicio relacionada
(por ejemplo `sap.html` enlaza a `../sap-consulting.html`).

**Contenido:** investigado a partir de la documentación oficial de cada
tecnología (SAP, Oracle/OpenJDK, Python Software Foundation, React, Node.js,
AWS, Microsoft Azure, PostgreSQL, MongoDB, Docker, Kubernetes) y de cómo
consultoras del sector presentan sus servicios asociados a cada una; todo el
copy es original de PATERSAY, sin fragmentos copiados de ninguna fuente. Cada
página evita duplicar el contenido de su página de servicio relacionada
manteniendo las descripciones de servicio más breves/generales y sumando un
enlace cruzado explícito hacia el detalle completo.

**Generación:** las 10 páginas más nuevas (todas menos `sap.html` y
`java.html`, escritas a mano como referencia) se generaron con un script
Node.js de un solo uso (no forma parte del repo ni de la build) que arma el
HTML a partir de objetos de contenido estructurados por tecnología, para
garantizar estructura, clases y balance de tags idénticos entre las 12
páginas mientras el contenido de cada una se redactaba por separado.

## 🏭 Páginas de Industria (`pages/industries/*.html`)

Las 8 tarjetas de la sección `#industries` del home (Financiero, Retail,
Manufactura, Salud, Educación, Telecomunicaciones, Logística, Energía) son
enlaces `<a class="industry-item" href="pages/industries/{slug}.html">`
reales, igual que ocurrió con `#technologies`. La misma cuadrícula de
industrias se repite (con subconjuntos de 5) en las 8 páginas de servicio y
en las 12 páginas de tecnología, así que también se convirtió ahí; la única
tarjeta que quedó sin enlazar a propósito es "Sector Público" (aparece en
algunas páginas de tecnología pero no tiene una página de industria propia
entre las 8 originales del home).

Cada página de industria es un catálogo comercial y técnico de cómo PATERSAY
resuelve los problemas de ese sector, con **10 secciones fijas**: Hero →
¿Qué es esta industria? → Principales Desafíos → ¿Cómo ayuda PATERSAY?
(12 tarjetas, una por cada uno de los 12 servicios de PATERSAY) →
Tecnologías que utilizamos en esta industria (12 tarjetas, una por cada
tecnología del catálogo, con seis explicaciones cada una: para qué se usa,
qué problema resuelve, qué beneficio aporta, qué proceso mejora, cómo la
implementa PATERSAY y un ejemplo práctico) → Beneficios → Casos de Uso
(ficticios, sin nombres de clientes reales) → Nuestro Proceso de Trabajo (8
pasos) → Preguntas Frecuentes (10 por página) → CTA final.

**Mismos componentes reutilizados que las páginas de tecnología** — cero CSS
nuevo: el hero usa `.hero-service-badge` con un ícono Lucide de la propia
industria en vez de un logo (no hay una marca oficial que vendorizar para
"Financiero" o "Retail"); "Principales Desafíos" y "¿Cómo ayuda PATERSAY?"
reutilizan `.whatwedo-list` y `.services-grid`/`.service-card`
respectivamente (esta última con 12 tarjetas en vez de 6, el grid CSS
simplemente agrega más filas); la sección de tecnologías reutiliza
`.case-grid`/`.case-card` con `.case-meta` extendido a seis filas en vez de
las tres que usan los "Casos de Uso" más abajo en la misma página (mismo
patrón visual, más contenido estructurado adentro); "Nuestro Proceso de
Trabajo" reutiliza `.methodology-grid`/`.methodology-step` numerado.

**Cross-linking bidireccional tecnologías ↔ industrias:** dentro de cada una
de las 12 tarjetas de tecnología en la sección "Tecnologías que utilizamos",
el logo y el nombre son un enlace real a `pages/tech/{slug}.html`; y las
páginas de tecnología, a su vez, ya enlazaban a las páginas de industria
desde su propia cuadrícula de "Industrias" (heredado de la conversión
`industry-item` → `<a>`). Además, cada página de industria enlaza a su
página de servicio más relevante ("¿Cómo ayuda PATERSAY?" cierra con un
link a `../sap-consulting.html`, `../erp-custom.html`, etc. según el caso),
completando la malla de enlaces internos entre industrias, tecnologías y
servicios que pedía el requerimiento de SEO.

**Contenido:** investigado a partir de cómo consultoras del sector (SAP,
IBM Consulting, Accenture, Deloitte, entre otras) estructuran su propuesta
de valor por industria — problemas típicos del sector, procesos que se
automatizan, tendencias de transformación digital — sin copiar texto de
ninguna fuente; todo el copy es original de PATERSAY y evita comparaciones
absolutas o descalificantes entre tecnologías.

**Generación:** igual que las páginas de tecnología, se generaron con un
script Node.js de un solo uso a partir de objetos de contenido estructurados
por industria, reutilizando entre las 8 páginas los bloques que son
genuinamente genéricos (los 12 títulos e iconos de "¿Cómo ayuda PATERSAY?",
los 10 títulos e iconos posibles de "Beneficios", y la metodología de 8
pasos de "Nuestro Proceso de Trabajo", que es la misma consultora
trabajando, no un proceso que cambie por sector) y variando el resto
(descripciones, desafíos, las 12 explicaciones de tecnología, casos de uso
y FAQ) por industria.

## 🏢 Sección "Compañía" (footer)

Los 4 enlaces del bloque **Compañía** del footer (repetido, igual que el resto
del footer, en las 32 páginas del sitio) ahora tienen funcionalidad real:

| Enlace | Comportamiento |
|---|---|
| Política de Privacidad | Navega a `pages/privacy-policy.html` |
| Términos de Servicio | Navega a `pages/terms-of-service.html` |
| Contacto | **No navega** — abre el modal de contacto ya existente |
| Careers | Navega a `pages/careers.html` |

### Política de Privacidad y Términos de Servicio

Dos páginas nuevas (`pages/privacy-policy.html`, `pages/terms-of-service.html`)
con contenido legal original y completo (19 y 20 secciones respectivamente,
cubriendo todos los puntos pedidos: alcance, información recopilada, cookies,
base legal, terceros, transferencias internacionales, derechos del usuario,
retención, menores, uso de imágenes/logotipos/marcas de terceros, etc.),
vigentes desde el 16 de julio de 2026 (Versión 1.0). La sección 19 de la
Política de Privacidad ("Uso de imágenes, logotipos y marcas de terceros")
se agregó después de la sección de vigencia, a pedido explícito, aclarando
que los logotipos de la sección "Tecnologías" pertenecen a sus respectivos
titulares y que su presencia no implica relación comercial, patrocinio ni
aprobación por parte de esas empresas.

> Ambos documentos incluían originalmente un aviso (`.legal-disclaimer`)
> aclarando que habían sido redactados como referencia inicial y requerían
> revisión de un asesor legal antes de adoptarse como política oficial. Ese
> aviso, y la aclaración `("nosotros", "nuestro" o "la empresa")` de la
> introducción de la Política de Privacidad, se quitaron a pedido explícito
> más adelante; la clase CSS `.legal-disclaimer` quedó sin uso en el HTML
> pero no se eliminó de `css/styles.css` para no exceder el alcance de ese
> pedido puntual.

**Índice automático:** un bloque `<nav class="legal-toc">` con un `<ol>` vacío
se completa en tiempo de carga por `main.js`, que recorre los `<h2>` de
`.legal-content`, les asigna un `id` (slug generado a partir del texto,
quitando tildes) y agrega un link al índice — si mañana se agrega o quita una
sección del documento, el índice se regenera solo, sin tocar el HTML del
índice.

**Descarga en PDF:** el botón "Descargar (PDF)" del hero llama a
`window.print()` en vez de generar el PDF con una librería — el proyecto no
tiene backend ni build step, así que no hay dónde renderizar un PDF del lado
del servidor, y sumar una librería de PDF client-side (jsPDF y similares)
habría sido la primera dependencia externa nueva del sitio. En su lugar, se
agregó una hoja `@media print` a `css/styles.css` que oculta header, footer,
modales y botones, muestra un encabezado y pie de página con el logo/nombre
del documento y su versión (clases `.print-only`, ocultas en pantalla), y
define numeración de página vía `@page { @bottom-center { content: counter
(page) ... } }` — esta regla de CSS Paged Media tiene buen soporte en
navegadores basados en Chromium (los más usados para "Guardar como PDF") y
se degrada de forma segura donde no se soporta: el usuario simplemente no ve
el número de página, pero el resto del documento imprime bien igual.

### Contacto

El enlace del footer solo tiene un `id="footerContact"` nuevo; el manejador en
`main.js` hace `e.preventDefault()` y llama al mismo `openModal(contactModal)`
que ya usan el botón del header y los botones de hero de cada página. No se
creó ningún modal ni formulario nuevo.

### Careers (`pages/careers.html`)

Página nueva con hero, sección de cultura (`.about` + `.whatwedo-list` de
valores), planes de carrera (`.whatwedo-list`), una cuadrícula de **20
tarjetas** de área de oportunidad (`.services-grid`/`.service-card`,
reutilizadas de las páginas de servicio) y un modal de postulación compartido
por las 20 tarjetas.

Cada tarjeta de área reutiliza el logo real de la tecnología cuando existe
(`assets/tech/*.svg`, las mismas 11 marcas ya vendorizadas para las páginas de
tecnología) o un ícono Lucide verificado para las 8 áreas sin marca propia
(UX/UI, QA, Business Analysis, Project Management, Consultoría Funcional,
Recursos Humanos, ERP, Inteligencia Artificial), más un bloque de metadata
(nivel profesional y modalidad) con el mismo patrón visual `.case-meta` ya
usado en "Casos de Uso".

**Modal de postulación único, no 20 modales:** las 20 tarjetas y el botón
"Postularme" del hero llaman a la misma función `openCareersModal(area)` en
`main.js`. Cada botón "Postúlate aquí" tiene `data-area="{Tecnología}"`; al
hacer clic, la función busca esa opción en el `<select>` de tecnología del
formulario y la preselecciona (o la deja vacía si se abrió desde el hero,
sin arrastrar la selección de una tarjeta anterior — bug que apareció y se
corrigió durante la verificación con Playwright).

**Carga de CV:** el input `type="file"` acepta `.pdf,.doc,.docx` y se valida
dos veces en el cliente —al elegir el archivo y de nuevo al enviar el
formulario— contra una whitelist de extensiones y un tamaño máximo de 10MB
(`MAX_CV_SIZE_MB` en `main.js`, fácil de ajustar). Un archivo inválido nunca
llega a "enviarse": se limpia el input y se muestra el motivo del rechazo.

**Envío de la postulación (honesto sobre lo que hoy existe):** igual que el
formulario de contacto original del sitio (ver nota de "Formularios" más
abajo), el envío de la postulación es una simulación: arma un `FormData`,
lo loguea en consola y muestra el mensaje de éxito, con un bloque comentado
mostrando exactamente el `fetch('/api/careers/apply', { method: 'POST', body:
formData })` que reemplazaría esa simulación el día que exista un backend.
El proyecto no tiene backend ni credenciales de email en ningún lado, así que
no se fabricó un envío de correo real ni se expuso ninguna credencial en el
frontend — construir ese backend (recepción segura del archivo, envío a
sayagoluisp@gmail.com, y opcionalmente guardado en base de datos o un ATS)
queda documentado aquí como el siguiente paso, no simulado como si ya existiera.

## ✨ Características Implementadas

### Header
- ✅ Sticky navigation
- ✅ Logo clickeable (vuelve al inicio)
- ✅ Búsqueda inteligente interna
- ✅ Selector de región (Argentina, Colombia, Uruguay, Venezuela)
- ✅ Botón de contacto
- ✅ Menú responsive para mobile

### Funcionalidades
- ✅ **Búsqueda**: Navega automáticamente a secciones
- ✅ **Región**: Guarda selección en localStorage
- ✅ **Contacto**: Modal con formulario validado
- ✅ **WhatsApp**: Botón flotante + formulario
- ✅ **FAQ**: Accordion expandible
- ✅ **Responsive**: Desktop, tablet, mobile

### Secciones
1. Hero - Impacto visual y CTA
2. Servicios - 8 pilares de negocio
3. Quiénes Somos
4. Metodología
5. Tecnologías
6. Industrias
7. FAQ
8. CTA Final
9. Footer

> Las secciones "Casos de Éxito", "Testimonios" y "Blog" del home se
> eliminaron (junto con sus enlaces de footer y de búsqueda) porque
> contenían contenido de ejemplo (empresas, personas y notas de blog
> ficticias) que no correspondía publicar como si fuera real. El CSS
> compartido (`.case-studies`, `.case-grid`, `.case-card`) se conservó
> porque las secciones "Casos de Uso" de cada página de servicio,
> tecnología e industria lo siguen usando activamente.

## 🚀 Cómo Usar

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code recomendado)

### Instalación Local

1. **Clonar/Descargar** la carpeta `patersay-website`

2. **Abrir con VS Code**:
   ```bash
   code patersay-website
   ```

3. **Usar Live Server** (extensión recomendada para VS Code)
   - Click derecho en `index.html`
   - Seleccionar "Open with Live Server"
   - Se abrirá en `http://localhost:5500`

4. **O abrir directamente en navegador**:
   - Abrir `index.html` en tu navegador

## 📱 Responsive Design

La página es completamente responsive:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 480px - 767px

## 🔧 Configuración Recomendada para VS Code

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 🎯 Próximos Pasos de Desarrollo

### Backend (Próxima Fase)
- [ ] API de contacto (Node.js/Express)
- [ ] Envío de emails (SMTP/SendGrid/Resend)
- [ ] Sistema de regiones
- [ ] Base de datos

### Frontend (Próxima Fase)
- [ ] Componentes reusables
- [ ] Animaciones avanzadas (Framer Motion)
- [ ] Google Analytics
- [ ] Open Graph optimización
- [ ] Schema.org markup completo

### SEO & Performance
- [ ] Minificación de CSS/JS
- [ ] Lazy loading de imágenes
- [ ] Web fonts optimization
- [ ] Core Web Vitals
- [ ] Sitemap.xml
- [ ] robots.txt

## 📧 Formularios

### Contacto
- Validación de campos
- Mensaje opcional, hasta 500 caracteres; contador discreto que solo aparece a partir de los 450 (`CHAR_COUNT_THRESHOLD` en `js/main.js`)
- Validación de email
- Envío real a: sayagoluisp@gmail.com, vía [Web3Forms](https://web3forms.com)
- Indicador de carga discreto en el botón "Enviar" (texto "Enviando..." + opacidad reducida) y bloqueo de doble envío mientras la solicitud está en curso
- Honeypot básico (`botcheck`) para descartar envíos automatizados
- Mensajes de éxito/error redactados para el usuario; el detalle técnico de cualquier falla solo se registra en la consola del navegador (`console.error`), nunca se muestra en la UI

**Cómo funciona (sin backend):** el sitio es 100% estático, así que el
formulario llama directamente por `fetch()` a la API de Web3Forms
(`https://api.web3forms.com/submit`), que reenvía la consulta al email
configurado en su panel. No hay servidor propio, ni SMTP, ni credenciales
secretas en el proyecto — el `access_key` que usa Web3Forms está diseñado
para vivir en código de frontend (no es un secreto; funciona como una clave
pública, limitada por dominio y por cuota desde el panel de Web3Forms).

**Estado actual: activado y verificado.** El Access Key real ya está cargado
en `WEB3FORMS_ACCESS_KEY` (`js/main.js`, cerca de la línea 30) y el envío se
probó de punta a punta contra la API real de Web3Forms (no simulado): la
consulta llega efectivamente a sayagoluisp@gmail.com.

Para obtener o rotar el Access Key en el futuro: entrar a
[web3forms.com](https://web3forms.com), ingresar el email de destino (no pide
contraseña ni crear una cuenta) y Web3Forms lo envía al instante.

> **Nota técnica (CORS):** el body del envío se arma con `FormData`, no con
> `JSON.stringify` + `Content-Type: application/json`. Un body JSON obliga al
> navegador a mandar un preflight CORS (OPTIONS) antes del POST, y el
> preflight de Web3Forms no devuelve los headers de CORS necesarios, así que
> el navegador bloquea el envío antes de que salga. `FormData` es una
> solicitud CORS "simple" (sin preflight) y es el formato que Web3Forms
> espera. Además, Web3Forms bloquea (sin headers de CORS) los requests cuyo
> User-Agent contiene `HeadlessChrome` u otras señales de navegador
> automatizado, como protección anti-abuso de su API gratuita — si un test
> automatizado (Playwright/Puppeteer en modo headless) falla acá con un error
> de CORS, no es un bug del sitio: hay que probar con un `userAgent` normal
> (sin "Headless") para reproducir el comportamiento real de un usuario.

> El botón flotante de la esquina inferior derecha abre un modal distinto
> ("Contactar por WhatsApp", campos Nombre/Empresa/Mensaje) que arma un enlace
> `wa.me` y abre WhatsApp directamente — nunca dependió de email y ya
> funcionaba correctamente antes de este cambio. El formulario de email
> (Nombre/Empresa/Correo/Teléfono/Mensaje) se abre desde el botón "Contactar"
> del header, los botones "Solicitar asesoría" de cada hero, y el enlace
> "Contacto" del footer — los cuatro abren el mismo `#contactModal` y usan
> exactamente el mismo envío a Web3Forms descripto arriba.

### WhatsApp
- Número: +54 9 11 5907-2017
- Abre WhatsApp Web automáticamente
- Incluye datos del usuario

### Postulación (Careers)
- Validación de campos requeridos, tecnología preseleccionable por tarjeta
- Validación de CV: solo PDF/DOC/DOCX, máximo 10MB
- Debería enviar el CV y los datos del postulante a: sayagoluisp@gmail.com

**Nota**: al igual que el formulario de Contacto, es una demostración: no hay backend que reciba el archivo ni envíe el email. El código deja preparado el `fetch()` a `/api/careers/apply` comentado en `js/main.js`, listo para conectar el día que exista un backend.

## 🌍 Localización por Región

El selector de región guarda la elección en `localStorage`. En producción, puedes:
- Cambiar contenido según región
- Mostrar horarios locales
- Cambiar moneda
- Adaptar copyrighting

## 🔐 Seguridad

**IMPORTANTE**: Antes de producción:
- [ ] Implementar backend seguro para formularios
- [ ] Usar HTTPS
- [ ] Validar datos en servidor
- [ ] Proteger credenciales de email
- [ ] Implementar CSRF tokens
- [ ] Rate limiting en APIs

## 📊 Analytics

El código incluye placeholders para Google Analytics:
```javascript
trackEvent('contact_form_submitted', { region: 'AR' });
```

Para activar:
1. Crea cuenta en Google Analytics
2. Añade el tracking ID en `index.html`
3. Implementa gtag.js

## 🎨 Personalización

### Cambiar Colores
Editar en `css/styles.css`:
```css
:root {
    --primary-color: #0066cc;      /* Azul corporativo */
    --text-color: #1a1a1a;          /* Texto */
    --bg-light: #fafafa;            /* Fondo claro */
}
```

### Cambiar Tipografía
En `index.html`, cambiar import de Google Fonts y actualizar `font-family` en CSS.

### Cambiar Contenido
- Editar secciones directamente en `index.html`
- Mantener estructura HTML
- Respetar clases CSS para estilos

## 📋 Checklist de Producción

- [ ] Backend implementado
- [ ] Emails configurados
- [ ] SSL/HTTPS activo
- [ ] Dominio configurado
- [ ] CDN de imágenes
- [ ] Analytics implementado
- [ ] Formularios securizados
- [ ] Robots.txt y Sitemap
- [ ] Meta tags optimizados
- [ ] Testing mobile
- [ ] Testing en navegadores
- [ ] Performance audit

## 📞 Soporte

Para dudas o cambios en el diseño, contacta con el equipo de desarrollo.

## 📄 Licencia

Propietario: PATERSAY
Año: 2024

---

**Versión**: 1.0  
**Última actualización**: Junio 2024  
**Desarrollador**: PATERSAY Dev Team
