# Ilha RPG no GitHub Pages (online com login)

O GitHub Pages só hospeda arquivos. Por isso, o login e o online usam o **Firebase**, que é gratuito no plano Spark. O Firebase cuida de:

- **Login:** Google, e-mail e senha, convidado e, se quiser, GitHub ou Microsoft.
- **Progresso na conta:** o jogador continua de onde parou em qualquer computador.
- **Online em tempo real:** os outros jogadores aparecem na ilha e todos conversam no mesmo chat.

Você só precisa fazer a configuração uma vez, e ela leva uns 15 minutos.

---

## 1. Criar o projeto no Firebase

1. Acesse <https://console.firebase.google.com>, clique em **Adicionar projeto** e dê um nome (ex.: `ilha-rpg`).
2. O Google Analytics é opcional: pode desativar.

## 2. Ativar as formas de login

Abra **Criação › Authentication › Vamos começar** (Build › Authentication › Get started). Na aba **Sign-in method**, ative:

| Forma de login | Como ativar |
|---|---|
| **Google** | Ativar e escolher seu e-mail de suporte. |
| **E-mail/senha** | Ativar só a primeira opção. |
| **Anônimo** | Ativar. É o "Jogar como convidado". |
| **GitHub** (opcional) | Crie um OAuth App em <https://github.com/settings/developers>. Use como *Authorization callback URL* o endereço que o Firebase mostra. Cole o Client ID e o Client Secret no Firebase. |

Para mostrar ou esconder botões na tela de login, edite `window.LOGIN_PROVEDORES` em `js/firebase-config.js`. As opções são `'google'`, `'github'`, `'microsoft'`, `'email'` e `'convidado'`.

## 3. Criar o banco em tempo real

1. Abra **Criação › Realtime Database › Criar banco de dados**. Escolha a região (ex.: `us-central1`) e o **modo bloqueado**.
2. Abra a aba **Regras**.
3. Apague o que estiver lá e cole o conteúdo de `regras-firebase.json` desta pasta.
4. Clique em **Publicar**.

As regras impedem que um jogador mexa no progresso ou na posição de outro. Elas também limitam o tamanho das mensagens e a frequência do chat.

## 4. Copiar a configuração para o jogo

1. Abra **Configurações do projeto** (engrenagem) › **Seus apps** › ícone **`</>`** (Web). Registre o app; não precisa de Hosting.
2. O Firebase mostra um bloco `firebaseConfig`. Copie os valores para **`Jogo/js/firebase-config.js`**, no projeto original, não na pasta publicada:

```js
window.FIREBASE_CONFIG = {
 apiKey: 'AIza...',
 authDomain: 'ilha-rpg.firebaseapp.com',
 databaseURL: 'https://ilha-rpg-default-rtdb.firebaseio.com',
 projectId: 'ilha-rpg',
 appId: '1:123...:web:abc...'
};
```

O `databaseURL` só aparece depois do passo 3. Se faltar, ele está no topo da página do Realtime Database.

A `apiKey` do Firebase não é secreta: ela sempre fica visível no site. Quem protege os dados são as regras do passo 3.

## 5. Autorizar os endereços do jogo

Abra **Authentication › Settings › Authorized domains** e adicione:

- `SEU-USUARIO.github.io`, o endereço do GitHub Pages.
- `127.0.0.1`, para testar no seu computador com o `Jogar.bat`. O `localhost` já vem autorizado.

## 6. Gerar a pasta e publicar

1. Rode **`Publicar-GitHub-Pages.bat`** na pasta `Jogo`. Ele monta, dentro do repositório clonado em `Jogo/GDM-Ilha-Acima-Dos-Deuses/GDM-Ilha-Acima-Dos-Deuses/`, só o que o jogo usa, e mostra se o online está ativo.
2. Crie um repositório **público** em <https://github.com/new> (ex.: `ilha-rpg`).
3. Envie o **conteúdo** dessa pasta. Há três formas:
   - **Pelo GitHub Desktop:** faça **Commit** e depois **Push origin**.
   - **Pelo site:** no repositório, use **Add file › Upload files** e arraste tudo o que está dentro da pasta.
   - **Pelo terminal** (com o Git instalado), dentro da pasta:

     ```
     git init
     git add .
     git commit -m "Ilha RPG"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/ilha-rpg.git
     git push -u origin main
     ```
4. No repositório, abra **Settings › Pages**. Em *Source* escolha **Deploy from a branch**, depois **main** e **/ (root)**, e salve.
5. Em 1 ou 2 minutos o jogo estará em **`https://SEU-USUARIO.github.io/ilha-rpg/`**.

## Atualizar o jogo publicado

1. Edite na Engine e salve com Ctrl+S.
2. Rode `Publicar-GitHub-Pages.bat` de novo. Ele mantém a pasta `.git`.
3. Envie as mudanças:
   - **Pelo GitHub Desktop:** **Commit** e depois **Push origin**.
   - **Pelo terminal:** na pasta do repositório, rode `git add .`, depois `git commit -m "Atualização"` e `git push`.
   - **Pelo site:** faça o upload de novo.

Os arquivos vão marcados com a versão, então os jogadores recebem a atualização ao recarregar a página.

---

## Como funciona para o jogador

- **Ao abrir o jogo:** aparece a tela de login. Quem já entrou antes entra direto.
- **Progresso:** o jogo salva no navegador a cada 5 segundos e envia para a conta a cada 20 segundos e ao fechar a página. Entrando em outro computador, vale sempre o progresso mais recente.
- **Convidado:** o progresso fica preso a este navegador. Pelo menu (Esc), o convidado pode usar **Vincular Google** para guardar o progresso numa conta de verdade sem perder nada.
- **Menu (Esc):** mostra a conta e o botão **Sair da conta**.
- **Chat:** abre com Enter. O comando `/nome NovoNome` muda o nome, que fica salvo na conta.

## Multijogador

| Recurso | Como funciona |
|---|---|
| **Cada um tem sua ilha** | Ao entrar, você está sozinho na sua ilha, com seus monstros e seu progresso. Cabem **até 4 pessoas** numa ilha. |
| **Convidar para a ilha** | Botão **Jogadores** (na barra do chat, tecla P) › **Convidar p/ ilha**. Quem aceita vai para a sua ilha e vê os seus monstros, que atacam qualquer um. **XP e ouro são divididos** em partes iguais entre quem participou da batalha: quem causou dano ou efeito no monstro, ou usou cura, bênção ou proteção nos últimos 15 segundos. Com 2 jogadores, cada um recebe 50%. Os itens vêm para cada participante. **Voltar para minha ilha** fica no mesmo painel. |
| **Amigos** | **Jogadores** › **Adicionar amigo**. Depois que o outro aceita, ele aparece em **Amigos**, online ou offline. **Visitar** leva direto para a ilha dele, sem convite. Com o amigo online, dá para **Convidar p/ grupo** e **Convidar p/ ilha** direto da lista. **Sussurrar** abre uma mensagem privada. |
| **Sussurro** | No chat: `/s Nome mensagem`. Para responder o último sussurro: `/r mensagem`. Os sussurros recebidos enquanto você estava offline aparecem quando você entra. |
| **Grupo de DG (até 5)** | No **portal do acampamento**, **Entrar na masmorra** abre a tela **Montar grupo**: 5 espaços com a fotinha de cada jogador; os vazios têm **+** para convidar (também em **Jogadores** › **Convidar p/ grupo**). **Começar** entra na DG. O convite chega no **Correio**. Quando o líder entra, o grupo recebe o chamado **Entrar**; dá para chamar gente mesmo com o líder já dentro da DG. A dificuldade acompanha quantos estão lá dentro: cada jogador a mais deixa os inimigos com +60% de vida e +15% de dano, e volta a cair se alguém sair. Se o líder sair, o grupo volta. |
| **Taverna** | Botão **Taverna** no canto de cima. É o ponto de encontro de todos, sem monstros. As habilidades interagem entre os jogadores: curas curam quem está perto (ou o jogador mirado), bênçãos e proteções fortalecem e ataques só empurram, sem dano. A taverneira vende uma bebida que enche a vida e a mana. Os **mestres de classe** ficam na taverna: aprender uma classe nova custa **2.000 de ouro**, e voltar para uma classe já aprendida é grátis. |
| **Visitar uma ilha** | A ilha aparece como o dono a deixou: paliçada, portal, carpinteiro e ferreiro. Só o dono mexe no portão, no portal e nos NPCs. O seu progresso não muda enquanto visita e volta quando você retorna para casa. |
| **Chat** | Aba **Local**: só quem está no mesmo lugar (ilha, DG ou taverna); aparece em balão sobre o personagem. Aba **Global**: todos online. |
| **Vender itens** | Na taverna, fale com a **Taverneira Bete** › **Vender itens**. O preço de cada item é configurado na Engine (Item › **Preço de venda**); sem preço, é calculado pelos atributos. Equipamentos valem de 50% a 150% conforme a qualidade. Itens equipados e de missão não são vendidos. |
| **Social** | Botão **Social** acima da Enciclopédia: só os seus amigos (online primeiro), com Visitar, Convidar, Sussurrar e Remover. Quem está online no jogo fica em **Jogadores**. |
| **Correio** | **Cartinha** no canto de cima à direita da barra do personagem (mostra quantos pedidos há): pedidos de amizade e convites de ilha e de grupo ficam ali até aceitar ou recusar. Amizade vale 7 dias; convites de ilha e de grupo, 10 minutos. |
| **Arena (PvP)** | Fale com o **Lanceiro Aldric** na taverna: partidas **1x1 ou 2x2** montadas num lobby (convite pelo Correio). Cada equipe começa numa ponta; quem cai fica assistindo; a partida acaba quando uma equipe perde todos ou em 5 minutos. Cair não custa ouro. Sozinho, dá para treinar no Boneco de treino. |
| **Voz** | Botão **Voz** na barra do chat: conversa com quem está no mesmo lugar e também ligou a voz. **Em grupo**, além de quem está no mesmo lugar, os membros do grupo se ouvem em qualquer lugar (cada um na sua ilha, DG ou taverna). O **microfone** ao lado mostra o nível do som enquanto transmite: verde é transmitindo, cinza é esperando e riscado é mudo. Clique nele para ficar mudo. A **engrenagem** permite escolher entre **Sempre ligado** e **Apertar para falar** (tecla V, ou segurar o botão **Falar**), além do microfone, do volume dos outros e de um teste de nível. Um ícone aparece sobre quem está falando. |
| **Criação de personagem** | No primeiro login, o jogador escolhe o **nome**, a **classe** e o **sexo**, com uma prévia do sprite. O nome é único: maiúsculas, acentos e símbolos não contam, então "Ána" e "ana" são o mesmo nome. O comando `/nome` no chat respeita a mesma regra. |
| **Salvamento** | Automático, sem salvar ou carregar manual: o que você faz não tem volta. Para recomeçar do zero, use o link vermelho **Excluir conta** no fim do menu (Esc). Ele apaga o personagem, o progresso, o nome, os amigos e o login, e volta para a tela de entrada, onde dá para criar outro personagem. |
| **Controles** | Menu › **Controles**: clique numa ação e aperte a nova tecla. Se a tecla já estiver em uso, as duas ações trocam. |

**Ao atualizar de uma versão anterior, publique de novo as regras** de `regras-firebase.json` (passo 3). As regras novas cobrem salas, convites, grupos, voz, nomes, posições (`pos`), ping, as partidas da arena (`arenas` e `salas/arena:.../pvp`), o convite de arena, os avisos de mecânica de chefe na ilha (`tg`) e a aparência do personagem (`online/{uid}/ap`: cores e estilo de cabelo). Sem elas, os outros jogadores não aparecem, o grupo e a arena não funcionam (o jogo avisa "O servidor recusou...") e os outros veem você com a aparência padrão.

**A voz** vai direto entre os jogadores (WebRTC), sem passar pelo Firebase. Em muitas redes a conexão direta é bloqueada e ninguém se escuta: internet móvel (4G/5G), provedores de fibra com CGNAT e redes de empresa. Para essas redes é preciso um **servidor TURN**, que repassa o áudio. Veja a seção abaixo.

### Servidor TURN para a voz (recomendado)

O Metered tem um plano grátis com alguns GB de TURN por mês. Confira o limite atual no painel deles.

1. Crie a conta em <https://dashboard.metered.ca/signup> e escolha o plano **Free**.
2. No painel, crie um app. Ele ganha um endereço do tipo `SEU-APP.metered.live`.
3. Em **TURN Server › Credentials**, crie uma credencial (API key).
4. Monte a URL e cole em `window.VOZ_TURN_URL`, no arquivo `Jogo/js/firebase-config.js`:

   ```js
   window.VOZ_TURN_URL = 'https://SEU-APP.metered.live/api/v1/turn/credentials?apiKey=SUA_CHAVE';
   ```
5. Rode o `Publicar-GitHub-Pages.bat` e envie as mudanças.

Se você tiver outro servidor TURN, coloque os dados dele em `window.VOZ_ICE`, no mesmo arquivo.

Na engrenagem da voz, cada pessoa aparece com o estado **conectado**, **conectando…** ou **sem conexão**. Se aparecer "sem conexão", a rede bloqueou a conexão direta. Sem TURN, o jogo tenta de novo 3 vezes e depois avisa no chat.

## Ping, FPS e desempenho

- **Ping e FPS:** aparecem no canto de cima à direita. Para esconder, use Menu › Opções › **Mostrar ping e FPS**. Até 90 ms fica verde, até 180 ms amarelo e acima disso vermelho. No painel **Jogadores** aparece também o ping de quem está no mesmo lugar.
- **Modo desempenho:** fica em Menu › Opções. Tira as luzes e deixa a névoa mais leve, para computadores fracos.
- **Rede:** cada jogador só recebe os movimentos de quem está no mesmo lugar, até 10 vezes por segundo. Os outros personagens andam suavizados, mesmo quando a internet oscila.

## Som

- **Volumes:** em Menu › Opções há quatro controles: geral, música, ambiente e efeitos.
- **Saída de som:** também fica em Menu › Opções. Pode ser o alto-falante ou o fone e vale para os sons do jogo e para a voz.
- **Música e ambiente:** cada lugar tem os seus, gerados pelo próprio jogo:
  - **ilha:** mar, vento e pássaros;
  - **masmorra:** goteiras e ecos;
  - **taverna:** lareira, conversa e canecas.
- **Sons substituíveis:** um arquivo em Engine › Sons substitui o som gerado. Isso inclui morte, renascer, nível, rank, missão, item caindo e pegar item de cada raridade.
- **Itens dos monstros:** caem no chão, brilhando na cor da raridade, e depois voam até o personagem. O som de pegar o item fica mais caprichado quanto maior a raridade.
- **Entrada (microfone) e saída:** também podem ser escolhidas na engrenagem da voz.
- **Ataques dos outros jogadores:** os golpes e as habilidades de quem está no mesmo lugar tocam para você, mais baixos quanto mais longe.

## Limites do plano gratuito (Spark)

- **Jogadores ao mesmo tempo:** até 100 conexões.
- **Tráfego:** 10 GB de download por mês e 1 GB armazenado.
  - O jogo só envia o que mudou, no máximo 5 vezes por segundo.
  - Com 10 pessoas juntas, isso dá dezenas de horas de jogo por mês.
- **Se passar disso:** o online para até o mês virar. O plano Blaze é pago por uso.

## Importante antes de vender itens (microtransações)

**Por enquanto, não venda nada.** Neste modelo o progresso é calculado no navegador do jogador e só depois guardado na conta. Uma pessoa com conhecimento técnico consegue alterar o próprio ouro ou os próprios itens. Por isso, a loja precisa de um servidor que valide as compras e o inventário, por exemplo Cloud Functions do Firebase no plano Blaze ou um servidor próprio.
