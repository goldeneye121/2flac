// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const convertBtn = document.getElementById('convertBtn');
const searchBtn = document.getElementById('searchBtn');
const urlInput = document.getElementById('urlInput');
const searchInput = document.getElementById('searchInput');
const statusMessage = document.getElementById('statusMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const sortSelect = document.getElementById('sortSelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const trendingGrid = document.getElementById('trendingGrid');
const tabs = document.querySelectorAll('.tab');
const trendingTabs = document.querySelectorAll('.trending-tab');
const musicModal = document.getElementById('musicModal');
const closeModal = document.getElementById('closeModal');
const musicDetails = document.getElementById('musicDetails');

// State Variables
let currentPage = 1;
let currentQuery = '';
let currentSort = 'relevance';
let isLoading = false;
let hasMoreResults = true;

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const platform = tab.getAttribute('data-platform');
        let placeholder = 'Tempel URL YouTube, Spotify, atau SoundCloud di sini...';
        
        if (platform === 'youtube') {
            placeholder = 'https://www.youtube.com/watch?v=... atau https://youtu.be/...';
        } else if (platform === 'spotify') {
            placeholder = 'https://open.spotify.com/track/... atau https://open.spotify.com/album/...';
        } else if (platform === 'soundcloud') {
            placeholder = 'https://soundcloud.com/...';
        }
        
        urlInput.placeholder = placeholder;
    });
});

// Trending Tabs
trendingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        trendingTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadTrending(tab.getAttribute('data-time'));
    });
});

// Modal Close
closeModal.addEventListener('click', () => {
    musicModal.style.display = 'none';
});

// Close modal when clicking outside
musicModal.addEventListener('click', (e) => {
    if (e.target === musicModal) {
        musicModal.style.display = 'none';
    }
});

// Show Status Message
function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    switch(type) {
        case 'success':
            statusMessage.classList.add('status-success');
            break;
        case 'error':
            statusMessage.classList.add('status-error');
            break;
        case 'warning':
            statusMessage.classList.add('status-warning');
            break;
        case 'info':
            statusMessage.classList.add('status-info');
            break;
    }
    
    statusMessage.style.display = 'block';
    
    // Auto-hide success/info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Show Loading Indicator
function showLoading() {
    loadingIndicator.style.display = 'block';
    isLoading = true;
}

// Hide Loading Indicator
function hideLoading() {
    loadingIndicator.style.display = 'none';
    isLoading = false;
}

// Validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Validate YouTube URL
function isValidYouTubeURL(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

// Validate Spotify URL
function isValidSpotifyURL(url) {
    const spotifyRegex = /^(https?:\/\/)?open\.spotify\.com\/(track|album|playlist)\/.+$/;
    return spotifyRegex.test(url);
}

// Validate SoundCloud URL
function isValidSoundCloudURL(url) {
    const soundcloudRegex = /^(https?:\/\/)?(www\.)?soundcloud\.com\/.+$/;
    return soundcloudRegex.test(url);
}

// Get Platform from URL
function getPlatformFromURL(url) {
    if (isValidYouTubeURL(url)) return 'youtube';
    if (isValidSpotifyURL(url)) return 'spotify';
    if (isValidSoundCloudURL(url)) return 'soundcloud';
    return null;
}

// Get Platform Color
function getPlatformColor(platform) {
    switch(platform) {
        case 'youtube': return '#FF0000';
        case 'spotify': return '#1DB954';
        case 'soundcloud': return '#FF5500';
        default: return '#8a2be2';
    }
}

// Get Platform Icon
function getPlatformIcon(platform) {
    switch(platform) {
        case 'youtube': return 'fab fa-youtube';
        case 'spotify': return 'fab fa-spotify';
        case 'soundcloud': return 'fab fa-soundcloud';
        default: return 'fas fa-music';
    }
}

// Create Result Card
function createResultCard(song) {
    const card = document.createElement('div');
    card.className = 'result-card will-change';
    card.dataset.id = song.id;
    
    const platformColor = getPlatformColor(song.platform);
    const platformIcon = getPlatformIcon(song.platform);
    
    card.innerHTML = `
        <div class="album-art">
            ${song.thumbnail ? 
                `<img src="${song.thumbnail}" alt="${song.title}" loading="lazy">` : 
                `<div class="album-art-placeholder" style="background: linear-gradient(135deg, ${platformColor}, ${platformColor}80);">
                    <i class="${platformIcon}"></i>
                </div>`
            }
            <div class="platform-badge">
                <i class="${platformIcon}"></i> ${song.platform.charAt(0).toUpperCase() + song.platform.slice(1)}
            </div>
        </div>
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">
                <i class="fas fa-user"></i> ${song.artist}
            </div>
            ${song.album ? `
                <div class="song-album">
                    <i class="fas fa-compact-disc"></i> ${song.album}
                </div>
            ` : ''}
            <div class="song-meta">
                <div class="song-duration">
                    <i class="far fa-clock"></i> ${song.duration || '3:45'}
                </div>
                <div class="quality-badge">${song.quality || 'FLAC • 24-bit'}</div>
            </div>
        </div>
    `;
    
    // Add click event to show details
    card.addEventListener('click', () => showMusicDetails(song));
    
    return card;
}

// Show Music Details Modal
async function showMusicDetails(song) {
    try {
        // Show loading in modal
        musicDetails.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>Memuat detail musik...</p>
            </div>
        `;
        
        musicModal.style.display = 'flex';
        
        // Simulate API call for details
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock detailed data
        const details = {
            ...song,
            album: song.album || 'Single',
            year: song.year || '2023',
            genre: song.genre || ['Pop', 'Electronic'],
            bitrate: '1411 kbps',
            sampleRate: '44.1 kHz',
            bitDepth: '16-bit',
            size: '25.4 MB',
            description: `"${song.title}" adalah lagu ${song.genre ? song.genre[0] : 'pop'} oleh ${song.artist}. 
                         Dikonversi ke format FLAC lossless dengan kualitas studio.`,
            tracks: [
                { title: song.title, duration: song.duration || '3:45' },
                { title: `${song.title} (Instrumental)`, duration: '3:45' },
                { title: `${song.title} (Acoustic)`, duration: '4:10' }
            ]
        };
        
        const platformColor = getPlatformColor(details.platform);
        
        musicDetails.innerHTML = `
            <div class="detail-header">
                <div class="album-art-large" style="background: linear-gradient(135deg, ${platformColor}, ${platformColor}80);">
                    ${details.thumbnail ? 
                        `<img src="${details.thumbnail}" alt="${details.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">` :
                        `<i class="${getPlatformIcon(details.platform)}" style="font-size: 4rem; color: white;"></i>`
                    }
                </div>
                <div class="detail-info">
                    <h1 class="detail-title">${details.title}</h1>
                    <h2 class="detail-artist">
                        <i class="fas fa-user"></i> ${details.artist}
                    </h2>
                    
                    <div class="detail-meta">
                        <div class="meta-item">
                            <i class="fas fa-compact-disc"></i>
                            <span>Album: ${details.album}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Tahun: ${details.year}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-music"></i>
                            <span>Genre: ${Array.isArray(details.genre) ? details.genre.join(', ') : details.genre}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>Durasi: ${details.duration}</span>
                        </div>
                    </div>
                    
                    <div class="detail-description">
                        <p>${details.description}</p>
                    </div>
                    
                    <div class="quality-options">
                        <h4><i class="fas fa-file-audio"></i> Pilih Kualitas FLAC</h4>
                        <div class="quality-buttons">
                            <button class="quality-btn active" data-quality="16bit">16-bit / 44.1kHz</button>
                            <button class="quality-btn" data-quality="24bit">24-bit / 96kHz</button>
                            <button class="quality-btn" data-quality="24bit-hr">24-bit / 192kHz</button>
                        </div>
                    </div>
                    
                    <div class="detail-actions">
                        <button class="detail-download-btn" onclick="handleDownload(${JSON.stringify(details).replace(/"/g, '&quot;')})">
                            <i class="fas fa-download"></i> Unduh FLAC
                        </button>
                        <button class="detail-preview-btn" onclick="previewMusic('${details.id}')">
                            <i class="fas fa-play"></i> Preview
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="track-list" style="margin-top: 2rem;">
                <h3><i class="fas fa-list"></i> Daftar Track</h3>
                <div style="margin-top: 1rem;">
                    ${details.tracks.map((track, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <span style="color: var(--text-secondary); margin-right: 1rem;">${index + 1}.</span>
                                <span>${track.title}</span>
                            </div>
                            <span style="color: var(--text-secondary);">${track.duration}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="audio-info" style="margin-top: 2rem; padding: 1rem; background: var(--secondary-bg); border-radius: 10px;">
                <h4><i class="fas fa-info-circle"></i> Informasi Teknis</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div>
                        <span style="color: var(--text-secondary);">Format:</span>
                        <span style="margin-left: 0.5rem; color: var(--accent-color);">FLAC</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Bitrate:</span>
                        <span style="margin-left: 0.5rem;">${details.bitrate}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Sample Rate:</span>
                        <span style="margin-left: 0.5rem;">${details.sampleRate}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Bit Depth:</span>
                        <span style="margin-left: 0.5rem;">${details.bitDepth}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Ukuran File:</span>
                        <span style="margin-left: 0.5rem;">${details.size}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add quality button listeners
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
    } catch (error) {
        console.error('Error loading details:', error);
        musicDetails.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--error);">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Gagal memuat detail musik. Silakan coba lagi.</p>
            </div>
        `;
    }
}

// Handle Download
function handleDownload(song) {
    try {
        const qualityBtn = document.querySelector('.quality-btn.active');
        const quality = qualityBtn ? qualityBtn.dataset.quality : '16bit';
        
        let qualityText = '';
        switch(quality) {
            case '16bit': qualityText = '16-bit/44.1kHz'; break;
            case '24bit': qualityText = '24-bit/96kHz'; break;
            case '24bit-hr': qualityText = '24-bit/192kHz'; break;
        }
        
        showStatus(`Mengunduh "${song.title}" dalam kualitas ${qualityText}...`, 'info');
        
        // Simulate download
        setTimeout(() => {
            showStatus(`"${song.title}" berhasil diunduh!`, 'success');
            
            // Create fake download link
            const downloadLink = document.createElement('a');
            downloadLink.href = '#';
            downloadLink.download = `${song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${quality}.flac`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Close modal after download
            setTimeout(() => {
                musicModal.style.display = 'none';
            }, 1000);
        }, 1500);
        
    } catch (error) {
        showStatus('Gagal mengunduh file. Silakan coba lagi.', 'error');
    }
}

// Preview Music (simulated)
function previewMusic(songId) {
    showStatus('Fitur preview akan segera tersedia.', 'info');
}

// Handle Conversion
async function handleConversion() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showStatus('Masukkan URL terlebih dahulu.', 'warning');
        urlInput.focus();
        return;
    }
    
    if (!isValidURL(url)) {
        showStatus('URL tidak valid. Pastikan URL sudah benar.', 'error');
        return;
    }
    
    const platform = getPlatformFromURL(url);
    if (!platform) {
        showStatus('URL harus dari YouTube, Spotify, atau SoundCloud.', 'error');
        return;
    }
    
    const activeTab = document.querySelector('.tab.active');
    const selectedPlatform = activeTab ? activeTab.getAttribute('data-platform') : 'all';
    
    if (selectedPlatform !== 'all' && selectedPlatform !== platform) {
        showStatus(`URL harus dari ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}.`, 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const result = {
            success: true,
            songs: [{
                id: `converted_${Date.now()}`,
                title: `Lagu dari ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
                artist: 'Various Artists',
                album: 'Converted Album',
                duration: '3:45',
                platform: platform,
                quality: 'FLAC • 24-bit',
                thumbnail: platform === 'youtube' ? 'https://i.ytimg.com/vi/sample/hqdefault.jpg' :
                         platform === 'spotify' ? 'https://i.scdn.co/image/ab67616d0000b273sample' :
                         'https://i1.sndcdn.com/artworks-sample.jpg',
                year: '2023',
                genre: ['Pop', 'Electronic']
            }]
        };
        
        if (result.success) {
            // Clear previous results and add the new one
            resultsGrid.innerHTML = '';
            result.songs.forEach(song => {
                resultsGrid.appendChild(createResultCard(song));
            });
            
            resultsCount.textContent = '1 hasil ditemukan';
            loadMoreContainer.style.display = 'none';
            
            showStatus(`Berhasil mengonversi dari ${platform}!`, 'success');
            
            // Scroll to results
            document.querySelector('.results').scrollIntoView({ behavior: 'smooth' });
        } else {
            showStatus('Gagal mengonversi. Silakan coba lagi.', 'error');
        }
    } catch (error) {
        showStatus('Terjadi kesalahan. Periksa koneksi internet Anda.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle Search
async function handleSearch(page = 1) {
    const query = searchInput.value.trim();
    
    if (!query) {
        showStatus('Masukkan kata kunci pencarian terlebih dahulu.', 'warning');
        searchInput.focus();
        return;
    }
    
    if (page === 1) {
        showLoading();
        resultsGrid.innerHTML = '';
        currentPage = 1;
        currentQuery = query;
        hasMoreResults = true;
    }
    
    try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Generate mock search results
        const mockResults = Array.from({ length: page === 1 ? 9 : 6 }, (_, i) => {
            const index = (page - 1) * 9 + i;
            const platforms = ['youtube', 'spotify', 'soundcloud'];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            const platformColor = getPlatformColor(platform);
            
            return {
                id: `search_${Date.now()}_${index}`,
                title: `${query} ${['Versi Lengkap', 'Remix', 'Acoustic', 'Live', 'Cover'][i % 5]}`,
                artist: `${['Artis Terkenal', 'Band Indie', 'DJ Producer', 'Solo Singer', 'Various Artists'][i % 5]}`,
                album: `${['Album Terbaru', 'Best Of', 'Compilation', 'Soundtrack', 'Mixtape'][i % 5]} ${2023 - (i % 3)}`,
                duration: `${3 + (i % 3)}:${(45 + i * 10) % 60}`.padStart(2, '0'),
                platform: platform,
                quality: ['FLAC • 16-bit', 'FLAC • 24-bit', 'FLAC • Lossless'][i % 3],
                thumbnail: `https://via.placeholder.com/300x180/${platformColor.replace('#', '')}/ffffff?text=${platform.charAt(0).toUpperCase()}`,
                year: `${2020 + (i % 4)}`,
                genre: [['Pop', 'Rock'], ['Electronic', 'Dance'], ['Hip Hop', 'R&B'], ['Jazz', 'Blues'], ['Classical', 'Instrumental']][i % 5]
            };
        });
        
        // Add results to grid
        mockResults.forEach(song => {
            resultsGrid.appendChild(createResultCard(song));
        });
        
        // Update results count
        const totalResults = page === 1 ? 45 : 45 - (page * 9);
        resultsCount.textContent = `${Math.min(page * 9, 45)} dari 45 hasil ditemukan`;
        
        // Show/hide load more button
        if (page * 9 < 45) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
            hasMoreResults = false;
        }
        
        if (page === 1) {
            showStatus(`Ditemukan 45 hasil untuk "${query}".`, 'success');
            document.querySelector('.results').scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (error) {
        showStatus('Gagal mencari. Silakan coba lagi.', 'error');
    } finally {
        if (page === 1) {
            hideLoading();
        }
    }
}

// Load More Results
loadMoreBtn.addEventListener('click', () => {
    if (!isLoading && hasMoreResults) {
        currentPage++;
        handleSearch(currentPage);
    }
});

// Load Trending
async function loadTrending(time = 'week') {
    try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock trending data
        const trendingData = Array.from({ length: 8 }, (_, i) => {
            const platforms = ['youtube', 'spotify', 'soundcloud'];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            const platformColor = getPlatformColor(platform);
            
            return {
                id: `trending_${Date.now()}_${i}`,
                rank: i + 1,
                title: `Lagu Trending ${['Pop', 'Rock', 'Electronic', 'Hip Hop', 'R&B'][i % 5]}`,
                artist: `Artis ${['A', 'B', 'C', 'D', 'E'][i % 5]}`,
                plays: `${(Math.floor(Math.random() * 100) + 50)}K`,
                platform: platform,
                thumbnail: `https://via.placeholder.com/250x120/${platformColor.replace('#', '')}/ffffff?text=Trending+${i + 1}`
            };
        });
        
        // Clear and update trending grid
        trendingGrid.innerHTML = '';
        trendingData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'trending-card will-change';
            card.dataset.id = item.id;
            
            card.innerHTML = `
                <div class="trending-rank">${item.rank}</div>
                <div class="trending-album-art">
                    <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                </div>
                <div class="trending-info">
                    <h4>${item.title}</h4>
                    <p>${item.artist}</p>
                    <div class="trending-stats">
                        <i class="fas fa-play"></i>
                        <span>${item.plays} plays</span>
                        <i class="${getPlatformIcon(item.platform)}" style="margin-left: auto;"></i>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                const mockSong = {
                    id: item.id,
                    title: item.title,
                    artist: item.artist,
                    platform: item.platform,
                    thumbnail: item.thumbnail
                };
                showMusicDetails(mockSong);
            });
            
            trendingGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading trending:', error);
    }
}

// Event Listeners
convertBtn.addEventListener('click', handleConversion);
searchBtn.addEventListener('click', () => handleSearch(1));

// Allow conversion/search on Enter key
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConversion();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch(1);
});

// Sort results
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    showStatus(`Mengurutkan berdasarkan ${e.target.options[e.target.selectedIndex].text}...`, 'info');
    // In real implementation, this would re-fetch sorted results
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load initial trending
    loadTrending('week');
    
    // Load sample search results
    searchInput.value = 'musik terbaru';
    setTimeout(() => handleSearch(1), 1000);
    
    // Initialize quality buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quality-btn')) {
            document.querySelectorAll('.quality-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
        }
    });
    
    // Show welcome message
    setTimeout(() => {
        showStatus('Selamat datang di 2FLAC! Cari atau konversi musik favorit Anda ke format FLAC.', 'info');
    }, 1500);
});