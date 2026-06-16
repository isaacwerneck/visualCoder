# 🎵 Audio Visualizer XP — Especificações do Projeto

**Versão:** 1.0.0  
**Tipo:** Aplicação Desktop Nativa  
**Stack:** Electron + Three.js + Web Audio API  
**Estilo Visual:** Psicodélico Robô / Webcore / Windows XP Aero

---

## 1. Visão Geral

Aplicação desktop que reproduz arquivos de áudio locais e gera visualizações 3D em tempo real, reagindo a frequências, beats, amplitude e outras características do som. O visual é fortemente inspirado na estética do Windows XP (Luna theme, Aero Glass) combinado com elementos psicodélicos, webcore e cyberpunk.

### 1.1 Propósito

Criar uma experiência imersiva onde o usuário pode:
- Reproduzir qualquer arquivo de áudio (.mp3, .wav, .flac)
- Ver feedback visual detalhado baseado nas características do som
- Personalizar cada aspecto visual em tempo real
- Alternar entre diferentes modos de visualização
- Usar o aplicativo como ferramenta de VJing / live visuals

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| **Electron** | ^30.0.0 | Runtime desktop nativo (janela, sistema de arquivos, menus) |
| **Three.js** | ^0.162.0 | Renderização 3D WebGL (geometrias, partículas, luzes, pós-processamento) |
| **Web Audio API** | Nativa do Chromium | Análise FFT em tempo real, detecção de beats, amplitude |
| **Canvas 2D** | Nativo | Geração de texturas procedurais |
| **Node.js fs** | Nativo do Electron | Leitura de arquivos locais, varredura de pastas |

### 2.1 Dependências (package.json)

```json
{
  "name": "audio-visualizer",
  "version": "1.0.0",
  "description": "Visualizador de áudio 3D psicodélico estilo Windows XP",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev"
  },
  "dependencies": {
    "electron": "^30.0.0",
    "three": "^0.162.0"
  }
}
```

---

## 3. Estrutura de Diretórios

```
audio-visualizer/
│
├── package.json                  # Configuração do projeto npm
├── main.js                       # Processo principal do Electron
├── preload.js                    # Ponte segura IPC (renderer ↔ main)
│
├── src/
│   ├── renderer.html             # Interface HTML principal
│   ├── renderer.js               # Entry point do Three.js + áudio
│   ├── style.css                 # Estilos CSS (tema XP Aero)
│   │
│   ├── audio/
│   │   ├── AudioManager.js       # Web Audio: decode, play, FFT analysis
│   │   └── BeatDetector.js       # Detecção de kicks e BPM
│   │
│   ├── visual/
│   │   ├── SceneManager.js       # Cena, câmera, renderizador, resize
│   │   ├── GeometryEngine.js     # Geometrias reativas ao som
│   │   ├── ParticleSystem.js     # Sistema de partículas
│   │   ├── LightEngine.js        # Iluminação dinâmica
│   │   ├── PostProcessing.js     # Efeitos de pós-processamento
│   │   ├── TextureGenerator.js   # Texturas procedurais
│   │   └── VisualReactivity.js   # Mapeamento áudio → parâmetros
│   │
│   └── ui/
│       ├── ControlPanel.js       # Painel de controles (sliders, toggles)
│       └── FileSystem.js         # Acesso a arquivos locais
│
└── assets/
    └── (músicas do usuário)
```

---

## 4. Funcionalidades do Sistema

### 4.1 Reprodução de Áudio

| Funcionalidade | Descrição |
|---|---|
| **Abrir arquivo** | Ctrl+O ou menu Arquivo → Abrir Música |
| **Abrir pasta** | Ctrl+Shift+O → carrega todos .mp3/.wav/.flac como playlist |
| **Drag & drop** | Arrastar música do Explorer para a janela |
| **Play/Pause** | Barra de espaço |
| **Pular faixa** | Ctrl + → (próxima) / Ctrl + ← (anterior) |
| **Volume** | Setas ↑↓ ou scroll do mouse |
| **Progresso** | Barra de progresso clicável |
| **Tempo restante** | Display MM:SS |
| **Playlist** | Lista lateral com nome, duração, arte (se houver) |
| **Repetir** | Modos: desligado / repetir uma / repetir todas |
| **Shuffle** | Embaralhar playlist |

### 4.2 Sistema de Arquivos

| Funcionalidade | Descrição |
|---|---|
| **Leitura local** | Acesso direto ao sistema de arquivos via Node.js |
| **Formatos suportados** | .mp3, .wav, .flac, .ogg, .aac, .m4a |
| **Varredura de pastas** | Escaneia subpastas recursivamente |
| **Histórico** | Últimas 20 músicas acessadas |
| **Playlists** | Salvar/Carregar .m3u |

### 4.3 Controles da Interface

| Controle | Tipo | Descrição |
|---|---|---|
| **Sensibilidade Graves** | Slider (0-200%) | Amplifica/atenua reação de graves |
| **Sensibilidade Médios** | Slider (0-200%) | Amplifica/atenua reação de médios |
| **Sensibilidade Agudos** | Slider (0-200%) | Amplifica/atenua reação de agudos |
| **Velocidade Base** | Slider (0-300%) | Velocidade de rotação/animação |
| **Intensidade Bloom** | Slider (0-100%) | Intensidade do glow/bloom |
| **Número Objetos** | Slider (1-200) | Quantidade de geometrias na tela |
| **Tamanho Objetos** | Slider (10-300%) | Escala base das geometrias |
| **Paleta de Cores** | Dropdown | Presets + Custom |
| **Modo Visual** | Dropdown | Formas / Partículas / Wireframe / Híbrido |
| **Background** | Dropdown | Preto / Gradiente XP / Sólido / CRT |
| **Geometria Base** | Dropdown | Cubo / Esfera / Toróide / Icosaedro / Dodecaedro / Anel / Cone / Cilindro |
| **Morph Speed** | Slider (0-100%) | Velocidade de transição entre formas |
| **Wireframe** | Toggle | Liga/desliga wireframe |
| **Transparência** | Toggle | Liga/desliga transparência |
| **Eixo X/Y/Z** | Toggle | Rotação em cada eixo |
| **Partículas** | Toggle | Liga/desliga sistema de partículas |
| **Reflexão** | Toggle | Espelhamento (cubo environment map) |
| **Chromatic Aberration** | Toggle | Distorção de cores nas bordas |

---

## 5. Requisitos Técnicos

### 5.1 Sistema Operacional

- Windows 10 / 11 (primário, com tema XP emulato)
- macOS (secundário)
- Linux (secundário)

### 5.2 Hardware Mínimo

| Componente | Mínimo | Recomendado |
|---|---|---|
| **CPU** | Intel i3 / AMD Ryzen 3 | Intel i5+ / AMD Ryzen 5+ |
| **RAM** | 4GB | 8GB+ |
| **GPU** | Integrada (Intel UHD) | Dedicada (NVIDIA GTX 1050+) |
| **Armazenamento** | 500MB livres | 1GB+ |
| **Áudio** | Qualquer placa de som | Sistema estéreo |

### 5.3 Performance

- **60 FPS** em hardware recomendado
- **30 FPS** em hardware mínimo (com ajustes)
- Modo "Performance" que reduz qualidade gráfica automaticamente
- Detecção de queda de FPS e ajuste dinâmico

---

## 6. Estilo Visual

### 6.1 Tema Windows XP (Luna)

| Elemento | Especificação |
|---|---|
| **Background janela** | Gradiente azul (#3a6ea5 → #4a8bc2) |
| **Título da janela** | Azul escuro (#0a2463) com texto branco |
| **Botões** | Verde XP (#68bd42) para ações positivas, prata (#d4d0c8) para neutros |
| **Bordas** | Arredondadas (border-radius: 8px) com sombra sutil |
| **Fontes** | "Tahoma", "Segoe UI", sans-serif |
| **Painéis** | Glassmorphism: fundo rgba(255,255,255,0.15) com backdrop-filter: blur(10px) |
| **Scrollbar** | Personalizada: track azul escuro, thumb gradiente prateado |
| **Checkboxes** | Estilo XP (quadrado com check verde) |
| **Sliders** | Track azul, thumb prateado com brilho |
| **Ícones** | Estilo Windows XP (setas, pastas, play/pause) |

### 6.2 Cores (Paletas)

#### Preset 1 — "XP Classic"
- Primária: #3a6ea5 (azul XP)
- Secundária: #68bd42 (verde Start)
- Destaque: #ffcc00 (amarelo)
- Fundo: Gradiente #0a2463 → #3a6ea5

#### Preset 2 — "Neon Cyber"
- Primária: #ff00ff (magenta)
- Secundária: #00ffff (ciano)
- Destaque: #ffff00 (amarelo neon)
- Fundo: #000000

#### Preset 3 — "Sunset Psy"
- Primária: #ff4500 (laranja)
- Secundária: #ff1493 (rosa)
- Destaque: #ffd700 (dourado)
- Fundo: #1a0033 (roxo escuro)

#### Preset 4 — "Chrome Robot"
- Primária: #c0c0c0 (prata)
- Secundária: #ff6600 (laranja)
- Destaque: #00bfff (azul elétrico)
- Fundo: #222222 (grafite)

#### Preset 5 — "Aero Glass"
- Primária: #e8f0fe (branco azulado)
- Secundária: rgba(255,255,255,0.3) (transparente)
- Destaque: #4fc3f7 (azul claro)
- Fundo: Gradiente translúcido com blur

#### Custom
- Inputs de cor HEX para cada categoria
- 3 cores selecionáveis livremente

---

## 7. Comportamento da Janela

### 7.1 Especificações

| Atributo | Valor |
|---|---|
| **Largura inicial** | 1280px |
| **Altura inicial** | 720px |
| **Largura mínima** | 800px |
| **Altura mínima** | 600px |
| **Resizable** | Sim |
| **Fullscreen** | F11 (oculta painel de controle) |
| **Frame** | Sim (com borda personalizada estilo XP) |
| **Ícone** | Ícone personalizado (visualizer.ico) |

### 7.2 Atalhos de Teclado

| Tecla | Ação |
|---|---|
| **Espaço** | Play / Pause |
| **→** | Próxima faixa |
| **←** | Faixa anterior |
| **↑** | Aumentar volume |
| **↓** | Diminuir volume |
| **F11** | Tela cheia |
| **Esc** | Sair da tela cheia / Fechar modal |
| **Ctrl+O** | Abrir arquivo |
| **Ctrl+Shift+O** | Abrir pasta |
| **Ctrl+H** | Mostrar/ocultar painel de controle |
| **M** | Mutar |
| **0-9** | Presets de visual (0 = reset) |
| **R** | Resetar visual |

---

## 8. Tratamento de Erros

### 8.1 Mensagens para o Usuário

| Situação | Mensagem |
|---|---|
| **Arquivo inválido** | "Formato de áudio não suportado. Use .mp3, .wav, .flac, .ogg, .aac ou .m4a" |
| **Arquivo corrompido** | "Não foi possível ler este arquivo. Ele pode estar corrompido." |
| **Pasta vazia** | "Nenhum arquivo de áudio encontrado nesta pasta." |
| **Erro de decodificação** | "Erro ao decodificar o áudio. Tente outro arquivo." |
| **GPU não suporta** | "Sua placa de vídeo não suporta WebGL. Ativando modo de baixa qualidade." |
| **Queda de FPS** | "Performance baixa detectada. Reduzindo qualidade automaticamente." |

---

## 9. Exportação e Compartilhamento

### 9.1 Gravação

- **Gravador de tela interno** (FFMPEG via Electron)
- Formatos: .mp4, .gif
- Resolução: 720p, 1080p
- FPS: 30, 60
- Atalho: Ctrl+R (iniciar/parar gravação)

### 9.2 Screenshots

- Ctrl+S: captura screenshot
- Formato: .png
- Salvamento automático na pasta "Screenshots" ao lado do executável

---

## 10. Licenciamento

- **Código:** MIT License (código aberto)
- **Ícones e assets visuais:** Próprios ou domínio público
- **Three.js:** MIT License
- **Electron:** MIT License

---

## 11. Roadmap Futuro

| Versão | Funcionalidades |
|---|---|
| **1.0** | MVP: player, visual 3D básico, painel de controle |
| **1.1** | MIDI input, OSC output (comunicação com TouchDesigner/Resolume) |
| **1.2** | Suporte a vídeo (reagir a vídeos também) |
| **1.3** | Plugins / scripts de visual personalizados |
| **1.4** | Streaming (Spotify, Tidal via API) |
| **2.0** | Realidade Virtual (VR) com óculos |

---

## 12. Instalação e Inicialização

### Pré-requisitos

- **Node.js** v18+ (recomendado v20+)
- **npm** v9+
- **Git** (opcional, para clonar)

### Como iniciar o projeto

```bash
# 1. Clonar ou criar o projeto
mkdir audio-visualizer
cd audio-visualizer

# 2. Inicializar npm
npm init -y

# 3. Instalar dependências
npm install electron three

# 4. Colocar uma música de teste
# Crie a pasta assets/ e coloque um arquivo .mp3 lá

# 5. Iniciar o app em modo desenvolvimento
npm start

# 6. (Opcional) Para desenvolvimento com DevTools aberto
npm run dev
```

### Estrutura para iniciar

Ao executar `npm start`, o Electron:
1. Lê o `main.js` que abre uma janela (1280x720)
2. Carrega `src/renderer.html`
3. O `renderer.js` inicia o Three.js e aguarda o usuário carregar uma música
4. Painel de controle fica visível à esquerda
5. Visual 3D ocupa o resto da tela

---

## 13. Observações Técnicas Importantes

### Web Audio API

- Usamos `AudioContext` do Chromium (embutido no Electron)
- `AnalyserNode` com FFT size 2048 ou 4096
- Dados de frequência divididos em 3 bandas:
  - **Graves (Bass):** bins 0-6 (aproximadamente 20-250Hz)
  - **Médios (Mid):** bins 7-63 (aproximadamente 250-2000Hz)
  - **Agudos (Treble):** bins 64-127 (aproximadamente 2000-20000Hz)
- Time domain data para forma de onda

### Three.js

- WebGLRenderer com antialiasing
- ShadowMap ativado
- Pós-processamento via EffectComposer + UnrealBloomPass
- Geometrias criadas dinamicamente e destruídas (Object3D.dispose())
- Otimização: instanced mesh para objetos repetidos