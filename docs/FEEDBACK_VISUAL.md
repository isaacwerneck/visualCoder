# 🎨 Guia Completo de Feedback Visual — Audio Visualizer XP

**Título:** Como o som se traduz em imagem  
**Versão:** 1.0.0  
**Estilo:** Psicodélico Robô / Webcore / Windows XP Aero

---

## Sumário

1. [Introdução — Filosofia do Feedback Visual](#1-introdução)
2. [Arquitetura do Mapeamento Áudio → Visual](#2-arquitetura)
3. [Análise de Frequências — O Coração do Sistema](#3-frequências)
4. [Detecção de Beats — O Pulso da Música](#4-beats)
5. [Geometrias — Formas que Ganham Vida](#5-geometrias)
6. [Cores — O Espectro Sonoro Visível](#6-cores)
7. [Movimentos — A Dança dos Objetos](#7-movimentos)
8. [Luzes e Sombras — Iluminação Reativa](#8-luzes)
9. [Partículas — O Brilho do Som](#9-partículas)
10. [Pós-processamento — Efeitos Globais](#10-pós-processamento)
11. [Texturas — A Pele dos Objetos](#11-texturas)
12. [Padrões e Distorções — O Caos Orgânico](#12-padrões)
13. [Modos de Visualização — Cenários Completos](#13-modos)
14. [Tabela Completa de Mapeamento](#14-tabela)
15. [Guia de Sintonia Fina](#15-sintonia)
16. [Exemplos Práticos — Músicas Reais](#16-exemplos)

---

## 1. Introdução — Filosofia do Feedback Visual

O Audio Visualizer XP traduz som em imagem em tempo real. O princípio é simples: **cada característica do áudio controla um ou mais parâmetros visuais**, criando uma experiência sincronizada e imersiva.

### 1.1 Conceitos Fundamentais

| Conceito | Descrição |
|---|---|
| **Reatividade** | Todo elemento visual responde a pelo menos um aspecto do som |
| **Multidimensionalidade** | Um único som afeta múltiplos aspectos visuais simultaneamente |
| **Organicidade** | As transições são suaves, não binárias (salvo efeitos de beat) |
| **Customização** | O usuário pode ajustar a intensidade de cada conexão |
| **Hierarquia** | Graves são a fundação, médios o corpo, agudos os detalhes |

### 1.2 O Tripé do Feedback Visual

```
                    ┌─────────────────┐
                    │   FREQUÊNCIAS    │
                    │  (O que toca)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │  GRAVES   │   │  MÉDIOS  │   │  AGUDOS  │
       │ 20-250Hz  │   │250-2000Hz│   │2k-20kHz  │
       └─────┬────┘   └─────┬────┘   └─────┬────┘
             │              │              │
             ▼              ▼              ▼
       ┌──────────────────────────────────────┐
       │         PARÂMETROS VISUAIS           │
       │  (Escala, Rotação, Cor, Luz, etc.)   │
       └──────────────────────────────────────┘
                             ▲
                    ┌────────┴────────┐
                    │   BEAT / BPM     │
                    │  (O pulso)       │
                    └─────────────────┘
```

---

## 2. Arquitetura do Mapeamento Áudio → Visual

### 2.1 Fluxo de Dados

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  ARQUIVO DE  │────▶│  Web Audio API  │────▶│   AudioManager   │
│   ÁUDIO      │     │  (Decode + FFT) │     │  (FFT Analysis)  │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                    ┌─────────────────────────────────┤
                    │              │                  │
                    ▼              ▼                  ▼
           ┌────────────┐  ┌────────────┐  ┌──────────────────┐
           │ frequency  │  │ timeDomain │  │   BeatDetector   │
           │   Data     │  │   Data     │  │(Energia de graves)│
           └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘
                 │               │                  │
                 ▼               ▼                  ▼
           ┌──────────────────────────────────────────┐
           │         VisualReactivity.js              │
           │  (Mapeia dados → parâmetros visuais)     │
           └────┬──────────┬──────────┬───────────────┘
                │          │          │
                ▼          ▼          ▼
         ┌──────────┐ ┌────────┐ ┌──────────┐
         │Geometry  │ │Particle│ │  Light   │
         │ Engine   │ │ System │ │  Engine  │
         └──────────┘ └────────┘ └────┬─────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │PostProcessing │
                                │   (Bloom)     │
                                └──────────────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │ THREE.JS     │
                                │ RENDERIZADOR │
                                └──────────────┘
```

### 2.2 Variáveis de Áudio Disponíveis

| Variável | Fonte | Faixa | Descrição |
|---|---|---|---|
| `audio.bass` | FFT (bins 0-6) | 0.0 — 1.0 | Energia de graves (~20-250Hz) |
| `audio.mid` | FFT (bins 7-63) | 0.0 — 1.0 | Energia de médios (~250-2000Hz) |
| `audio.treble` | FFT (bins 64-127) | 0.0 — 1.0 | Energia de agudos (~2k-20kHz) |
| `audio.amplitude` | Time Domain | 0.0 — 1.0 | Volume/amplitude geral |
| `audio.frequencyBands[16]` | FFT dividida | 0.0 — 1.0 | 16 bandas individuais |
| `audio.timeDomain` | Time Domain | 0-255 | Forma de onda bruta |
| `beatDetector.bpm` | Algoritmo | 60-180 | Batidas por minuto estimado |
| `beatDetector.isBeatActive()` | Algoritmo | true/false | Se há um kick agora |
| `beatDetector.getBeatIntensity()` | Algoritmo | 0.0 — 1.0 | Força do beat atual |

---

## 3. Análise de Frequências — O Coração do Sistema

### 3.1 Divisão do Espectro

```
         GRAVES          MÉDIOS               AGUDOS
      ────────┬──────────────────────────────────┬──────
              │          │              │         │
              20Hz      250Hz         2000Hz     20kHz
              │          │              │         │
              ▼          ▼              ▼         ▼
         Sub-bass    Vocals,        Hi-hats,
         Kicks,      Guitars,       Cymbals,
         Bass        Synths         Shakers
         Lines                      Air
```

### 3.2 O Que Cada Faixa Controla

#### 3.2.1 Graves (Bass) — A Fundação

| Parâmetro Visual | Reação | Intensidade |
|---|---|---|
| **Escala das geometrias** | Pulsa (cresce com graves fortes) | 1x = 100%, 2x no máximo |
| **Tamanho das partículas** | Aumenta com graves | +200% no pico |
| **Intensidade da luz pontual** | Brilho + alcance aumentam | 1x → 4x |
| **Bloom (glow)** | Glow extra nos graves | +50% |
| **Velocidade de rotação Z** | Rotação no eixo Z acelera | +100% |
| **Opacidade** | Objetos ficam mais sólidos | 0.6 → 1.0 |
| **Expansão da nuvem de partículas** | Partículas se afastam | Raio +50% |
| **Distorção de posição** | Objetos vibram | Amplitude × bass |

**Efeito psicológico:** Os graves criam a sensação de **impacto físico** e **peso**. Visualmente, tudo "pesa" mais quando os graves estão fortes.

#### 3.2.2 Médios (Mid) — O Corpo

| Parâmetro Visual | Reação | Intensidade |
|---|---|---|
| **Rotação X e Y** | Objetos giram nos eixos horizontais | +200% |
| **Movimento orbital** | Objetos se deslocam em órbitas | Raio × mid |
| **Saturação de cor** | Cores ficam mais vivas | 0.7 → 1.0 |
| **Luminosidade** | Objetos ficam mais claros | 0.3 → 0.8 |
| **Morphing (transição)** | Geometrias mudam de forma | Velocidade × mid |
| **Neblina (fog)** | Densidade da neblina | +100% |
| **Turbulência de partículas** | Partículas se agitam | Velocidade × mid |
| **Reflexão (envMap)** | Intensidade do brilho metálico | 0.3 → 1.0 |

**Efeito psicológico:** Os médios representam a **melodia** e a **voz**. Visualmente, trazem **movimento contínuo** e **vida** à cena.

#### 3.2.3 Agudos (Treble) — Os Detalhes

| Parâmetro Visual | Reação | Intensidade |
|---|---|---|
| **Matiz de cor (hue)** | Ciclagem rápida de cor | Velocidade × treble |
| **Transparência** | Objetos ficam mais translúcidos | 1.0 → 0.3 |
| **Wireframe** | Densidade do wireframe | +100% no pico |
| **Tamanho de partículas finas** | Partículas menores brilham | -50% do tamanho |
| **Chromatic aberration** | Distorção de cor nas bordas | 0 → máximo |
| **Cintilação (flicker)** | Objetos piscam rapidamente | Frequência × treble |
| **Detalhes de textura** | Nitidez de texturas | +100% |
| **Refração** | Leve distorção de vidro | Intensidade × treble |

**Efeito psicológico:** Os agudos trazem **brilho**, **leveza** e **detalhes minuciosos**. Visualmente, são as **faíscas** e os **reflexos**.

### 3.3 Interação Entre Bandas

```
Exemplo: Uma música com bateria forte (graves) + vocal melódico (médios) + hi-hat (agudos)

Tempo:   ════▓▓▓▓══════▓▓▓▓══════▓▓▓▓══════▓▓▓▓══▶
Bass:    ██████████████░░░░░░██████████████░░░░░░     → Escala pulsa
Mid:     ░░░░████████░░░░████████░░░░████████░░░░     → Rotação contínua
Treble:  ░░░░░░░░████░░░░░░░░████░░░░░░░░████░░░░     → Cintilação nos detalhes

Resultado visual:
- Objetos crescem e encolhem no ritmo da bateria
- Giram suavemente acompanhando a melodia
- Brilham e cintilam nos pratos e hi-hats
```

---

## 4. Detecção de Beats — O Pulso da Música

### 4.1 Algoritmo de Beat Detection

O `BeatDetector` analisa a **energia instantânea dos graves** e compara com a **média histórica**:

```
Energia instantânea > Média + (Threshold × Desvio Padrão)
                               ↓
                        BEAT DETECTADO!
```

### 4.2 Efeitos Disparados por Beat

| Efeito | Duração | Intensidade | Descrição |
|---|---|---|---|
| **Flash de luz** | 100-200ms | Alto | Luz branca/colorida explode do centro |
| **Pulso de escala** | 200-400ms | Médio-Alto | Todas as geometrias aumentam 1.5-3x |
| **Explosão de partículas** | 300-500ms | Alto | Partículas são lançadas radialmente |
| **Mudança de cor** | 200-300ms | Médio | Cor dominante muda abruptamente |
| **Bloom spike** | 150-250ms | Alto | Glow intenso por um instante |
| **Câmera shake** | 100-200ms | Baixo-Médio | Leve tremor na câmera |
| **Onda de distorção** | 300-400ms | Médio | Onda concêntrica distorce a cena |
| **Background flash** | 100ms | Baixo | Fundo pisca branco |

### 4.3 Visualização do BPM

O BPM estimado é usado para:

- **Sincronizar a rotação base** (velocidade = BPM/60)
- **Criar pulsos rítmicos** entre beats (subdivisões)
- **Alternar paletas de cor** a cada 4/8 beats
- **Gerar ondas** que viajam da origem

---

## 5. Geometrias — Formas que Ganham Vida

### 5.1 Tipos de Geometria

| Geometria | Vértices | Arestas | Efeito Visual Principal |
|---|---|---|---|
| **Cubo** | 8 | 12 | Sólido, robusto, clássico |
| **Esfera** | ~500 | — | Suave, orgânico, fluido |
| **Toróide (donut)** | ~256 | — | Curvilíneo, anéis, fluido |
| **Icosaedro** | 12 | 30 | Facetado, gemométrico, techno |
| **Dodecaedro** | 20 | 30 | Complexo, cristalino |
| **Nó Toroidal** | ~512 | — | Entrelaçado, psicodélico, caótico |
| **Cone** | 9 | 16 | Apontado, direcional |
| **Cilindro** | ~64 | — | Tubular, extenso |

### 5.2 Reações por Faixa de Frequência

| Geometria | Graves | Médios | Agudos |
|---|---|---|---|
| **Cubo** | Escala uniforme (+200%) | Rotação nos 3 eixos | Arestas brilham (emissive) |
| **Esfera** | Infla/desinfla (scale) | Deforma (vertex displacement) | Superfície com ondas |
| **Toróide** | Grossura do anel | Torce (twist) | Segmentação |
| **Icosaedro** | Vértices se expandem | Gira em torno do centro | Wireframe interno |
| **Dodecaedro** | Faces se destacam | Rotação lenta | Arestas coloridas |
| **Nó Toroidal** | Nó se contrai/expande | Desfia/entrelaça mais | Complexidade do nó |
| **Cone** | Altura varia | Ponta oscila | Base se abre/fecha |
| **Cilindro** | Raio expande | Altura varia | Segmentos vibratórios |

### 5.3 Morphing Entre Geometrias

Quando ativado, as geometrias podem **morph** (transicionar suavemente) entre formas:

- **Velocidade:** Controlada pelos médios
- **Direção:** Aleatória ou sequencial
- **Estilo:** Morph com interpolação de vértices

```
Exemplo de morphing:
  Cubo ───▶ Icosaedro ───▶ Esfera ───▶ Toróide ───▶ Cubo
  (4s)       (3s)          (5s)        (4s)         (4s)

Cada transição leva de 3-5 segundos, acelerada pelos médios.
```

### 5.4 Disposição no Espaço 3D

```
                    ┌─────────────────────────────────┐
                    │         VISTA SUPERIOR           │
                    │                                 │
                    │      ●       ●       ●          │
                    │          ●   ●   ●              │
                    │      ●   ●   ○   ●   ●          │
                    │          ●   ●   ●              │
                    │      ●       ●       ●          │
                    │                                 │
                    │  ○ = Centro (câmera olha aqui)  │
                    │  ● = Geometrias em grade esférica│
                    └─────────────────────────────────┘

Distribuição:
- Raio: 3-8 unidades do centro
- Altura (Y): -4 a +4 unidades
- Ângulo: Distribuição uniforme em esfera
- Cada objeto tem fase única para movimento individual
```

---

## 6. Cores — O Espectro Sonoro Visível

### 6.1 Modelo de Cor HSL

Usamos **HSL** (Matiz, Saturação, Luminosidade) para controle fino:

```
HSL(audio.bass, audio.mid, audio.treble) = COR REATIVA

H (Matiz):   0°(vermelho) → 120°(verde) → 240°(azul) → 360°(vermelho)
             Ciclagem controlada por agudos + tempo

S (Saturação): 0 (cinza) → 1 (vibrante)
               Controlada por médios

L (Luminosidade): 0 (preto) → 0.5 (puro) → 1 (branco)
                  Controlada por graves
```

### 6.2 Paletas de Cor

#### Preset 1 — "XP Classic" (Azul + Verde + Amarelo)
```
Faixa      Cor         HEX       HSL
Graves     Azul XP     #3a6ea5   hsl(210, 50%, 44%)
Médios     Verde XP    #68bd42   hsl(102, 48%, 50%)
Agudos     Dourado     #ffcc00   hsl(48, 100%, 50%)
Beat       Branco      #ffffff   hsl(0, 0%, 100%)
Background Gradiente   #0a2463 → #3a6ea5
```

#### Preset 2 — "Neon Cyber" (Magenta + Ciano + Amarelo)
```
Faixa      Cor         HEX       HSL
Graves     Magenta     #ff00ff   hsl(300, 100%, 50%)
Médios     Ciano       #00ffff   hsl(180, 100%, 50%)
Agudos     Amarelo     #ffff00   hsl(60, 100%, 50%)
Beat       Branco Azul #e0f0ff   hsl(210, 100%, 94%)
Background Preto       #000000
```

#### Preset 3 — "Sunset Psy" (Laranja + Rosa + Dourado)
```
Faixa      Cor         HEX       HSL
Graves     Laranja     #ff4500   hsl(16, 100%, 50%)
Médios     Rosa        #ff1493   hsl(328, 100%, 54%)
Agudos     Dourado     #ffd700   hsl(51, 100%, 50%)
Beat       Branco      #ffffff   hsl(0, 0%, 100%)
Background Roxo Escuro #1a0033
```

#### Preset 4 — "Chrome Robot" (Prata + Laranja + Azul Elétrico)
```
Faixa      Cor         HEX       HSL
Graves     Prata       #c0c0c0   hsl(0, 0%, 75%)
Médios     Laranja     #ff6600   hsl(24, 100%, 50%)
Agudos     Azul Elét.  #00bfff   hsl(196, 100%, 50%)
Beat       Branco      #ffffff   hsl(0, 0%, 100%)
Background Grafite    #222222
```

#### Preset 5 — "Aero Glass" (Branco Azulado + Azul Claro)
```
Faixa      Cor         HEX       HSL
Graves     Branco Azul #e8f0fe   hsl(216, 86%, 95%)
Médios     Transparent rgba(255,255,255,0.3) —
Agudos     Azul Claro  #4fc3f7   hsl(199, 89%, 64%)
Beat       Branco      #ffffff   hsl(0, 0%, 100%)
Background Translúcido com blur
```

### 6.3 Comportamento Dinâmico das Cores

Cada objeto tem sua própria cor que evolui no tempo:

```
cor = HSL(
  (hue_base + treble × 0.2 + time × 0.02) % 1,   // H: ciclagem
  sat_base + mid × 0.3,                            // S: viveza
  light_base + bass × 0.4                          // L: luminosidade
)
```

- **Sem áudio:** Cores estáticas, suaves, pastéis
- **Música calma:** Cores se movem lentamente, tons frios (azul, verde)
- **Música agitada:** Cores mudam rapidamente, tons quentes (vermelho, laranja)
- **Pico (drop/clímax):** Cores explodem em saturação máxima

### 6.4 Emissão (Glow Interno)

No momento do beat, os objetos emitem luz da própria cor:

```
objeto.material.emissive = objeto.material.color
objeto.material.emissiveIntensity = beatIntensity × 2
```

---

## 7. Movimentos — A Dança dos Objetos

### 7.1 Tipos de Movimento

| Movimento | Controlado Por | Efeito |
|---|---|---|
| **Rotação X** | Médios | Objeto gira para cima/baixo |
| **Rotação Y** | Médios + Agudos | Objeto gira horizontalmente |
| **Rotação Z** | Graves | Objeto gira no eixo de profundidade |
| **Escala (tamanho)** | Graves + Beat | Objeto cresce e encolhe |
| **Translação (posição)** | Graves/Médios/Agudos | Objeto se move no espaço |
| **Orbital** | Médios | Órbita em torno do centro |
| **Oscilação senoidal** | Todas as bandas | Movimento suave tipo onda |
| **Vibração (jitter)** | Amplitude + Agudos | Tremor fino e rápido |
| **Morphing** | Médios | Transição entre formas |
| **Wave distortion** | Todas | Onda percorre a superfície |

### 7.2 Fórmulas de Movimento

#### Rotação (por objeto)
```javascript
// Cada objeto tem velocidade e fase únicas
obj.rotation.x += mid * 0.02 * speed * obj.userData.speed;
obj.rotation.y += treble * 0.03 * speed * obj.userData.speed;
obj.rotation.z += bass * 0.01 * speed * obj.userData.speed;
```

#### Escala (pulsação)
```javascript
const bassScale = 1 + bass * 2 * (0.5 + Math.sin(phase) * 0.5);
const beatScale = isBeat ? 1 + beatIntensity * 1.5 : 1;
const finalScale = baseScale * bassScale * beatScale;
obj.scale.set(finalScale, finalScale, finalScale);
```

#### Posição (órbita reativa)
```javascript
const moveX = Math.sin(time * 0.5 * ud.speed + phase) * bass * 1.5;
const moveY = Math.cos(time * 0.3 * ud.speed + phase) * mid * 1.5;
const moveZ = Math.sin(time * 0.7 * ud.speed + phase) * treble * 1.5;

obj.position.x = originalX + moveX;
obj.position.y = originalY + moveY;
obj.position.z = originalZ + moveZ;
```

### 7.3 Padrões de Movimento

#### Padrão 1 — "Respiração" (Música ambiente/lenta)
```
Objetos:
  - Crescem lentamente com os graves (0.5s de subida, 0.5s de descida)
  - Giro suave (~5°/segundo)
  - Flutuação vertical tipo água-viva

Sensação: Meditativo, hipnótico, orgânico
```

#### Padrão 2 — "Dança" (Música eletrônica/dance)
```
Objetos:
  - Pulsam no beat (escala 1x → 1.5x no kick)
  - Rotação rápida (~20°/segundo, acelerando no drop)
  - Movimento orbital elíptico

Sensação: Energético, rítmico, contagiante
```

#### Padrão 3 — "Caos" (Música pesada/metal/dubstep)
```
Objetos:
  - Escala violenta (0.3x → 2.5x, movimentos bruscos)
  - Rotação errática, mudanças de direção súbitas
  - Vibração intensa (jitter) nos agudos

Sensação: Agressivo, intenso, imprevisível
```

#### Padrão 4 — "Flutuação" (Música chill/lofi)
```
Objetos:
  - Movimento muito lento, quase imperceptível
  - Rotação leve (1-2°/segundo)
  - Ondas suaves percorrendo a superfície

Sensação: Calmo, nostálgico, sonhador
```

### 7.4 Câmera — O Olho que se Move

| Parâmetro | Controle | Descrição |
|---|---|---|
| **Distância** | Amplitude geral | Câmera se aproxima em momentos intensos |
| **Órbita lenta** | Tempo + Médios | Câmera gira lentamente em torno da cena |
| **Tremor (shake)** | Beat | Leve vibração no beat |
| **Altura** | Graves | Câmera sobe/desce com os graves |
| **Zoom** | Beat + Amplitude | Aproxima nos drops |

---

## 8. Luzes e Sombras — Iluminação Reativa

### 8.1 Sistema de Luzes

| Luz | Tipo | Cor | Função |
|---|---|---|---|
| **Ambient** | Ambiente | Variável (HSL reativo) | Iluminação base suave |
| **Directional** | Direcional | Branca com tom | Sombras principais |
| **Point (colorida)** | Pontual | Reativa aos graves | Destaque colorido dinâmico |
| **Spot** | Spot | Reativa ao beat | Flash dramático no beat |

### 8.2 Reações de Cada Luz

#### Luz Ambiente
```
cor:     HSL(time * 0.02, 0.3, 0.2 + bass * 0.3)
intensidade: 0.2 + mid * 0.4
```

**Efeito:** A luz base da cena muda de cor suavemente. Música triste → tons azulados. Música feliz → tons alaranjados.

#### Luz Directional
```
posição: Ângulo varia com médios (órbita 8 unidades de raio)
altura:  5 + treble * 5
intensidade: 0.5 + amplitude * 1.5
```

**Efeito:** As sombras se movem com a música. Objetos projetam sombras dançantes no chão.

#### Luz Pontual Colorida
```
cor:     HSL(bass * 0.5 + time * 0.05, 0.8, 0.5)
posição: Órbita ao redor do centro, raio = 4 × (1 + bass)
intensidade: 1 + bass × 3
alcance: 10 + bass × 10
```

**Efeito:** Uma luz colorida que "explode" com os graves, iluminando objetos próximos com cores vibrantes.

#### Luz Spot (Flash do Beat)
```
intensidade: 3 + beatIntensity × 5 (dispara no beat)
             Decai 2% por frame após o beat
cor:         HSL(0.6 + beatIntensity × 0.3, 0.8, 0.5)
```

**Efeito:** Um holoforte que pisca intensamente a cada kick. Como um flash de palco.

### 8.3 Paleta de Iluminação

A iluminação segue a paleta de cores selecionada:

- **XP Classic:** Luz ambiente azulada, pontual azul, spot branco
- **Neon Cyber:** Luz ambiente magenta, pontual ciano, spot branco azulado
- **Sunset Psy:** Luz ambiente alaranjada, pontual rosa, spot dourado
- **Chrome Robot:** Luz ambiente prateada, pontual laranja, spot azul elétrico
- **Aero Glass:** Luz ambiente branco azulado, pontual azul claro, spot branco

---

## 9. Partículas — O Brilho do Som

### 9.1 Configuração do Sistema

| Parâmetro | Valor | Descrição |
|---|---|---|
| **Quantidade** | 5.000 | Total de partículas na cena |
| **Distribuição** | Nuvem esférica | Raio 5-15 unidades |
| **Tamanho base** | 0.05-0.15 unidades | Variável por partícula |
| **Blending** | Aditivo | Partículas brilham (glow) |
| **Opacidade** | 0.5-1.0 | Variável com agudos |
| **Cor** | Por vértice | Cada partícula tem cor própria |

### 9.2 Reações ao Áudio

| Estímulo | Reação das Partículas |
|---|---|
| **Graves** | Partículas se expandem radialmente (explosão) |
| **Médios** | Agitação/turbulência (movimento browniano amplificado) |
| **Agudos** | Cintilação (opacidade varia rapidamente) |
| **Beat** | Explosão concêntrica + flash de cor |
| **Amplitude** | Tamanho médio aumenta proporcionalmente |
| **Silêncio** | Partículas convergem para o centro, diminuem |

### 9.3 Comportamento Detalhado

```javascript
// A cada frame, para cada partícula:
for (let i = 0; i < particleCount; i++) {
  // Velocidade: aleatória amplificada pelo som
  vel.x += (random - 0.5) * bass * 0.05;
  vel.y += (random - 0.5) * mid * 0.05;
  vel.z += (random - 0.5) * treble * 0.05;

  // Amortecimento (volta ao normal gradualmente)
  vel *= 0.98;

  // Atualiza posição
  pos += vel;

  // Mantém dentro do raio máximo
  if (dist > maxDist) pos *= 0.99;

  // Cor: HSL baseado em distância + áudio
  hue = (dist / maxDist + treble * 0.2 + time * 0.01) % 1;
  sat = 0.8;
  light = 0.5 + bass * 0.3;

  // Tamanho: reativo à amplitude
  size = 0.1 + amplitude * 0.3;
}
```

### 9.4 Efeitos Especiais com Partículas

#### Nebulosa Galática
Quando a música tem muitos médios suaves, as partículas formam **redemoinhos** e **braços espirais**, como uma galáxia.

#### Chuva de Estrelas
Quando os agudos são fortes, partículas finas caem do topo da tela como estrelas cadentes.

#### Explosão de Supernova
No beat mais forte da música, todas as partículas explodem do centro para fora em um flash de luz.

#### Névoa Psicodélica
Com bloom ativo, as partículas criam **nuvens coloridas** que se misturam, como fumaça psicodélica.

---

## 10. Pós-processamento — Efeitos Globais

### 10.1 Bloom (Glow)

O bloom faz com que áreas brilhantes "sangrem" para áreas escuras.

| Parâmetro | Faixa | Controle |
|---|---|---|
| **Strength** | 0.0 — 1.5 | Slider + graves + beat |
| **Radius** | 0.0 — 1.0 | Agudos |
| **Threshold** | 0.0 — 0.5 | 1 - amplitude |

**Comportamento:**
- **Música calma:** Bloom sutil (0.1-0.2)
- **Música normal:** Bloom moderado (0.3-0.5)
- **Drop/clímax:** Bloom intenso (0.8-1.5)
- **Beat:** Pico instantâneo de bloom

### 10.2 Aberração Cromática

Distorce as cores nas bordas da tela, separando os canais RGB.

| Parâmetro | Controle | Efeito |
|---|---|---|
| **Offset** | Agudos | Separação das cores (0 = normal, 0.05 = máximo) |
| **Ativo** | Toggle | Liga/desliga |

**Comportamento:**
- **Sem agudos:** Imagem normal
- **Agudos moderados:** Leve separação nas bordas (estilo lente)
- **Agudos fortes:** Distorção intensa (estilo VHS danificado)

### 10.3 Motion Blur (Desfoque de Movimento)

Cria rastros atrás de objetos em movimento.

| Parâmetro | Controle | Efeito |
|---|---|---|
| **Intensidade** | Amplitude + Beat | Quanto maior o som, mais rastro |
| **Ativo** | Sempre (sutil) | Nunca desliga completamente |

### 10.4 Grain (Ruído)

Adiciona textura de filme/analógico.

| Parâmetro | Controle |
|---|---|
| **Intensidade** | Agudos + tempo |
| **Tamanho** | Fixo (1-2 pixels) |

---

## 11. Texturas — A Pele dos Objetos

### 11.1 Tipos de Textura Procedural

| Textura | Descrição | Melhor Para |
|---|---|---|
| **Gradiente XP** | Azul escuro → claro | Cubos, cilindros |
| **Chrome** | Metálico prateado com brilho | Toróides, nós |
| **Psicodélica** | Radial arco-íris | Esferas, partículas |
| **CRT** | Scanlines (linhas de monitor antigo) | Fundo, painéis |
| **Noise** | Ruído aleatório | Superfícies orgânicas |
| **Animada** | Gradiente que muda com o som | Todas as geometrias |

### 11.2 Aplicação por Geometria

| Geometria | Textura Padrão | Textura Reativa |
|---|---|---|
| **Cubo** | Gradiente XP | Animada (cores mudam com som) |
| **Esfera** | Chrome + Psicodélica | Animada + reflexão |
| **Toróide** | Chrome | Animada + emissão no beat |
| **Icosaedro** | Gradiente XP | Noise + wireframe |
| **Dodecaedro** | Gradiente + Chrome | Animada |
| **Nó Toroidal** | Psicodélica | Animada + distorção |
| **Cone** | Gradiente XP | Animada |
| **Cilindro** | Chrome | Animada + scanlines |

### 11.3 Texturas Animadas

As texturas animadas são geradas em tempo real via **Canvas 2D**:

```javascript
// A cada N frames, regenera a textura com base no áudio
const r = Math.floor(100 + 155 * bass);
const g = Math.floor(50 + 205 * mid);
const b = Math.floor(150 + 105 * treble);

const gradient = ctx.createLinearGradient(0, 0, w, h);
gradient.addColorStop(0, `rgb(${r},${g},${b})`);
gradient.addColorStop(0.5, `rgb(${g},${b},${r})`);
gradient.addColorStop(1, `rgb(${b},${r},${g})`);

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, w, h);
```

---

## 12. Padrões e Distorções — O Caos Orgânico

### 12.1 Padrões de Distribuição

#### Grade Esférica (Padrão)
```
Objetos distribuídos uniformemente em uma esfera.
Raio: 3-8 unidades
Altura: -4 a +4
```

#### Matriz 3D
```
Objetos em grid cúbico (5×5×5 = 125 objetos).
Distância: 1.5 unidades entre cada.
```

#### Anéis Concêntricos
```
Objetos formam anéis ao redor do centro.
Cada anel tem raio crescente.
Rotação em direções alternadas.
```

#### Espiral Fibonacci
```
Objetos seguem a proporção áurea.
Distribuição em espiral.
Movimento de rotação contínuo.
```

### 12.2 Distorções de Superfície

#### Wave Distortion
```
Ondas percorrem a superfície dos objetos.
Frequência: Controlada pelos médios
Amplitude: Controlada pelos graves
Velocidade: Controlada pelos agudos
```

#### Vertex Displacement
```
Vértices das geometrias são deslocados.
Intensidade: Controlada pela amplitude
Padrão: Senoidal ou ruído Perlin
```

#### Twist (Torção)
```
Objetos sofrem torção ao longo de um eixo.
Intensidade: Controlada pelos médios
Direção: Alterna com o beat
```

---

## 13. Modos de Visualização — Cenários Completos

### 13.1 Modo Híbrido (Padrão)

Tudo ativo: geometrias + partículas + luzes + bloom.

**Melhor para:** Músicas complexas com variação em todas as frequências.

### 13.2 Modo "Apenas Formas"

Apenas geometrias 3D, sem partículas.

**Melhor para:** Músicas com melodias claras (vocal, piano, violão).

### 13.3 Modo "Apenas Partículas"

Apenas sistema de partículas, sem geometrias.

**Melhor para:** Músicas ambientes, chill, eletrônica suave.

### 13.4 Modo "Wireframe"

Geometrias em modo wireframe (apenas arestas), sem partículas.

**Melhor para:** Músicas techno, industrial, eletrônica pesada.

---

## 14. Tabela Completa de Mapeamento

### 14.1 Matriz Áudio → Visual

| Componente | Parâmetro | Graves | Médios | Agudos | Beat | Amplitude |
|---|---|---|---|---|---|---|
| **Geometria** | Escala | ✅ Forte | — | — | ✅ Forte | ✅ |
| **Geometria** | Rotação X | — | ✅ Forte | — | — | — |
| **Geometria** | Rotação Y | — | ✅ | ✅ | — | — |
| **Geometria** | Rotação Z | ✅ | — | — | — | — |
| **Geometria** | Posição | ✅ | ✅ | ✅ | ✅ | — |
| **Geometria** | Cor (Hue) | — | — | ✅ Forte | ✅ | — |
| **Geometria** | Saturação | — | ✅ | — | ✅ | — |
| **Geometria** | Luminosidade | ✅ | — | — | ✅ | — |
| **Geometria** | Emissão | — | — | — | ✅ Forte | — |
| **Geometria** | Opacidade | — | — | ✅ | — | — |
| **Geometria** | Wireframe | — | — | ✅ | — | — |
| **Partículas** | Tamanho | ✅ | — | ✅ | ✅ | ✅ Forte |
| **Partículas** | Velocidade | ✅ | ✅ | ✅ | ✅ Forte | — |
| **Partículas** | Cor (Hue) | — | — | ✅ | ✅ | — |
| **Partículas** | Opacidade | — | — | ✅ | ✅ | — |
| **Partículas** | Expansão | ✅ Forte | — | — | ✅ | — |
| **Luz Ambiente** | Cor | ✅ | — | — | — | — |
| **Luz Ambiente** | Intensidade | — | ✅ | — | — | ✅ |
| **Luz Direcional** | Ângulo | — | ✅ | — | — | — |
| **Luz Direcional** | Intensidade | — | — | — | — | ✅ Forte |
| **Luz Pontual** | Cor | ✅ | — | — | — | — |
| **Luz Pontual** | Intensidade | ✅ Forte | — | — | ✅ | — |
| **Luz Pontual** | Alcance | ✅ | — | — | — | — |
| **Luz Spot** | Intensidade | — | — | — | ✅ Forte | — |
| **Luz Spot** | Cor | — | — | — | ✅ | — |
| **Bloom** | Strength | ✅ | — | — | ✅ Forte | ✅ |
| **Bloom** | Radius | — | — | ✅ | — | — |
| **Bloom** | Threshold | — | — | — | — | ✅ (inverso) |
| **Background** | Cor | ✅ | ✅ | ✅ | ✅ | — |
| **Câmera** | Distância | — | — | — | — | ✅ |
| **Câmera** | Tremor | — | — | — | ✅ | — |

### 14.2 Matriz de Intensidade

| Valor | Descrição |
|---|---|
| — | Sem efeito |
| ✅ | Efeito leve (1x-1.5x) |
| ✅ ✅ | Efeito moderado (1.5x-3x) |
| ✅ ✅ ✅ | Efeito forte (3x-5x+) |

---

## 15. Guia de Sintonia Fina

### 15.1 Ajustes Recomendados por Gênero Musical

#### Eletrônico / Dance / House
```
Sensibilidade: Graves 150%, Médios 100%, Agudos 80%
Geometria: Cubo ou Toróide
Partículas: Ativado (explosões no beat)
Bloom: 40%
Velocidade: 150%
Modo: Híbrido
Paleta: Neon Cyber
```

#### Rock / Metal
```
Sensibilidade: Graves 120%, Médios 140%, Agudos 100%
Geometria: Icosaedro ou Dodecaedro
Partículas: Ativado (agitação)
Bloom: 60%
Velocidade: 200%
Modo: Wireframe
Paleta: Chrome Robot
```

#### Jazz / Blues
```
Sensibilidade: Graves 80%, Médios 120%, Agudos 100%
Geometria: Esfera ou Toróide
Partículas: Ativado (sutil)
Bloom: 20%
Velocidade: 50%
Modo: Apenas Formas
Paleta: XP Classic
```

#### Lo-fi / Chill / Ambiente
```
Sensibilidade: Graves 60%, Médios 80%, Agudos 50%
Geometria: Esfera
Partículas: Ativado (névoa)
Bloom: 30%
Velocidade: 30%
Modo: Apenas Partículas
Paleta: Aero Glass
Background: Gradiente XP
```

#### Clássica / Orquestral
```
Sensibilidade: Graves 70%, Médios 150%, Agudos 130%
Geometria: Esfera + Toróide
Partículas: Ativado (sutil)
Bloom: 50%
Velocidade: 80%
Modo: Híbrido
Paleta: Sunset Psy
```

#### Experimental / IDM / Glitch
```
Sensibilidade: Graves 200%, Médios 200%, Agudos 200%
Geometria: Nó Toroidal
Partículas: Ativado (caos)
Bloom: 100%
Velocidade: 300%
Modo: Wireframe
Paleta: Neon Cyber
Efeitos: Aberração cromática ON
```

### 15.2 Dicas de Performance

| Situação | Ajuste |
|---|---|
| **FPS abaixo de 30** | Reduzir número de objetos para 10 |
| **FPS abaixo de 20** | Desligar partículas |
| **FPS abaixo de 15** | Desligar bloom |
| **Tela preta** | Verificar se WebGL está disponível |
| **Áudio não sincroniza** | Aumentar sensibilidade dos graves |
| **Cores muito agitadas** | Reduzir sensibilidade dos agudos |

---

## 16. Exemplos Práticos — Músicas Reais

### 16.1 Exemplo 1: Música Eletrônica (House)

**Música:** "Strobe" — Deadmau5

```
Análise:
├── Introdução (0:00-1:00): Melodia suave, sem bateria
│   ├── Bass: 0.1 (muito baixo)
│   ├── Mid: 0.3-0.5 (melodia em synth)
│   ├── Treble: 0.2 (hi-hats sutis)
│   └── Beat: Nenhum
│   
│   Visual:
│   ├── Geometrias: Flutuação lenta, rotação suave
│   ├── Cores: Azuis e verdes pastéis
│   ├── Partículas: Névoa sutil
│   └── Bloom: 0.2

├── Desenvolvimento (1:00-2:00): Bateria entra
│   ├── Bass: 0.3-0.5 (kick começa)
│   ├── Mid: 0.4-0.6 (melodia + baixo)
│   ├── Treble: 0.3-0.4 (hi-hats + claps)
│   └── Beat: A cada 1.5s (128 BPM)
│   
│   Visual:
│   ├── Geometrias: Pulso no kick, rotação acelera
│   ├── Cores: Transição para ciano e magenta
│   ├── Partículas: Explosões no beat
│   └── Bloom: 0.3-0.4

├── Clímax (2:00-3:30): Drop
│   ├── Bass: 0.7-0.9 (kick forte + sub-bass)
│   ├── Mid: 0.6-0.8 (synths cheios)
│   ├── Treble: 0.5-0.7 (hi-hats rápidos)
│   └── Beat: Intensidade 0.8-1.0
│   
│   Visual:
│   ├── Geometrias: Escala 2x no beat, rotação rápida
│   ├── Cores: Explosão de cores, saturação máxima
│   ├── Partículas: Explosão radial intensa
│   ├── Bloom: 0.8-1.0 (glow intenso)
│   ├── Luzes: Spot branco pisca no beat
│   └── Câmera: Zoom in + shake no beat

├── Saída (3:30-5:00): Volta à calma
│   ├── Bass: 0.2-0.4
│   ├── Mid: 0.3-0.5
│   ├── Treble: 0.2-0.3
│   └── Beat: Menos frequente
│   
│   Visual:
│   ├── Tudo volta gradualmente ao estado inicial
│   ├── Bloom diminui
│   └── Partículas convergem ao centro
```

### 16.2 Exemplo 2: Rock Progressivo

**Música:** "2112" — Rush

```
Análise:
├── Overture (0:00-2:00): Guitarras pesadas + bateria
│   ├── Bass: 0.5-0.7 (bateria + baixo)
│   ├── Mid: 0.5-0.8 (guitarra solo)
│   ├── Treble: 0.3-0.5 (pratos)
│   └── Beat: Intensidade média, frequente
│   
│   Visual:
│   ├── Geometrias: Icosaedros pulsando, rotação média
│   ├── Cores: Laranja e vermelho predominam
│   ├── Modo: Híbrido com wireframe ativado
│   └── Bloom: 0.4-0.6

├── Parte Calma (2:00-3:30): Vocal + violão
│   ├── Bass: 0.1-0.2
│   ├── Mid: 0.3-0.5 (vocal)
│   ├── Treble: 0.2-0.3 (dedilhado)
│   └── Beat: Raro
│   
│   Visual:
│   ├── Geometrias: Suaves, cores frias
│   ├── Partículas: Pouca atividade
│   └── Bloom: 0.2

├── Grand Finale (3:30-5:00): Tudo ao mesmo tempo
│   ├── Bass: 0.8-1.0
│   ├── Mid: 0.7-0.9
│   ├── Treble: 0.6-0.8
│   └── Beat: Intensidade alta
│   
│   Visual:
│   ├── TODOS os efeitos no máximo
│   ├── Bloom: 1.0-1.5
│   ├── Aberração cromática ativada
│   ├── Partículas em turbilhão
│   └── Luzes strobe no beat
```

### 16.3 Exemplo 3: Jazz Suave

**Música:** "Take Five" — Dave Brubeck

```
Análise (5/4 time signature, BPM ~170 swing):
├── Intro: Sax + piano
│   ├── Bass: 0.2 (contrabaixo andando)
│   ├── Mid: 0.4-0.6 (sax melodia)
│   ├── Treble: 0.3 (pratos swing)
│   └── Beat: Sutil (bateria leve)
│   
│   Visual:
│   ├── Geometrias: Esferas flutuando, rotação lenta
│   ├── Cores: Dourados e azuis escuros
│   ├── Partículas: Névoa com poucas partículas
│   └── Bloom: 0.2 (sutil)
│   ├── Modo: Apenas Formas (partículas desligadas)

├── Solo de bateria:
│   ├── Bass: 0.3-0.5 (bumbo)
│   ├── Mid: 0.4 (caixa)
│   ├── Treble: 0.6-0.8 (pratos pesados)
│   └── Beat: Não regular (jazz)
│   
│   Visual:
│   ├── Geometrias: Movimento orgânico, não rígido
│   ├── Cores: Mudanças suaves
│   ├── Partículas: Ativadas sutilmente
│   └── Bloom: 0.3

├── Outro: Desaceleração
│   ├── Tudo diminui gradualmente
│   └── Visual volta ao estado calmo inicial
```

---

## Resumo Visual em Uma Imagem

```
                    ┌─────────────────────────────────────┐
                    │          ÁUDIO ANALISADO            │
                    │   (FFT 2048 bins → 3 bandas)        │
                    └────────────┬───────────┬────────────┘
                                 │           │
                    ┌────────────┘           └────────────┐
                    ▼                                     ▼
           ┌────────────────┐                  ┌──────────────────┐
           │   FREQUÊNCIAS   │                  │       BEAT       │
           │                │                  │                  │
           │ Bass → Escala  │                  │ Luz spot flash   │
           │ Mid  → Rotação │                  │ Escala pulso     │
           │ Treble → Cor   │                  │ Partículas boom  │
           │                │                  │ Bloom spike      │
           └────────────────┘                  └──────────────────┘
                    │                                     │
                    └────────────────┬────────────────────┘
                                     ▼
                          ┌──────────────────┐
                          │  MUNDO VISUAL 3D │
                          │                  │
                          │  ✦ Geometrias    │
                          │  ✦ Partículas    │
                          │  ✦ Luzes         │
                          │  ✦ Cores         │
                          │  ✦ Movimento     │
                          │  ✦ Bloom/Glow    │
                          │  ✦ Distorções    │
                          │  ✦ Texturas      │
                          └──────────────────┘
                                     │
                                     ▼
                          ┌──────────────────┐
                          │  THREE.JS RENDER │
                          │  60 FPS em tela  │
                          └──────────────────┘
```

---

**Fim do Guia de Feedback Visual**  
⚡ Use este documento como referência para entender, ajustar e expandir os visuais do Audio Visualizer XP. Experimente diferentes músicas, ajustes e modos para descobrir combinações únicas! 🎵✨