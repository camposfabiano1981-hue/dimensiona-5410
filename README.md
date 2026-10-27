# Dimensiona 5410

Plataforma web para **projetos elétricos de baixa tensão**:
- dimensionamento de condutores, proteção, eletrodutos e eletrocalhas pela **ABNT NBR 5410:2004**;
- quadro de cargas, com **diagramas unifilar e multifilar** de cada quadro;
- cálculo luminotécnico de interiores pela **NBR ISO/CIE 8995-1** e de exteriores (projetores em postes) pela **NBR 5101 / EN 12464-2**;
- demanda para a concessionária pelas normas **Energisa NDU 001 / NDU 003**;
- carga térmica de climatização pela **ABNT NBR 16401**;
- aterramento, da haste única à malha, pelas **NBR 5410, NBR 7117-1 e NBR 15751 / IEEE Std 80**;
- **SPDA** — análise de risco e projeto pela **ABNT NBR 5419:2026** (partes 1 a 4).

O documento principal é o **memorial descritivo** da instalação (NBR 5410), com influências externas, especificação dos materiais e normas de fabricação, tendo como **anexos** as memórias de cálculo escolhidas pelo profissional e a **lista de materiais**. Cada memória também sai separadamente ou num **relatório consolidado**, em **PDF**, **Word (.docx)** e **HTML**. O quadro de cargas e a lista de materiais saem em **Excel (.xlsx)**.

A navegação é feita por uma **barra de menus suspensos** no estilo dos aplicativos de escritório: itens numerados, submenus (▸), atalhos de teclado e o caminho da tela atual logo abaixo.

Funciona 100% no navegador: **não precisa de servidor, banco de dados nem instalação**. Está publicada gratuitamente no **GitHub Pages**.

**Acesse:** https://camposfabiano1981-hue.github.io/dimensiona-5410/

---

## Funcionalidades

**Menu**
- **Barra de menus:** Projeto · Instalações · Sistemas · Materiais · Documentos · Tabelas, com itens numerados, separadores, submenus e marca ✓ na opção ativa (interiores/exteriores, aterramento simplificado/completo).
- **Teclado:** setas para navegar, número do item para escolhê-lo, Esc para fechar; atalhos F2 (projeto), F4 (circuitos), F8 (quadros), F9 (memorial descritivo), Ctrl+S (salvar) e Ctrl+O (abrir).
- **Celular:** os menus ocupam a largura da tela e os submenus abrem dentro do próprio menu.

**Projeto e circuitos (NBR 5410)**
- **Dados da obra:** identificação, sistema de alimentação, esquema de aterramento, temperatura ambiente e do solo, e fator de demanda editável (padrão 100 %).
- **Esquemas de ligação:** F+N, F+N+PE, F+F, F+F+PE, F+F+N+PE, F+F+F, F+F+F+PE e F+F+F+N+PE. O esquema escolhido sai no quadro de cargas.
- **Maneiras de instalar:** todos os métodos da Tabela 33, com desenho ilustrativo de cada um.
- **Critérios verificados por circuito:**
  - capacidade de condução (Tabelas 36 a 39, cobre e alumínio, 0,5 a 1000 mm²);
  - fatores de correção de temperatura e de agrupamento (Tabelas 40 a 45);
  - seção mínima (Tabela 47), neutro (Tabela 48) e condutor de proteção;
  - coordenação da proteção (IB ≤ In ≤ Iz; I2 ≤ 1,45·Iz);
  - queda de tensão com R e X do cabo, incluindo o fator para eletroduto de aço;
  - curto-circuito (k²S² ≥ I²t).
- **Eletrodutos:** taxa de ocupação de 53 %, 31 % ou 40 % (6.2.11.1.6) e tamanho nominal, com corte desenhado.
- **Eletrocalhas:** eletrocalha lisa ou perfurada, bandeja, perfilado, eletrocalha aramada, leito e canaleta. O cálculo cobre ocupação, largura e altura comerciais, e os fatores de agrupamento do método de instalação adotado.
- **Quadros de carga:**
  - balanceamento de fases e demanda do alimentador;
  - colunas de ligação, FCA, FCT e fator de potência;
  - exportação para Excel com fórmulas.

**Proteção contra surtos — DPS (NBR 5410 6.3.5 e NBR 5419-4:2026)**
- **Por quadro:** classe (I+II na entrada com SPDA ou exposição alta; II nos quadros), ligação pelo esquema de aterramento (n+0 ao PE ou n+1 com centelhador N–PE; TT a montante do DR em n+1), Uc pela Tabela 49 e valor comercial (175 V em 127/220 V; 275 V em 220/380 V).
- **Correntes:** In ≥ 5 kA; Imáx pela exposição segundo as faixas usuais de fabricantes (20, 40 ou 65 kA); Iimp ≥ 12,5 kA ou o do nível do SPDA (25 / 18,75 / 12,5 kA por polo; N–PE com a soma).
- **Verificações:** Up ≤ categoria II da Tabela 31, nível efetivo Up/f contra a suportabilidade dos equipamentos (varistor: Up + ΔU; centelhador: máx(Up; ΔU); ΔU de 1 kV/m na classe I e desprezível na ligação em V), condutores de ligação (≤ 0,5 m; 4 ou 16 mm²), retaguarda e Isccr do fabricante e indicação de DPS classe III.
- **Parâmetros complementares de seleção:**
  - sobretensão temporária (TOV): UT ≥ 1,45 × U0 por 5 s; no TT, centelhador N–PE para 1 200 V por 200 ms (IEC 61643-11);
  - centelhadores: corrente subsequente interrompida Ifi ≥ curto-circuito presumido; N–PE com Ifi ≥ 100 A (IEC 60364-5-534);
  - distância de proteção por oscilação lpo = (Uw − Up/f) / 25 V/m, com a lista dos circuitos terminais mais longos (IEC 62305-4, Anexo D);
  - coordenação entre estágios: DPS declarados coordenados pelo fabricante ou pelo menos 10 m de cabo (IEC 61643-12, informativo);
  - DPS a jusante de DR geral: DR seletivo (tipo S).
- **Saídas:** memória própria (PDF, Word e HTML) anexável ao memorial descritivo; especificação nos diagramas unifilar e multifilar (com o desenho da ligação n+1) e na lista de materiais.

**SPDA — proteção contra descargas atmosféricas (ABNT NBR 5419:2026)**
- **Análise de risco (Parte 2):** áreas de exposição AD e AM, eventos perigosos ND, NM, NL e NI, componentes RA, RB, RC, RM, RU, RV, RW e RZ, risco R1 (vida humana), R3 (patrimônio cultural) e frequência de danos F aos sistemas internos, novidade da edição 2026 (tolerável 1 por ano, ou 0,1 para sistemas críticos).
- **Escolha das medidas:** tabela de combinações nível de proteção × DPS, com o nível mínimo exigido; com SPDA, os DPS da entrada ficam compatíveis com o mesmo nível.
- **Projeto (Parte 3):** níveis de proteção NP I a IV (esfera rolante, malha, descidas e anéis), captação pelo método das malhas ou por captores Franklin (ângulo de proteção equivalente à esfera rolante, com sugestão do número de mastros), descidas nos cantos e intermediárias, anéis a cada 10 a 20 m de altura, aterramento em anel (arranjo B, o único na edição 2026) com verificação de l1 e eletrodos adicionais, distância de segurança s = ki · kc/km · l.
- **DPS (Parte 4):** corrente de impulso por modo do DPS classe I na entrada; o quadro de entrada passa a mostrar DPS classe I+II nos diagramas e na lista de materiais.
- **Saídas:** planta da cobertura, elevação com a zona protegida, gráfico de risco, materiais com normas, inspeção (visual anual e completa a cada 1 ou 3 anos) e memorial em PDF, Word e HTML, anexável ao memorial descritivo.

**Diagramas unifilar e multifilar dos quadros**
- **Gerados automaticamente** a partir dos circuitos: alimentação, disjuntor geral, DPS, disjuntores, DR (IDR ou DDR), condutores com as seções e distribuição entre as fases.
- **Unifilar:** barramento vertical com um ramal por circuito, marcas de fase, neutro e PE, reserva da Tabela 59 e resumo de carga, demanda e equilíbrio de fases.
- **Multifilar:** barramentos A, B, C, N e PE com as cores dos condutores, cada polo dos disjuntores e dos DR, toróide do DR e ligação dos DPS ao PE.
- **Onde aparecem:** na seção Quadros de carga (botões unifilar/multifilar) e no documento *Diagramas unifilares e multifilares* (PDF, Word e HTML), que também pode ser anexado ao memorial descritivo. O DPS de cada quadro entra na lista de materiais.
- **Símbolos:** IEC 60617 (prática usual da antiga NBR 5444); cores do neutro e do PE pela NBR 5410, 6.1.5.3.

**Luminotécnica (NBR ISO/CIE 8995-1)**
- **Requisitos por ambiente:** iluminância mantida, UGR, Ra e uniformidade.
- **Cálculo:** método dos lúmens, com fator de utilização por radiosidade, e verificação ponto a ponto em malha.
- **Catálogo de lâmpadas e luminárias:** Philips, Ledvance, Lumicenter, Elgin e outros.
- **Relatório:** planta com o mapa de iluminâncias e locação cotada, além do desenho de cada luminária (vista inferior e corte).
- **Integração:** a potência calculada pode alimentar os circuitos de iluminação.

**Iluminação de exteriores (NBR 5101 / EN 12464-2 / EN 12193)**
- **Áreas:** pátios, estacionamentos, vias internas e quadras, com projetores ou luminárias viárias em postes.
- **Arranjos:** postes em um lado, nos dois lados (frente a frente ou alternados), nos quatro cantos ou em grade; altura, inclinação, recuo e projetores por poste.
- **Método dos lúmens:** N = E × S / (Φ × Fu × Fd), como em Mamede Filho (*Instalações Elétricas Industriais*), com sugestão de quantidade que também respeita o espaçamento de 3 × a altura.
- **Ponto a ponto:** E = Σ I(θ) · h / d³ em malha de pontos, com I(θ) = I0 · cosᵐθ em torno do eixo de mira de cada projetor; resultam Eméd, Emín, Emáx, U0 = Emín/Eméd e o Fu efetivo.
- **Requisitos:** classes V1–V5 e P1–P4 da NBR 5101 (valores por iluminância da edição 2018), locais de trabalho e estacionamentos da EN 12464-2 e quadras da EN 12193.
- **Saídas:** planta com mapa de iluminância, postes e setas de mira no relatório luminotécnico; projetores, postes e relé fotoelétrico na lista de materiais; potência no circuito de iluminação.

**Demanda Energisa (NDU 001 v7.0 e NDU 003 v8.1)**
- **Unidades consumidoras individuais e agrupadas:** demanda D = (d1 + … + d7) / 0,92 pelas Tabelas 4 a 15 da NDU 001.
- **Enquadramento de categoria:** Tabela 16 (220/127 V) e Tabela 21 (254/127 V), com o padrão de entrada, o disjuntor e os condutores.
- **Edifícios de uso coletivo (NDU 003):** D = D1 + D2. As Tabelas 03 e 04 são preenchidas pelo projetista.
- **Memorial para análise da concessionária:** declaração de carga, dados completos da UC e esquema da entrada.

**Climatização — carga térmica (NBR 16401)**
- **Cálculo:**
  - hora a hora no dia de projeto, com radiação solar de céu claro (ASHRAE);
  - temperatura sol-ar e condução periódica pelas camadas da parede e da cobertura, com atraso e amortecimento;
  - ganhos por vidros, pessoas, iluminação, equipamentos, ar exterior e infiltração.
- **Componentes construtivos:** transmitância, capacidade térmica e atraso térmico (NBR 15220-2), com editor de camadas.
- **Conforto térmico (NBR 16401-2:2024):** PMV/PPD pela ISO 7730, com critério −0,5 ≤ PMV ≤ +0,5.
- **Ar exterior:** Vef = Pz·Fp + Az·Fa pela NBR 16401-3:2008. A edição de 2024 está suspensa.
- **Resultado:**
  - carga sensível e latente, em W, BTU/h e TR;
  - gráfico de 24 h;
  - carga simultânea máxima do conjunto;
  - equipamento indicado.
- **Integração:** cria os circuitos dos aparelhos na seção Circuitos.

**Aterramento (NBR 5410, NBR 7117-1, NBR 15751 / IEEE 80)**

Dois modos, escolhidos no topo da seção ou em Sistemas › Aterramento:
- **Simplificado (só hastes):**
  - resistividade por tipo de solo (valores típicos da literatura), informada ou pela média das medições de Wenner;
  - haste única ou conjuntos de hastes, com o número mínimo de hastes para atingir o limite (botão "Usar N hastes") e gráfico da resistência em função do número de hastes;
  - esboço da instalação (quadro/BEP, eletroduto, caixas de inspeção, cabo nu e hastes), planta e lista de materiais.
- **Completo:** acrescenta solo em duas camadas, cabo contrapeso e malha, com os itens abaixo.

- **Resistividade do solo:**
  - medições pelo método de Wenner (NBR 7117-1:2020), com média geométrica ou aritmética por espaçamento e descarte de leituras com desvio acima de 50 %;
  - modelo homogêneo ou de duas camadas (ρ₁, ρ₂, h₁) ajustado por mínimos quadrados, com curva de resistividade aparente;
  - fator sazonal.
- **Configurações:** haste única, hastes alinhadas, em triângulo, em quadrado vazio ou cheio e em circunferência, com resistência mútua entre hastes (Kindermann & Campagnolo); cabo contrapeso; malha.
- **Malha:**
  - resistência pelos métodos de Sverak e Schwarz;
  - tensões de toque e de passo admissíveis (50 ou 70 kg, camada de brita) e calculadas (Em, Es);
  - elevação de potencial (GPR) e dimensionamento térmico do condutor.
- **Critérios:**
  - padrão de entrada Energisa: R ≤ 20 Ω, hastes de 2,40 m espaçadas de 2,40 m e número mínimo de hastes da categoria (NDU 001 v7.0, 8.10);
  - SPDA: resistência recomendada da ordem de 10 Ω (NBR 5419-3);
  - esquema TT: RA × IΔn ≤ 50 V.
- **Saídas:** planta e corte de cada arranjo, sugestão do número de hastes para atingir o limite e memorial com recomendações de execução e de medição (NBR 15749).

**Materiais**
- **Quantitativo automático do projeto:**
  - condutores por tipo, seção e cor (fases preto/vermelho/branco, neutro azul-claro, proteção verde-amarelo), com acréscimo configurável;
  - disjuntores e dispositivos DR por modelo;
  - quadros com módulos DIN e espaço de reserva da Tabela 59;
  - eletrodutos e eletrocalhas por tipo e diâmetro;
  - luminárias da luminotécnica;
  - hastes, conectores, caixas e cabos do aterramento;
  - padrão de entrada Energisa e, opcionalmente, os condicionadores de ar.
- **Cadastro de materiais:** cerca de 40 itens com norma de fabricação (DPS, barramentos, tomadas, interruptores, caixas, acessórios de eletroduto, materiais diversos). O profissional escolhe os itens informando a quantidade e pode cadastrar outros.
- **Lista de materiais:** composta pelo quantitativo automático (cada item pode ser desmarcado ou ter a quantidade ajustada) e pelos itens escolhidos, com norma de fabricação e fabricante/referência; sai em PDF, Word, HTML e Excel.

**Memorial descritivo (NBR 5410)**
- **Conteúdo:** objetivo e escopo; normas; caracterização da obra e da instalação; critérios de projeto; descrição da entrada de energia, quadros, circuitos, linhas elétricas, iluminação, climatização, aterramento e proteção contra surtos; especificação dos materiais com as normas de fabricação; execução, inspeção, ensaios e documentação.
- **Influências externas (4.2.6):**
  - classificação das 23 influências (AA a CB), com a classe adotada e as medidas no projeto;
  - padrão por tipo de edificação, editável;
  - tabela de locais com influências específicas (banheiros, cozinha, áreas externas, quadros).
- **Anexos:** as memórias de cálculo e a lista de materiais marcadas pelo profissional entram como Anexo A, B, C…, com uma única assinatura.

**Memórias de cálculo**
- **Memórias separadas:** condutores e proteção, eletrodutos, eletrocalhas, quadros de carga, diagramas dos quadros, luminotécnica, demanda Energisa, carga térmica, aterramento e SPDA, cada uma em PDF, Word e HTML.
- **Relatório consolidado:** reúne as memórias marcadas, com sumário, partes A, B, C… (numeração prefixada pela letra da parte) e uma única assinatura do responsável técnico. A declaração de carga do titular, exigida pela Energisa, é mantida.
- **Formatação comum:** todos os documentos têm cabeçalho, rodapé, paginação e bloco de assinatura.
- **Tabelas da norma:** consulta às tabelas da NBR 5410, da NBR ISO/CIE 8995-1 e da NDU 001 dentro da plataforma.

---

## Como usar

### Online (GitHub Pages)
Acesse https://camposfabiano1981-hue.github.io/dimensiona-5410/

### No computador
Baixe o arquivo `index.html` e abra-o no navegador (Chrome, Edge ou Firefox atualizados). A tela funciona sem internet. Só a emissão dos documentos baixa, na primeira vez, as bibliotecas de PDF, Word e Excel (jsPDF, docx e ExcelJS) da CDN jsDelivr.

### Fluxo sugerido
1. **Projeto:** dados da obra, tensão, esquema de aterramento e temperaturas.
2. **Circuitos:** cadastre as cargas, o esquema de ligação e a maneira de instalar. O resultado é recalculado a cada alteração.
3. **Eletrodutos / Eletrocalhas / Quadros de carga:** confira ocupação, balanceamento e demanda.
4. **Sistemas → Luminotécnica (interiores e exteriores), Climatização e Aterramento; Instalações → Demanda Energisa:** quando o projeto exigir.
5. **Documentos:** memorial descritivo, memórias separadas ou relatório consolidado, em PDF, Word, HTML ou Excel.

> **Onde ficam os dados?** No armazenamento local do navegador (localStorage). Use **Salvar projeto** para gravar um arquivo `.dimensiona5410.json` e **Abrir projeto** para carregá-lo em outro computador. Os dados digitados **não** vão para o GitHub.

---

## Fontes e premissas

| Módulo | Referência |
|---|---|
| Condutores, proteção e eletrodutos | ABNT NBR 5410:2004 (versão corrigida 2008); tabelas conferidas com o Guia de Dimensionamento de Cabos para Baixa Tensão (Prysmian, Rev. 9) |
| Iluminação de interiores | ABNT NBR ISO/CIE 8995-1:2013; catálogos dos fabricantes (conferir a ficha técnica oficial pelo código) |
| Iluminação de exteriores | ABNT NBR 5101 (classes por iluminância da edição 2018); EN 12464-2 / CIE S 015; EN 12193; Mamede Filho, *Instalações Elétricas Industriais* (métodos dos lúmens e ponto a ponto) |
| Demanda | Energisa NDU 001 v7.0 e NDU 003 v8.1 (Tabelas 03 e 04 da NDU 003 a preencher pelo projetista) |
| Carga térmica | ABNT NBR 16401-1:2024, NBR 16401-2:2024 e NBR 16401-3:2008; NBR 15220-2; ISO 7730; ASHRAE Handbook — Fundamentals |
| SPDA | ABNT NBR 5419-1 a 5419-4:2026 (substituiu a edição 2015); IEC 62305 |
| DPS | ABNT NBR 5410:2004 (6.3.5, Tabelas 31 e 49); ABNT NBR 5419-4:2026; ABNT NBR IEC 61643-11; IEC 61643-12; IEC 60364-5-534; IEC 62305-4 (Anexo D); Energisa ETU-124.2; catálogos de fabricantes |
| Aterramento | ABNT NBR 5410:2004 (6.4); NBR 7117-1:2020; NBR 15749:2009; NBR 15751:2013; IEEE Std 80-2013; Energisa NDU 001 v7.0 (8.10); Kindermann & Campagnolo, *Aterramento Elétrico* |

**Dados que o projetista precisa confirmar:**
- **Dados climáticos de projeto:** use o Anexo A da NBR 16401-1:2024 para a localidade. Os valores do exemplo são ilustrativos.
- **Vazões de ar exterior (Fp, Fa):** confira na Tabela 1 da NBR 16401-3:2008.
- **Propriedades de produtos:** catálogo de luminárias, fator solar de vidros e capacidades de equipamentos devem ser conferidos com o fabricante.
- **Iluminação externa:**
  - os níveis da NBR 5101 são os da edição 2018 (a edição 2024 usa as classes M, C e P, com requisitos de luminância) e os da EN 12464-2 são de referência; confirme na edição vigente e nas exigências da prefeitura ou da distribuidora;
  - os projetores do catálogo são genéricos e o modelo de intensidade é simétrico em torno do eixo de mira; para luminárias viárias assimétricas e projetos executivos, confirme com a fotometria do fabricante (IES/LDT) em software de cálculo.
- **DPS:** confira na sua NBR 5410 os valores das Tabelas 31 e 49 e dos itens 6.3.5.2 usados no motor, e informe Up, Iimp, UT, Ifi, retaguarda e Isccr do produto escolhido (os valores-padrão são típicos de catálogo). Os critérios de TOV, Ifi e coordenação por 10 m vêm das normas IEC e de catálogos; a regra dos 10 m é informativa e cede à declaração do fabricante.
- **SPDA:**
  - a densidade NG vem da tabela municipal do Anexo F da NBR 5419-2:2026: os 79 municípios de Mato Grosso do Sul estão no motor de cálculo (o memorial cita só o município escolhido; o exemplo usa Campo Grande, NG = 30); para outros estados, informe o valor;
  - as probabilidades e perdas seguem as tabelas da Parte 2 e ficam listadas no memorial; os limites da frequência de danos (1 e 0,1 por ano) e as seções de materiais da revisão foram obtidos de resumos técnicos — confira-os no texto oficial da ABNT.
- **Aterramento:**
  - a resistividade deve vir de medição em campo, de preferência em época seca;
  - as equações simplificadas da IEEE 80 valem para malhas regulares em solo homogêneo; em solo fortemente estratificado ou geometria irregular, confirme com software de malha;
  - a resistência final deve ser medida após a execução (NBR 15749).

A plataforma é uma ferramenta de apoio ao projeto. A responsabilidade técnica é do profissional habilitado que assina o documento.

---

## Estrutura do projeto

```
index.html            Aplicação completa em um único arquivo (gerada por build.py — não editar à mão)
build.py              Junta src/ e as fontes em index.html
src/shell.html        Estrutura da página e estilos
src/tables.js         Tabelas da NBR 5410 (33, 35 a 48, resistências, diâmetros)
src/engine.js         Motor NBR 5410: circuitos, eletrodutos, quadros e demanda
src/calhas.js         Eletrocalhas, perfilados, bandejas e leitos
src/lumi.js           Requisitos da 8995-1, catálogo e cálculo luminotécnico
src/lumiext.js        Iluminação de exteriores: requisitos, projetores, lúmens e ponto a ponto
src/energisa.js       Tabelas e cálculo de demanda das NDU 001 / NDU 003
src/clima.js          Carga térmica: clima, sol, condução periódica, psicrometria, PMV/PPD
src/aterr.js          Aterramento: solo (Wenner, duas camadas), hastes, cabo, malha, toque e passo
src/spda.js           SPDA: análise de risco (NBR 5419-2) e projeto (NBR 5419-3 e 5419-4)
src/spdadoc.js        SPDA: planta, elevação, gráfico de risco e memorial
src/dps.js            DPS: seleção e verificações por quadro (NBR 5410 6.3.5, NBR 5419-4)
src/dpsdoc.js         DPS: memória de cálculo
src/pictos.js         Desenhos da Tabela 33 e cortes de eletrodutos
src/memorial.js       Memória de cálculo NBR 5410
src/diagramas.js      Diagramas unifilar e multifilar dos quadros
src/lumidoc.js        Relatório luminotécnico (plantas, desenhos das luminárias e áreas externas)
src/energisadoc.js    Memorial de demanda para a concessionária
src/climadoc.js       Memorial de carga térmica
src/aterrdoc.js       Memorial de aterramento (planta, corte e curva do solo)
src/materiais.js      Cadastro de materiais, quantitativo automático e lista de materiais
src/descritivo.js     Memorial descritivo (influências externas, especificações) e lista de materiais
src/memorias.js       Memórias separadas, relatório consolidado e anexos
src/export.js         Saída em PDF (jsPDF), Word (docx), HTML e Excel (ExcelJS)
src/ui_menu.js        Barra de menus suspensos, atalhos de teclado e caminho da tela
src/ui*.js            Interface (seções, formulários, bancadas)
src/sample.js         Projeto de exemplo
fonts/                DejaVu Sans (subconjunto) embutida nos PDFs
exemplo/              Documentos gerados a partir do projeto de exemplo
test/                 Testes do motor e de ponta a ponta no navegador
```

## Desenvolvimento e testes

```bash
python3 build.py                 # gera index.html depois de editar src/
node --test test/motor.test.js   # testes do motor de cálculo (Node 18+)

npm install --no-save playwright && npx playwright install chromium
node test/navegador.js           # navega pelo menu (mouse e teclado), percorre as seções, gera os documentos em exemplo/ e verifica erros
```

Os testes do motor conferem o projeto de exemplo com valores verificados à mão:
- seções e disjuntores dos circuitos;
- demanda e categoria Energisa;
- carga térmica por ambiente;
- PMV/PPD contra os exemplos da ISO 7730;
- transmitâncias e regime permanente da condução;
- psicrometria e radiação solar;
- aterramento:
  - haste e conjunto de hastes;
  - malha reproduzindo o exemplo 1 do anexo B da IEEE Std 80-2013 (Rg 2,78 Ω; Em 1.002 V);
  - recuperação de um modelo de solo de duas camadas;
- quantitativo de materiais coerente com os circuitos;
- memorial descritivo com as 23 influências externas e os anexos escolhidos;
- montagem das memórias, da lista de materiais e do relatório consolidado.
