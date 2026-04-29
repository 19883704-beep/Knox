// script.js - AnimeSAO Pro Premium Experience v2
const API_BASE = '/api';
const SECTIONS_CONFIG = [
    { id: 'latest', title: 'Añadidos Recientemente', type: 'latest', endpoint: 'latest' },
    { id: 'trending', title: 'Animes Populares', type: 'trending', endpoint: 'trending' },
    { id: 'action', title: 'Acción', type: 'genre', endpoint: 'genre/accion' },
    { id: 'comedy', title: 'Comedia', type: 'genre', endpoint: 'genre/comedia' },
    { id: 'romance', title: 'Romance', type: 'genre', endpoint: 'genre/romance' },
    { id: 'fantasy', title: 'Fantasía', type: 'genre', endpoint: 'genre/fantasia' },
    { id: 'isekai', title: 'Isekai', type: 'genre', endpoint: 'genre/isekai' },
    { id: 'drama', title: 'Drama', type: 'genre', endpoint: 'genre/drama' },
    { id: 'shounen', title: 'Shounen', type: 'genre', endpoint: 'genre/shounen' },
    { id: 'mystery', title: 'Misterio', type: 'genre', endpoint: 'genre/misterio' }
];

// ==================== STATE ====================
const AppState = {
    library: JSON.parse(localStorage.getItem('anime_library') || '[]'),
    history: JSON.parse(localStorage.getItem('anime_history') || '[]'),
    userPreferences: JSON.parse(localStorage.getItem('anime_prefs') || '{}'),
    currentAnime: null,
    currentEpisode: null,
    currentServers: [],
    currentServerIndex: 0,
    playerProgress: {},
    homeSections: new Map(),
    homeLoading: false,
    homeInitialized: false,
    sectionsLoading: new Set(),
    sectionPageCache: new Map(),
    categoryType: null,
    categoryGenre: null,
    categoryPage: 1,
    categoryLoading: false,
    categoryHasMore: true,
    searchTimeout: null,
    searchCache: new Map(),
    playerLoading: false,
    playerError: null,
    seenAnimeIds: new Set(),
    toastTimer: null
};

// ==================== UTILITIES ====================
const $ = (id) => document.getElementById(id);

const showToast = (msg, duration = 2400) => {
    const toast = $('toast');
    if (!toast) return;

    clearTimeout(AppState.toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');

    AppState.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toast.textContent = '';
    }, duration);
};

const debounce = (fn, ms) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// ==================== RECOMENDACIONES ====================
const Recommendations = {
    updateWeights(genres) {
        if (!genres || !Array.isArray(genres)) return;
        genres.forEach(g => {
            const safeGen = g.toLowerCase().replace(/[^a-z0-9-]/g, '');
            AppState.userPreferences[safeGen] = (AppState.userPreferences[safeGen] || 0) + 1;
        });
        localStorage.setItem('anime_prefs', JSON.stringify(AppState.userPreferences));
    },
    
    getTopGenre() {
        const prefs = AppState.userPreferences;
        if (Object.keys(prefs).length === 0) return null;
        return Object.keys(prefs).reduce((a, b) => prefs[a] > prefs[b] ? a : b);
    }
};

// ==================== API ====================
const API = {
    requestCache: new Map(),
    
    async fetch(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE}/${endpoint}${queryString ? '?' + queryString : ''}`;
            
            if (params.nocache) {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            }

            if (this.requestCache.has(url)) {
                return this.requestCache.get(url);
            }
            
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            this.requestCache.set(url, data);
            setTimeout(() => this.requestCache.delete(url), 3 * 60 * 1000);
            
            return data;
        } catch (err) {
            console.error('[API Error]', err);
            return { success: false, error: err.message, data: null };
        }
    },

    getLatest(page = 1, nocache = false) {
        return this.fetch('latest', { page, nocache });
    },

    getTrending(nocache = false) {
        return this.fetch('trending', { nocache });
    },

    getGenre(genre, page = 1, nocache = false) {
        return this.fetch(`genre/${genre}`, { page, nocache });
    },

    search(query) {
        return this.fetch('search', { q: query });
    },

    getInfo(id) {
        const cleanId = id.replace('/anime/', '');
        return this.fetch(`info/${cleanId}`);
    },

    getVideo(id, cap) {
        const cleanId = id.replace('/anime/', '');
        return this.fetch(`video/${cleanId}/${cap}`);
    }
};

// ==================== UI BUILDER ====================
const UIBuilder = {
    buildCard(anime, isHistory = false) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const epTag = anime.lastEpisode && anime.lastEpisode !== '?' 
            ? `<div class="ep-tag">EP ${anime.lastEpisode}</div>` 
            : '';
        
        const historyItem = AppState.history.find(h => h.id === anime.id);
        const progress = historyItem && historyItem.progress && historyItem.duration
            ? (historyItem.progress / historyItem.duration) * 100
            : 0;
        
        const progressHtml = (isHistory && progress > 0) 
            ? `<div class="history-progress" style="width: ${Math.min(progress, 99)}%;"></div>` 
            : '';

        const coverUrl = anime.cover && anime.cover.length > 0 
            ? anime.cover 
            : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

        card.innerHTML = `
            <div class="card-img-wrapper">
                ${epTag}
                <img src="${coverUrl}" alt="${anime.title}" loading="lazy">
                ${progressHtml}
            </div>
            <div class="card-title">${anime.title}</div>
        `;
        
        const img = card.querySelector('img');
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            img.classList.add('loaded');
        });
        
        card.addEventListener('click', () => {
            DetailOverlay.open(anime.id);
        });
        
        return card;
    },

    renderHistorySection() {
        const container = $('continue-watching-container');
        if (AppState.history.length === 0) {
            container.innerHTML = '';
            return;
        }

        const section = document.createElement('div');
        section.className = 'home-section continue-watching-section';
        section.innerHTML = `
            <div class="home-section-header">
                <h2 class="home-section-title">Continuar Viendo</h2>
                <button class="btn-see-more">Ver todas</button>
            </div>
            <div class="row-scroll" id="history-row"></div>
        `;
        
        const row = section.querySelector('#history-row');
        AppState.history.slice(0, 10).forEach(item => {
            row.appendChild(this.buildCard(item, true));
        });
        
        section.querySelector('.btn-see-more').addEventListener('click', () => {
            Navigation.switchView('view-library');
        });
        
        container.innerHTML = '';
        container.appendChild(section);
    }
};

// ==================== HOME MANAGER ====================
const HomeManager = {
    async initializeSections(forceRefresh = false) {
        const content = $('home-content');
        if (forceRefresh) {
            content.innerHTML = '';
            AppState.homeSections.clear();
            AppState.homeInitialized = false;
            AppState.seenAnimeIds.clear();
            API.requestCache.clear();
            
            const topGenre = Recommendations.getTopGenre();
            const recCont = $('recommendations-container');
            if (topGenre && recCont) {
                const recConfig = { id: 'for_you', title: 'Recomendado Para Ti', type: 'genre', endpoint: `genre/${topGenre}` };
                recCont.innerHTML = '';
                const sec = this.createSectionElement(recConfig);
                recCont.appendChild(sec);
                AppState.homeSections.set(recConfig.id, { config: recConfig, element: sec, loaded: false, data: [] });
            }
        }

        if (AppState.homeInitialized) return;
        
        for (const config of SECTIONS_CONFIG) {
            const section = this.createSectionElement(config);
            content.appendChild(section);
            AppState.homeSections.set(config.id, {
                config,
                element: section,
                loaded: false,
                data: [],
                displayedCount: 0
            });
            AppState.sectionPageCache.set(config.id, forceRefresh ? Math.floor(Math.random() * 3) + 1 : 1);
        }
        
        AppState.homeInitialized = true;
        this.setupIntersectionObserver();
        await this.loadInitialSections(forceRefresh);
    },

    forceRefresh() {
        showToast('Actualizando catálogo...');
        const loader = $('home-loader');
        if (loader) loader.style.display = 'flex';
        this.initializeSections(true);
    },

    createSectionElement(config) {
        const section = document.createElement('div');
        section.className = 'home-section';
        section.id = `section-${config.id}`;
        section.innerHTML = `
            <div class="home-section-header">
                <h2 class="home-section-title">${config.title}</h2>
                <button class="btn-see-more">Ver más</button>
            </div>
            <div class="row-scroll" id="row-${config.id}"></div>
        `;
        
        const btn = section.querySelector('.btn-see-more');
        btn.addEventListener('click', () => {
            CategoryManager.open(config);
        });
        
        return section;
    },

    setupIntersectionObserver() {
        const rootEl = $('home-scroll');
        const sentinel = $('home-sentinel');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !AppState.homeLoading) {
                    this.loadNextSections();
                }
            });
        }, { 
            root: rootEl,
            rootMargin: '300px 0px 300px 0px'
        });

        if (sentinel) {
            observer.observe(sentinel);
        }
    },

    // AQUI SE APLICÓ EL FIX PARA EL LOADER INFINITO
    async loadInitialSections(nocache = false) {
        const unloaded = Array.from(AppState.homeSections.values())
            .filter(s => !s.loaded)
            .slice(0, 3);
        
        if (unloaded.length === 0) {
            const loader = $('home-loader');
            if (loader) loader.style.display = 'none';
            return;
        }
        
        AppState.homeLoading = true;
        const promises = unloaded.map(section => this.loadSection(section.config.id, nocache));
        await Promise.allSettled(promises);
        
        const loader = $('home-loader');
        if (loader) loader.style.display = 'none';
        AppState.homeLoading = false;
    },

    // AQUI SE APLICÓ EL FIX PARA EL LOADER INFINITO
    async loadNextSections() {
        const unloaded = Array.from(AppState.homeSections.values())
            .filter(s => !s.loaded);
        
        if (unloaded.length === 0) {
            const loader = $('home-loader');
            if (loader) loader.style.display = 'none';
            return;
        }
        
        AppState.homeLoading = true;
        const batchSize = 2;
        const batch = unloaded.slice(0, batchSize);
        const promises = batch.map(section => this.loadSection(section.config.id));
        
        await Promise.allSettled(promises);
        AppState.homeLoading = false;
    },

    async loadSection(sectionId, nocache = false) {
        const section = AppState.homeSections.get(sectionId);
        if (!section) return;

        if (AppState.sectionsLoading.has(sectionId)) return;
        AppState.sectionsLoading.add(sectionId);

        try {
            const { config } = section;
            let data;
            
            if (config.type === 'latest') {
                const page = AppState.sectionPageCache.get(sectionId) || 1;
                data = await API.getLatest(page, nocache);
                AppState.sectionPageCache.set(sectionId, (page % 5) + 1);
            } else if (config.type === 'trending') {
                data = await API.getTrending(nocache);
            } else if (config.type === 'genre') {
                const genre = config.endpoint.split('/')[1];
                const page = AppState.sectionPageCache.get(sectionId) || 1;
                data = await API.getGenre(genre, page, nocache);
                AppState.sectionPageCache.set(sectionId, (page % 3) + 1);
            }

            section.loaded = true;

            if (data && data.success && data.data && data.data.length > 0) {
                let displayData = nocache ? shuffleArray([...data.data]) : data.data;
                
                section.data = displayData;
                const row = $(`row-${sectionId}`);
                if (row) {
                    row.innerHTML = '';
                    const filteredItems = [];
                    for (const item of displayData) {
                        if (!AppState.seenAnimeIds.has(item.id) && filteredItems.length < 15) {
                            AppState.seenAnimeIds.add(item.id);
                            filteredItems.push(item);
                        }
                    }
                    
                    filteredItems.forEach((item, idx) => {
                        const card = UIBuilder.buildCard(item);
                        card.style.animationDelay = `${idx * 0.05}s`;
                        row.appendChild(card);
                    });
                }
            } else {
                if (section.element) section.element.style.display = 'none';
            }
        } catch (err) {
            console.error('[HomeManager] Error cargando sección:', err);
            section.loaded = true;
            if (section.element) section.element.style.display = 'none';
        } finally {
            AppState.sectionsLoading.delete(sectionId);
        }
    }
};

// ==================== CATEGORY MANAGER ====================
const CategoryManager = {
    open(config) {
        AppState.categoryType = config.type;
        AppState.categoryGenre = config.type === 'genre' ? config.endpoint.split('/')[1] : null;
        AppState.categoryPage = 1;
        AppState.categoryHasMore = true;

        $('category-title').textContent = config.title;
        $('category-grid').innerHTML = '';
        
        Navigation.switchView('view-category');
        this.loadMore();
    },

    async loadMore() {
        if (AppState.categoryLoading || !AppState.categoryHasMore) return;
        
        AppState.categoryLoading = true;
        const loader = $('category-loader');
        if (loader) loader.style.display = 'flex';

        try {
            let data;
            if (AppState.categoryType === 'latest') {
                data = await API.getLatest(AppState.categoryPage);
            } else if (AppState.categoryType === 'trending') {
                data = await API.getTrending();
                AppState.categoryHasMore = false;
            } else if (AppState.categoryType === 'genre' && AppState.categoryGenre) {
                data = await API.getGenre(AppState.categoryGenre, AppState.categoryPage);
            } else {
                data = { success: false, data: [] };
            }

            if (data.success && data.data && data.data.length > 0) {
                const grid = $('category-grid');
                data.data.forEach((item, idx) => {
                    const card = UIBuilder.buildCard(item);
                    card.style.animationDelay = `${(idx % 20) * 0.05}s`;
                    grid.appendChild(card);
                });
                
                AppState.categoryPage++;
                if (data.data.length < 20) {
                    AppState.categoryHasMore = false;
                }
            } else {
                AppState.categoryHasMore = false;
            }
        } catch (err) {
            console.error('[CategoryManager] Error cargando más:', err);
            showToast('Error al cargar más');
            AppState.categoryHasMore = false;
        } finally {
            AppState.categoryLoading = false;
            if (loader) {
                loader.style.display = AppState.categoryHasMore ? 'flex' : 'none';
            }
        }
    },

    setupScroll() {
        const scrollEl = $('category-scroll');
        const sentinel = $('category-sentinel');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !AppState.categoryLoading && AppState.categoryHasMore) {
                    this.loadMore();
                }
            });
        }, { root: scrollEl, rootMargin: '0px 0px 300px 0px' });
        
        if (sentinel) {
            observer.observe(sentinel);
        }
    }
};

// ==================== DETAIL OVERLAY ====================
const DetailOverlay = {
    resetVisuals() {
        const titleEl = $('detail-title');
        const coverEl = $('detail-cover');
        const backdropEl = $('detail-backdrop');
        const synopsisEl = $('detail-synopsis');
        const statusEl = $('detail-status');
        const epCountEl = $('detail-ep-count');
        const genresCont = $('detail-genres');
        const episodesCont = $('detail-episodes');

        if(titleEl) titleEl.textContent = 'Cargando...';
        if(coverEl) coverEl.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        if(backdropEl) backdropEl.style.backgroundImage = 'none';
        if(synopsisEl) synopsisEl.textContent = '';
        if(statusEl) statusEl.textContent = '...';
        if(epCountEl) epCountEl.textContent = '0';
        if(genresCont) genresCont.innerHTML = '';
        if(episodesCont) episodesCont.innerHTML = '';
        
        const btn = $('btn-library');
        if(btn) btn.classList.remove('active');
    },

    async open(animeId) {
        const overlay = $('overlay-detail');
        overlay.classList.add('active');
        
        this.resetVisuals();

        const loading = $('detail-loading');
        const loaded = $('detail-loaded');
        if (loading) loading.style.display = 'flex';
        if (loaded) loaded.style.opacity = '0';

        try {
            const data = await API.getInfo(animeId);
            if (!data.success || !data.data) {
                throw new Error(data.error || 'No se encontró el anime');
            }

            const anime = data.data;
            AppState.currentAnime = anime;
            
            if(anime.genres) Recommendations.updateWeights(anime.genres);

            if (loading) loading.style.display = 'none';
            await delay(50);
            if (loaded) loaded.style.opacity = '1';
            this.render(anime);
        } catch (err) {
            console.error('[DetailOverlay] Error:', err);
            showToast('Anime no encontrado');
            this.close();
        }
    },

    render(anime) {
        const titleEl = $('detail-title');
        const coverEl = $('detail-cover');
        const backdropEl = $('detail-backdrop');
        const synopsisEl = $('detail-synopsis');
        const statusEl = $('detail-status');
        const epCountEl = $('detail-ep-count');

        if (titleEl) titleEl.textContent = anime.title;
        if (coverEl) {
            coverEl.src = anime.cover || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            coverEl.onerror = function() {
                this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            };
        }
        if (backdropEl) {
            backdropEl.style.backgroundImage = `url(${anime.cover || ''})`;
        }
        if (synopsisEl) synopsisEl.textContent = anime.synopsis || 'Sin sinopsis disponible';
        if (statusEl) statusEl.textContent = anime.status || 'Desconocido';
        if (epCountEl) epCountEl.textContent = anime.episodes?.length || 0;

        const genresCont = $('detail-genres');
        if (genresCont) {
            genresCont.innerHTML = '';
            (anime.genres || []).forEach((g, idx) => {
                const span = document.createElement('span');
                span.textContent = g;
                span.style.animationDelay = `${idx * 0.05}s`;
                genresCont.appendChild(span);
            });
        }

        const episodesCont = $('detail-episodes');
        if (episodesCont) {
            episodesCont.innerHTML = '';
            
            if (!anime.episodes || anime.episodes.length === 0) {
                const msg = document.createElement('div');
                msg.className = 'empty-state-premium';
                msg.textContent = 'No se encontraron episodios.';
                episodesCont.appendChild(msg);
            } else {
                anime.episodes.forEach((ep, idx) => {
                    const row = document.createElement('div');
                    row.className = 'ep-row';
                    row.style.animationDelay = `${idx * 0.02}s`;
                    
                    const historyItem = AppState.history.find(h => h.id === anime.id);
                    const isWatched = historyItem && historyItem.lastEp === ep.number;
                    
                    row.innerHTML = `
                        <span class="ep-number">Episodio ${ep.number}${isWatched ? ' ✓' : ''}</span>
                        <span class="ep-play">▶</span>
                    `;
                    row.addEventListener('click', () => {
                        PlayerOverlay.open(ep.number);
                    });
                    episodesCont.appendChild(row);
                });
            }
        }

        this.updateLibraryBtn();
    },

    updateLibraryBtn() {
        const btn = $('btn-library');
        if(!AppState.currentAnime || !btn) return;
        const isSaved = AppState.library.some(a => a.id === AppState.currentAnime.id);
        
        if (isSaved) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    },

    close() {
        const overlay = $('overlay-detail');
        if (overlay) overlay.classList.remove('active');
    }
};

// ==================== PLAYER OVERLAY ====================
const PlayerOverlay = {
    retryCount: 0,
    maxRetries: 3,
    
    async open(epNumber) {
        if (!AppState.currentAnime) return;
        
        AppState.currentEpisode = epNumber;
        AppState.currentServerIndex = 0;
        this.retryCount = 0;
        
        const overlay = $('overlay-player');
        if (overlay) overlay.classList.add('active');
        
        const titleEl = $('player-title');
        const episodeEl = $('player-episode-info');
        const iframeEl = $('player-iframe');
        
        if (titleEl) titleEl.textContent = AppState.currentAnime.title;
        if (episodeEl) episodeEl.textContent = `Episodio ${epNumber}`;
        if (iframeEl) iframeEl.src = '';
        
        const loader = $('player-loader');
        if (loader) loader.style.display = 'flex';
        
        const error = $('player-error');
        if (error) error.classList.add('hidden');
        
        const serverSelector = $('server-selector');
        if (serverSelector) serverSelector.innerHTML = '';

        try {
            const data = await API.getVideo(AppState.currentAnime.id, epNumber);
            
            if (!data.success || !data.data || !data.data.servers || data.data.servers.length === 0) {
                throw new Error('No se encontraron servidores');
            }

            AppState.currentServers = data.data.servers;
            this.renderServers();
            this.loadServer(0);
            this.updateNavigation();
        } catch (err) {
            console.error('[PlayerOverlay] Error:', err);
            this.showError('No se pudo cargar el video');
            this.updateNavigation();
        }
    },

    renderServers() {
        const selector = $('server-selector');
        if (!selector) return;
        
        selector.innerHTML = '';
        AppState.currentServers.forEach((server, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${server.name || `Servidor ${idx + 1}`}`;
            selector.appendChild(opt);
        });
        selector.addEventListener('change', (e) => {
            this.loadServer(parseInt(e.target.value, 10));
        });
    },

    loadServer(index) {
        const server = AppState.currentServers[index];
        if (!server) return;
        
        AppState.currentServerIndex = index;
        const loader = $('player-loader');
        const error = $('player-error');
        
        if (loader) loader.style.display = 'none';
        if (error) error.classList.add('hidden');
        
        const iframe = $('player-iframe');
        if (!iframe) return;

        iframe.onload = () => {
            if (AppState.currentAnime && AppState.currentEpisode) {
                this.saveToHistory(AppState.currentAnime, AppState.currentEpisode);
            }
        };
        
        iframe.onerror = () => {
            if (this.retryCount < this.maxRetries - 1) {
                this.retryCount++;
                setTimeout(() => {
                    this.loadServer(AppState.currentServerIndex);
                }, 1000);
            } else {
                this.showError('Servidor no disponible. Intenta otro.');
            }
        };
        
        iframe.src = server.url;
    },

    showError(message) {
        const loader = $('player-loader');
        const error = $('player-error');
        
        if (loader) loader.style.display = 'none';
        if (error) {
            error.classList.remove('hidden');
            const msgEl = error.querySelector('.error-message');
            if (msgEl) msgEl.textContent = message;
        }
        
        const btnRetry = $('btn-retry');
        if (btnRetry) {
            btnRetry.onclick = () => {
                this.retryCount = 0;
                this.loadServer(AppState.currentServerIndex);
            };
        }
    },

    updateNavigation() {
        const eps = AppState.currentAnime?.episodes || [];
        const canGoPrev = eps.some(e => e.number === AppState.currentEpisode - 1);
        const canGoNext = eps.some(e => e.number === AppState.currentEpisode + 1);

        const btnPrev = $('btn-prev-ep');
        const btnNext = $('btn-next-ep');
        
        if (btnPrev) {
            btnPrev.disabled = !canGoPrev;
            btnPrev.onclick = () => {
                if (canGoPrev) this.open(AppState.currentEpisode - 1);
            };
        }
        if (btnNext) {
            btnNext.disabled = !canGoNext;
            btnNext.onclick = () => {
                if (canGoNext) this.open(AppState.currentEpisode + 1);
            };
        }
    },

    saveToHistory(anime, episode) {
        const now = Date.now();
        const existingIndex = AppState.history.findIndex(h => h.id === anime.id);
        
        const historyItem = {
            id: anime.id,
            title: anime.title,
            cover: anime.cover,
            lastEp: episode,
            progress: 0,
            duration: 100,
            timestamp: now,
            lastUpdated: now
        };

        if (existingIndex > -1) {
            AppState.history.splice(existingIndex, 1);
        }
        
        AppState.history.unshift(historyItem);
        AppState.history = AppState.history.slice(0, 100);
        
        localStorage.setItem('anime_history', JSON.stringify(AppState.history));
        UIBuilder.renderHistorySection();
    },

    close() {
        const overlay = $('overlay-player');
        const iframe = $('player-iframe');
        
        if (overlay) overlay.classList.remove('active');
        if (iframe) iframe.src = '';
    }
};

// ==================== SEARCH ====================
const Search = {
    setup() {
        const input = $('search-input');
        const clear = $('search-clear');
        const message = $('search-message');
        const grid = $('search-grid');

        if (!input) return;

        input.addEventListener('input', debounce((e) => {
            const q = e.target.value.trim();
            
            if (clear) clear.classList.toggle('hidden', q.length === 0);

            if (q.length < 3) {
                if (grid) grid.innerHTML = '';
                if (message) message.style.display = 'flex';
                return;
            }

            this.execute(q);
        }, 400));

        if (clear) {
            clear.addEventListener('click', () => {
                input.value = '';
                if (grid) grid.innerHTML = '';
                clear.classList.add('hidden');
                if (message) message.style.display = 'flex';
            });
        }
    },

    async execute(query) {
        const message = $('search-message');
        const grid = $('search-grid');
        const loader = $('search-loader');

        if (message) message.style.display = 'none';
        if (loader) loader.classList.remove('hidden');

        try {
            const data = await API.search(query);
            
            if (!data.success || !data.data || data.data.length === 0) {
                if (message) {
                    message.innerHTML = '<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="opacity:0.5"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><p>No se encontraron resultados</p>';
                    message.style.display = 'flex';
                }
                if (grid) grid.innerHTML = '';
            } else {
                if (grid) {
                    grid.innerHTML = '';
                    data.data.forEach((item, idx) => {
                        const card = UIBuilder.buildCard(item);
                        card.style.animationDelay = `${idx * 0.05}s`;
                        grid.appendChild(card);
                    });
                }
            }
        } catch (err) {
            console.error('[Search] Error:', err);
            if (message) {
                message.innerHTML = '<svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="opacity:0.5"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><p>Error al buscar</p>';
                message.style.display = 'flex';
            }
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    }
};

// ==================== LIBRARY ====================
const Library = {
    render() {
        const grid = $('library-grid');
        const empty = $('library-empty');

        if (!grid) return;

        grid.innerHTML = '';
        
        if (AppState.library.length === 0) {
            if (empty) empty.style.display = 'flex';
        } else {
            if (empty) empty.style.display = 'none';
            AppState.library.forEach((item, idx) => {
                const card = UIBuilder.buildCard(item);
                card.style.animationDelay = `${idx * 0.05}s`;
                grid.appendChild(card);
            });
        }
    },

    toggle(anime) {
        const idx = AppState.library.findIndex(a => a.id === anime.id);
        
        if (idx > -1) {
            AppState.library.splice(idx, 1);
            showToast('Eliminado de la biblioteca');
        } else {
            AppState.library.push({
                id: anime.id,
                title: anime.title,
                cover: anime.cover
            });
            showToast('Guardado en la biblioteca');
        }

        if(anime.genres) Recommendations.updateWeights(anime.genres);
        localStorage.setItem('anime_library', JSON.stringify(AppState.library));
        DetailOverlay.updateLibraryBtn();
        this.render();
    },

    setup() {
        const btn = $('btn-library');
        if (btn) {
            btn.addEventListener('click', () => {
                if (AppState.currentAnime) {
                    this.toggle(AppState.currentAnime);
                }
            });
        }
    }
};

// ==================== NAVIGATION ====================
const Navigation = {
    setup() {
        document.querySelectorAll('.nav-item-premium').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                if (target === 'view-home' && $('view-home').classList.contains('active')) {
                    HomeManager.forceRefresh();
                    return;
                }
                this.switchView(target);
            });
        });

        const btnBackCat = $('btn-back-category');
        if (btnBackCat) {
            btnBackCat.addEventListener('click', () => {
                this.switchView('view-home');
            });
        }

        const btnCloseDetail = $('btn-close-detail');
        if (btnCloseDetail) {
            btnCloseDetail.addEventListener('click', () => {
                DetailOverlay.close();
            });
        }

        const btnClosePlayer = $('btn-close-player');
        if (btnClosePlayer) {
            btnClosePlayer.addEventListener('click', () => {
                PlayerOverlay.close();
            });
        }
    },

    switchView(target) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        const targetEl = $(target);
        if (targetEl) targetEl.classList.add('active');

        document.querySelectorAll('.nav-item-premium').forEach(n => {
            n.classList.remove('active');
        });
        const navBtn = document.querySelector(`[data-target="${target}"]`);
        if (navBtn) navBtn.classList.add('active');
    }
};

// ==================== SETTINGS ====================
const Settings = {
    setup() {
        const btn = $('btn-clear-cache');
        if (btn) {
            btn.addEventListener('click', () => {
                if (confirm('¿Limpiar todos los datos locales? (Biblioteca e Historial)')) {
                    localStorage.clear();
                    location.reload();
                }
            });
        }
    }
};

// ==================== SMART ENHANCEMENTS ====================
const normalizeText = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const uniqueById = (items = []) => {
    const seen = new Set();
    return items.filter(item => {
        const id = item && item.id ? String(item.id) : '';
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const hashString = (input = '') => {
    let hash = 0;
    const str = String(input);
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const getRandomSeed = (label = '') => hashString(`${label}:${Date.now()}:${Math.random()}`);

const buildAnimeTokens = (anime = {}) => {
    const pieces = [
        anime.title,
        anime.synopsis,
        anime.status,
        anime.type,
        ...(anime.genres || []),
        ...(anime.tags || [])
    ].filter(Boolean);

    const tokens = new Set();
    pieces.forEach(piece => {
        normalizeText(piece).split(' ').forEach(word => {
            if (word.length >= 3 && !['anime', 'episodio', 'capitulo', 'online', 'sub', 'dub'].includes(word)) {
                tokens.add(word);
            }
        });
    });
    return Array.from(tokens).slice(0, 40);
};

const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

Recommendations.profileKey = 'anime_reco_profile_v2';
Recommendations._loadProfile = function () {
    try {
        const profile = JSON.parse(localStorage.getItem(this.profileKey) || '{}');
        return {
            genres: profile.genres || {},
            tokens: profile.tokens || {},
            types: profile.types || {},
            statuses: profile.statuses || {},
            favorites: profile.favorites || {},
            views: profile.views || {},
            lastUpdated: profile.lastUpdated || Date.now()
        };
    } catch {
        return { genres: {}, tokens: {}, types: {}, statuses: {}, favorites: {}, views: {}, lastUpdated: Date.now() };
    }
};
Recommendations._saveProfile = function (profile) {
    profile.lastUpdated = Date.now();
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
};
Recommendations._touchBucket = function (bucket, key, weight = 1) {
    if (!key) return;
    bucket[key] = (bucket[key] || 0) + weight;
};
Recommendations.registerAnime = function (anime, weight = 1) {
    if (!anime || !anime.id) return;
    const profile = this._loadProfile();
    (anime.genres || []).forEach(genre => this._touchBucket(profile.genres, normalizeText(genre), weight * 2.2));
    (anime.type ? [anime.type] : []).forEach(type => this._touchBucket(profile.types, normalizeText(type), weight * 0.7));
    (anime.status ? [anime.status] : []).forEach(status => this._touchBucket(profile.statuses, normalizeText(status), weight * 0.5));
    buildAnimeTokens(anime).forEach(token => this._touchBucket(profile.tokens, token, weight * 0.15));
    this._touchBucket(profile.views, anime.id, weight);
    this._saveProfile(profile);
};
Recommendations.registerFavorite = function (anime, isFavorite = true) {
    if (!anime || !anime.id) return;
    const profile = this._loadProfile();
    const weight = isFavorite ? 3.4 : 1.2;
    (anime.genres || []).forEach(genre => this._touchBucket(profile.genres, normalizeText(genre), weight * 2.8));
    buildAnimeTokens(anime).forEach(token => this._touchBucket(profile.tokens, token, weight * 0.3));
    this._touchBucket(profile.favorites, anime.id, isFavorite ? 1 : -1);
    this._saveProfile(profile);
};
Recommendations.updateWeights = function (genres, anime = null, weight = 1) {
    if (!Array.isArray(genres) || genres.length === 0) return;
    const profile = this._loadProfile();
    genres.forEach(genre => this._touchBucket(profile.genres, normalizeText(genre), weight * 1.8));
    if (anime) {
        this.registerAnime(anime, weight * 0.8);
    } else {
        this._saveProfile(profile);
    }
};
Recommendations.getTopSignals = function () {
    const profile = this._loadProfile();
    const topGenres = Object.entries(profile.genres).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const topTokens = Object.entries(profile.tokens).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    return { topGenres, topTokens };
};
Recommendations.getProfile = function () {
    return this._loadProfile();
};
Recommendations.scoreAnime = function (anime) {
    if (!anime || !anime.id) return 0;
    const profile = this._loadProfile();
    const titleTokens = buildAnimeTokens(anime);
    const normalizedGenres = (anime.genres || []).map(genre => normalizeText(genre));
    const normalizedType = normalizeText(anime.type || '');
    const normalizedStatus = normalizeText(anime.status || '');
    let score = 0;

    normalizedGenres.forEach(genre => {
        score += profile.genres[genre] ? profile.genres[genre] * 2.0 : 0;
    });

    titleTokens.forEach(token => {
        score += profile.tokens[token] ? profile.tokens[token] * 0.55 : 0;
    });

    if (normalizedType && profile.types[normalizedType]) {
        score += profile.types[normalizedType] * 0.9;
    }

    if (normalizedStatus && profile.statuses[normalizedStatus]) {
        score += profile.statuses[normalizedStatus] * 0.5;
    }

    if (AppState.library.some(item => item.id === anime.id)) {
        score += 4.5;
    }

    const historyItem = AppState.history.find(item => item.id === anime.id);
    if (historyItem) {
        const recencyBoost = Math.max(0, 1 - ((Date.now() - (historyItem.lastUpdated || historyItem.timestamp || 0)) / (1000 * 60 * 60 * 24 * 14)));
        score += 2.5 + recencyBoost * 2;
    }

    const lastEpisode = safeNumber(anime.lastEpisode, 0);
    if (lastEpisode > 0) {
        score += Math.min(lastEpisode / 100, 0.8);
    }

    return score;
};
Recommendations.rankItems = function (items = []) {
    return uniqueById(items)
        .map(item => ({ ...item, __score: this.scoreAnime(item), __shuffle: hashString(item.id || item.title || '') }))
        .sort((a, b) => {
            if (b.__score !== a.__score) return b.__score - a.__score;
            return a.__shuffle - b.__shuffle;
        })
        .map(({ __score, __shuffle, ...item }) => item);
};

const buildRequestKey = (endpoint, params = {}) => {
    const clean = {};
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === false || v === '') return;
        clean[k] = v;
    });
    const qs = new URLSearchParams(clean).toString();
    return `${API_BASE}/${endpoint}${qs ? '?' + qs : ''}`;
};

API.pendingRequests = new Map();
API.fetch = async function (endpoint, params = {}) {
    const clean = {};
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === false || v === '') return;
        clean[k] = v;
    });
    const requestKey = buildRequestKey(endpoint, clean);
    const bypass = clean.nocache === true || clean.nocache === 'true';

    try {
        if (!bypass && this.requestCache.has(requestKey)) {
            return this.requestCache.get(requestKey);
        }
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const requestPromise = (async () => {
            const url = bypass ? `${requestKey}${requestKey.includes('?') ? '&' : '?'}_=${Date.now()}` : requestKey;
            const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!bypass) {
                this.requestCache.set(requestKey, data);
                setTimeout(() => this.requestCache.delete(requestKey), 3 * 60 * 1000);
            }
            return data;
        })();

        this.pendingRequests.set(requestKey, requestPromise);
        return await requestPromise;
    } catch (err) {
        console.error('[API Error]', err);
        return { success: false, error: err.message, data: null };
    } finally {
        this.pendingRequests.delete(requestKey);
    }
};
API.clearCaches = function () {
    this.requestCache.clear();
    this.pendingRequests.clear();
};

HomeManager.getAllLoadedItems = function () {
    const items = [];
    AppState.homeSections.forEach(section => {
        if (Array.isArray(section.data)) items.push(...section.data);
    });
    if (items.length === 0) {
        items.push(...AppState.history, ...AppState.library);
    }
    return uniqueById(items);
};

HomeManager.renderPersonalizedSection = function () {
    const container = $('recommendations-container');
    if (!container) return;
    const { topGenres } = Recommendations.getTopSignals();
    const candidates = this.getAllLoadedItems();
    const ranked = Recommendations.rankItems(candidates).slice(0, 12);

    if (ranked.length === 0) {
        container.innerHTML = '';
        return;
    }

    const section = document.createElement('div');
    section.className = 'home-section recommendation-panel';
    section.innerHTML = `
        <div class="home-section-header">
            <h2 class="home-section-title">Para ti</h2>
            <button class="btn-see-more" id="btn-refresh-home">Refrescar</button>
        </div>
        <div class="recommendation-meta">
            <span class="mini-pill">${topGenres[0] ? `Género: ${topGenres[0]}` : 'Basado en tu actividad'}</span>
            <span class="mini-pill">${AppState.history.length} vistos</span>
            <span class="mini-pill">${AppState.library.length} favoritos</span>
        </div>
        <div class="row-scroll" id="personalized-row"></div>
    `;

    const row = section.querySelector('#personalized-row');
    ranked.forEach((item, idx) => {
        const card = UIBuilder.buildCard(item);
        card.style.animationDelay = `${idx * 0.04}s`;
        row.appendChild(card);
    });

    section.querySelector('#btn-refresh-home').addEventListener('click', () => {
        HomeManager.forceRefresh();
    });

    container.innerHTML = '';
    container.appendChild(section);
};

HomeManager.bindFilterChips = function () {
    document.querySelectorAll('[data-home-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-home-filter]').forEach(node => node.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.homeFilter;

            if (filter === 'recommended') {
                const rec = $('recommendations-container');
                if (rec) rec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.renderPersonalizedSection();
                return;
            }

            const targetSection = filter ? document.getElementById(`section-${filter}`) : null;
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                HomeManager.forceRefresh();
            }
        });
    });
};

const originalLibraryToggle = Library.toggle.bind(Library);
Library.toggle = function (anime) {
    const idx = AppState.library.findIndex(a => a.id === anime.id);
    originalLibraryToggle(anime);
    Recommendations.registerFavorite(anime, idx === -1);
};

const originalPlayerOpen = PlayerOverlay.open.bind(PlayerOverlay);
PlayerOverlay.open = async function (epNumber) {
    const token = (AppState.playerRequestId || 0) + 1;
    AppState.playerRequestId = token;
    const currentAnime = AppState.currentAnime;
    if (!currentAnime) return;

    AppState.currentEpisode = epNumber;
    AppState.currentServerIndex = 0;
    this.retryCount = 0;

    const overlay = $('overlay-player');
    if (overlay) overlay.classList.add('active');

    const titleEl = $('player-title');
    const episodeEl = $('player-episode-info');
    const iframeEl = $('player-iframe');
    if (titleEl) titleEl.textContent = currentAnime.title || 'Sin título';
    if (episodeEl) episodeEl.textContent = `Episodio ${epNumber}`;
    if (iframeEl) iframeEl.src = '';

    const loader = $('player-loader');
    if (loader) loader.style.display = 'flex';
    const error = $('player-error');
    if (error) error.classList.add('hidden');
    const serverSelector = $('server-selector');
    if (serverSelector) serverSelector.innerHTML = '';

    try {
        const data = await API.getVideo(currentAnime.id, epNumber);
        if (token !== AppState.playerRequestId) return;
        if (!data.success || !data.data || !data.data.servers || data.data.servers.length === 0) {
            throw new Error('No se encontraron servidores');
        }
        AppState.currentServers = data.data.servers;
        this.renderServers();
        this.loadServer(0);
        this.updateNavigation();
    } catch (err) {
        if (token !== AppState.playerRequestId) return;
        console.error('[PlayerOverlay] Error:', err);
        this.showError('No se pudo cargar el video');
        this.updateNavigation();
    }
};

const originalPlayerLoadServer = PlayerOverlay.loadServer.bind(PlayerOverlay);
PlayerOverlay.loadServer = function (index) {
    const token = AppState.playerRequestId || 0;
    const server = AppState.currentServers[index];
    if (!server) return;
    AppState.currentServerIndex = index;
    const loader = $('player-loader');
    const error = $('player-error');
    if (loader) loader.style.display = 'none';
    if (error) error.classList.add('hidden');
    const iframe = $('player-iframe');
    if (!iframe) return;

    iframe.onload = () => {
        if (token !== AppState.playerRequestId) return;
        if (AppState.currentAnime && AppState.currentEpisode) {
            this.saveToHistory(AppState.currentAnime, AppState.currentEpisode);
        }
    };

    iframe.onerror = () => {
        if (token !== AppState.playerRequestId) return;
        if (this.retryCount < this.maxRetries - 1) {
            this.retryCount++;
            setTimeout(() => { this.loadServer(AppState.currentServerIndex); }, 1000);
        } else {
            this.showError('Servidor no disponible. Intenta otro.');
        }
    };

    iframe.src = server.url;
};

PlayerOverlay.close = function () {
    AppState.playerRequestId = (AppState.playerRequestId || 0) + 1;
    const overlay = $('overlay-player');
    const iframe = $('player-iframe');
    if (overlay) overlay.classList.remove('active');
    if (iframe) iframe.src = '';
};

// ==================== APP INIT ====================
const App = {
    async init() {
        try {
            Navigation.setup();
            Library.setup();
            Library.render();
            Search.setup();
            Settings.setup();
            CategoryManager.setupScroll();
            
            if (HomeManager.bindFilterChips) HomeManager.bindFilterChips();
            
            UIBuilder.renderHistorySection();
            await HomeManager.initializeSections(false);
            
            HomeManager.renderPersonalizedSection();
            
            console.log('[AnimeSAO Pro] ✓ App initialized');
            console.log('[AnimeSAO Pro] ✓ Version: 3.2.0 Premium');
        } catch (err) {
            console.error('[App] Error en inicialización:', err);
            showToast('Error al inicializar');
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('anime_library', JSON.stringify(AppState.library));
    localStorage.setItem('anime_history', JSON.stringify(AppState.history));
});
