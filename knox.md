# 📁 knoX — Informe de Análisis Profundo
## `AnimeSAO Pro v3.2.0` · Generado por Análisis Automatizado Completo

---

```
╔══════════════════════════════════════════════════════════════════╗
║  📂 knoX / INFORME COMPLETO                                      ║
║  ─────────────────────────────────────────────────────────────   ║
║  📄 Página 01 · Análisis General                                 ║
║  📄 Página 02 · Errores Detectados                               ║
║  📄 Página 03 · Mejoras a Realizar                               ║
║  📄 Página 04 · Sugerencias Propuestas                           ║
║  📄 Página 05 · Visión General de la App                         ║
║  📄 Página 06 · Esquema Visual                                   ║
║  📄 Página 07 · Nivel y Arquitectura Completa                    ║
║  📄 Página 08 · Arquitectura del Procesamiento de Datos          ║
║  📄 Página 09 · Seguridad y Riesgos Legales                      ║
║  📄 Página 10 · Rendimiento y Métricas Técnicas                  ║
╚══════════════════════════════════════════════════════════════════╝
```

> **Archivos analizados:** `index.html` · `script.js` · `style.css` · `server.js`
> **Líneas de código total:** ~2,900+ (JS: ~1,453 | CSS: ~1,264 | HTML: ~228 | Server: ~542)
> **Versión declarada:** AnimeSAO Pro v7 / 3.2.0 Premium

---

---

# 📄 PÁGINA 01 — ANÁLISIS GENERAL

---

## 1.1 · ¿Qué es esta aplicación?

AnimeSAO Pro es una **Progressive Web App (PWA) de streaming de anime**, construida con tecnología web pura (Vanilla JS + Node.js). Actúa como frontend de consumo para contenido extraído dinámicamente del sitio **AnimeFLV** (`www3.animeflv.net`) mediante técnicas de web scraping en tiempo real.

La aplicación **no aloja contenido propio**. Todo el catálogo, metadatos de anime, episodios y servidores de video son raspados de AnimeFLV y servidos a través de un backend Express.js propio.

---

## 1.2 · Stack Tecnológico Completo

| Capa | Tecnología | Versión / Detalle |
|------|-----------|-------------------|
| Frontend | Vanilla JavaScript | ES2020+ (async/await, Map, Set, IntersectionObserver) |
| Estilos | CSS3 puro | Variables CSS, Grid, Flexbox, backdrop-filter |
| Backend | Node.js + Express.js | Puerto 3000 |
| HTTP Client | Axios | Con instancia personalizada y User-Agent spoofing |
| HTML Parser | Cheerio | Web scraping del DOM de AnimeFLV |
| Seguridad | Helmet.js | CSP desactivado manualmente |
| Fuente | Google Fonts | Inter (300–800 pesos) |
| Almacenamiento | localStorage | Biblioteca, historial, preferencias de usuario |

---

## 1.3 · Análisis de `index.html`

El HTML es **limpio, semántico y bien estructurado**. Usa vistas SPA (Single Page Application) controladas por CSS `display: none / flex`. 

**Puntos positivos:**
- Etiquetas semánticas correctas (`<main>`, `<section>`, `<nav>`, `<header>`)
- `aria-label` en el toolbar de filtros
- Viewport con `maximum-scale=1.0` (optimizado para móvil)
- Manifest PWA declarado
- Imágenes con lazy loading (`loading="lazy"`)
- Placeholder GIF base64 de 1×1px para evitar broken images

**Puntos negativos:**
- No hay `<meta name="description">` para SEO
- No hay `<noscript>` fallback
- El `manifest.json` está referenciado pero **no fue incluido en los archivos entregados**
- El ícono `icon-192.png` referenciado tampoco existe en los archivos analizados
- Los archivos CSS/JS usan versionado manual (`?v=7`) en vez de hashing automatizado

---

## 1.4 · Análisis de `script.js` (Frontend)

El JS tiene **1,453 líneas** y está organizado en módulos objeto. La arquitectura es modular pero **sin sistema de módulos ES** (no usa `import/export`).

**Módulos detectados:**

| Módulo | Función | Líneas aprox. |
|--------|---------|---------------|
| `AppState` | Estado global centralizado | 17–42 |
| `API` | Comunicación con backend (con caché y deduplicación) | 98–155 |
| `UIBuilder` | Construcción de tarjetas y secciones | 158–232 |
| `HomeManager` | Carga infinita y secciones del home | 234–421 |
| `CategoryManager` | Vista de categoría con scroll infinito | 424–502 |
| `DetailOverlay` | Panel de detalle de anime | 504–644 |
| `PlayerOverlay` | Reproductor de video con iframe | 646–821 |
| `Search` | Búsqueda con debounce | 823–893 |
| `Library` | Guardado de favoritos | 896–949 |
| `Navigation` | Cambio de vistas SPA | 951–999 |
| `Settings` | Limpieza de caché local | 1002–1015 |
| `Recommendations` | Motor de recomendaciones por puntaje | 1074–1187 |

**Enhancements (parche post-inicial):**
A partir de la línea ~1017, el código aplica **monkey patching** sobre objetos ya definidos: `API.fetch`, `PlayerOverlay.open`, `PlayerOverlay.loadServer`, `Library.toggle`. Esto indica **crecimiento incremental sin refactorización**, es un anti-patrón en proyectos serios.

---

## 1.5 · Análisis de `server.js` (Backend)

El servidor tiene **542 líneas** y expone una **API REST propia** que actúa como proxy hacia AnimeFLV.

**Endpoints expuestos:**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /api/latest` | GET | Animes añadidos recientemente (scraping de `/browse?order=added`) |
| `GET /api/trending` | GET | Animes populares (scraping de `/` y fallback a `/browse?order=rating`) |
| `GET /api/genre/:genre` | GET | Listado por género (scraping de `/browse?genre=...`) |
| `GET /api/search` | GET | Búsqueda por texto (scraping de `/browse?q=...`) |
| `GET /api/info/:id` | GET | Detalle completo + episodios (scraping de `/anime/:id`) |
| `GET /api/video/:id/:cap` | GET | Servidores de video (scraping de `/ver/:id-:cap`) |
| `GET /api/health` | GET | Estado del servidor y tamaño de caché |

**Sistema de caché inteligente:**

| Tipo | TTL |
|------|-----|
| `latest` | 5 minutos |
| `trending` | 15 minutos |
| `genre` | 10 minutos |
| `search` | 5 minutos |
| `info` | 60 minutos |
| `video` | 30 minutos |

---

## 1.6 · Análisis de `style.css`

El CSS tiene **1,264 líneas** con un sistema de variables bien definido. La paleta es coherente (dark mode azul/violeta), con animaciones CSS y efectos glassmorphism.

**Hallazgo crítico:** La clase `.card` está **definida dos veces** (líneas ~241 y ~1108), con propiedades que se solapan y contradicen. Esto genera comportamientos visuales inconsistentes.

---

---

# 📄 PÁGINA 02 — ERRORES DETECTADOS

---

## 🔴 ERRORES CRÍTICOS

### Error C-01 · Clase `.card` duplicada en CSS
**Archivo:** `style.css` · **Líneas:** ~241 y ~1108

```css
/* Primera definición (línea ~241) */
.card {
    cursor: pointer;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

/* Segunda definición (línea ~1108) */
.card {
    position: relative;
    border-radius: 14px;        /* ← DIFERENTE */
    box-shadow: 0 8px 20px rgba(0,0,0,0.22);  /* ← DIFERENTE */
    background: var(--bg-secondary);
}
```

**Impacto:** La segunda definición sobrescribe la primera. El `border-radius` real aplicado es `14px` (no `12px`). Además, `position: relative` del segundo bloque es necesario para el pseudo-elemento `::before`, pero al estar separados crea confusión. Se debe unificar en una sola regla.

---

### Error C-02 · `PlayerOverlay.open()` definido dos veces (monkey patching)
**Archivo:** `script.js` · **Líneas:** ~651 y ~1327

```javascript
// Primera versión (línea 651) - Definición original en el objeto
const PlayerOverlay = {
    async open(epNumber) { ... }
}

// Segunda versión (línea 1327) - Monkey patch que sobreescribe
const originalPlayerOpen = PlayerOverlay.open.bind(PlayerOverlay);
PlayerOverlay.open = async function (epNumber) { ... }
```

**Impacto:** Si el orden de ejecución cambia, o si se añaden más módulos, `originalPlayerOpen` puede no ser la versión correcta. El sistema de token (`playerRequestId`) para cancelar requests solo existe en el monkey patch, no en el original. Esto es una **trampa de concurrencia** silenciosa.

---

### Error C-03 · `iframe.onerror` no funciona para iframes en la mayoría de browsers
**Archivo:** `script.js` · **Líneas:** ~732–741 y ~1392–1400

```javascript
iframe.onerror = () => {
    // Este evento NO se dispara para iframes cross-origin en Chrome/Firefox
    if (this.retryCount < this.maxRetries - 1) { ... }
};
```

**Impacto:** El sistema de reintentos automáticos del servidor de video **nunca se activa**. Si un servidor falla, el usuario queda con pantalla en blanco sin retroalimentación. El `onerror` de un `<iframe>` no se dispara para errores de carga de contenido externo por políticas CORS y seguridad del navegador.

---

### Error C-04 · `iframe.onload` guarda historial incluso si el video no cargó
**Archivo:** `script.js` · **Líneas:** ~726–729

```javascript
iframe.onload = () => {
    // onload se dispara cuando el iframe carga CUALQUIER cosa, incluso páginas de error
    this.saveToHistory(AppState.currentAnime, AppState.currentEpisode);
};
```

**Impacto:** Si el servidor de video devuelve una página de error (404 del proveedor), el `onload` se dispara igual y el episodio se marca como visto incorrectamente.

---

### Error C-05 · XSS potencial en `Search.execute()` — innerHTML con datos externos
**Archivo:** `script.js` · **Línea:** ~870

```javascript
message.innerHTML = '<svg ...></svg><p>No se encontraron resultados</p>';
```

En este caso el HTML es estático, pero el patrón `innerHTML` está también usado en `UIBuilder.buildCard()` donde `anime.title` se inserta directamente:

```javascript
card.innerHTML = `
    <div class="card-img-wrapper">
        <img src="${coverUrl}" alt="${anime.title}" loading="lazy">
    ...
`;
```

Si `anime.title` o `coverUrl` contiene caracteres como `"` o `>`, se puede romper el HTML. El `alt` especialmente acepta cualquier valor del servidor de scraping.

---

## 🟠 ERRORES MODERADOS

### Error M-01 · `isWatched` siempre muestra solo el último episodio visto
**Archivo:** `script.js` · **Línea:** ~611

```javascript
const isWatched = historyItem && historyItem.lastEp === ep.number;
```

**Impacto:** Solo el **último** episodio visto se marca con `✓`. Todos los episodios anteriores no tienen indicador de visto, aunque el usuario los haya completado. El historial no lleva registro por episodio individual.

---

### Error M-02 · Progress bar del historial siempre es 0
**Archivo:** `script.js` · **Línea:** ~797–798

```javascript
const historyItem = {
    progress: 0,     // ← SIEMPRE 0
    duration: 100,   // ← VALOR ARBITRARIO FIJO
};
```

**Impacto:** La barra de progreso visible en las tarjetas del historial (`history-progress`) siempre estará al 0% porque no hay ningún mecanismo que actualice `progress` durante la reproducción. El iframe no permite acceder al tiempo de reproducción del video por ser cross-origin.

---

### Error M-03 · `renderServers()` registra múltiples event listeners en el `<select>`
**Archivo:** `script.js` · **Líneas:** ~707–709

```javascript
selector.addEventListener('change', (e) => {
    this.loadServer(parseInt(e.target.value, 10));
});
```

Cada vez que se abre un nuevo episodio, se llama `renderServers()` que añade **otro** listener al mismo `<select>`. En la segunda apertura, `loadServer` se llama dos veces; en la tercera, tres veces, etc. La corrección requiere `selector.innerHTML = ''` seguido de recrear el elemento o usar `{ once: true }`.

---

### Error M-04 · `initializeSections(true)` no limpia elementos del DOM
**Archivo:** `script.js` · **Línea:** ~238–254

```javascript
if (forceRefresh) {
    content.innerHTML = '';
    AppState.homeSections.clear();
    // ...
    const sec = this.createSectionElement(recConfig);
    recCont.appendChild(sec);
    AppState.homeSections.set(recConfig.id, { ... });
}
// Luego continúa creando TODAS las secciones nuevamente
for (const config of SECTIONS_CONFIG) { ... }
```

**Impacto:** En el refresh, la sección `for_you` se añade al mapa **antes** del guard `if (AppState.homeInitialized) return`. Pero `homeInitialized` se pone a `false` en el refresh, por lo que el loop completo re-crea las 10 secciones de `SECTIONS_CONFIG`. La sección `for_you` no está en `SECTIONS_CONFIG` pero sí en el mapa, generando inconsistencias de estado.

---

### Error M-05 · `validateGenre` en el servidor no verifica géneros permitidos
**Archivo:** `server.js` · **Línea:** ~75–78

```javascript
const validateGenre = (genre) => {
    if (!genre || typeof genre !== 'string') return null;
    return genre.toLowerCase().replace(/[^a-z0-9-]/g, '');
};
```

**Impacto:** Un atacante puede pasar `género` = `../../../etc/passwd` o cualquier path. Aunque el replace de caracteres previene path traversal básico, un género como `aaaaaaaaaaaa` (500 caracteres) sería aceptado y generaría una petición a AnimeFLV con una URL inválida. **No hay lista blanca de géneros válidos.**

---

### Error M-06 · `cors()` sin configuración — acepta cualquier origen
**Archivo:** `server.js` · **Línea:** ~41

```javascript
app.use(cors());
```

**Impacto:** La API es accesible desde **cualquier dominio**. Cualquier sitio externo puede hacer peticiones a tu backend y consumir tu caché/ancho de banda sin restricción.

---

## 🟡 ERRORES MENORES

### Error L-01 · `overflow: hidden` en `body` bloquea el scroll en desktop
**Archivo:** `style.css` · **Línea:** ~38

```css
body {
    overflow: hidden;
}
```

Esto es intencional para la SPA móvil, pero en desktop genera una experiencia de usuario degradada. No hay breakpoint que lo corrija.

---

### Error L-02 · Falta `<meta name="description">` y Open Graph básico
**Archivo:** `index.html`

La PWA carece de metadatos de descripción. Si algún usuario comparte el link de la app, las plataformas (WhatsApp, Twitter) mostrarán una preview vacía.

---

### Error L-03 · `hashString()` definida pero `getRandomSeed()` nunca usada
**Archivo:** `script.js` · **Líneas:** ~1036–1046

```javascript
const getRandomSeed = (label = '') => hashString(`${label}:${Date.now()}:${Math.random()}`);
// Esta función no aparece llamada en ninguna parte del código
```

Código muerto que aumenta el tamaño del bundle.

---

### Error L-04 · `Recommendations.getTopGenre()` y `Recommendations.getTopSignals()` — funciones redundantes
**Archivo:** `script.js` · **Líneas:** ~90–94 y ~1128–1133

`getTopGenre()` devuelve un string con el top género usando `AppState.userPreferences`. `getTopSignals()` devuelve top 3 géneros usando `_loadProfile().genres`. Son dos perfiles paralelos y separados en `localStorage`. El código del refresh usa el primero, el rendering usa el segundo. **Los datos de recomendación están fragmentados en dos keys distintos** (`anime_prefs` vs `anime_reco_profile_v2`).

---

---

# 📄 PÁGINA 03 — MEJORAS A REALIZAR

---

## 3.1 · CSS — Consolidación y limpieza

**Acción:** Unificar las dos definiciones de `.card` en una sola regla.

```css
/* Definitivo unificado */
.card {
    position: relative;
    cursor: pointer;
    border-radius: 14px;
    overflow: hidden;
    background: var(--bg-secondary);
    box-shadow: 0 8px 20px rgba(0,0,0,0.22);
    animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal), filter var(--transition-normal);
}
```

**Acción:** Añadir `@media (hover: hover)` para aplicar hover effects **solo en dispositivos con mouse**. Las animaciones de hover (`:hover`) en móviles pueden dispararse incorrectamente al tocar.

```css
@media (hover: hover) {
    .card:hover {
        transform: translateY(-5px) scale(1.01);
        box-shadow: 0 18px 34px rgba(99, 102, 241, 0.26);
    }
}
```

---

## 3.2 · Script — Refactorización del PlayerOverlay

Eliminar el monkey patching y unificar en una sola definición limpia:

```javascript
const PlayerOverlay = {
    retryCount: 0,
    maxRetries: 3,
    requestId: 0,

    async open(epNumber) {
        const token = ++this.requestId;
        // ... lógica unificada con token desde el inicio
    }
};
```

---

## 3.3 · Script — Fix del listener duplicado en `renderServers()`

```javascript
renderServers() {
    const selector = $('server-selector');
    if (!selector) return;

    // Reemplazar el nodo para eliminar todos los listeners previos
    const newSelector = selector.cloneNode(false);
    selector.parentNode.replaceChild(newSelector, selector);

    AppState.currentServers.forEach((server, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = server.name || `Servidor ${idx + 1}`;
        newSelector.appendChild(opt);
    });

    newSelector.addEventListener('change', (e) => {
        this.loadServer(parseInt(e.target.value, 10));
    });
}
```

---

## 3.4 · Script — Reemplazar `iframe.onerror` con un timeout de detección

Como `onerror` no funciona en iframes cross-origin, usar un timeout de fallback:

```javascript
loadServer(index) {
    const server = AppState.currentServers[index];
    if (!server) return;

    const iframe = $('player-iframe');
    iframe.src = '';

    const loadTimeout = setTimeout(() => {
        // Si después de 12 segundos no cargó, intentar siguiente servidor
        if (this.retryCount < this.maxRetries - 1) {
            this.retryCount++;
            this.loadServer(index); // O pasar al siguiente
        } else {
            this.showError('Servidor no disponible.');
        }
    }, 12000);

    iframe.onload = () => {
        clearTimeout(loadTimeout);
        this.saveToHistory(AppState.currentAnime, AppState.currentEpisode);
    };

    iframe.src = server.url;
}
```

---

## 3.5 · Server — Añadir whitelist de géneros

```javascript
const VALID_GENRES = new Set([
    'accion', 'aventura', 'comedia', 'drama', 'fantasia', 'romance',
    'ciencia-ficcion', 'misterio', 'terror', 'slice-of-life', 'isekai',
    'shounen', 'shoujo', 'seinen', 'josei', 'mecha', 'deportes', 'musica'
]);

const validateGenre = (genre) => {
    if (!genre || typeof genre !== 'string') return null;
    const clean = genre.toLowerCase().replace(/[^a-z0-9-]/g, '');
    return VALID_GENRES.has(clean) ? clean : null;
};
```

---

## 3.6 · Server — Restringir CORS

```javascript
const allowedOrigins = ['https://tu-dominio.com', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));
```

---

## 3.7 · Server — Añadir Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,                  // máximo 100 peticiones por IP
    message: { success: false, error: 'Demasiadas solicitudes' }
});

app.use('/api/', limiter);
```

---

## 3.8 · Historial — Sistema de episodios por ítem

Cambiar la estructura del historial para registrar **todos** los episodios vistos:

```javascript
// Estructura actual (problemática)
{ id, title, cover, lastEp: 5 }

// Estructura propuesta
{ id, title, cover, lastEp: 5, watchedEps: [1, 2, 3, 4, 5], timestamps: { 1: 1700000, 5: 1700500 } }
```

---

## 3.9 · Unificar los dos perfiles de recomendación

Eliminar `AppState.userPreferences` / `anime_prefs` y usar solo `anime_reco_profile_v2` como única fuente de verdad para recomendaciones. Migrar llamadas de `Recommendations.updateWeights()` para siempre pasar el objeto anime completo.

---

---

# 📄 PÁGINA 04 — SUGERENCIAS PROPUESTAS

---

## 💡 Sugerencia S-01 · Implementar Service Worker para funcionamiento offline

La app declara un manifest PWA pero **no tiene Service Worker**. Sin él, la PWA no puede:
- Funcionar sin internet
- Cachear el shell de la app
- Mostrar una pantalla offline personalizada

```javascript
// sw.js
const CACHE_NAME = 'animesao-v1';
const SHELL_ASSETS = ['/', '/index.html', '/style.css', '/script.js'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
```

**Beneficio:** La app se puede instalar en el homescreen y funciona sin conexión para el catálogo ya cargado.

---

## 💡 Sugerencia S-02 · Añadir sistema de búsqueda local instantánea

Actualmente la búsqueda hace una petición HTTP por cada query. Se podría complementar con búsqueda local sobre el catálogo ya cargado:

```javascript
Search.executeLocal = function(query) {
    const normalQuery = normalizeText(query);
    const allItems = HomeManager.getAllLoadedItems();
    return allItems.filter(item =>
        normalizeText(item.title).includes(normalQuery)
    ).slice(0, 20);
};
```

**Beneficio:** Resultados instantáneos sin latencia de red para animes ya en caché.

---

## 💡 Sugerencia S-03 · Skeleton Loading en secciones de home

Actualmente mientras carga, las secciones simplemente no aparecen. Se puede mostrar placeholder animado:

```javascript
createSectionElement(config) {
    const section = document.createElement('div');
    section.innerHTML = `
        <div class="home-section-header">
            <div class="skeleton-pulse" style="width: 140px; height: 20px;"></div>
        </div>
        <div class="row-scroll">
            ${Array(6).fill('<div class="card skeleton-card"></div>').join('')}
        </div>
    `;
    return section;
}
```

**Beneficio:** UX mucho más fluida. El usuario ve que hay contenido cargando y la pantalla no parece vacía.

---

## 💡 Sugerencia S-04 · Servidor: agregar endpoint `/api/featured`

El servidor tiene `featured` en `CACHE_TTL` pero **no tiene el endpoint implementado**. Se puede añadir para exponer los animes destacados del home de AnimeFLV (banners/sliders).

```javascript
app.get('/api/featured', async (req, res) => {
    const cached = cacheGet('featured');
    if (cached) return res.json({ success: true, data: cached });
    // Scrape del carrusel principal de AnimeFLV
    const data = await retryRequest(() => axiosInstance.get('/'));
    const $ = cheerio.load(data.data);
    const featured = [];
    $('.SliderContainer .Slide').each((i, el) => {
        // ... parseo del slider
    });
    cacheSet('featured', featured);
    res.json({ success: true, data: featured });
});
```

---

## 💡 Sugerencia S-05 · Separar el motor de recomendaciones a un Web Worker

El scoring de anime (`Recommendations.rankItems`) itera sobre todos los ítems cargados y corre en el hilo principal. Con catálogos grandes puede generar jank en la UI:

```javascript
// recommendation.worker.js
self.onmessage = ({ data: { items, profile } }) => {
    const ranked = rankItems(items, profile);
    self.postMessage({ ranked });
};

// En script.js
const recWorker = new Worker('recommendation.worker.js');
recWorker.postMessage({ items: allItems, profile: Recommendations.getProfile() });
recWorker.onmessage = ({ data: { ranked } }) => renderPersonalizedSection(ranked);
```

---

## 💡 Sugerencia S-06 · Añadir paginación al historial en la librería

El historial tiene un límite de 100 ítems pero todos se renderizan de una vez en la librería. Para catálogos grandes, se recomienda renderizado virtual o paginación simple:

```javascript
Library.renderPage = function(page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize;
    const items = AppState.library.slice(start, start + pageSize);
    items.forEach(item => grid.appendChild(UIBuilder.buildCard(item)));
};
```

---

## 💡 Sugerencia S-07 · Implementar compresión gzip en el servidor

```javascript
const compression = require('compression');
app.use(compression()); // Añadir ANTES de las rutas
```

**Beneficio:** Reduce el tamaño de las respuestas JSON de la API en ~70–80%. Esencial para conexiones lentas móviles.

---

## 💡 Sugerencia S-08 · Dashboard de salud del servidor más completo

El endpoint `/api/health` actual solo devuelve `cache.size`. Extenderlo:

```javascript
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cache: {
            size: cache.size,
            keys: Array.from(cache.keys()).slice(0, 10)
        },
        timestamp: new Date().toISOString()
    });
});
```

---

---

# 📄 PÁGINA 05 — VISIÓN GENERAL DE LA APLICACIÓN

---

## 5.1 · Propósito y Audiencia

AnimeSAO Pro es una aplicación web para **consumo personal de anime** dirigida a hispanohablantes. Funciona como cliente alternativo de AnimeFLV con una interfaz móvil-primero más limpia y moderna.

**Audiencia objetivo:** Usuarios hispanohablantes que consumen anime en dispositivos móviles y buscan una experiencia sin anuncios intrusivos del sitio original.

---

## 5.2 · Funcionalidades Actuales

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Catálogo home con secciones | ✅ Funcional | 10 secciones por género/tipo |
| Búsqueda de anime | ✅ Funcional | Con debounce 400ms |
| Detalle de anime | ✅ Funcional | Con géneros, sinopsis, episodios |
| Reproductor de video | ✅ Funcional | Via iframe + selector de servidor |
| Biblioteca de favoritos | ✅ Funcional | Persistida en localStorage |
| Historial de visto | ⚠️ Parcial | Solo guarda el último ep, no todos |
| Barra de progreso | ❌ No funciona | Siempre 0% |
| Recomendaciones personalizadas | ✅ Funcional | Motor de scoring ponderado |
| Categorías con scroll infinito | ✅ Funcional | IntersectionObserver |
| Filtros rápidos en home | ✅ Funcional | 6 chips de filtro |
| PWA / Instalable | ⚠️ Parcial | Manifest sí, Service Worker no |
| Funcionamiento offline | ❌ No disponible | Sin Service Worker |
| Modo oscuro | ✅ Siempre activo | No hay toggle light/dark |

---

## 5.3 · Flujo Principal del Usuario

```
INICIO
  └─▶ Home carga secciones (lazy, 3 primeras inmediatas)
        └─▶ Usuario hace clic en tarjeta de anime
              └─▶ DetailOverlay abre → API.getInfo() scraping
                    └─▶ Usuario elige episodio
                          └─▶ PlayerOverlay abre → API.getVideo() scraping
                                └─▶ Se selecciona servidor → iframe.src = url
                                      └─▶ Video se reproduce (en servidor externo)
                                            └─▶ Anime se guarda en historial
```

---

## 5.4 · Fortalezas de la Aplicación

1. **UI/UX pulida:** Animaciones CSS fluidas, glassmorphism, sistema de diseño coherente.
2. **Motor de recomendaciones no trivial:** Sistema de scoring con pesos por géneros, tokens, tipo, status y recencia.
3. **Caché multicapa:** Caché en servidor (por tipo, con TTL diferenciado) + caché en cliente (3 minutos) + deduplicación de requests pendientes.
4. **Scroll infinito eficiente:** Usa `IntersectionObserver` tanto en home como en categorías, no polling.
5. **Manejo de errores en servidor:** Retry con backoff exponencial, respuestas de error estructuradas.
6. **Extracción robusta de metadatos:** Múltiples selectores de fallback para título, portada (DOM → alt → og:image → twitter:image).

---

## 5.5 · Debilidades Principales

1. **Dependencia frágil de scraping:** Si AnimeFLV cambia su HTML, toda la app se rompe sin aviso.
2. **Sin autenticación:** Cualquiera con acceso a la URL puede usar la API del servidor.
3. **Sin monitoreo:** No hay logging estructurado ni alertas de errores.
4. **Progreso de video no rastreable:** Los iframes cross-origin no exponen el tiempo de reproducción.
5. **Código con deuda técnica:** Monkey patching, estados duplicados, funciones muertas.

---

---

# 📄 PÁGINA 06 — ESQUEMA VISUAL

---

## 6.1 · Estructura de Vistas SPA

```
┌─────────────────────────────────────────┐
│              APP CONTAINER              │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VIEW-HOME (activa por defecto)  │   │
│  │  ┌────────────────────────────┐  │   │
│  │  │  Continue Watching (row)   │  │   │
│  │  ├────────────────────────────┤  │   │
│  │  │  Home Chips (filtros)      │  │   │
│  │  ├────────────────────────────┤  │   │
│  │  │  Recommendations (Para Ti) │  │   │
│  │  ├────────────────────────────┤  │   │
│  │  │  Sección: Recientes (row)  │  │   │
│  │  │  Sección: Populares (row)  │  │   │
│  │  │  Sección: Acción (row)     │  │   │
│  │  │  ... ×10 secciones         │  │   │
│  │  └────────────────────────────┘  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VIEW-SEARCH                     │   │
│  │  [Search Input Bar]              │   │
│  │  [Grid de resultados]            │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VIEW-CATEGORY                   │   │
│  │  [Header con título]             │   │
│  │  [Grid con scroll infinito]      │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VIEW-LIBRARY                    │   │
│  │  [Grid de favoritos]             │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  VIEW-SETTINGS                   │   │
│  │  [Limpiar datos] [Info versión]  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ══════════ BOTTOM NAV ════════════════  │
│  [ Inicio ] [ Buscar ] [ Lib ] [ Cfg ]  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OVERLAY-DETAIL (z-index: 50)           │
│  ┌────────────────────────────────┐     │
│  │  [Backdrop difuminado]         │     │
│  │  [Cover 100px]                 │     │
│  ├────────────────────────────────┤     │
│  │  Título  [Status badge] [★ Lib]│     │
│  │  [Género 1] [Género 2] ...     │     │
│  │  Sinopsis...                   │     │
│  ├────────────────────────────────┤     │
│  │  Episodios (N)                 │     │
│  │  Ep 1 ▶  /  Ep 2 ▶  ...       │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OVERLAY-PLAYER (z-index: 50)           │
│  [← Volver]  Título · Episodio N        │
│  ┌────────────────────────────────┐     │
│  │  [IFRAME - Video externo]      │     │
│  │  [Loader / Error state]        │     │
│  └────────────────────────────────┘     │
│  Servidor: [Select ▼]                   │
│  [◀ Anterior]          [Siguiente ▶]    │
└─────────────────────────────────────────┘
```

---

## 6.2 · Paleta de Colores

```
■ --bg-primary:      #0a0e27   (Fondo principal - azul muy oscuro)
■ --bg-secondary:    #10152d   (Fondo secundario)
■ --bg-tertiary:     #1a1f3a   (Fondo terciario)
■ --bg-surface:      #242d4a   (Superficies elevadas)
■ --accent-primary:  #6366f1   (Indigo - color principal de acento)
■ --accent-secondary:#8b5cf6   (Violeta - acento secundario)
■ --text-primary:    #ffffff   (Texto principal)
■ --text-secondary:  #a6b1d5   (Texto secundario)
■ --text-muted:      #687499   (Texto apagado)
■ --error:           #ff6b6b   (Errores)
■ --success:         #10b981   (Éxito)
```

---

## 6.3 · Jerarquía de Z-Index

```
z-index: 100  ──  Toast de notificaciones
z-index: 50   ──  Overlays (Detail + Player)
z-index: 40   ──  Bottom Navigation
z-index: 10   ──  Top Bars / Headers
z-index: 2    ──  EP Tags / Progress bars
z-index: 1    ──  Card hover overlay
z-index: -1   ──  Background gradient (body::before)
```

---

## 6.4 · Sistema de Animaciones CSS

| Animación | Duración | Uso |
|-----------|----------|-----|
| `cardAppear` | 500ms / spring | Aparición de tarjetas |
| `viewEnter` | 400ms / spring | Cambio de vista |
| `sectionAppear` | 500ms / ease-out | Secciones del home |
| `fadeIn` | 300ms / ease-out | Overlays y géneros |
| `spin` | 800ms / linear | Spinners de carga |
| `pulse` | 2000ms / ease-in-out | Skeleton loading |

---

---

# 📄 PÁGINA 07 — NIVEL Y ARQUITECTURA COMPLETA DEL SITIO

---

## 7.1 · Nivel de Madurez Técnica

| Dimensión | Nivel | Justificación |
|-----------|-------|---------------|
| Arquitectura general | ⭐⭐⭐⭐ (4/5) | SPA bien estructurada, separación de responsabilidades |
| Calidad del CSS | ⭐⭐⭐ (3/5) | Sistema de variables sólido, pero clase duplicada crítica |
| Calidad del JS | ⭐⭐⭐ (3/5) | Modular pero con monkey patching y deuda técnica |
| Backend / API | ⭐⭐⭐⭐ (4/5) | Bien estructurado, caché inteligente, retry logic |
| Seguridad | ⭐⭐ (2/5) | CORS abierto, sin rate limit, sin autenticación |
| Rendimiento | ⭐⭐⭐⭐ (4/5) | Lazy loading, IntersectionObserver, caché multicapa |
| UX/UI | ⭐⭐⭐⭐⭐ (5/5) | Animaciones fluidas, diseño cohesivo y premium |
| Mantenibilidad | ⭐⭐ (2/5) | Monkey patching, código muerto, estados duplicados |
| Escalabilidad | ⭐⭐ (2/5) | Sin módulos ES, sin bundler, estado global plano |

**Nivel global: Avanzado-Intermedio** — La aplicación está bien concebida y visualmente muy por encima del promedio, pero necesita refactorización de la lógica JS y endurecimiento del servidor para considerarse producción-ready.

---

## 7.2 · Arquitectura Completa

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│                                                                  │
│  ┌──────────────┐   ┌──────────────────────────────────────┐    │
│  │  index.html  │   │          script.js (SPA Core)         │    │
│  │              │   │                                       │    │
│  │  5 vistas    │   │  AppState (estado global)             │    │
│  │  2 overlays  │   │  ├─ library[]                         │    │
│  │  1 nav       │   │  ├─ history[]                         │    │
│  │  1 toast     │   │  ├─ userPreferences{}                 │    │
│  └──────────────┘   │  ├─ homeSections (Map)                │    │
│         │           │  └─ currentAnime/Episode/Servers       │    │
│  ┌──────┴───────┐   │                                       │    │
│  │  style.css   │   │  API → fetch('/api/*')                │    │
│  │              │   │  ├─ Caché en memoria (3 min)          │    │
│  │  1264 líneas │   │  └─ Deduplicación de requests         │    │
│  │  CSS vars    │   │                                       │    │
│  │  Animaciones │   │  Módulos UI: UIBuilder, HomeManager,  │    │
│  └──────────────┘   │  CategoryManager, DetailOverlay,      │    │
│                     │  PlayerOverlay, Search, Library,       │    │
│  localStorage        │  Navigation, Settings, Recommendations│    │
│  ├─ anime_library   └──────────────────────────────────────┘    │
│  ├─ anime_history                                                │
│  ├─ anime_prefs                                                  │
│  └─ anime_reco_profile_v2                                        │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP GET /api/*
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js / Express)                   │
│                        Puerto: 3000                               │
│                                                                  │
│  Middlewares:                                                    │
│  ├─ Helmet (seguridad headers, CSP desactivado)                  │
│  ├─ CORS (abierto, sin restricción)                              │
│  ├─ express.static('public') → sirve index.html, CSS, JS        │
│  └─ express.json()                                               │
│                                                                  │
│  Caché en Memoria (Map):                                         │
│  ├─ key: `tipo_parámetro`                                        │
│  └─ TTL diferenciado por tipo (5–60 minutos)                     │
│                                                                  │
│  Endpoints:                                                      │
│  ├─ GET /api/latest?page=N                                       │
│  ├─ GET /api/trending                                            │
│  ├─ GET /api/genre/:genre?page=N                                 │
│  ├─ GET /api/search?q=query                                      │
│  ├─ GET /api/info/:id                                            │
│  ├─ GET /api/video/:id/:cap                                      │
│  └─ GET /api/health                                              │
│                                                                  │
│  Axios Instance:                                                 │
│  ├─ baseURL: https://www3.animeflv.net                           │
│  ├─ timeout: 20000ms                                             │
│  ├─ User-Agent: Chrome spoofed                                   │
│  └─ Referer: animeflv.net                                        │
│                                                                  │
│  Retry Logic:                                                    │
│  └─ 3 intentos, backoff exponencial (1s, 2s, 4s max 5s)         │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP GET (scraping)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                FUENTE DE DATOS: AnimeFLV                         │
│              https://www3.animeflv.net                           │
│                                                                  │
│  Páginas scrapeadas:                                             │
│  ├─ /browse?order=added&page=N    → Latest                       │
│  ├─ /                             → Trending (ListAnimeTop)      │
│  ├─ /browse?order=rating&page=1  → Trending fallback             │
│  ├─ /browse?genre=:g&page=N      → Género                        │
│  ├─ /browse?q=:query             → Búsqueda                      │
│  ├─ /anime/:id                   → Info + episodios (var episodes)│
│  └─ /ver/:id-:cap                → Servers (var videos)           │
│                                                                  │
│  Datos extraídos:                                                │
│  ├─ Listas: .ListAnimes li, .ListAnimeTop li                     │
│  ├─ Metadatos: h1.Title, .Description p, .AnmStts, .Nvgnrs      │
│  ├─ Portadas: .AnimeCover img → og:image → twitter:image         │
│  ├─ Episodios: var episodes = [...] en <script>                  │
│  └─ Servidores: var videos = {...} en <script>                   │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ iframe.src = server.url
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│           SERVIDORES DE VIDEO EXTERNOS (Terceros)                │
│                                                                  │
│  Ejemplos: streamwish.to, mp4upload.com, etc.                    │
│  Acceso: Via iframe embebido en el player                        │
│  Control: NINGUNO (cross-origin, sin acceso a tiempo/estado)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7.3 · Diagrama de Módulos JS

```
App.init()
├── Navigation.setup()
├── Library.setup() + Library.render()
├── Search.setup()
├── Settings.setup()
├── CategoryManager.setupScroll()
├── HomeManager.bindFilterChips()
├── UIBuilder.renderHistorySection()
├── HomeManager.initializeSections()
│   ├── createSectionElement() ×10
│   ├── setupIntersectionObserver()
│   │   └── → loadNextSections() (on scroll)
│   └── loadInitialSections()
│       └── loadSection() ×3 (primeras 3)
│           ├── API.getLatest() / getTrending() / getGenre()
│           └── UIBuilder.buildCard() ×N
└── HomeManager.renderPersonalizedSection()
    └── Recommendations.rankItems()
        └── Recommendations.scoreAnime() ×N
```

---

---

# 📄 PÁGINA 08 — ARQUITECTURA DEL PROCESAMIENTO DE INFORMACIÓN

---

## 8.1 · Pipeline de Extracción de Metadatos de Anime

```
SOLICITUD: GET /api/info/:id
│
├── 1. Validación del ID
│      └── id.replace(/\//g, '').substring(0, 100)
│
├── 2. Check Caché
│      └── cacheGet(`info_${cleanId}`) → TTL: 60 minutos
│          ├── HIT → return cached → res.json(200)
│          └── MISS → continúa
│
├── 3. HTTP Request a AnimeFLV
│      └── axiosInstance.get(`/anime/${cleanId}`)
│          ├── Retry: hasta 3 intentos (backoff 1s, 2s, 4s)
│          └── Timeout: 20 segundos
│
├── 4. Parsing con Cheerio
│   │
│   ├── 4a. EPISODIOS (extracción de JavaScript embebido)
│   │      Scripts analizados → buscar "var episodes ="
│   │      Regex: /var episodes\s*=\s*(\[.*?\]);/i
│   │      JSON.parse(match[1])
│   │      Cada entrada: [epNum, epId] o {ep, id} o {number, slug}
│   │      → normalizeEpisode() → .reverse().slice(0, 500)
│   │
│   ├── 4b. GÉNEROS
│   │      $('.Nvgnrs a') → text().trim() → slice(0, 10)
│   │
│   ├── 4c. PORTADA (3 niveles de fallback)
│   │      1. $('.AnimeCover img').attr('src')
│   │      2. $('img[alt*="Cover"]').attr('src')
│   │      3. meta[property="og:image"] / twitter:image
│   │      URL: si no empieza con http → BASE_URL + src
│   │
│   ├── 4d. TÍTULO (7 niveles de fallback)
│   │      1. h1.Title
│   │      2. .Ficha.fcont .Title
│   │      3. .Ficha.fcont h2
│   │      4. .container .Title
│   │      5. h1
│   │      6. .AnimeName
│   │      7. meta og:title / twitter:title / name=title
│   │      8. $('title').text() (sin pipe)
│   │
│   ├── 4e. SINOPSIS
│   │      $('.Description p').text().trim()
│   │
│   └── 4f. STATUS
│          $('.AnmStts span').text().trim()
│
├── 5. Construcción del objeto normalizado
│      { id, title, cover, synopsis, status, genres[], episodes[] }
│
├── 6. cacheSet(`info_${cleanId}`, info)
│
└── 7. res.json({ success: true, data: info })
```

---

## 8.2 · Pipeline de Extracción de Servidores de Video

```
SOLICITUD: GET /api/video/:id/:cap
│
├── 1. Validación
│      cleanSlug: id.replace(/\//g, '').substring(0, 100)
│      cleanCap:  cap.replace(/\D/g, '').substring(0, 10)
│
├── 2. Check Caché → TTL: 30 minutos
│
├── 3. HTTP Request
│      axiosInstance.get(`/ver/${cleanSlug}-${cleanCap}`)
│
├── 4. Parsing de JavaScript embebido
│      Scripts analizados → buscar "var videos ="
│      Regex: /var videos\s*=\s*(\{.*?\});/i
│      JSON.parse(match[1])
│
├── 5. Extracción SUB
│      videoData.SUB[] → solo subtitulados al español
│      Cada servidor:
│        name: s.title || s.server
│        url:  s.code (si contiene 'http') || `streamwish.to/e/${s.code}`
│        priority: s.priority || 0
│      Filtro: url.length > 10
│      Sort: por prioridad descendente
│      Slice: primeros 10 servidores
│
├── 6. Si servers.length === 0
│      → res.status(404).json({ error: 'Video no disponible' })
│
└── 7. cacheSet + res.json({ servers })
```

---

## 8.3 · Flujo del Motor de Recomendaciones

```
PERFIL DE USUARIO (localStorage: anime_reco_profile_v2)
{
  genres:    { "accion": 15.4, "fantasia": 8.2, ... }   ← peso ×2.2 por vista
  tokens:    { "dragon": 3.1, "espada": 2.0, ... }       ← peso ×0.15
  types:     { "anime": 5.0, "ova": 1.2 }                ← peso ×0.7
  statuses:  { "en emision": 3.0, "finalizado": 1.5 }    ← peso ×0.5
  favorites: { "anime-id-x": 1, "anime-id-y": 1 }        ← peso +3.4
  views:     { "anime-id-z": 2 }                          ← registro de vistas
}

ACTUALIZACIÓN DEL PERFIL:
├── Al abrir un anime:  Recommendations.updateWeights(anime.genres)
│                       _touchBucket(genres, genre, peso × 1.8)
├── Al guardar favorito: registerFavorite(anime, true)
│                        _touchBucket(genres, genre, 3.4 × 2.8)
│                        _touchBucket(tokens, token, 3.4 × 0.3)
└── Al ver info:        registerAnime(anime, 1)
                        _touchBucket(genres, peso × 2.2)
                        _touchBucket(tokens, peso × 0.15)

SCORING (Recommendations.scoreAnime):
score = 0
+ por cada género del anime en profile.genres:   genres[g] × 2.0
+ por cada token del anime en profile.tokens:     tokens[t] × 0.55
+ si type matches:                                types[t] × 0.9
+ si status matches:                              statuses[s] × 0.5
+ si está en biblioteca:                          +4.5
+ si está en historial:                           +2.5 + recencyBoost × 2.0
                                                  (boost: 0–1 según días)
+ por cantidad de episodios:                      min(lastEp/100, 0.8)

RANKING:
items.map(i => ({ ...i, __score: scoreAnime(i) }))
     .sort((a,b) => b.__score - a.__score || a.__shuffle - b.__shuffle)
     .slice(0, 12)
```

---

## 8.4 · Ciclo de Vida de la Caché Cliente

```
API.fetch(endpoint, params)
│
├── buildRequestKey() → URL canónica sin params vacíos
│
├── ¿nocache=true?
│   └── SÍ → bypass completo, añade timestamp a URL
│
├── ¿requestCache.has(url)?
│   └── SÍ → return cached (hit de memoria)
│
├── ¿pendingRequests.has(url)?
│   └── SÍ → return await mismo Promise (deduplicación)
│
├── fetch(url, { cache: 'no-store' })
│
├── requestCache.set(url, data)
│   └── setTimeout(delete, 3 minutos)
│
└── pendingRequests.delete(url) [en finally]
```

---

---

# 📄 PÁGINA 09 — SEGURIDAD Y RIESGOS LEGALES

---

## 9.1 · Análisis de Seguridad Técnica

### 🔴 Riesgo Alto — CORS Abierto

```javascript
app.use(cors()); // Permite cualquier origen
```

**Impacto:** Cualquier sitio web puede hacer fetch() a tu API. Un atacante puede crear un sitio que consuma tu backend masivamente sin tu conocimiento, agotando recursos y bandwidth.

**Mitigación:** Whitelist de orígenes permitidos (ver Página 03).

---

### 🔴 Riesgo Alto — Sin Rate Limiting

No existe ningún límite de solicitudes por IP o por usuario. Un bot puede hacer 10,000 peticiones por minuto al `/api/search`, lo que:
- Agota el caché del servidor
- Genera carga masiva en AnimeFLV (posible ban de IP)
- Consume recursos del servidor sin control

**Mitigación:** `express-rate-limit` (ver Página 03).

---

### 🟠 Riesgo Moderado — Sin validación de input en búsqueda

```javascript
const query = q.trim().substring(0, 100); // Solo limita longitud
```

El query se pasa directamente a `encodeURIComponent(query)` en la URL de AnimeFLV. No hay sanitización contra payloads que puedan:
- Generar URLs malformadas
- Hacer request splitting (aunque encodeURIComponent previene la mayoría)

---

### 🟠 Riesgo Moderado — ContentSecurityPolicy desactivada

```javascript
app.use(helmet({ contentSecurityPolicy: false }));
```

CSP fue desactivada explícitamente. Esto es necesario para que los iframes de video funcionen, pero significa que la aplicación es vulnerable a inyección de scripts si hay algún XSS presente (ver Error C-05).

---

### 🟡 Riesgo Bajo — Historial y biblioteca sin cifrado

Los datos de localStorage se almacenan en texto plano en el navegador. No es un riesgo crítico para esta app (no hay datos sensibles como contraseñas), pero si se añaden cuentas de usuario en el futuro, esto debe revisarse.

---

### 🟡 Riesgo Bajo — User-Agent spoofing

```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...'
```

El servidor simula ser un navegador Chrome para el scraping. Si AnimeFLV detecta el patrón de acceso (muchas peticiones del mismo IP sin comportamiento humano), puede bloquear la IP del servidor.

---

## 9.2 · Análisis de Riesgos Legales

### ⚠️ Advertencia Legal — Web Scraping sin autorización

La aplicación realiza scraping de `www3.animeflv.net` sin ningún acuerdo formal. Los Términos de Servicio de la mayoría de sitios web **prohíben explícitamente** el scraping automatizado. Esto puede resultar en:

- **Bloqueo de IP del servidor** por parte de AnimeFLV
- **Acción legal** por violación de términos de servicio
- **Cesación y desistimiento** si el sitio lo requiere

### ⚠️ Advertencia Legal — Redistribución de contenido con copyright

El anime es contenido con derechos de autor. AnimeFLV redistribuye contenido que pertenece a estudios como Crunchyroll, Funimation, Netflix Anime, etc. Al actuar como proxy de AnimeFLV, esta aplicación participa en la cadena de redistribución no autorizada.

### ℹ️ Nota

Este análisis describe riesgos técnicos y legales existentes. Las decisiones sobre cómo proceder corresponden exclusivamente al desarrollador de la aplicación.

---

---

# 📄 PÁGINA 10 — RENDIMIENTO Y MÉTRICAS TÉCNICAS

---

## 10.1 · Análisis de Rendimiento del Frontend

### Carga inicial de la aplicación

| Recurso | Tamaño estimado | Impacto |
|---------|----------------|---------|
| `index.html` | ~8 KB | Bajo |
| `style.css` | ~35 KB | Medio |
| `script.js` | ~55 KB | Medio-Alto |
| Google Fonts (Inter) | ~30 KB | Bajo (preload) |
| **Total** | **~128 KB** | Aceptable para móvil |

Sin minificación ni bundling, el JS y CSS están sin comprimir. Con gzip en el servidor y minificación, el bundle podría reducirse a ~45 KB total.

---

### IntersectionObserver — Eficiencia del scroll infinito

```
Home Observer:
  rootMargin: '300px 0px 300px 0px'
  → Precarga con 300px de anticipación (buena práctica)
  → Carga 2 secciones por batch

Category Observer:
  rootMargin: '0px 0px 300px 0px'
  → Precarga 300px antes del final (buena práctica)
  → Carga página por página
```

**Evaluación:** Implementación correcta y eficiente. El `Promise.allSettled()` garantiza que un error en una sección no bloquee las demás.

---

### Caché cliente — Eficiencia

```
TTL: 3 minutos en memoria
Estrategia: Cache-First con bypass manual (nocache=true)
Deduplicación: Map de pendingRequests evita N requests simultáneos a la misma URL
```

**Escenario típico:** Si 3 secciones piden `/api/latest` simultáneamente, solo se hace **1 petición HTTP** al servidor gracias al sistema de `pendingRequests`.

---

## 10.2 · Análisis de Rendimiento del Backend

### Throughput estimado por endpoint

| Endpoint | Tiempo sin caché | Tiempo con caché | Carga AnimeFLV |
|----------|-----------------|-----------------|----------------|
| `/api/latest` | ~800–2000ms | ~1ms | 1 HTTP request |
| `/api/trending` | ~600–1500ms | ~1ms | 1 HTTP request |
| `/api/genre/:g` | ~700–1800ms | ~1ms | 1 HTTP request |
| `/api/search` | ~600–1500ms | ~1ms | 1 HTTP request |
| `/api/info/:id` | ~800–2500ms | ~1ms | 1 HTTP request |
| `/api/video/:id/:cap` | ~1000–3000ms | ~1ms | 1 HTTP request |

El sistema de caché es fundamental. Sin él, cada usuario generaría docenas de requests a AnimeFLV por sesión.

---

### Estimación de uso de memoria del caché servidor

```
Típico por entrada de caché:
- latest/trending: ~5–15 KB (lista de 20 animes normalizada)
- info: ~10–30 KB (con episodios completos)
- video: ~2–5 KB (lista de 10 servidores)

Con 100 entradas activas (uso normal):
- Estimado: 1–3 MB de RAM
- Sin límite de tamaño implementado → riesgo de memory leak a largo plazo
```

**Problema detectado:** La caché en memoria (`new Map()`) **no tiene límite de entradas**. Si el servidor corre durante días con muchos usuarios, la caché puede crecer indefinidamente hasta agotar la memoria RAM del proceso.

**Solución recomendada:** Implementar LRU (Least Recently Used) o un límite máximo:

```javascript
const MAX_CACHE_SIZE = 500;

const cacheSet = (key, data) => {
    if (cache.size >= MAX_CACHE_SIZE) {
        // Eliminar la entrada más antigua
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
    cache.set(key, { data, timestamp: Date.now() });
};
```

---

## 10.3 · Puntos de Falla del Sistema

```
PUNTO DE FALLA #1: AnimeFLV cambia su HTML
Probabilidad: Alta (los sitios actualizan su HTML regularmente)
Impacto: Total (toda la extracción de datos falla silenciosamente)
Detección: Solo al ver que la app devuelve listas vacías
Mitigación: Tests automáticos de scraping + alertas por email

PUNTO DE FALLA #2: AnimeFLV bloquea la IP del servidor
Probabilidad: Media (sin rate limiting propio)
Impacto: Total (todas las peticiones dan 403/503)
Mitigación: Rate limiting + rotación de IPs o proxies

PUNTO DE FALLA #3: Servidor de video externo cae
Probabilidad: Alta (servidores de terceros son inestables)
Impacto: Parcial (el selector permite cambiar de servidor)
Mitigación: Ya existe selección manual de servidor (bien)

PUNTO DE FALLA #4: Memoria RAM agotada (caché sin límite)
Probabilidad: Media (en producción con muchos usuarios)
Impacto: Crash del servidor Node.js
Mitigación: LRU cache con límite de entradas
```

---

## 10.4 · Resumen Ejecutivo de Métricas

| Métrica | Valor | Rating |
|---------|-------|--------|
| Líneas totales de código | ~2,900 | — |
| Módulos JS identificados | 12 | ✅ Bien modularizado |
| Endpoints API | 7 | ✅ Completo |
| Clases CSS únicas | ~85 | ✅ Manejable |
| Animaciones CSS | 6 | ✅ Pulido |
| Errores críticos | 5 | 🔴 Requieren atención |
| Errores moderados | 6 | 🟠 Planificar corrección |
| Errores menores | 4 | 🟡 Backlog |
| Sugerencias de mejora | 8 | 💡 Roadmap futuro |
| Cobertura de tests | 0% | ❌ Sin testing |
| Service Worker | No | ❌ PWA incompleta |
| Rate Limiting | No | 🔴 Urgente |
| Compresión gzip | No | 🟠 Recomendada |

---

```
╔══════════════════════════════════════════════════════════════════╗
║  📁 knoX — FIN DEL INFORME                                      ║
║  ─────────────────────────────────────────────────────────────   ║
║  AnimeSAO Pro v3.2.0 · Análisis completado                      ║
║  10 páginas · 4 archivos analizados · ~2,900 líneas revisadas   ║
╚══════════════════════════════════════════════════════════════════╝
```
