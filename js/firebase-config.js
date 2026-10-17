/* ---------- Configuração do online pela nuvem (Firebase) ----------
   Cole aqui os dados do app Web do seu projeto Firebase
   (Console do Firebase > Configurações do projeto > Seus apps > Configuração do SDK).
   O passo a passo completo está em ferramentas/LEIA-ME-GITHUB-PAGES.md.
   Com os campos vazios o jogo funciona como antes: sem login, progresso só no navegador
   e online apenas pelo servidor.py (Jogar-online-LAN.bat). */
window.FIREBASE_CONFIG = {
 apiKey: 'AIzaSyBDSQqrwt6S32CLAbXI2Td8gq-FPR-pDm4',
 authDomain: 'gdm-ilha-acima-dos-deuses.firebaseapp.com',
 databaseURL: 'https://gdm-ilha-acima-dos-deuses-default-rtdb.firebaseio.com',
 projectId: 'gdm-ilha-acima-dos-deuses',
 appId: '1:612507198004:web:fcb675ca34fd7dff08e061'
};

/* Formas de entrar mostradas na tela de login, na ordem desejada.
   Opções: 'google', 'github', 'microsoft', 'email', 'convidado'.
   Cada uma precisa estar ativada em Authentication > Sign-in method no Firebase. */
window.LOGIN_PROVEDORES = ['google', 'email', 'convidado'];
