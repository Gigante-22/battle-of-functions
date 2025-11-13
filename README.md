# Battle of Functions – Dark Visual Edition 🎮⚔️

## Descrição

Um jogo educativo e interativo de Cálculo Diferencial e Integral com tema **Dark Fantasy**. Os jogadores enfrentam duelos matemáticos onde devem responder corretamente a questões sobre **Limites**, **Derivadas** e **Integrais** para atacar e derrotar o rival.

## Características

✨ **Modo de Jogo:**
- 1 Jogador vs IA
- 2 Jogadores (local alternado)

⚡ **Ataques Matemáticos:**
- **Limite** → 10 dano (rápido)
- **Derivada** → 20 dano (médio)
- **Integral** → 30 dano (forte)

🎨 **Visual:**
- Tema dark com gradientes roxos e vermelhos
- Personagens: Mago (Jogador 1) e Guerreiro (Rival)
- Efeitos de ataque animados (raios, fogo, energia)
- Animações de dano e impacto
- Background temático

🔊 **Áudio:**
- Síntese de som via WebAudio (funciona offline)
- Efeitos sonoros diferenciados por tipo de ataque
- Música ambiente de fundo

📚 **Banco de Questões:**
- **15 questões** sobre Limites
- **20 questões** sobre Derivadas
- **17 questões** sobre Integrais
- **Total: 52 perguntas** com níveis variados de dificuldade

## Estrutura de Arquivos

```
Battle-of-Functions-Dark/
├── index.html                    # Interface principal do jogo
├── css/
│   └── style.css                 # Estilos dark com animações
├── js/
│   └── script.js                 # Lógica do jogo, IA e sons
├── img/
│   ├── mago.png                  # Personagem do Jogador 1
│   ├── guerreiro.png             # Personagem do Rival
│   ├── background.jpg            # Fundo do campo de batalha
│   └── efeitos/
│       ├── Raio branco integral.png      # Efeito de ataque Integral
│       ├── Fogo limite.png               # Efeito de ataque Limite
│       ├── energia derivada.png          # Efeito de ataque Derivada
│       └── Efeito de impacto.png         # Efeito de impacto
├── audio/
│   └── README.txt                # Instruções para adicionar áudio
└── data/
    └── perguntas.json            # Banco de perguntas

```

## Como Jogar

### 1️⃣ Iniciar o Jogo
- Abra `index.html` em um navegador moderno
- Clique em **"Jogar"** na tela inicial

### 2️⃣ Escolher Modo
- **1 Jogador (vs IA):** Jogue contra a inteligência artificial
- **2 Jogadores (local):** Jogue contra um amigo, alternando turnos

### 3️⃣ Batalhar
- Clique em um dos botões de ataque:
  - 🎯 **Limite** (10 dano)
  - 📐 **Derivada** (20 dano)
  - ∫ **Integral** (30 dano)

### 4️⃣ Responder Questão
- Uma pergunta de múltipla escolha aparecerá
- Escolha a alternativa **correta (A, B, C ou D)**
- ✅ **Acertou?** → Ataque causa dano ao inimigo
- ❌ **Errou?** → Inimigo contra-ataca com o mesmo dano

### 5️⃣ Vencer
- Reduza o HP do rival para **0**
- Veja a tela de vitória com mensagem animada
- Reinicie para jogar novamente

## Requisitos Técnicos

- ✅ Navegador moderno com suporte a ES6+
- ✅ Funciona **100% offline** (não precisa de internet)
- ✅ Funciona em desktop e mobile (responsivo)
- ✅ Sem dependências externas

## Como Executar

### Opção 1: Abrir Direto
```powershell
# No Windows, navegue até a pasta e abra:
start index.html
```

### Opção 2: Servidor Local (recomendado para melhor compatibilidade)
```powershell
# Com Python 3 instalado:
python -m http.server 8000

# Depois abra no navegador:
# http://localhost:8000
```

## Customização

### Adicionar Mais Perguntas
1. Abra `data/perguntas.json`
2. Adicione novas perguntas seguindo o formato:
```json
{
  "tipo": "derivada",
  "pergunta": "Calcule f'(x) se f(x) = x² + 3x",
  "alternativas": ["2x + 3", "2x", "x + 3", "2"],
  "correta": "2x + 3"
}
```

### Substituir Imagens
- Coloque novas imagens PNG em `img/`
- As dimensões recomendadas são:
  - **Personagens:** 256x256px
  - **Efeitos:** 100x100px a 120x120px
  - **Background:** 1280x720px ou superior

### Adicionar Áudio Real
1. Coloque arquivos `.mp3` em `audio/`
2. O jogo usará WebAudio synth por padrão (offline)
3. Para usar arquivos MP3, solicite uma atualização do script

## Créditos e Atribuições

**Desenvolvimento:** Sistema educativo interativo de Cálculo

**Tecnologias:**
- HTML5
- CSS3 (gradientes, animações, flexbox)
- JavaScript vanilla (ES6+)
- Web Audio API

**Imagens:** Personalizadas para o tema dark fantasy

**Sons:** Síntese via Web Audio API (compatível com offline)

## Dicas de Gameplay

🧠 **Estratégia:**
- Use ataques fracos (Limite) para conservar mana/energia
- Use ataques fortes (Integral) quando tiver certeza de acertar
- Estude os tópicos para melhorar sua taxa de acerto

📊 **Balanceamento:**
- 100 HP para cada personagem
- A dificuldade aumenta com perguntas mais complexas
- IA tem 75% de chance de acerto (modo realista)

🎯 **Para Ganhar:**
- Acerte a maioria das questões
- Use o ataque adequado na hora certa
- Aprenda com os erros!

## Troubleshooting

**Problema:** As imagens não aparecem
- ✅ Verifique se todos os arquivos estão na pasta `img/`
- ✅ Abra via servidor local em vez de arquivo direto

**Problema:** Som não funciona
- ✅ Compatível com Web Audio (funciona offline)
- ✅ Verifique se o navegador não está silenciado
- ✅ Tente outro navegador

**Problema:** Perguntas não carregam
- ✅ O jogo tem fallback embutido
- ✅ Verifique se `data/perguntas.json` existe
- ✅ Abra via servidor local para melhor compatibilidade

## Licença e Uso

Este projeto é fornecido como software educacional livre. Sinta-se à vontade para:
- ✅ Usar para fins educacionais
- ✅ Modificar e adaptar
- ✅ Compartilhar melhorias

---

**Desenvolvido com ❤️ para aprender Cálculo de forma divertida!**

🎮 **Divirta-se e aprenda!** 📚✨
