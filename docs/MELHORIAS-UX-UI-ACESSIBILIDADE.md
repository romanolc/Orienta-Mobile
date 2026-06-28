# Orienta — Análise Crítica e Plano de Melhorias UX/UI/Acessibilidade

> **Data:** 27/06/2026
> **Versão analisada:** OrientaV4 (index.html + script.js + style.css)
> **Persona-alvo:** produtores rurais com baixa escolaridade, baixa familiaridade tecnológica, uso majoritário de celular e, frequentemente, idosos.
> **Princípio-guia:** *"O mapa interpreta. O produtor entende. A legislação fala a língua dele."*

---

## 1. Visão Geral do Estado Atual

### 1.1 Pontos fortes identificados

| Item | Avaliação |
|---|---|
| Identidade visual (verde/navy, logo, splash) | ✅ Consistente, reconhecível e "do campo" |
| Linguagem da persona ("Seu Raimundo", "bora") | ✅ Tom acolhedor, regionalista e acessível |
| Arquitetura mobile-first (max-width 430px, dvh, safe areas) | ✅ Compatível com Android low-end |
| TTS pt-BR nativo com controle de velocidade | ✅ Bom esqueleto de acessibilidade |
| Mapa SVG interativo com áreas clicáveis | ✅ Bom começo (mas precisa evoluir) |
| Painel lateral ao tocar na área | ✅ Funciona como Google Maps, mas é subutilizado |
| Simulador "E se eu..." já implementado | ✅ Diferencial competitivo relevante |
| Diagnóstico com score ring e cards expansíveis | ✅ Linguagem clara |
| Sistema de cores semafórico (verde/vermelho/âmbar) | ✅ Familiar para qualquer usuário |
| FAQ + Comunidade com exemplos humanos | ✅ Construção de confiança |

### 1.2 Pontos fracos críticos

| Item | Impacto | Severidade |
|---|---|---|
| **Mapa é estático** — sem halo, sem zoom automático, sem realce da área clicada | O usuário não sabe *onde* clicou | 🔴 Alta |
| **Legenda técnica** ("APP", "RL", "Limite") | Repele o produtor | 🔴 Alta |
| **Painel do mapa é raso** — mostra apenas texto corrido sem status, ações, restrições, motivos | Não ensina | 🔴 Alta |
| **Sem perguntas guiadas ao tocar a área** — usuário precisa digitar | Frustra idosos | 🔴 Alta |
| **Sem simulador integrado ao mapa** — está num card separado | Quebra a experiência conversacional | 🔴 Alta |
| **Alertas contextuais não pulsam no mapa** — só aparecem no sino | Passa despercebido | 🔴 Alta |
| **Diagnóstico sem timeline** — o produtor não enxerga o "andamento" | Falta confiança | 🟠 Média |
| **Dashboard sem cartões de status** (Tudo certo/Atenção/Pendências) | Tela inicial "frouxa" | 🟠 Média |
| **Comando por voz só de saída (TTS)**, sem STT | Acessibilidade incompleta | 🟠 Média |
| **Modo alto contraste** é só classe CSS — não há tokens semânticos próprios | Não atende WCAG AAA | 🟠 Média |
| **Glifos decorativos (🌿, 💧)** sem fallback textual para leitor de tela | Barreira para cegos | 🟠 Média |
| **Auto-read do chat precisa estar visível** — está escondido em Configurações | Descoberta baixa | 🟡 Baixa |
| **Sem onboarding guiado no primeiro acesso** | Produtor se perde | 🟡 Baixa |
| **Sem histórico de conversas da IA** | Perda de contexto | 🟡 Baixa |

---

## 2. Arquitetura da Informação — Jornada Recomendada

A jornada atual segue o modelo *dashboard → módulos*. Para um produtor com baixa escolaridade, o ideal é **uma jornada narrativa**, em que cada etapa conta uma história.

### 2.1 Jornada "Conte-me sobre a sua terra" (proposta)

```
1. Boas-vindas (com voz)            → "Olá, Seu Raimundo. Vamos ver como está sua terra hoje?"
2. Onboarding guiado (1ª vez)       → "Mostre-me onde fica sua propriedade" (opcional: foto do documento CAR)
3. Resumo visual                    → Cartões grandes (verde/âmbar/vermelho) com 1 palavra cada
4. Mapa interativo                  → Toque em qualquer área para ouvir o que pode ou não fazer
5. Diagnóstico em timeline          → "1. Imóvel localizado  2. Dados analisados..."
6. Próximos passos personalizados   → 3 ações simples para resolver pendências
7. Falar com Orienta (IA)           → Chat ou voz
```

### 2.2 Navegação inferior (bottom-nav) — proposta refinada

Atual: **Início · IA · Mapa · Comunidade · Suporte**

Recomendação: **Início · Mapa · Falar (centro, elevado) · Alertas · Perfil**

- **"Falar"** centralizado, com ícone de microfone grande e cor de destaque — torna o comando por voz descobrível sem entrar em Configurações.
- **"Alertas"** substitui "Comunidade" como prioridade nº 1 do produtor (o que afeta minha terra hoje?).
- **Comunidade** entra como aba dentro de "Perfil" ou "Mais".
- **Suporte** vira botão flutuante WhatsApp (que já existe) e dentro de "Perfil".

---

## 3. Dashboard — Cartões de Resumo (Prioridade Alta)

### 3.1 Estado atual
- Saudação personalizada ✅
- Card grande da propriedade ✅
- 4 quick-actions ✅
- Lista de "últimas orientações" ✅

### 3.2 Melhorias propostas

**Substituir** o card de propriedade gigante por uma **fileira de 4 mini-cartões de status** (estilo status bancário):

```
┌─────────────────┐  ┌─────────────────┐
│ 🟢 Tá tudo certo│  │ 🟡 Atenção      │
│ 3 áreas ok      │  │ 1 área         │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│ 🔴 Pendências   │  │ 📄 Próximos     │
│ 1 ação          │  │ passos         │
└─────────────────┘  └─────────────────┘
```

Cada cartão deve:
- Ter **ícone grande (40px+)**, cor de fundo da categoria e **uma única frase**.
- Ser **clicável e levar ao detalhe** com animação de slide.
- Ter **borda lateral colorida** para reforço de cor + ícone (não depender só de cor).
- Exibir **contador** ("1 ação necessária", "3 áreas ok").
- Mostrar **microanimação** ao tocar (pulso leve de 1.5x).
- Possuir `aria-live="polite"` para anunciar mudanças a leitores de tela.

**Abaixo**, manter o **card da propriedade** (resumo estático) e **quick-actions**, mas com labels ainda mais curtos:
- "🤖 Falar com Orienta"
- "🗺️ Ver minha terra"
- "🩺 Como está minha terra"
- "👥 Vizinhos"

**Remover** a seção "Últimas orientações" da home (vai para Alertas), para reduzir ruído.

---

## 4. Mapa Interativo — Reescrita Completa (Prioridade Máxima)

> Esta é a mudança mais importante do projeto. O mapa deixa de ser "mostrador" e vira **"consultor ambiental visual"**.

### 4.1 Deficiências atuais
1. **Sem realce visual ao clicar** — o painel aparece, mas o mapa não indica *onde* está a área selecionada.
2. **Sem perguntas pré-prontas** — produtor precisa digitar (idosos desistem).
3. **Sem simulador dentro do mapa** — está num card solto em "Meu Imóvel".
4. **Legenda usa jargão** (APP, RL, Limite).
5. **Sem halo, sem zoom automático, sem animação de foco.**
6. **Sem ícones grandes sobrepostos** ao mapa (pin de interrogação, pin de alerta).
7. **Painel lateral tem só texto** — sem status visual, sem checklist de permitido/proibido.
8. **Áreas críticas não pulsam nem piscam**.

### 4.2 Especificação da nova experiência

#### 4.2.1 Legenda (substituir completamente)

Manter a legenda fixa no canto inferior esquerdo, mas com **linguagem cotidiana**:

| Ícone | Nome popular | Cor | Significado |
|---|---|---|---|
| 🟢 | **Área livre** | Verde claro | Pode plantar e usar. |
| 🟡 | **Atenção** | Amarelo | Existe restrição. Toque para saber. |
| 🔴 | **Área protegida** | Vermelho translúcido | Não mexer. Tem regra forte. |
| 🔵 | **Beira de rio** | Azul claro | APP obrigatória. |
| 🌳 | **Mato preservado** | Verde escuro | Vegetação nativa. |

**Cada item da legenda também deve ser clicável** e abrir um microexplicativo (modal pequeno).

#### 4.2.2 Interação ao tocar uma área (5 etapas)

Quando o usuário tocar em qualquer área do mapa:

**Etapa 1 — Realce visual no SVG**
- A área clicada recebe um **halo pulsante** (`<animate>` SVG ou CSS keyframes).
- A borda fica **mais espessa e animada** (stroke-dasharray correndo).
- As **demais áreas ficam com opacidade 0.35** para destacar a escolhida.
- **Zoom automático suave** (`transform: scale(1.08)` no polígono, com `transform-origin` calculado).
- Animação de "foco": a área cresce 1.05x, volta para 1.0x, em 400ms.

**Etapa 2 — Painel lateral (desktop) / Bottom Sheet (mobile)**

Estrutura recomendada:

```
┌────────────────────────────────────┐
│  ✕                                │
│  📍  Área próxima ao Córrego      │
│      São João                      │
│                                    │
│  Status                            │
│  🔴 Área Protegida (APP)          │
│                                    │
│  O que significa (texto simples)   │
│  "Essa faixa fica ao redor do      │
│   rio. A lei pede pra preservar."  │
│                                    │
│  ✅ O que PODE fazer               │
│  ✔ Recuperar a vegetação           │
│  ✔ Manter a área como está         │
│                                    │
│  ❌ O que NÃO PODE fazer           │
│  ✘ Abrir novo cultivo              │
│  ✘ Tirar a vegetação sem autorização│
│                                    │
│  ⚠ Construções precisam de         │
│    autorização                     │
│                                    │
│  [ 🔊 Ouvir esta explicação ]      │
│                                    │
│  ─────────────────────────────     │
│  Perguntas rápidas:                │
│  ┌─────────────┐ ┌──────────────┐ │
│  │ 🌱 Posso    │ │ 🏠 Posso     │ │
│  │ plantar?    │ │ construir?   │ │
│  └─────────────┘ └──────────────┘ │
│  ┌─────────────┐ ┌──────────────┐ │
│  │ 🐄 Posso    │ │ 🌳 Preciso   │ │
│  │ criar gado? │ │ recuperar?   │ │
│  └─────────────┘ └──────────────┘ │
│  ┌──────────────────────────────┐  │
│  │ 🧪 Simular uma atividade    │  │
│  │    nesta área                │  │
│  └──────────────────────────────┘  │
│  [ 🧠 Entender o motivo ]         │
│  [ 💬 Falar com a IA ]            │
└────────────────────────────────────┘
```

**Etapa 3 — Perguntas pré-prontas (chips grandes)**

Tocar em qualquer chip = envia a pergunta para a IA **automaticamente** com o contexto da área selecionada (ex.: "Posso plantar aqui? *contexto: APP — Córrego São João*"). A IA já existente responde com a linguagem simples.

**Etapa 4 — "Entender o motivo"**

Abre um subpainel com:
- Linguagem nível fundamental
- Analogia do cotidiano (ex.: "É como o cinto de segurança — mesmo sem acidente, é obrigatório usar")
- Exemplo prático do produtor
- Botão "Falar com a IA sobre isso"

**Etapa 5 — Simulador "E se eu..."**

Substituir o simulador atual (que está em um card avulso no Diagnóstico) e movê-lo para dentro do mapa:
- Botão "🧪 Simular uma atividade nesta área"
- Opções: 🌱 Plantar milho · 🏠 Construir · 🚜 Abrir estrada · 🌳 Recuperar vegetação · 🐄 Criar gado · 🪵 Tirar lenha
- Resposta visual em 3 níveis:
  - ✅ **Verde** — Pode fazer tranquilo
  - ⚠️ **Amarelo** — Pode, mas com condições
  - ❌ **Vermelho** — Não recomendado (e por quê)
- Sempre acompanhado de **alternativas** ("Posso fazer aqui? ➜ use a área azul destacada no mapa").

#### 4.2.3 Alertas pulsantes no mapa

- Áreas com status ⚠️ ou 🔴 devem ter **pulso contínuo** (animação lenta de stroke-opacity).
- Tap em um alerta abre diretamente o painel contextual.
- Cor do halo: vermelho translúcido (`rgba(220,38,38,0.35)` com pulse para `0.55`).
- Aplicar também **uma exclamação grande** (⚠️) posicionada sobre a área crítica.

#### 4.2.4 Pin "?" sobreposto

- Colocar **1 botão "❓ O que posso fazer aqui?"** centralizado na parte inferior do mapa.
- Quando tocado, abre menu de **perguntas universais** que não dependem de área selecionada.
- Mantém a IA em modo "livre", mas com sugestões iniciais.

#### 4.2.5 Indicadores visuais por categoria (ícones grandes)

Sobrepor ao mapa, com posição fixa (por área):

```
📍 APP          ➜ ícone azul redondo com gota 💧
🌳 Vegetação    ➜ ícone verde redondo com árvore
🌱 Cultivo      ➜ ícone amarelo redondo com broto
💧 Curso d'água  ➜ ícone azul claro com onda
🚧 Alerta       ➜ ícone vermelho com exclamação
```

Cada ícone tem **48px+ de área clicável** (acessibilidade por toque). Tap = mesmo painel contextual.

#### 4.2.6 Botões flutuantes do mapa

Adicionar coluna à direita com FABs (Floating Action Buttons):
- 🔍+ Zoom in
- 🔍− Zoom out
- 🎯 Centralizar na propriedade
- 📍 Minha localização (GPS — pedir permissão)
- 🧭 Bússola (reorientar norte)
- 🔊 Modo áudio guiado (narrar áreas conforme desliza)

---

## 5. Diagnóstico — Reformulação com Timeline (Prioridade Alta)

### 5.1 Estado atual
- Score ring 80%
- Cards expansíveis (Reserva Legal, APP, CAR)
- Cada card tem "O que é / Como está / O que fazer"

### 5.2 Melhorias propostas

#### 5.2.1 Adicionar timeline visual no topo

```
  1️⃣ Imóvel localizado          ✓
  2️⃣ Dados analisados           ✓
  3️⃣ Legislação interpretada    ✓
  4️⃣ Diagnóstico pronto         ✓
  5️⃣ Recomendações geradas      ✓
```

Cada etapa tem:
- Ícone grande (32px) circular
- Linha conectora animada entre etapas (a etapa concluída fica em verde, a atual em azul pulsante, as futuras em cinza)
- Label curto (1 linha)
- Data/hora de conclusão ao tocar

#### 5.2.2 Substituir score numérico por "Termômetro Ambiental"

Em vez de "80%" + ring, usar:

```
┌─────────────────────────────────────┐
│  Como está sua terra hoje          │
│                                     │
│  🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜  (7/10)        │
│                                     │
│  "Tá bem. Só precisa de 1 cuidado." │
│                                     │
│  [ ▶ Ouvir resumo (3 min) ]         │
└─────────────────────────────────────┘
```

- **Visual de "barrinhas coloridas"** é mais intuitivo que %.
- Frase curta abaixo com **avaliação qualitativa** ("Tá tudo certo", "Precisa de atenção", "Tem risco sério").
- Botão de TTS para ouvir o resumo enquanto olha o mapa.

#### 5.2.3 Cards expansíveis — refinar

- Cada card deve ter **badge de risco** (🟢/🟡/🔴) com texto ("Tudo certo", "Atenção", "Crítico").
- Adicionar **ícone de "ir para o mapa"** que centraliza e destaca aquela área.
- Manter a estrutura "O que é / Como está / O que fazer" mas com **uma frase por linha** e **linguagem ainda mais simples** (substituir "passivo ambiental", "sobreposição", "conformidade" — ver dicionário na seção 9).

---

## 6. Assistente IA — Aprimoramentos

### 6.1 Estado atual
- Chat com bolhas
- Sugestões iniciais (chips)
- TTS por mensagem
- Digitação simulada

### 6.2 Melhorias propostas

#### 6.2.1 Botão de voz flutuante (STT)
- **Microfone grande** abaixo do input (44px, com pulse quando escutando).
- Web Speech API (`SpeechRecognition`) — já tem `startVoiceInput` mas pouco descoberto.
- Feedback visual: ondas de áudio animadas enquanto escuta.
- Após reconhecer, mostrar texto digitado **palavra por palavra** (efeito "ao vivo").

#### 6.2.2 Respostas em camadas

Em vez de um textão, dividir a resposta em **3 blocos**:

```
🌿 Resposta curta (1 linha)
"Essa área é protegida. Não pode mexer."

📖 Explicação simples (2-3 linhas)
"É como se fosse a beira do rio. A lei pede
pra deixar o mato ali pra proteger a água."

💡 O que fazer (1-2 linhas)
"Use outra parte da sua terra pra plantar.
A IA te ajuda a achar."
```

Cada bloco tem ícone próprio, cor de fundo suave e botão "🔊 Ouvir".

#### 6.2.3 Anexar contexto da área selecionada

Quando o chat for aberto a partir do mapa (área selecionada), o contexto da área é **enviado implicitamente** à IA:
- A primeira mensagem da IA inclui: "Tô vendo que você tocou na **APP do Córrego São João**. Posso te ajudar com isso?"

#### 6.2.4 Histórico persistente

- Manter histórico da conversa na sessão (`localStorage` opcional).
- Botão "↻ Nova conversa" para reiniciar sem perder contexto anterior.

#### 6.2.5 Atalhos rápidos na barra superior do chat

- 📷 Enviar foto (já implementado)
- 🗺️ Voltar ao mapa (com a última área selecionada em destaque)
- 🔊 Ler tudo em voz alta
- ⭐ Salvar resposta importante

#### 6.2.6 Indicador "está pensando"

O atual `ia-typing` é bom, mas adicionar **texto dinâmico**:
- "Analisando sua pergunta..."
- "Conferindo no mapa da sua terra..."
- "Vou explicar de um jeito simples..."

---

## 7. Alertas — Sistema Visual Estilo WhatsApp/Waze

### 7.1 Estado atual
- Tela "Notificações" lista itens com ícone + texto.
- Sem badge visual no mapa.
- Sem agrupamento por prioridade.

### 7.2 Melhorias propostas

#### 7.2.1 Reorganizar como feed de alertas (estilo WhatsApp)

Cada alerta é uma **"conversa"** com a IA:

```
┌────────────────────────────────────┐
│  🌿 Orienta IA · agora              │
│  ─────────────────────────────     │
│  🔴 1 ponto de atenção              │
│                                     │
│  Achei uma área perto do rio que    │
│  precisa de cuidado.                │
│                                     │
│  [ Ver no mapa ]  [ Me explica ]    │
└────────────────────────────────────┘
```

#### 7.2.2 Tipos de alerta (semáforo + ícone + som)

| Tipo | Cor | Ícone | Som | Vibração |
|---|---|---|---|---|
| Crítico | Vermelho | 🔴 | Curto, grave | 2x longa |
| Atenção | Amarelo | ⚠️ | Suave | 1x média |
| Informativo | Verde | ✅ | Nenhum | Nenhuma |
| Oportunidade | Azul | 💡 | Nenhum | Nenhuma |

#### 7.2.3 Notificação no app (badge)

- Badge numérico no ícone do sino (já existe, mas é só "dot").
- Pulse vermelho no sino quando há alerta crítico não lido.
- Som opcional ao receber (toggle em Acessibilidade).

#### 7.2.4 Mini-mapa dentro do alerta

Cada alerta mostra um **mini-mapa (thumbnail)** com a área destacada em vermelho translúcido. Tap = vai para o mapa completo focado na área.

---

## 8. Navegação — Simplificação

### 8.1 Bottom-nav atual
Início · IA · Mapa · Comunidade · Suporte

### 8.2 Bottom-nav proposta
**Início · Mapa · Falar (centro) · Alertas · Perfil**

- **"Falar"** no centro, elevado (FAB), com ícone de microfone grande, sempre acessível — resolve o problema de descoberta do comando por voz.
- **"Alertas"** (substituindo Comunidade) prioriza o que afeta a terra do produtor.
- **Comunidade** entra como item dentro de "Perfil" → "Comunidade e dicas".

### 8.3 Top-bar (consistência)

Padronizar a top-bar em **todas as telas**:
- Esquerda: botão Voltar (sempre que houver histórico) **OU** logo do Orienta (apenas na Home)
- Centro: título curto
- Direita: 2-3 ações contextuais (sino, acessibilidade, perfil)

---

## 9. Dicionário de Tradução (linguagem técnica → linguagem simples)

Esta é a **mudança cultural** mais importante. Substituir sistematicamente:

| ❌ Evitar | ✅ Usar |
|---|---|
| APP — Área de Preservação Permanente | Beira protegida do rio / APP (com subtítulo) |
| Reserva Legal | A parte da terra que a lei pede pra guardar |
| Conformidade | Tá tudo certo / Tá combinado com a lei |
| Não conformidade | Precisa arrumar |
| Passivo ambiental | Ponto que pode precisar de regularização |
| Sobreposição | Parte do terreno que coincide com outro registro |
| CAR | Cadastro da propriedade (documento da terra) |
| SICAR | Sistema do governo |
| Outorga | Autorização pra usar água |
| Supressão de vegetação | Tirar o mato / desmatar |
| Demanda hídrica | Necessidade de água |
| Fitofisionomia | Tipo de vegetação |
| Recomposição | Recuperar / plantar de novo |
| Regeneração natural | Deixar a natureza se recuperar sozinha |
| Bioma | Tipo de natureza da região (Caatinga, Cerrado...) |
| Índice de adequação ambiental | Nota da sua terra |
| Diagnóstico | Como está sua terra |
| Adequado | Tá certo |
| Inadequado | Tem problema |
| Embargo | Proibição de mexer |
| Auto de infração | Multa |
| TAC (Termo de Ajustamento de Conduta) | Compromisso pra resolver |
| PRA (Programa de Regularização Ambiental) | Plano pra arrumar a terra |

> **Regra de ouro:** toda primeira vez que um termo técnico aparecer, colocar entre parênteses a tradução em linguagem simples. A partir da 3ª vez, pode usar só o termo técnico.

---

## 10. Acessibilidade — Plano Completo

### 10.1 Estado atual
- ✅ TTS pt-BR com controle de velocidade
- ✅ Auto-read toggle (mas escondido)
- ✅ Toggle de fonte (5 níveis)
- ✅ Toggle alto contraste (classe CSS simples)
- ✅ Modo leitura (classe CSS)
- ✅ STT parcial (sem UI dedicada)

### 10.2 Itens a adicionar/melhorar

#### 10.2.1 Visão
- **Modo alto contraste melhorado** — não apenas inverter, mas usar paleta testada (fundo preto puro, texto branco puro, amarelo/laranja para destaques).
- **Modo daltonismo** — toggle "Modo para daltonismo" (paleta segura para deuteranopia e protanopia).
- **Tamanho base mínimo 16px**, com 5 níveis: 14, 16, 18, 20, 24.
- **Espaçamento entre linhas** ajustável (1.4 / 1.6 / 1.8).
- **Foco visível** em todos os elementos interativos (outline 3px amarelo `#FFC107`).

#### 10.2.2 Audição
- **Legendas automáticas** quando TTS ativo (subtítulo embaixo da bolha da IA).
- **Modo silencioso** (sem sons de alerta, só vibração).
- **Vibração diferenciada** para alertas (curta/longa/2x).

#### 10.2.3 Motricidade / Idosos
- **Áreas clicáveis mínimas 48x48px** (WCAG 2.5.5 AAA) — auditar todos os botões atuais; muitos `btn-icon` têm só 36x36.
- **Botão "voltar ao topo"** em todas as telas com scroll.
- **Gestos opcionais** (swipe para voltar, mas só com toggle).
- **Confirmação de ações destrutivas** (sempre com botão "Cancelar" grande).

#### 10.2.4 Cognição / Baixa escolaridade
- **Linguagem nível fundamental** (ver dicionário seção 9).
- **Ícones sempre acompanhados de texto** (nunca depender só de cor ou ícone).
- **Microcopy mais humano**: "Tudo bem?", "Bora?", "Combinado".
- **Tutoriais em vídeo curtos** (≤30s) embutidos em telas-chave.
- **Onboarding guiado na primeira execução** com mascote animado.

#### 10.2.5 Leitor de tela
- **Adicionar `aria-label` em todos os ícones decorativos** (atualmente emojis sem fallback textual).
- **Roles semânticos** (`role="button"`, `aria-live="polite"` em cards dinâmicos).
- **Ordem de tab lógica** (já é, mas auditar).
- **Anúncio de mudanças** ao abrir painel do mapa: "Painel aberto: APP do Córrego São João. Área protegida. Não pode plantar."
- **Texto alternativo em SVGs** do mapa.

#### 10.2.6 Comando por voz (STT) — UI dedicada
Adicionar **botão de microfone fixo no chat** (44px, abaixo do input), com:
- Pulse quando escutando
- Texto aparecendo em tempo real
- Confirmação antes de enviar ("Você disse: 'Posso plantar aqui?'. Enviar?")

#### 10.2.7 Modo offline expandido
- Cache local do mapa (imagens estáticas + metadados das áreas).
- Respostas pré-prontas da IA para perguntas comuns.
- Sincronização quando voltar online.

---

## 11. Telas e Funcionalidades que Estão Faltando

### 11.1 Telas ausentes

| Tela | Por quê é importante |
|---|---|
| **Onboarding (1º acesso)** | Apresentar Orienta de forma guiada, com mascote e áudio |
| **Boas-vindas personalizadas** | Perguntar nome do produtor, tamanho da propriedade, principal cultura |
| **Galeria de áreas com problemas** | Visual rápido de TODAS as pendências (estilo galeria de fotos) |
| **Linha do tempo da propriedade** | Histórico de análises, mudanças, alertas |
| **Documentos da terra** | Onde armazenar CAR, comprovantes, fotos |
| **Crédito rural** | Trilha para acessar programas (PRA, etc.) — alinhado à proposta de valor |
| **Calendário ambiental** | "Esse mês: faça a manutenção da APP. Próximo mês: atualize o CAR." |
| **Tela "Antes de agir, consulte"** | Atalho universal para a IA com foto + texto |
| **Confirmação de leitura** | "Você entendeu? [Sim / Me explique de novo / Ouvir]" após mensagens-chave da IA |
| **SOS Ambiental** | Botão vermelho grande: "Tô com problema agora. Me ajuda." (liga pra suporte + IA) |

### 11.2 Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Push notification real** | Integração com service worker (PWA) |
| **PWA (instalável)** | Adicionar `manifest.json` e service worker — funciona offline, ícone na tela inicial |
| **Múltiplas propriedades** | Toggle entre "Fazenda São João" / "Chácara Boa Vista" |
| **Comparação temporal do mapa** | "Como estava sua terra em 2024 vs 2026" |
| **Exportar PDF do diagnóstico** | Para apresentar a um técnico ou banco |
| **Marcar favorito** | Salvar áreas importantes para consulta rápida |
| **Modo "Sou técnico agrícola"** | Versão avançada com termos técnicos + camadas extras |
| **Integração WhatsApp real** | O botão atual é só link — falta envio de mensagem pré-prontas |
| **Geolocalização GPS** | Centralizar mapa na posição atual do produtor |
| **Modo noturno automático** | Respeitar `prefers-color-scheme` |
| **Tour em vídeo da tela inicial** | 30s narrado, "Seu Zé, vou te mostrar como funciona" |

---

## 12. Melhorias de Comunicação Visual

### 12.1 Tipografia
- **Hierarquia mais clara:**
  - H1 (saudação): 28-32px, peso 800
  - H2 (seção): 20-22px, peso 700
  - H3 (cartão): 17-18px, peso 700
  - Body: 16-17px (nunca abaixo de 15px)
  - Caption: 13-14px, peso 500
- **Peso médio mais alto** (500) em texto de corpo — ajuda na leitura em telas pequenas.
- **Line-height mínimo 1.5** para corpo de texto.
- **Letter-spacing levemente positivo** (0.01em) em texto pequeno.

### 12.2 Cor e ícone
- **Reforçar o sistema de cores semafórico** em **TODOS** os indicadores:
  - Verde `#10B981` / ok
  - Amarelo `#F59E0B` / atenção
  - Vermelho `#DC2626` / crítico
  - Azul `#0EA5E9` / água
  - Roxo `#7C3AED` / oportunidade
- **Nunca usar só cor** — sempre par cor+ícone+texto.
- **Badges com bordas suaves** (border 1px na cor, fundo 12% opacity).

### 12.3 Ilustração
- Adicionar **ilustrações de cena** (estilo Brasil-ilustra) nas telas explicativas: "O que é APP?" com desenho de um rio, árvores, e o produtor.
- **Mascote próprio** ("Orie", uma folha com olho) que aparece em:
  - Onboarding
  - Estado vazio
  - Confirmação de ação
  - Mensagens de erro amigáveis

### 12.4 Animação
- **Microanimações de feedback**:
  - Tap em botão: scale 0.96 em 100ms
  - Checkmark de sucesso: animação de traço
  - Alerta crítico: pulse 1.5s loop
  - Mapa: realce suave da área tocada (400ms)
- **Transições entre telas**: manter 280ms atual, mas adicionar **easing mais orgânico** (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Skeletons de carregamento** (em vez de spinners) — parece mais rápido e acolhedor.

---

## 13. Refinamentos Pontuais por Tela

### 13.1 Splash
- Adicionar **áudio curto** ("Olá, eu sou o Orienta") com botão de pular.
- Tempo de splash reduzido para 1.2s (não travar).
- Versão do app discreta no canto inferior.

### 13.2 Login/Cadastro
- **Botão "Entrar com CPF"** (produtor rural não usa e-mail necessariamente).
- **Login por biometria** (impressão digital — `navigator.credentials`).
- Mostrar **foto de perfil opcional** no cadastro (humaniza).
- Tutorial inline nos campos (placeholder explicativo).

### 13.3 Home
- **Substituir lista de "últimas orientações"** por mini-resumo do dia:
  > "Bom dia! Hoje tem 1 alerta novo + 1 oportunidade. Ver →"
- **"Dica do dia"** (carrossel com 1 dica de preservação por dia).
- **Botão "Como está minha terra em 30 segundos"** — vídeo/áudio resumo.

### 13.4 Meu Imóvel
- Adicionar **botão "Imprimir/Salvar PDF"** (download do resumo).
- Mini-mapa no topo deve **abrir o mapa completo ao tocar** (já faz, mas precisa ser mais óbvio).
- Estatísticas (245 ha, 48 ha, 12 ha) devem ter **ícones grandes** ao lado dos números.

### 13.5 Comunidade
- **Subordinar ao Perfil** (não no bottom-nav).
- Adicionar **tags de busca** ("APP", "Reserva Legal", "Crédito Rural").
- **Filtro por região** (estado/município).
- Posts devem ter **nível de complexidade** (básico / avançado).

### 13.6 Suporte
- **Atalhos pré-prontos** ("Não consigo abrir o mapa", "Quero falar com humano").
- **Status do atendimento** ("Estamos respondendo em até 2h").
- **FAQ inline** dentro do chat.

### 13.7 Perfil
- **Configurações agrupadas**:
  - Conta (nome, foto, propriedades)
  - Acessibilidade (atalho direto da top-bar)
  - Notificações
  - Privacidade
  - Ajuda
  - Sobre
- Adicionar **botão grande "Sair"** no fim.

---

## 14. Sugestões Específicas para Vencer um Hackathon

### 14.1 Critérios comuns de avaliação

| Critério | Como o Orienta pode brilhar |
|---|---|
| **Impacto social** | Apresentar números potenciais: "2,5 milhões de pequenos produtores podem se beneficiar", "Reduz risco de multa em X%". |
| **Inovação técnica** | Demonstrar IA generativa interpretando polígonos, simulador contextual, mapa autoexplicativo. |
| **UX/UI** | Mostrar antes/depois do produtor leigo. Prototipar com persona "Dona Maria, 62 anos, primeira vez no celular". |
| **Acessibilidade** | Listar todas as features: TTS, STT, alto contraste, daltonismo, modo leitura, área clicável 48px+, dicionário simples. |
| **Viabilidade** | Mostrar que já funciona em mockup. Roadmap claro (MVC → IA real → integração CAR/SICAR → PWA → multi-propriedade). |
| **Apresentação** | Demo narrativa: "Imagine Seu Raimundo, 65 anos, vai desmatar e não sabe..." |

### 14.2 Diferenciais competitivos para destacar

1. **"O único sistema que traduz a lei para a língua do produtor"** — explorar a metáfora do "assistente que explica a propriedade".
2. **Mapa autoexplicativo** — comparar lado a lado: GIS técnico (polígonos confusos) vs. Orienta (ícones, perguntas, voz).
3. **Simulador "E se eu..."** — interatividade única. Mostra resultado imediato. Podem usar de demo ao vivo.
4. **Comando de voz nativo** — STT + TTS em pt-BR regional. Poucos concorrentes oferecem isso.
5. **Linha do tempo de diagnóstico** — gamificação da confiança.
6. **Acessibilidade como pilar, não como afterthought** — narrar isso no pitch.

### 14.3 Frases de impacto (para o pitch)

- "Seu Raimundo nunca leu um parecer ambiental. Não precisa."
- "A legislação fala difícil. A terra do Seu Raimundo, não."
- "Você não precisa entender o mapa. O mapa te entende."
- "Toque. Pergunte. Decida."
- "O CAR é o documento da sua terra. O Orienta é o tradutor."

### 14.4 Demo matadora (roteiro de 3 min)

```
[00:00] Splash: "Seu imóvel fala. A legislação explica. Nós traduzimos."
[00:30] Login direto (já logado). Saudação por voz: "Bom dia, Seu Raimundo".
[01:00] Dashboard: 4 cartões. Tocar em "Atenção" (amarelo).
[01:30] Mapa: zoom automático na APP, painel contextual, perguntas pré-prontas.
[02:00] Tocar em "Simular atividade: Plantar milho" → resposta imediata.
[02:30] Chat com IA: pergunta digitada por voz → resposta com TTS.
[02:50] Linha do tempo do diagnóstico com confetti.
[03:00] CTA: "Para 2,5 milhões de produtores. Em todo o Brasil. Em qualquer celular."
```

---

## 15. Análise Crítica Final (Estilo Avaliador de Hackathon)

### 15.1 Pontos fortes
- Identidade visual sólida e memorável (splash + branding consistente).
- Persona bem definida ("Seu Raimundo", tom acolhedor, regionalismo).
- Esqueleto de funcionalidades completo (mapa interativo, diagnóstico, simulador, comunidade, suporte).
- Base de acessibilidade presente (TTS, fonte, alto contraste, modo leitura).
- Simulador "E se eu..." — diferencial competitivo real.
- Linguagem acessível em vários pontos (substituição de termos técnicos).
- Mobile-first coerente.
- Tela de acessibilidade dedicada e descobrível.

### 15.2 Pontos fracos
- **Mapa é o coração prometido mas não entrega** a experiência "autoexplicativa" — é estático, sem realce, sem perguntas pré-prontas, sem simulador integrado.
- **STT está implementado mas escondido** — perde um diferencial enorme.
- **Auto-read toggle** está longe demais (Acessibilidade) — deveria estar no topo do chat.
- **Legenda do mapa mantém jargão** (APP, RL) — contradiz o discurso.
- **Sem onboarding** — primeira impressão é uma tela complexa.
- **Sem mascote** — falta elemento emocional para público idoso.
- **Sem modo offline visualmente claro** — produtor rural tem sinal ruim.
- **Dashboard sem cartões de status** claros — não há "termômetro" da propriedade na home.
- **Comunidade no bottom-nav** compete com Alertas (prioridade maior).
- **Sem PWA** — perde uma das principais vantagens mobile.

### 15.3 Funcionalidades críticas faltando
1. Realce visual da área clicada no mapa (halo + zoom + opacidade).
2. Painel contextual com status, ações permitidas/proibidas, motivo, perguntas rápidas.
3. Simulador integrado ao mapa (não avulso).
4. Botão de microfone proeminente (STT).
5. Cartões de status no Dashboard.
6. Timeline no Diagnóstico.
7. Onboarding guiado na primeira execução.
8. Alertas pulsantes no mapa.
9. Mini-mapas nos alertas.
10. Dicionário técnico→simples sistemático.

### 15.4 Oportunidades de inovação
- **Mapa narrado por voz** — ao deslizar, o Orienta narra: "Você tá passando pela APP. Não pode mexer aqui."
- **Tour guiado por áudio** — botão "Me mostra como funciona" → 60s de tour narrado.
- **Reconhecimento de foto da propriedade** — tirar foto da terra, IA cruza com mapa.
- **Áudio-resumo diário** — push notification matinal: "Bom dia! Sua terra tá bem. 1 coisa pra ver hoje. [Ouvir]".
- **Modo "vizinho Solidário"** — produtor pede ajuda a outro produtor da região via áudio.
- **Gamificação ambiental** — badge "Cuidador da APP" ao manter vegetação por 12 meses.
- **Modo offline com sync** — diferencial enorme no semiárido.

### 15.5 Veredito simulado
> "O Orienta acerta no tom, na persona e na promessa. A tecnologia está posta, mas a execução da experiência-chave (o mapa conversacional) precisa ser a estrela — e hoje ainda é um mostradório bonito. Com as mudanças propostas (mapa autoexplicativo, simulador contextual, painel contextual rico, comando de voz descoberto, dashboard de status, timeline, dicionário de linguagem), o projeto sobe de 'protótipo interessante' para 'categoria nova'. Em hackathon, é potencial de pódio. Em produção, pode mudar a vida de milhões."
>
> — Avaliação de banca

---

## 16. Roadmap de Implementação Sugerido

### Sprint 1 — Fundação (1 semana)
- [ ] Adicionar dicionário técnico→simples e revisar todas as telas.
- [ ] Aumentar áreas clicáveis para 48x48.
- [ ] Adicionar `aria-label` em todos os ícones decorativos.
- [ ] Reorganizar bottom-nav (Início · Mapa · Falar · Alertas · Perfil).
- [ ] Mover Comunidade para dentro do Perfil.

### Sprint 2 — Mapa Autoexplicativo (2 semanas)
- [ ] Realce visual da área clicada (halo + zoom + opacidade).
- [ ] Painel contextual rico (status, permitido, proibido, motivo, perguntas).
- [ ] Perguntas pré-prontas como chips grandes.
- [ ] Simulador integrado ao mapa.
- [ ] Alertas pulsantes.
- [ ] Nova legenda com linguagem simples.

### Sprint 3 — Dashboard + Diagnóstico (1 semana)
- [ ] Cartões de status no Dashboard (4 mini-cards).
- [ ] Timeline no Diagnóstico.
- [ ] Termômetro visual no lugar do score numérico.
- [ ] Link "ir para o mapa" em cada card de área.

### Sprint 4 — Voz + Onboarding (1 semana)
- [ ] Botão de microfone proeminente no chat (STT com feedback).
- [ ] Auto-read toggle visível no topo do chat.
- [ ] Onboarding guiado na primeira execução.
- [ ] Mascote (Orie) em estados vazios e confirmações.

### Sprint 5 — Telas e funcionalidades complementares (2 semanas)
- [ ] Tela de Créditos Rurais.
- [ ] Calendário Ambiental.
- [ ] SOS Ambiental.
- [ ] PWA (manifest + service worker).
- [ ] Modo noturno automático.
- [ ] Múltiplas propriedades.

### Sprint 6 — Polish para hackathon (3 dias)
- [ ] Roteiro de demo.
- [ ] Vídeo de 60s.
- [ ] Pitch deck.
- [ ] Testes com 5 produtores reais.

---

## 17. Princípios Norteadores (cola na parede)

1. **Se a Dona Maria de 65 anos não entende, refaça.**
2. **Ícone sozinho é barreira. Ícone + texto é clareza.**
3. **Cor é reforço, nunca mensagem.**
4. **Toque, depois fala, depois digita.** (ordem de preferência)
5. **Se tem que explicar duas vezes, não é óbvio.**
6. **A legislação fala difícil. O Orienta fala a língua do produtor.**
7. **O mapa interpreta. O produtor decide.**
8. **Acessibilidade não é checklist. É o produto.**
9. **Confiança se constrói com transparência. Mostre o que está acontecendo.**
10. **"Não precisa entender o mapa. O mapa te entende."**

---

> **Conclusão:** O Orienta tem uma base sólida, uma promessa poderosa e uma persona bem desenhada. O caminho do "bom protótipo" para "vencedor de hackathon + produto transformador" passa por **transformar o mapa no verdadeiro protagonista conversacional**, **revelar os recursos de voz**, **dividir a comunicação por cores + ícones + texto**, **e colocar o produtor rural — com suas limitações e sua sabedoria — no centro de cada decisão de design**. As mudanças propostas mantêm a identidade visual atual e a arquitetura existente, mas elevam radicalmente a clareza, a emoção e a confiança da experiência.
