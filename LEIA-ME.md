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

1. Rode **`Publicar-GitHub-Pages.bat`** na pasta `Jogo`. Ele monta `Jogo/github-pages/` só com o que o jogo usa e mostra se o online está ativo.
2. Crie um repositório **público** em <https://github.com/new> (ex.: `ilha-rpg`).
3. Envie o **conteúdo** da pasta `github-pages`. Há duas formas:
   - **Pelo site:** no repositório, use **Add file › Upload files** e arraste tudo o que está dentro de `github-pages`.
   - **Pelo terminal** (com o Git instalado), na pasta `github-pages`:

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
   - **Pelo terminal:** na pasta `github-pages`, rode `git add .`, depois `git commit -m "Atualização"` e `git push`.
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
| **Cada um tem sua ilha** | Ao entrar, você está sozinho na sua ilha, com seus monstros e seu progresso. |
| **Convidar para a ilha** | Botão **Jogadores** (na barra do chat) › **Convidar p/ ilha**. Quem aceita vai para a sua ilha e vê os seus monstros. Os monstros atacam qualquer um, e cada um ganha XP, ouro e itens quando um monstro morre. **Voltar para minha ilha** fica no mesmo painel. |
| **Grupo de DG (até 5)** | **Jogadores** › **Convidar p/ grupo**. O líder entra numa DG pelo portal do acampamento e o grupo recebe o aviso **Entrar**. Os inimigos ficam mais fortes a cada jogador extra: +60% de vida e +15% de dano. Se o líder sair, o grupo volta. |
| **Taverna** | Botão **Taverna** no canto de cima. É o ponto de encontro de todos, sem monstros. As habilidades interagem entre os jogadores: curas curam quem está perto (ou o jogador mirado), bênçãos e proteções fortalecem e ataques só empurram, sem dano. A taverneira vende uma bebida que enche a vida e a mana. |
| **Chat** | Aba **Local**: só quem está no mesmo lugar (ilha, DG ou taverna); aparece em balão sobre o personagem. Aba **Global**: todos online. |
| **Voz** | Botão **Voz** na barra do chat: conversa com quem está no mesmo lugar e também ligou a voz. **Mudo** desliga o microfone. Um ícone aparece sobre quem está falando. |

**Ao atualizar de uma versão anterior, publique de novo as regras** de `regras-firebase.json` (passo 3): as regras novas cobrem salas, convites, grupos e voz.

**A voz** vai direto entre os jogadores (WebRTC), sem passar pelo Firebase. Em algumas redes muito fechadas (empresas, alguns 4G), ela pode não conectar. Para essas redes seria preciso um servidor TURN, que é pago.

## Limites do plano gratuito (Spark)

- **Jogadores ao mesmo tempo:** até 100 conexões.
- **Tráfego:** 10 GB de download por mês e 1 GB armazenado.
  - O jogo só envia o que mudou, no máximo 5 vezes por segundo.
  - Com 10 pessoas juntas, isso dá dezenas de horas de jogo por mês.
- **Se passar disso:** o online para até o mês virar. O plano Blaze é pago por uso.

## Importante antes de vender itens (microtransações)

**Por enquanto, não venda nada.** Neste modelo o progresso é calculado no navegador do jogador e só depois guardado na conta. Uma pessoa com conhecimento técnico consegue alterar o próprio ouro ou os próprios itens. Por isso, a loja precisa de um servidor que valide as compras e o inventário, por exemplo Cloud Functions do Firebase no plano Blaze ou um servidor próprio.
