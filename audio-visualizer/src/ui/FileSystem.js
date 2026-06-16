class FileSystem {
  constructor() {
    this.supportedExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'];
    this.playlist = []; this.currentIndex = -1;
    this.onPlaylistChange = null; this.onTrackLoad = null; this.onError = null;
    this._initDragDrop();
  }
  _initDragDrop() {
    document.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; const dz = document.getElementById('drop-zone'); if (dz) dz.classList.add('drag-over'); });
    document.addEventListener('dragleave', (e) => { e.preventDefault(); const dz = document.getElementById('drop-zone'); if (dz) dz.classList.remove('drag-over'); });
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const dz = document.getElementById('drop-zone'); if (dz) dz.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => this._isSupported(f.name));
      if (files.length > 0) this._loadFiles(files);
      else if (this.onError) this.onError('Nenhum arquivo de áudio encontrado.');
    });
  }
  _isSupported(name) { return this.supportedExtensions.includes(name.toLowerCase().slice(name.lastIndexOf('.'))); }
  async loadFileViaIPC(filePath) {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.readAudioFile(filePath);
        if (result && result.success) {
          return { success: true, data: result.data, fileName: result.fileName };
        }
      }
      return null;
    } catch (err) { if (this.onError) this.onError('Erro ao carregar arquivo.'); return null; }
  }
  _loadFiles(files) {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.playlist.push({ name: file.name, data: e.target.result, index: this.playlist.length });
        if (this.onPlaylistChange) this.onPlaylistChange(this.playlist);
      };
      reader.readAsArrayBuffer(file);
    });
  }
  addToPlaylist(track) { this.playlist.push(track); if (this.onPlaylistChange) this.onPlaylistChange(this.playlist); }
  clearPlaylist() { this.playlist = []; this.currentIndex = -1; if (this.onPlaylistChange) this.onPlaylistChange(this.playlist); }
  getCurrentTrack() { if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) return this.playlist[this.currentIndex]; return null; }
  next() { if (this.playlist.length === 0) return null; this.currentIndex = (this.currentIndex + 1) % this.playlist.length; return this.getCurrentTrack(); }
  prev() { if (this.playlist.length === 0) return null; this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length; return this.getCurrentTrack(); }
}