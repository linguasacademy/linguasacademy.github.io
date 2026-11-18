/* =====================================================================
   practica.js · Lingua's Academy
   Puerta del estudiante (estudiantes.html) y motor de práctica autónoma.
   Lee: window.PRACTICA_TEMAS (practica/temas.js), window.PRACTICA_INDICE y
   window.PRACTICA_META (practica/indice.js), window.CATALOGO (assets/catalogo.js)
   y, bajo demanda, practica/datos/<nombre>.js (window.PRACTICA[nombre]).
   Progreso en localStorage («la-practica»), siempre opcional.
   Iconos: Lucide, ISC.
   ===================================================================== */
(function () {
  'use strict';

  var W = window, D = document;
  var TEMAS = W.PRACTICA_TEMAS || [];
  var INDICE = W.PRACTICA_INDICE || [];
  var META = W.PRACTICA_META || {};
  var CATALOGO = W.CATALOGO || [];
  var NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  var NOMBRE_RE = /^(en-|pt-)?[abc][12]-[a-z0-9]+(-[a-z0-9]+)*$/;
  var URL_BASE = 'https://linguasacademy.github.io/estudiantes.html';
  var VERSION = '2026111802';
  /* ?t=<tablero>&tarea=<código>: tarea con entrega (la crea el profe en el catálogo) */
  var TAREA = (function () {
    try {
      var u = new URLSearchParams(W.location.search), c = u.get('tarea') || '', n = u.get('t') || '';
      return /^[0-9a-z]{10}$/.test(c) && n ? { codigo: c, t: n } : null;
    } catch (e) { return null; }
  })();

  var CAT = {};
  CATALOGO.forEach(function (c) { CAT[String(c.archivo || '').replace(/\.html$/, '')] = c; });

  /* ---------------- almacenamiento (nunca imprescindible) ---------------- */
  var CLAVE = 'la-practica';
  function leerEstado() {
    try {
      var v = JSON.parse(W.localStorage.getItem(CLAVE) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  }
  var EST = leerEstado();
  if (!EST.p || typeof EST.p !== 'object') EST.p = {};
  if (!EST.borradores || typeof EST.borradores !== 'object') EST.borradores = {};
  if (!EST.entregas || typeof EST.entregas !== 'object') EST.entregas = {};
  function guardar() {
    try { W.localStorage.setItem(CLAVE, JSON.stringify(EST)); } catch (e) { /* sin guardar: todo sigue igual */ }
  }

  /* ---------------- textos de la interfaz ---------------- */
  var TX = {
    es: {
      'inicio.titulo': 'Lo que viste en clase, ahora a tu ritmo.',
      'inicio.lead': 'Ejercicios cortos para fijar cada tablero: con pistas, explicaciones y un texto tuyo al final.',
      'apoyo.pregunta': '¿En qué idioma te explicamos?',
      'apoyo.aria': 'Idioma de las explicaciones',
      'nivel.titulo': '¿En qué nivel estás?',
      'nivel.lead': 'Si no lo sabes, pregúntale a tu profe. Lo puedes cambiar cuando quieras.',
      'nivel': 'Nivel',
      'nivel.A1': 'Estoy empezando', 'nivel.A2': 'Me defiendo en el día a día', 'nivel.B1': 'Cuento, explico y opino',
      'nivel.B2': 'Argumento y matizo', 'nivel.C1': 'Juego con el registro', 'nivel.C2': 'Casi como en mi lengua',
      'temas.titulo': '¿Qué repasamos hoy?',
      'temas.vacio': 'Todavía no hay prácticas de este nivel. Prueba con otro.',
      'tema.volver': 'Temáticas',
      'estado.hecho': 'Hecha', 'estado.repasar': 'Para repasar', 'estado.pendiente': 'Por hacer',
      'cuenta.hecho': ['{n} hecha', '{n} hechas'], 'cuenta.repasar': ['{n} para repasar', '{n} para repasar'], 'cuenta.pendiente': ['{n} por hacer', '{n} por hacer'],
      'pr.empezar': 'Empezar', 'pr.otra_vez': 'Empezar de nuevo',
      'pr.repaso': 'Repaso', 'pr.ejercicios': ['{n} ejercicio', '{n} ejercicios'], 'pr.reto': 'Reto de escritura',
      'pr.ultima': 'La última vez: {a} de {b} a la primera.',
      'pr.no_esta': 'Esta práctica todavía no está lista.',
      'pr.no_carga': 'No se pudo cargar la práctica. Revisa la conexión y vuelve a intentarlo.',
      'pr.ver_temas': 'Ver las temáticas',
      'paso': 'Paso {a} de {b}',
      'repaso.consigna': 'Toca cada tarjeta para ver qué significa. Léela en voz alta.',
      'b.comprobar': 'Comprobar', 'b.siguiente': 'Siguiente', 'b.pista': 'Pista', 'b.borrar': 'Borrar', 'b.continuar': 'Continuar', 'b.terminar': 'Terminar', 'b.voltear': 'Voltear',
      'ok': ['Bien.', 'Exacto.', 'Eso es.', 'Muy bien.'],
      'casi': 'Casi. Inténtalo otra vez.',
      'respuesta': 'La respuesta es:',
      'tilde': 'Ojo con la tilde:',
      'vacio.escribe': 'Escribe tu respuesta primero.',
      'vacio.ordena': 'Toca las palabras en orden.',
      'empareja.no': 'No: «{r}» es «{l}».',
      'empareja.listo': 'Todas las parejas, listas.',
      'tu_respuesta': 'Tu respuesta',
      'reto.ideas': 'Para empezar',
      'reto.revisa': 'Antes de terminar, revisa',
      'reto.u.frases': ['{n} frase', '{n} frases'], 'reto.u.palabras': ['{n} palabra', '{n} palabras'],
      'reto.rango': 'entre {min} y {max}',
      'reto.faltan': 'Te faltan {n}.', 'reto.sobran': 'Te pasaste por {n}; puedes recortar.', 'reto.bien': 'Buena extensión.',
      'reto.etiqueta': 'Tu texto',
      'fin.t.todo': 'Todo salió a la primera.',
      'fin.t.bien': 'Vas bien. Queda poco por pulir.',
      'fin.t.repasar': 'Esto pide otra vuelta.',
      'fin.primera': '{a} de {b} a la primera',
      'fin.corregiste': 'Después corregiste {a} de {b}.',
      'fin.bien': 'Lo que salió bien',
      'fin.bien.nada': 'Ningún ejercicio salió completo todavía. Con «Repetir lo que fallé» vuelves solo a esos ítems.',
      'fin.repasar': 'Para repasar',
      'fin.repasar.nada': 'Nada pendiente.',
      'fin.escribiste': 'Escribiste', 'fin.correcto': 'Correcto',
      'fin.reto': 'Tu texto',
      'fin.reto.corto': 'Quedó corto: {a} de {min}.',
      'fin.enviar': 'Enviar a mi profe', 'fin.repetir': 'Repetir lo que fallé', 'fin.volver': '{t}',
      'fin.copiado': 'Copiado. Pégalo en el chat con tu profe.',
      'fin.compartido': 'Listo.',
      'fin.no_copia': 'No se pudo copiar. Selecciona el texto y cópialo.',
      'ent.entregar': 'Entregar a mi profe', 'ent.otra_vez': 'Volver a entregar', 'ent.entregando': 'Entregando…',
      'ent.nombre': 'Tu nombre', 'ent.nombre_falta': 'Escribe tu nombre para que tu profe sepa de quién es.',
      'ent.lista': 'Entregada.', 'ent.lista_el': 'Entregada el {f}. Si la repites, puedes volver a entregarla.',
      'ent.fallo': 'No se pudo entregar. Revisa tu conexión e inténtalo otra vez, o copia el resumen y envíaselo a tu profe.',
      'ent.cerrada': 'Esta tarea ya no recibe entregas. Copia el resumen y envíaselo a tu profe.',
      'ent.copiar': 'Copiar el resumen',
      'mas.otra': 'Siguiente práctica'
    },
    en: {
      'inicio.titulo': 'What you saw in class, now at your own pace.',
      'inicio.lead': 'Short exercises to lock in each lesson, with hints, explanations and a text of your own at the end.',
      'apoyo.pregunta': 'Which language should we explain things in?',
      'apoyo.aria': 'Language of the explanations',
      'nivel.titulo': 'What is your level?',
      'nivel.lead': 'Not sure? Ask your teacher. You can change it any time.',
      'nivel': 'Level',
      'nivel.A1': "I'm just starting", 'nivel.A2': 'I can handle everyday things', 'nivel.B1': 'I can tell stories and give opinions',
      'nivel.B2': 'I can argue and nuance', 'nivel.C1': 'I play with register and tone', 'nivel.C2': 'Almost like my own language',
      'temas.titulo': 'What shall we review today?',
      'temas.vacio': 'There are no practices at this level yet. Try another one.',
      'tema.volver': 'Topics',
      'estado.hecho': 'Done', 'estado.repasar': 'To review', 'estado.pendiente': 'To do',
      'cuenta.hecho': ['{n} done', '{n} done'], 'cuenta.repasar': ['{n} to review', '{n} to review'], 'cuenta.pendiente': ['{n} to do', '{n} to do'],
      'pr.empezar': 'Start', 'pr.otra_vez': 'Start over',
      'pr.repaso': 'Review', 'pr.ejercicios': ['{n} exercise', '{n} exercises'], 'pr.reto': 'Writing challenge',
      'pr.ultima': 'Last time: {a} of {b} right on the first try.',
      'pr.no_esta': "This practice isn't ready yet.",
      'pr.no_carga': "The practice couldn't load. Check your connection and try again.",
      'pr.ver_temas': 'See the topics',
      'paso': 'Step {a} of {b}',
      'repaso.consigna': 'Tap each card to see what it means. Read it out loud.',
      'b.comprobar': 'Check', 'b.siguiente': 'Next', 'b.pista': 'Hint', 'b.borrar': 'Clear', 'b.continuar': 'Continue', 'b.terminar': 'Finish', 'b.voltear': 'Flip',
      'ok': ['Right.', 'Exactly.', "That's it.", 'Well done.'],
      'casi': 'Not quite. Try again.',
      'respuesta': 'The answer is:',
      'tilde': 'Watch the accent:',
      'vacio.escribe': 'Type your answer first.',
      'vacio.ordena': 'Tap the words in order.',
      'empareja.no': 'Not that one: «{r}» is «{l}».',
      'empareja.listo': 'All pairs matched.',
      'tu_respuesta': 'Your answer',
      'reto.ideas': 'To get started',
      'reto.revisa': 'Before you finish, check',
      'reto.u.frases': ['{n} sentence', '{n} sentences'], 'reto.u.palabras': ['{n} word', '{n} words'],
      'reto.rango': 'aim for {min}–{max}',
      'reto.faltan': '{n} to go.', 'reto.sobran': "{n} over; you can trim it.", 'reto.bien': 'Good length.',
      'reto.etiqueta': 'Your text',
      'fin.t.todo': 'Everything right on the first try.',
      'fin.t.bien': "You're doing well. A little left to polish.",
      'fin.t.repasar': 'This needs another round.',
      'fin.primera': '{a} of {b} right on the first try',
      'fin.corregiste': 'Then you fixed {a} of {b}.',
      'fin.bien': 'What went well',
      'fin.bien.nada': 'No exercise was fully right yet. «Redo what I missed» takes you back to just those items.',
      'fin.repasar': 'To review',
      'fin.repasar.nada': 'Nothing pending.',
      'fin.escribiste': 'You wrote', 'fin.correcto': 'Correct',
      'fin.reto': 'Your text',
      'fin.reto.corto': 'A bit short: {a} of {min}.',
      'fin.enviar': 'Send to my teacher', 'fin.repetir': 'Redo what I missed', 'fin.volver': '{t}',
      'fin.copiado': 'Copied. Paste it in your chat with your teacher.',
      'fin.compartido': 'Done.',
      'fin.no_copia': "Couldn't copy. Select the text and copy it.",
      'ent.entregar': 'Hand in to my teacher', 'ent.otra_vez': 'Hand in again', 'ent.entregando': 'Handing in…',
      'ent.nombre': 'Your name', 'ent.nombre_falta': 'Write your name so your teacher knows who it is from.',
      'ent.lista': 'Handed in.', 'ent.lista_el': 'Handed in on {f}. If you redo it, you can hand it in again.',
      'ent.fallo': "Couldn't hand it in. Check your connection and try again, or copy the summary and send it to your teacher.",
      'ent.cerrada': 'This homework no longer takes submissions. Copy the summary and send it to your teacher.',
      'ent.copiar': 'Copy the summary',
      'mas.otra': 'Next practice'
    },
    pt: {
      'inicio.titulo': 'O que você viu na aula, agora no seu ritmo.',
      'inicio.lead': 'Exercícios curtos para fixar cada aula, com dicas, explicações e um texto seu no final.',
      'apoyo.pregunta': 'Em que idioma explicamos?',
      'apoyo.aria': 'Idioma das explicações',
      'nivel.titulo': 'Qual é o seu nível?',
      'nivel.lead': 'Se não souber, pergunte ao seu professor. Dá para mudar quando quiser.',
      'nivel': 'Nível',
      'nivel.A1': 'Estou começando', 'nivel.A2': 'Me viro no dia a dia', 'nivel.B1': 'Conto, explico e opino',
      'nivel.B2': 'Argumento e matizo', 'nivel.C1': 'Brinco com o registro', 'nivel.C2': 'Quase como na minha língua',
      'temas.titulo': 'O que vamos revisar hoje?',
      'temas.vacio': 'Ainda não há práticas deste nível. Tente outro.',
      'tema.volver': 'Temas',
      'estado.hecho': 'Feita', 'estado.repasar': 'Para revisar', 'estado.pendiente': 'A fazer',
      'cuenta.hecho': ['{n} feita', '{n} feitas'], 'cuenta.repasar': ['{n} para revisar', '{n} para revisar'], 'cuenta.pendiente': ['{n} a fazer', '{n} a fazer'],
      'pr.empezar': 'Começar', 'pr.otra_vez': 'Começar de novo',
      'pr.repaso': 'Revisão', 'pr.ejercicios': ['{n} exercício', '{n} exercícios'], 'pr.reto': 'Desafio de escrita',
      'pr.ultima': 'Da última vez: {a} de {b} na primeira tentativa.',
      'pr.no_esta': 'Esta prática ainda não está pronta.',
      'pr.no_carga': 'Não foi possível carregar a prática. Confira a conexão e tente de novo.',
      'pr.ver_temas': 'Ver os temas',
      'paso': 'Passo {a} de {b}',
      'repaso.consigna': 'Toque em cada cartão para ver o que significa. Leia em voz alta.',
      'b.comprobar': 'Verificar', 'b.siguiente': 'Próximo', 'b.pista': 'Dica', 'b.borrar': 'Limpar', 'b.continuar': 'Continuar', 'b.terminar': 'Terminar', 'b.voltear': 'Virar',
      'ok': ['Isso.', 'Exato.', 'Certo.', 'Muito bem.'],
      'casi': 'Quase. Tente de novo.',
      'respuesta': 'A resposta é:',
      'tilde': 'Atenção ao acento:',
      'vacio.escribe': 'Escreva sua resposta primeiro.',
      'vacio.ordena': 'Toque nas palavras na ordem.',
      'empareja.no': 'Não: «{r}» é «{l}».',
      'empareja.listo': 'Todos os pares prontos.',
      'tu_respuesta': 'Sua resposta',
      'reto.ideas': 'Para começar',
      'reto.revisa': 'Antes de terminar, confira',
      'reto.u.frases': ['{n} frase', '{n} frases'], 'reto.u.palabras': ['{n} palavra', '{n} palavras'],
      'reto.rango': 'entre {min} e {max}',
      'reto.faltan': 'Faltam {n}.', 'reto.sobran': 'Passou {n}; dá para cortar.', 'reto.bien': 'Boa extensão.',
      'reto.etiqueta': 'Seu texto',
      'fin.t.todo': 'Tudo certo na primeira tentativa.',
      'fin.t.bien': 'Você vai bem. Falta pouco para polir.',
      'fin.t.repasar': 'Isto pede mais uma volta.',
      'fin.primera': '{a} de {b} na primeira tentativa',
      'fin.corregiste': 'Depois você corrigiu {a} de {b}.',
      'fin.bien': 'O que deu certo',
      'fin.bien.nada': 'Nenhum exercício saiu completo ainda. Com «Refazer o que errei» você volta só a esses itens.',
      'fin.repasar': 'Para revisar',
      'fin.repasar.nada': 'Nada pendente.',
      'fin.escribiste': 'Você escreveu', 'fin.correcto': 'Correto',
      'fin.reto': 'Seu texto',
      'fin.reto.corto': 'Ficou curto: {a} de {min}.',
      'fin.enviar': 'Enviar para meu professor', 'fin.repetir': 'Refazer o que errei', 'fin.volver': '{t}',
      'fin.copiado': 'Copiado. Cole no chat com seu professor.',
      'fin.compartido': 'Pronto.',
      'fin.no_copia': 'Não foi possível copiar. Selecione o texto e copie.',
      'ent.entregar': 'Entregar ao meu professor', 'ent.otra_vez': 'Entregar de novo', 'ent.entregando': 'Entregando…',
      'ent.nombre': 'Seu nome', 'ent.nombre_falta': 'Escreva seu nome para seu professor saber de quem é.',
      'ent.lista': 'Entregue.', 'ent.lista_el': 'Entregue em {f}. Se refizer, pode entregar de novo.',
      'ent.fallo': 'Não foi possível entregar. Confira sua conexão e tente de novo, ou copie o resumo e envie ao seu professor.',
      'ent.cerrada': 'Esta tarefa não recebe mais entregas. Copie o resumo e envie ao seu professor.',
      'ent.copiar': 'Copiar o resumo',
      'mas.otra': 'Próxima prática'
    }
  };
  /* Consignas por defecto (si un archivo de datos no trae la suya) */
  var CONSIGNA_DEF = {
    elige: { es: 'Elige la opción correcta.', en: 'Choose the right option.', pt: 'Escolha a opção certa.' },
    completa: { es: 'Escribe lo que falta.', en: 'Write what is missing.', pt: 'Escreva o que falta.' },
    ordena: { es: 'Ordena la frase.', en: 'Put the sentence in order.', pt: 'Coloque a frase em ordem.' },
    empareja: { es: 'Une cada expresión con su significado.', en: 'Match each expression with its meaning.', pt: 'Ligue cada expressão ao seu significado.' },
    transforma: { es: 'Escribe la frase transformada.', en: 'Rewrite the sentence.', pt: 'Reescreva a frase.' }
  };

  function adivinarApoyo() {
    var g = null;
    try { g = W.localStorage.getItem('la-lang'); } catch (e) { /* nada */ }
    if (g === 'en' || g === 'pt' || g === 'es') return g;
    var n = String((W.navigator && (W.navigator.language || '')) || '').toLowerCase();
    if (n.indexOf('pt') === 0) return 'pt';
    if (n.indexOf('es') === 0) return 'es';
    return 'en';
  }
  var AP = (EST.apoyo === 'es' || EST.apoyo === 'en' || EST.apoyo === 'pt') ? EST.apoyo : adivinarApoyo();

  function t(k, vars) {
    var v = (TX[AP] && TX[AP][k]) != null ? TX[AP][k] : TX.es[k];
    if (v == null) return k;
    if (Array.isArray(v) && vars && typeof vars.n === 'number') v = v[vars.n === 1 ? 0 : 1];
    else if (Array.isArray(v)) v = v[0];
    return String(v).replace(/\{(\w+)\}/g, function (m, p) { return vars && vars[p] != null ? vars[p] : m; });
  }
  function okAlAzar() { var a = TX[AP].ok; return a[Math.floor(Math.random() * a.length)]; }
  /* Texto T del contrato: string tal cual, u objeto {es,en,pt} en la lengua de apoyo, con caída a es */
  function txt(T, lengua) {
    if (T == null) return '';
    if (typeof T === 'string' || typeof T === 'number') return String(T);
    var l = lengua || AP;
    return T[l] != null ? T[l] : (T.es != null ? T.es : (T.en != null ? T.en : (T.pt != null ? T.pt : '')));
  }

  /* ---------------- iconos (Lucide, ISC) ---------------- */
  var ICON = {
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
    'circle-dashed': '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
    'repeat-2': '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'list-checks': '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>'
  };
  function icono(n, tam) {
    var s = tam || 18;
    var span = D.createElement('span');
    span.className = 'pi';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (s >= 32 ? 1.75 : 2) + '" stroke-linecap="round" stroke-linejoin="round">' + (ICON[n] || '') + '</svg>';
    return span;
  }

  /* ---------------- DOM ---------------- */
  function h(tag, attrs) {
    var el = D.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k) || attrs[k] == null || attrs[k] === false) continue;
        var v = attrs[k];
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, String(v));
      }
    }
    for (var i = 2; i < arguments.length; i++) anexar(el, arguments[i]);
    return el;
  }
  function anexar(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { anexar(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? D.createTextNode(String(c)) : c);
  }
  function boton(texto, clase, onclick, ico, icoDespues) {
    var b = h('button', { type: 'button', class: 'pb ' + (clase || 'pb--sec'), onclick: onclick });
    if (ico && !icoDespues) b.appendChild(icono(ico));
    b.appendChild(h('span', { text: texto }));
    if (ico && icoDespues) b.appendChild(icono(ico));
    return b;
  }
  function mezclar(arr, semilla) {
    var a = arr.slice(), s = semilla || 1;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      var j = Math.floor((s / 233280) * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function semillaDe(str) { var s = 7; for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) % 100003; return s + 1; }

  /* ---------------- comparación de respuestas ---------------- */
  function normalizar(s) {
    return String(s == null ? '' : s).normalize('NFC').toLowerCase()
      .replace(/[¿?¡!.,;:"«»“”‘’'()\[\]…–—-]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  /* quita tildes y diéresis, pero no la virgulilla de la ñ */
  function sinTildes(s) {
    return String(s).normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC');
  }
  /* devuelve {ok, tilde:[palabras], correcta} */
  function comparar(resp, aceptadas) {
    var lista = Array.isArray(aceptadas) ? aceptadas : [aceptadas];
    var r = normalizar(resp);
    if (!r) return { ok: false, vacio: true, correcta: String(lista[0] || '') };
    var i;
    for (i = 0; i < lista.length; i++) if (normalizar(lista[i]) === r) return { ok: true, tilde: [], correcta: String(lista[i]) };
    for (i = 0; i < lista.length; i++) {
      var k = normalizar(lista[i]);
      if (sinTildes(k) === sinTildes(r)) {
        var pk = k.split(' '), pr = r.split(' '), malas = [];
        for (var j = 0; j < pk.length; j++) if (pk[j] !== pr[j]) malas.push(pk[j]);
        return { ok: true, tilde: malas, correcta: String(lista[i]) };
      }
    }
    return { ok: false, correcta: String(lista[0] || '') };
  }
  function contar(texto, unidad) {
    var s = String(texto || '').trim();
    if (!s) return 0;
    if (unidad === 'palabras') return s.split(/\s+/).filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }).length;
    return s.split(/[.!?…]+/).filter(function (f) { return /[\p{L}\p{N}]/u.test(f); }).length;
  }

  /* ---------------- datos ---------------- */
  function nivelDe(nombre) {
    var c = CAT[nombre];
    if (c && c.nivel) return c.nivel;
    if (META[nombre] && META[nombre].nivel) return META[nombre].nivel;
    var m = /^(?:en-|pt-)?([abc][12])-/.exec(nombre);
    return m ? m[1].toUpperCase() : '';
  }
  function tematicaDe(nombre) { return (META[nombre] && META[nombre].tematica) || ''; }
  function idiomaDe(nombre) { var c = CAT[nombre]; return (c && c.idioma) || 'es'; }
  function tituloDe(nombre) { var c = CAT[nombre]; return (c && c.titulo) || nombre; }
  function temaPorId(id) { for (var i = 0; i < TEMAS.length; i++) if (TEMAS[i].id === id) return TEMAS[i]; return null; }
  function nombreTema(id) { var tm = temaPorId(id); return tm ? (tm[AP] || tm.es) : id; }
  function notaDe(c) { if (!c) return ''; return AP === 'en' ? (c.notaEn || c.nota || '') : AP === 'pt' ? (c.notaPt || c.nota || '') : (c.nota || ''); }
  function fotoUrl(c, w) { return c && c.foto ? String(c.foto).split('?')[0] + '?auto=format&fit=crop&w=' + w + '&q=70' : ''; }
  function disponibles() {
    var orden = {};
    CATALOGO.forEach(function (c, i) { orden[String(c.archivo).replace(/\.html$/, '')] = i; });
    return INDICE.filter(function (n) { return NOMBRE_RE.test(n); }).slice().sort(function (a, b) {
      var oa = orden[a] == null ? 1e6 : orden[a], ob = orden[b] == null ? 1e6 : orden[b];
      return oa - ob || (a < b ? -1 : 1);
    });
  }
  function nivelesDisponibles() {
    var set = {};
    disponibles().forEach(function (n) { set[nivelDe(n)] = 1; });
    return NIVELES.filter(function (l) { return set[l]; });
  }
  function estadoDe(nombre) { var r = EST.p[nombre]; return r && (r.estado === 'hecho' || r.estado === 'repasar') ? r.estado : 'pendiente'; }

  var cargando = {};
  function cargarDatos(nombre) {
    return new Promise(function (ok, mal) {
      if (W.PRACTICA && W.PRACTICA[nombre]) return ok(W.PRACTICA[nombre]);
      if (!NOMBRE_RE.test(nombre)) return mal(new Error('nombre'));
      var s = D.createElement('script');
      s.src = 'practica/datos/' + nombre + '.js';
      s.async = true;
      s.onload = function () { (W.PRACTICA && W.PRACTICA[nombre]) ? ok(W.PRACTICA[nombre]) : mal(new Error('vacío')); };
      s.onerror = function () { s.remove(); mal(new Error('red')); };
      cargando[nombre] = s;
      D.head.appendChild(s);
    });
  }

  /* ---------------- navegación ---------------- */
  var main, vivo, selApoyo;
  function params() {
    var u = new URLSearchParams(W.location.search);
    return { t: u.get('t') || '', tema: u.get('tema') || '', nivel: (u.get('nivel') || '').toUpperCase() };
  }
  function ir(p, reemplazar) {
    var u = new URLSearchParams();
    if (p.t) {
      u.set('t', p.t);
      if (TAREA && TAREA.t === p.t) u.set('tarea', TAREA.codigo);
    } else {
      if (p.tema) u.set('tema', p.tema);
      if (p.nivel) u.set('nivel', p.nivel);
    }
    var q = u.toString();
    var url = W.location.pathname + (q ? '?' + q : '');
    try { W.history[reemplazar ? 'replaceState' : 'pushState']({}, '', url); } catch (e) { /* file:// u otros: seguimos */ }
    pintar(p);
  }
  function anunciar(msg) { if (vivo) { vivo.textContent = ''; setTimeout(function () { vivo.textContent = msg; }, 30); } }
  function vaciar() { main.innerHTML = ''; W.scrollTo(0, 0); }
  function enfocarTitulo() { var t1 = main.querySelector('h1'); if (t1) { t1.setAttribute('tabindex', '-1'); t1.focus({ preventScroll: true }); } }

  var VISTA = null; /* { tipo, p } */
  function pintar(p) {
    P = null;
    p = p || params();
    VISTA = { p: p };
    if (p.t) return vistaPractica(p.t);
    if (!EST.apoyo) return vistaApoyo();
    var nivel = p.nivel || EST.nivel;
    var niveles = nivelesDisponibles();
    if (!nivel || niveles.indexOf(nivel) < 0) {
      if (EST.nivel && niveles.indexOf(EST.nivel) >= 0 && !p.nivel) nivel = EST.nivel;
      else return vistaNivel();
    }
    if (p.tema && temaPorId(p.tema)) return vistaTema(p.tema, nivel);
    return vistaTemas(nivel);
  }
  function repintar() {
    if (P) return pintarFase();
    pintar(VISTA ? VISTA.p : params());
  }

  /* ---------------- selector de lengua de apoyo (cabecera) ---------------- */
  function pintarSelector() {
    if (!selApoyo) return;
    selApoyo.innerHTML = '';
    selApoyo.setAttribute('aria-label', t('apoyo.aria'));
    [['es', 'ES', 'Español'], ['en', 'EN', 'English'], ['pt', 'PT', 'Português']].forEach(function (o) {
      selApoyo.appendChild(h('button', {
        type: 'button', 'aria-pressed': AP === o[0] ? 'true' : 'false', lang: o[0], title: o[2], 'aria-label': o[2], text: o[1],
        onclick: function () { elegirApoyo(o[0]); }
      }));
    });
  }
  function elegirApoyo(l) {
    if (P && P.fase === 'ej') {
      var campo = main.querySelector('.pr-campo');
      if (campo && !P.cerrado) P.borrador = campo.value;
      P.cerrado = false; P.intento = 0;
    }
    AP = l; EST.apoyo = l; guardar();
    D.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
    pintarSelector();
    repintar();
  }

  /* ---------------- vistas: apoyo, nivel, temáticas, temática ---------------- */
  function cabeza(kicker, titulo, lead) {
    return h('div', { class: 'pr-head' },
      kicker ? h('p', { class: 'pr-kicker mano', text: kicker }) : null,
      h('h1', { class: 'pr-h1', text: titulo }),
      lead ? h('p', { class: 'pr-lead', text: lead }) : null);
  }

  function vistaApoyo() {
    vaciar();
    D.title = "Lingua's Academy · " + t('inicio.titulo');
    var opciones = [
      { l: 'en', t: 'English', s: 'Explanations and hints in English' },
      { l: 'pt', t: 'Português', s: 'Explicações e dicas em português' },
      { l: 'es', t: 'Español', s: 'Todo en español' }
    ];
    main.appendChild(h('section', { class: 'pr-wrap pr-paso' },
      cabeza(null, t('inicio.titulo'), t('inicio.lead')),
      h('h2', { class: 'pr-h2', text: t('apoyo.pregunta') }),
      h('div', { class: 'pr-opciones', role: 'list' }, opciones.map(function (o) {
        return h('div', { role: 'listitem' }, h('button', {
          type: 'button', class: 'pr-opcion', lang: o.l, 'data-apoyo': o.l,
          onclick: function () { elegirApoyo(o.l); }
        }, h('span', { class: 'pr-opcion__t', text: o.t }), h('span', { class: 'pr-opcion__s', text: o.s }), icono('arrow-right')));
      }))));
    enfocarTitulo();
  }

  function vistaNivel() {
    vaciar();
    D.title = "Lingua's Academy · " + t('nivel.titulo');
    var niveles = nivelesDisponibles();
    main.appendChild(h('section', { class: 'pr-wrap pr-paso' },
      cabeza(null, t('nivel.titulo'), t('nivel.lead')),
      h('div', { class: 'pr-opciones pr-opciones--nivel', role: 'list' }, niveles.map(function (l) {
        return h('div', { role: 'listitem' }, h('button', {
          type: 'button', class: 'pr-opcion pr-opcion--nivel', 'data-nivel': l,
          onclick: function () { EST.nivel = l; guardar(); ir({ nivel: l }); }
        }, h('span', { class: 'pr-nivel', text: l }), h('span', { class: 'pr-opcion__s', text: t('nivel.' + l) }), icono('arrow-right')));
      }))));
    enfocarTitulo();
  }

  function selectorNivel(actual, alCambiar) {
    var niveles = nivelesDisponibles();
    return h('div', { class: 'pr-seg', role: 'group', 'aria-label': t('nivel') },
      niveles.map(function (l) {
        return h('button', {
          type: 'button', 'data-nivel': l, 'aria-pressed': l === actual ? 'true' : 'false', text: l,
          onclick: function () { if (l !== actual) alCambiar(l); }
        });
      }));
  }

  function practicasDe(tema, nivel) {
    return disponibles().filter(function (n) { return tematicaDe(n) === tema && nivelDe(n) === nivel; });
  }
  function resumenEstados(lista) {
    var c = { hecho: 0, repasar: 0, pendiente: 0 };
    lista.forEach(function (n) { c[estadoDe(n)]++; });
    return c;
  }
  function lineaEstados(c) {
    var partes = [];
    ['hecho', 'repasar', 'pendiente'].forEach(function (k) {
      if (c[k]) partes.push(h('span', { class: 'pr-cuenta pr-cuenta--' + k }, h('i', { 'aria-hidden': 'true' }), t('cuenta.' + k, { n: c[k] })));
    });
    return h('p', { class: 'pr-cuentas' }, partes);
  }

  function vistaTemas(nivel) {
    vaciar();
    EST.nivel = nivel; guardar();
    D.title = "Lingua's Academy · " + t('temas.titulo');
    var grupos = TEMAS.map(function (tm) { return { tm: tm, lista: practicasDe(tm.id, nivel) }; })
      .filter(function (g) { return g.lista.length; });
    var grid = h('ul', { class: 'pr-temas', role: 'list' });
    grupos.forEach(function (g) {
      var conFoto = null;
      for (var i = 0; i < g.lista.length; i++) if (CAT[g.lista[i]] && CAT[g.lista[i]].foto) { conFoto = CAT[g.lista[i]]; break; }
      var c = resumenEstados(g.lista);
      var nombre = g.tm[AP] || g.tm.es;
      grid.appendChild(h('li', null, h('a', {
        class: 'pr-tema', href: '?tema=' + encodeURIComponent(g.tm.id) + '&nivel=' + nivel, 'data-tema': g.tm.id, 'data-nivel': nivel,
        onclick: function (ev) { if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return; ev.preventDefault(); ir({ tema: g.tm.id, nivel: nivel }); }
      },
        h('span', { class: 'pr-tema__foto' }, conFoto ? h('img', { src: fotoUrl(conFoto, 640), alt: '', loading: 'lazy', width: 640, height: 427, onerror: function () { this.remove(); } }) : null),
        h('span', { class: 'pr-tema__cuerpo' },
          h('span', { class: 'pr-tema__nombre', text: nombre }),
          lineaEstados(c)))));
    });
    main.appendChild(h('section', { class: 'pr-wrap' },
      h('div', { class: 'pr-barra' },
        cabeza(null, t('temas.titulo')),
        selectorNivel(nivel, function (l) { ir({ nivel: l }); })),
      grupos.length ? grid : h('p', { class: 'pr-vacio', text: t('temas.vacio') })));
  }

  function enlaceVolver(texto, destino) {
    return h('a', {
      class: 'pr-volver', href: destino.href,
      onclick: function (ev) { if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return; ev.preventDefault(); ir(destino.p); }
    }, icono('arrow-left'), h('span', { text: texto }));
  }

  function vistaTema(tema, nivel) {
    vaciar();
    var nombre = nombreTema(tema);
    D.title = "Lingua's Academy · " + nombre;
    var lista = practicasDe(tema, nivel);
    var ul = h('ul', { class: 'pr-lista', role: 'list' });
    lista.forEach(function (n) {
      var c = CAT[n] || {};
      var est = estadoDe(n);
      var reg = EST.p[n];
      ul.appendChild(h('li', null, h('a', {
        class: 'pr-fila', href: '?t=' + encodeURIComponent(n), 'data-practica': n,
        onclick: function (ev) { if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return; ev.preventDefault(); ir({ t: n }); }
      },
        h('span', { class: 'pr-fila__foto' }, c.foto ? h('img', { src: fotoUrl(c, 240), alt: '', loading: 'lazy', width: 240, height: 180, onerror: function () { this.remove(); } }) : null),
        h('span', { class: 'pr-fila__cuerpo' },
          notaDe(c) ? h('span', { class: 'pr-fila__nota mano', text: notaDe(c) }) : null,
          h('span', { class: 'pr-fila__titulo', lang: idiomaDe(n), text: tituloDe(n) }),
          c.desc ? h('span', { class: 'pr-fila__desc', lang: 'es', text: c.desc }) : null),
        h('span', { class: 'pr-estado pr-estado--' + est },
          icono(est === 'hecho' ? 'circle-check' : est === 'repasar' ? 'repeat-2' : 'circle-dashed'),
          h('span', { text: t('estado.' + est) }),
          reg && reg.total ? h('span', { class: 'pr-estado__n', text: reg.bien + '/' + reg.total }) : null),
        h('span', { class: 'pr-fila__chev' }, icono('chevron-right')))));
    });
    main.appendChild(h('section', { class: 'pr-wrap pr-wrap--tema' },
      enlaceVolver(t('tema.volver'), { href: '?nivel=' + nivel, p: { nivel: nivel } }),
      h('div', { class: 'pr-head' },
        h('p', { class: 'pr-nivel-tag', 'data-nivel': nivel, text: t('nivel') + ' ' + nivel }),
        h('h1', { class: 'pr-h1', text: nombre }),
        lineaEstados(resumenEstados(lista))),
      ul));
    enfocarTitulo();
  }

  /* ======================================================================
     Motor de práctica
     ====================================================================== */
  var P = null;

  function vistaPractica(nombre) {
    vaciar();
    var volverP = { tema: tematicaDe(nombre), nivel: nivelDe(nombre) };
    if (!NOMBRE_RE.test(nombre) || INDICE.indexOf(nombre) < 0) {
      main.appendChild(h('section', { class: 'pr-wrap pr-col' },
        cabeza(null, t('pr.no_esta')),
        h('p', null, boton(t('pr.ver_temas'), 'pb--pri', function () { ir({}); }, 'arrow-right', true))));
      enfocarTitulo();
      return;
    }
    main.appendChild(h('div', { class: 'pr-wrap pr-col pr-cargando', 'aria-busy': 'true' }, h('div', { class: 'pr-esqueleto' })));
    cargarDatos(nombre).then(function (datos) {
      if (!VISTA || VISTA.p.t !== nombre) return;
      P = nuevaPractica(nombre, datos, volverP);
      pintarFase();
    }, function () {
      if (!VISTA || VISTA.p.t !== nombre) return;
      vaciar();
      main.appendChild(h('section', { class: 'pr-wrap pr-col' },
        cabeza(null, t('pr.no_carga')),
        h('div', { class: 'pr-acciones' },
          boton(t('pr.otra_vez'), 'pb--pri', function () { vistaPractica(nombre); }, 'rotate-ccw'),
          boton(t('pr.ver_temas'), 'pb--sec', function () { ir({}); }))));
    });
  }

  function nuevaPractica(nombre, datos, volverP) {
    var ejs = (datos.ejercicios || []).map(function (e) {
      var n = e.tipo === 'empareja' ? (e.pares || []).length : (e.items || []).length;
      var r = []; for (var i = 0; i < n; i++) r.push(null);
      return r;
    });
    return {
      nombre: nombre, datos: datos, volver: volverP,
      fase: 'inicio', ej: 0, item: 0,
      res: ejs,           /* res[ej][item] = {ok1, ok, resp, rep} */
      cola: null,         /* modo «repetir lo que fallé»: [{ej, item}] */
      colaPos: 0,
      intento: 0, cerrado: false,
      reto: EST.borradores[nombre] || '',
      marcas: [],
      retry: null
    };
  }

  function pasosTotales() { return 2 + P.datos.ejercicios.length; } /* repaso + ejercicios + reto */
  function pasoActual() {
    if (P.fase === 'repaso') return 1;
    if (P.fase === 'ej') return 2 + P.ej;
    if (P.fase === 'reto') return pasosTotales();
    return 0;
  }

  function cabezaPractica() {
    var nombre = P.nombre, nivel = nivelDe(nombre), tema = tematicaDe(nombre);
    var bar = h('div', { class: 'pr-pasos', role: 'img', 'aria-label': t('paso', { a: Math.max(pasoActual(), 1), b: pasosTotales() }) });
    var actual = pasoActual();
    for (var i = 1; i <= pasosTotales(); i++) {
      bar.appendChild(h('i', { class: i < actual || P.fase === 'fin' ? 'hecho' : i === actual ? 'actual' : '' }));
    }
    return h('div', { class: 'pr-pcab', 'data-nivel': nivel },
      h('div', { class: 'pr-pcab__fila' },
        tema ? enlaceVolver(nombreTema(tema), { href: '?tema=' + tema + '&nivel=' + nivel, p: P.volver }) : enlaceVolver(t('tema.volver'), { href: '?', p: {} }),
        h('span', { class: 'pr-pcab__titulo', lang: idiomaDe(nombre), text: tituloDe(nombre) }),
        h('span', { class: 'pr-nivel-tag', 'data-nivel': nivel, text: nivel })),
      P.fase !== 'inicio' && P.fase !== 'fin' && !P.cola ? bar : null);
  }

  function pintarFase() {
    vaciar();
    var cont = h('div', { class: 'pr-wrap pr-col pr-practica', 'data-fase': P.fase, 'data-practica': P.nombre });
    main.appendChild(cont);
    cont.appendChild(cabezaPractica());
    D.title = tituloDe(P.nombre) + " · Lingua's Academy";
    if (P.fase === 'inicio') faseInicio(cont);
    else if (P.fase === 'repaso') faseRepaso(cont);
    else if (P.fase === 'ej') faseEjercicio(cont);
    else if (P.fase === 'reto') faseReto(cont);
    else if (P.fase === 'fin') faseFin(cont);
  }

  /* ---------- inicio ---------- */
  function faseInicio(cont) {
    var d = P.datos, c = CAT[P.nombre] || {};
    var reg = EST.p[P.nombre];
    var lista = h('ul', { class: 'pr-indice', role: 'list' },
      h('li', null, icono('list-checks'), h('span', { text: t('pr.repaso') })),
      h('li', null, icono('pencil'), h('span', { text: t('pr.ejercicios', { n: d.ejercicios.length }) })),
      h('li', null, icono('send'), h('span', { text: t('pr.reto') })));
    var foto = c.foto ? h('figure', { class: 'pr-portada' },
      h('img', { src: fotoUrl(c, 1100), alt: c.fotoAlt || '', width: 1100, height: 620, onerror: function () { this.parentNode.remove(); } }),
      c.fotoAutor ? h('figcaption', { class: 'pr-credito' }, 'Foto: ', c.fotoPagina ? h('a', { href: c.fotoPagina, target: '_blank', rel: 'noopener', text: c.fotoAutor }) : c.fotoAutor, ' · Unsplash') : null) : null;
    cont.appendChild(h('section', { class: 'pr-inicio' },
      foto,
      h('div', { class: 'pr-inicio__txt' },
        notaDe(c) ? h('p', { class: 'pr-kicker mano', text: notaDe(c) }) : null,
        h('h1', { class: 'pr-h1', lang: idiomaDe(P.nombre), text: tituloDe(P.nombre) }),
        h('p', { class: 'pr-lead', text: txt(d.objetivo) }),
        lista,
        reg && reg.total ? h('p', { class: 'pr-ultima', text: t('pr.ultima', { a: reg.bien, b: reg.total }) }) : null,
        h('div', { class: 'pr-acciones' },
          boton(reg ? t('pr.otra_vez') : t('pr.empezar'), 'pb--pri pb--main', function () { P.fase = 'repaso'; pintarFase(); enfocarTitulo(); }, 'arrow-right', true)))));
    enfocarTitulo();
  }

  /* ---------- repaso: tarjetas que giran ---------- */
  function faseRepaso(cont) {
    var lengua = idiomaDe(P.nombre);
    var grid = h('ul', { class: 'pr-tarjetas', role: 'list' });
    (P.datos.repaso || []).forEach(function (r, i) {
      var frente = r[lengua] != null ? r[lengua] : txt(r, 'es');
      var dorsoL = AP !== lengua && r[AP] != null ? AP : (r.en != null ? 'en' : (r.pt != null ? 'pt' : null));
      var dorso = dorsoL ? r[dorsoL] : '';
      var b = h('button', {
        type: 'button', class: 'pr-tarjeta', 'aria-pressed': 'false', 'data-i': i,
        onclick: function () { var v = b.getAttribute('aria-pressed') === 'true'; b.setAttribute('aria-pressed', v ? 'false' : 'true'); }
      },
        h('span', { class: 'pr-tarjeta__cara' },
          h('span', { class: 'pr-tarjeta__frente', lang: lengua }, h('span', { text: frente })),
          h('span', { class: 'pr-tarjeta__dorso', lang: dorsoL || AP }, h('span', { class: 'pr-tarjeta__modelo', lang: lengua, text: frente }), h('span', { text: dorso }))));
      grid.appendChild(h('li', null, b));
    });
    cont.appendChild(h('section', { class: 'pr-fase' },
      h('h1', { class: 'pr-h2', text: t('pr.repaso') }),
      h('p', { class: 'pr-consigna', text: t('repaso.consigna') }),
      grid,
      h('div', { class: 'pr-acciones' }, boton(t('b.continuar'), 'pb--pri pb--main', function () { irEjercicio(0, 0); }, 'arrow-right', true))));
  }

  /* ---------- ejercicios ---------- */
  function irEjercicio(ej, item) {
    P.fase = 'ej'; P.ej = ej; P.item = item; P.intento = 0; P.cerrado = false; P.orden = null; P.emp = null;
    pintarFase();
  }
  function totalItems(e) { return e.tipo === 'empareja' ? 1 : (e.items || []).length; }
  /* lista de ítems del ejercicio actual (en modo repetir, solo los fallados) */
  function itemsActivos(ejIdx) {
    var e = P.datos.ejercicios[ejIdx];
    var n = e.tipo === 'empareja' ? (e.pares || []).length : (e.items || []).length;
    var todos = []; for (var i = 0; i < n; i++) todos.push(i);
    if (!P.cola) return todos;
    return P.cola.filter(function (c) { return c.ej === ejIdx; }).map(function (c) { return c.item; });
  }
  function siguienteEjercicio() {
    var n = P.datos.ejercicios.length;
    for (var j = P.ej + 1; j < n; j++) {
      if (itemsActivos(j).length) return irEjercicio(j, 0);
    }
    if (P.cola) { cerrarRepeticion(); return; }
    P.fase = 'reto'; pintarFase(); enfocarTitulo();
  }
  function siguiente() {
    var e = P.datos.ejercicios[P.ej];
    var activos = itemsActivos(P.ej);
    if (e.tipo !== 'empareja' && P.item + 1 < activos.length) {
      P.item++; P.intento = 0; P.cerrado = false; P.orden = null;
      pintarFase();
      return;
    }
    siguienteEjercicio();
  }
  /* final=false: primer intento fallido (queda abierto); final=true: el ítem se cierra */
  function registrar(ejIdx, itemIdx, ok, resp, correcta, final) {
    var r = P.res[ejIdx][itemIdx];
    if (P.cola) { if (r && final) r.rep = ok; return; }
    if (!r) P.res[ejIdx][itemIdx] = { ok1: ok, ok: ok, resp: resp, correcta: correcta };
    else if (final) r.ok = ok;
  }

  function faseEjercicio(cont) {
    var e = P.datos.ejercicios[P.ej];
    var activos = itemsActivos(P.ej);
    var sec = h('section', { class: 'pr-fase', 'data-tipo': e.tipo, 'data-ej': P.ej });
    var cuenta = e.tipo === 'empareja' ? null :
      h('span', { class: 'pr-contador', 'aria-label': (P.item + 1) + ' / ' + activos.length, text: (P.item + 1) + ' / ' + activos.length });
    sec.appendChild(h('div', { class: 'pr-fase__cab' },
      h('h1', { class: 'pr-consigna pr-consigna--h', text: txt(e.consigna) || txt(CONSIGNA_DEF[e.tipo]) }),
      cuenta));
    var tarjeta = h('div', { class: 'pr-item' });
    sec.appendChild(tarjeta);
    var fb = h('div', { class: 'pr-fb', 'aria-live': 'polite', role: 'status' });
    var acciones = h('div', { class: 'pr-acciones pr-acciones--item' });
    sec.appendChild(fb);
    sec.appendChild(acciones);
    cont.appendChild(sec);
    var ctx = { e: e, idx: activos[P.item], tarjeta: tarjeta, fb: fb, acciones: acciones };
    if (e.tipo === 'empareja') return pintarEmpareja(ctx);
    var it = e.items[ctx.idx];
    ctx.it = it;
    if (e.tipo === 'elige') pintarElige(ctx);
    else if (e.tipo === 'completa' || e.tipo === 'transforma') pintarEscribe(ctx);
    else if (e.tipo === 'ordena') pintarOrdena(ctx);
    else { tarjeta.appendChild(h('p', { text: e.tipo })); acciones.appendChild(boton(t('b.siguiente'), 'pb--pri', siguiente, 'arrow-right', true)); }
  }

  function frasePrompt(p, lengua, hueco) {
    var partes = String(p || '').split('___');
    var f = h('p', { class: 'pr-frase', lang: lengua });
    partes.forEach(function (parte, i) {
      f.appendChild(D.createTextNode(parte));
      if (i < partes.length - 1) f.appendChild(hueco ? hueco(i) : h('span', { class: 'pr-hueco', 'aria-label': '…' }));
    });
    return f;
  }
  function glosa(it) { var g = txt(it.g); return g ? h('p', { class: 'pr-glosa', text: g }) : null; }
  function botonPista(ctx) {
    var hint = txt(ctx.it && ctx.it.h);
    if (!hint) return null;
    var b = boton(t('b.pista'), 'pb--ghost', function () {
      mostrarFb(ctx, 'pista', null);
      b.remove();
    }, 'lightbulb');
    b.classList.add('pr-pista-btn');
    return b;
  }
  /* tipo: ok | casi | mal | pista */
  function mostrarFb(ctx, tipo, info) {
    var fb = ctx.fb, it = ctx.it || {};
    fb.innerHTML = '';
    var caja = h('div', { class: 'pr-fb__caja pr-fb--' + tipo });
    var ico = tipo === 'ok' ? 'check' : tipo === 'pista' ? 'lightbulb' : tipo === 'casi' ? 'lightbulb' : 'x';
    caja.appendChild(h('span', { class: 'pr-fb__ico' }, icono(ico, 18)));
    var cuerpo = h('div', { class: 'pr-fb__txt' });
    if (tipo === 'ok') {
      cuerpo.appendChild(h('p', null, h('strong', { text: okAlAzar() }), ' ', txt(it.e)));
      if (info && info.tilde && info.tilde.length) {
        cuerpo.appendChild(h('p', { class: 'pr-fb__tilde' }, t('tilde') + ' ', h('strong', { lang: idiomaDe(P.nombre), text: info.tilde.join(', ') })));
      }
    } else if (tipo === 'casi') {
      cuerpo.appendChild(h('p', null, h('strong', { text: t('casi') })));
      var pista = txt(it.h);
      if (pista) cuerpo.appendChild(h('p', { text: pista }));
    } else if (tipo === 'mal') {
      cuerpo.appendChild(h('p', null, h('strong', { text: t('respuesta') }), ' ', h('span', { class: 'pr-fb__correcta', lang: idiomaDe(P.nombre), text: info && info.correcta || '' })));
      if (txt(it.e)) cuerpo.appendChild(h('p', { text: txt(it.e) }));
    } else if (tipo === 'pista') {
      cuerpo.appendChild(h('p', { text: txt(it.h) }));
    } else if (tipo === 'aviso') {
      cuerpo.appendChild(h('p', { text: info }));
    }
    caja.appendChild(cuerpo);
    fb.appendChild(caja);
  }
  function cerrarItem(ctx, ok, info, resp) {
    P.cerrado = true;
    registrar(P.ej, ctx.idx, ok, resp, info.correcta, true);
    mostrarFb(ctx, ok ? 'ok' : 'mal', info);
    ctx.acciones.innerHTML = '';
    var sig = boton(t('b.siguiente'), 'pb--pri pb--main', siguiente, 'arrow-right', true);
    sig.setAttribute('data-accion', 'siguiente');
    ctx.acciones.appendChild(sig);
    setTimeout(function () { sig.focus({ preventScroll: true }); }, 20);
  }
  /* primer error: queda la pista y otro intento; segundo error: se muestra la respuesta */
  function fallo(ctx, info, resp) {
    if (P.intento === 0) {
      registrar(P.ej, ctx.idx, false, resp, info.correcta, false);
      P.intento = 1;
      mostrarFb(ctx, 'casi', info);
      var pb = ctx.acciones.querySelector('.pr-pista-btn'); if (pb) pb.remove();
      return false;
    }
    cerrarItem(ctx, false, info, resp);
    return true;
  }

  /* --- elige --- */
  function pintarElige(ctx) {
    var it = ctx.it, lengua = idiomaDe(P.nombre);
    var opciones = h('div', { class: 'pr-ops', role: 'group' });
    ctx.tarjeta.appendChild(frasePrompt(it.p, lengua));
    var g = glosa(it); if (g) ctx.tarjeta.appendChild(g);
    ctx.tarjeta.appendChild(opciones);
    (it.o || []).forEach(function (o, i) {
      var b = h('button', { type: 'button', class: 'pr-op', lang: lengua, 'data-i': i, text: txt(o) });
      b.addEventListener('click', function () {
        if (P.cerrado || b.disabled) return;
        var correcta = txt(it.o[it.k]);
        if (i === it.k) {
          b.classList.add('es-ok');
          var hueco = ctx.tarjeta.querySelector('.pr-hueco'); if (hueco) { hueco.textContent = correcta; hueco.classList.add('lleno'); }
          opciones.querySelectorAll('.pr-op').forEach(function (x) { x.disabled = true; });
          cerrarItem(ctx, true, { correcta: correcta }, txt(o));
        } else {
          b.classList.add('es-mal'); b.disabled = true;
          var fin = fallo(ctx, { correcta: correcta }, txt(o));
          if (fin) {
            opciones.querySelectorAll('.pr-op').forEach(function (x, j) { x.disabled = true; if (j === it.k) x.classList.add('es-sol'); });
          }
        }
      });
      opciones.appendChild(b);
    });
    var pista = botonPista(ctx); if (pista) ctx.acciones.appendChild(pista);
    setTimeout(function () { var f = opciones.querySelector('.pr-op'); if (f) f.focus({ preventScroll: true }); }, 20);
  }

  /* --- completa y transforma (se escribe) --- */
  function pintarEscribe(ctx) {
    var it = ctx.it, e = ctx.e, lengua = idiomaDe(P.nombre);
    var input = h('input', {
      type: 'text', class: 'pr-campo', lang: lengua, autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
      'aria-label': t('tu_respuesta'), enterkeyhint: 'done'
    });
    var enLinea = e.tipo === 'completa' && String(it.p || '').indexOf('___') >= 0;
    if (enLinea) {
      var largo = Math.max.apply(null, (Array.isArray(it.k) ? it.k : [it.k]).map(function (s) { return String(s).length; }));
      input.classList.add('pr-campo--linea');
      input.style.width = Math.min(Math.max(largo + 3, 5), 22) + 'ch';
      ctx.tarjeta.appendChild(frasePrompt(it.p, lengua, function () { return input; }));
    } else {
      ctx.tarjeta.appendChild(h('p', { class: 'pr-frase', lang: lengua, text: it.p || '' }));
    }
    var g = glosa(it); if (g) ctx.tarjeta.appendChild(g);
    if (!enLinea) { input.classList.add('pr-campo--bloque'); ctx.tarjeta.appendChild(h('label', { class: 'pr-campo-label' }, h('span', { class: 'visually-hidden', text: t('tu_respuesta') }), input)); }
    if (P.borrador != null) { input.value = P.borrador; P.borrador = null; }
    input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); });
    function comprobar() {
      if (P.cerrado) return;
      var res = comparar(input.value, it.k);
      if (res.vacio) { mostrarFb(ctx, 'aviso', t('vacio.escribe')); input.focus(); return; }
      if (res.ok) {
        input.readOnly = true; input.classList.add('es-ok');
        cerrarItem(ctx, true, res, input.value.trim());
      } else {
        input.setAttribute('aria-invalid', 'true');
        var fin = fallo(ctx, res, input.value.trim());
        if (fin) { input.readOnly = true; input.classList.add('es-mal'); }
        else { input.select(); }
      }
    }
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); if (P.cerrado) siguiente(); else comprobar(); }
    });
    var pista = botonPista(ctx); if (pista) ctx.acciones.appendChild(pista);
    ctx.acciones.appendChild(boton(t('b.comprobar'), 'pb--pri pb--main', comprobar, 'check'));
    ctx.campo = input;
    setTimeout(function () { input.focus({ preventScroll: true }); }, 20);
  }

  /* --- ordena (tocar palabras) --- */
  function pintarOrdena(ctx) {
    var it = ctx.it, lengua = idiomaDe(P.nombre);
    var meta = Array.isArray(it.k) ? it.k[0] : it.k;
    var fichas = String(meta).trim().split(/\s+/);
    if (!P.orden) {
      var orden = fichas.map(function (_, i) { return i; });
      var mezcla = mezclar(orden, semillaDe(P.nombre + ':' + P.ej + ':' + ctx.idx));
      if (mezcla.join() === orden.join() && mezcla.length > 1) mezcla.push(mezcla.shift());
      P.orden = { banco: mezcla, linea: [] };
    }
    var linea = h('div', { class: 'pr-linea', lang: lengua, 'aria-label': t('tu_respuesta') });
    var banco = h('div', { class: 'pr-banco', lang: lengua, role: 'group' });
    var g = glosa(it); if (g) ctx.tarjeta.appendChild(g);
    ctx.tarjeta.appendChild(linea);
    ctx.tarjeta.appendChild(banco);
    function pintarFichas() {
      linea.innerHTML = ''; banco.innerHTML = '';
      if (!P.orden.linea.length) linea.appendChild(h('span', { class: 'pr-linea__vacia', 'aria-hidden': 'true' }));
      P.orden.linea.forEach(function (i, pos) {
        linea.appendChild(h('button', {
          type: 'button', class: 'pr-ficha pr-ficha--puesta', text: fichas[i], disabled: P.cerrado || null,
          onclick: function () { if (P.cerrado) return; P.orden.linea.splice(pos, 1); P.orden.banco.push(i); pintarFichas(); enfocar(banco); }
        }));
      });
      P.orden.banco.forEach(function (i, pos) {
        banco.appendChild(h('button', {
          type: 'button', class: 'pr-ficha', text: fichas[i], disabled: P.cerrado || null,
          onclick: function () { if (P.cerrado) return; P.orden.banco.splice(pos, 1); P.orden.linea.push(i); pintarFichas(); enfocar(banco.childNodes.length ? banco : linea); }
        }));
      });
    }
    function enfocar(zona) { var b = zona.querySelector('button:not([disabled])'); if (b) b.focus({ preventScroll: true }); else { var c = ctx.acciones.querySelector('[data-accion="comprobar"]'); if (c) c.focus({ preventScroll: true }); } }
    function comprobar() {
      if (P.cerrado) return;
      if (P.orden.banco.length) { mostrarFb(ctx, 'aviso', t('vacio.ordena')); return; }
      var resp = P.orden.linea.map(function (i) { return fichas[i]; }).join(' ');
      var res = comparar(resp, Array.isArray(it.k) ? it.k : [it.k]);
      if (res.ok) {
        P.cerrado = true; pintarFichas(); linea.classList.add('es-ok');
        cerrarItem(ctx, true, { correcta: meta }, resp);
      } else {
        var fin = fallo(ctx, { correcta: meta }, resp);
        if (fin) { pintarFichas(); linea.classList.add('es-mal'); }
        else { linea.classList.add('es-mal'); setTimeout(function () { linea.classList.remove('es-mal'); }, 600); }
      }
    }
    pintarFichas();
    var pista = botonPista(ctx); if (pista) ctx.acciones.appendChild(pista);
    ctx.acciones.appendChild(boton(t('b.borrar'), 'pb--ghost', function () {
      if (P.cerrado) return; P.orden.banco = P.orden.banco.concat(P.orden.linea); P.orden.linea = []; pintarFichas(); enfocar(banco);
    }, 'rotate-ccw'));
    var bc = boton(t('b.comprobar'), 'pb--pri pb--main', comprobar, 'check');
    bc.setAttribute('data-accion', 'comprobar');
    ctx.acciones.appendChild(bc);
    setTimeout(function () { enfocar(banco); }, 20);
  }

  /* --- empareja --- */
  function pintarEmpareja(ctx) {
    var e = ctx.e, lengua = idiomaDe(P.nombre);
    var pares = e.pares || [];
    var activos = itemsActivos(P.ej);
    if (!P.emp) {
      var ronda = activos.slice();
      if (P.cola) { /* con pocos fallos, se completa la ronda con otras parejas que no cuentan */
        for (var i = 0; i < pares.length && ronda.length < Math.min(4, pares.length); i++) if (ronda.indexOf(i) < 0) ronda.push(i);
      }
      P.emp = {
        ronda: ronda, cuentan: activos.slice(),
        izq: mezclar(ronda, semillaDe(P.nombre + 'i' + P.ej)), der: mezclar(ronda, semillaDe(P.nombre + 'd' + P.ej + 'x')),
        hechas: [], fallos: {}, sel: null
      };
    }
    var E = P.emp;
    var cols = h('div', { class: 'pr-parejas' });
    var izq = h('div', { class: 'pr-parejas__col', role: 'group', lang: lengua });
    var der = h('div', { class: 'pr-parejas__col pr-parejas__col--der', role: 'group' });
    cols.appendChild(izq); cols.appendChild(der);
    ctx.tarjeta.appendChild(cols);
    var cuenta = h('span', { class: 'pr-contador' });
    ctx.tarjeta.parentNode.querySelector('.pr-fase__cab').appendChild(cuenta);
    function pintarCols() {
      cuenta.textContent = E.hechas.length + ' / ' + E.ronda.length;
      izq.innerHTML = ''; der.innerHTML = '';
      E.izq.forEach(function (i) {
        var hecha = E.hechas.indexOf(i) >= 0;
        izq.appendChild(h('button', {
          type: 'button', class: 'pr-par' + (hecha ? ' es-ok' : ''), 'data-i': i, 'aria-pressed': E.sel === i ? 'true' : 'false', disabled: hecha || null,
          onclick: function () { E.sel = E.sel === i ? null : i; pintarCols(); var b = der.querySelector('button:not([disabled])'); if (E.sel != null && b) b.focus({ preventScroll: true }); }
        }, hecha ? icono('check') : null, h('span', { text: pares[i][0] })));
      });
      E.der.forEach(function (i) {
        var hecha = E.hechas.indexOf(i) >= 0;
        der.appendChild(h('button', {
          type: 'button', class: 'pr-par pr-par--der' + (hecha ? ' es-ok' : ''), 'data-i': i, disabled: hecha || null,
          onclick: function () { elegirDer(i); }
        }, hecha ? icono('check') : null, h('span', { text: txt(pares[i][1]) })));
      });
    }
    function elegirDer(i) {
      if (E.sel == null) { var b = izq.querySelector('button:not([disabled])'); if (b) b.focus({ preventScroll: true }); return; }
      var izqI = E.sel;
      var cuenta1 = E.cuentan.indexOf(izqI) >= 0;
      if (i === izqI) {
        E.hechas.push(izqI); E.sel = null;
        if (cuenta1) registrar(P.ej, izqI, !E.fallos[izqI], txt(pares[izqI][1]), txt(pares[izqI][1]), true);
        pintarCols();
        if (E.hechas.length === E.ronda.length) {
          listo();
        } else {
          ctx.fb.innerHTML = '';
          var b2 = izq.querySelector('button:not([disabled])'); if (b2) b2.focus({ preventScroll: true });
        }
      } else {
        if (!E.fallos[izqI] && cuenta1) { E.fallos[izqI] = true; registrar(P.ej, izqI, false, txt(pares[i][1]), txt(pares[izqI][1]), false); }
        ctx.it = {};
        mostrarFb(ctx, 'aviso', t('empareja.no', { r: txt(pares[i][1]), l: pares[i][0] }));
        ctx.fb.querySelector('.pr-fb__caja').classList.add('pr-fb--casi');
        var btn = der.querySelector('[data-i="' + i + '"]');
        if (btn) { btn.classList.add('es-mal'); setTimeout(function () { btn.classList.remove('es-mal'); }, 650); }
      }
    }
    function listo() {
      P.cerrado = true;
      ctx.it = {};
      mostrarFb(ctx, 'ok', null);
      var caja = ctx.fb.querySelector('.pr-fb__txt');
      caja.innerHTML = '';
      caja.appendChild(h('p', null, h('strong', { text: t('empareja.listo') })));
      ctx.acciones.innerHTML = '';
      var sig = boton(t('b.siguiente'), 'pb--pri pb--main', siguiente, 'arrow-right', true);
      sig.setAttribute('data-accion', 'siguiente');
      ctx.acciones.appendChild(sig);
      setTimeout(function () { sig.focus({ preventScroll: true }); }, 20);
    }
    pintarCols();
    if (E.hechas.length && E.hechas.length === E.ronda.length) return listo();
    setTimeout(function () { var b = izq.querySelector('button:not([disabled])'); if (b) b.focus({ preventScroll: true }); }, 20);
  }

  /* ---------- reto de escritura ---------- */
  function faseReto(cont) {
    var r = P.datos.reto || {};
    var unidad = r.unidad === 'palabras' ? 'palabras' : 'frases';
    var lengua = idiomaDe(P.nombre);
    var area = h('textarea', { class: 'pr-texto', lang: lengua, rows: unidad === 'palabras' ? 9 : 6, spellcheck: 'false', id: 'pr-reto-texto' });
    area.value = P.reto || '';
    var contador = h('p', { class: 'pr-conteo', 'aria-live': 'polite' });
    function actualizar() {
      P.reto = area.value;
      EST.borradores[P.nombre] = area.value; guardar();
      var n = contar(area.value, unidad);
      var min = +r.min || 0, max = +r.max || 0;
      var estado = n < min ? t('reto.faltan', { n: min - n }) : (max && n > max ? t('reto.sobran', { n: n - max }) : t('reto.bien'));
      contador.textContent = '';
      contador.appendChild(h('strong', { text: t('reto.u.' + unidad, { n: n }) }));
      contador.appendChild(D.createTextNode(' · ' + t('reto.rango', { min: min, max: max }) + ' · '));
      contador.appendChild(h('span', { class: n < min ? 'pr-conteo--falta' : 'pr-conteo--ok', text: estado }));
    }
    area.addEventListener('input', actualizar);
    function insertar(frase) {
      var base = area.value.replace(/\s+$/, '');
      var limpia = String(frase).replace(/…\s*$/, '').replace(/\s*…\s*/g, ' ').trim();
      area.value = (base ? base + ' ' : '') + limpia + ' ';
      area.focus(); area.setSelectionRange(area.value.length, area.value.length);
      actualizar();
    }
    var ruta = h('div', { class: 'pr-ruta' },
      h('p', { class: 'pr-mini', text: t('reto.ideas') }),
      h('div', { class: 'pr-ruta__chips', lang: lengua }, (r.ruta || []).map(function (f) {
        return h('button', { type: 'button', class: 'pr-chip', text: txt(f, lengua), onclick: function () { insertar(txt(f, lengua)); } });
      })));
    var lista = h('ul', { class: 'pr-check', role: 'list' });
    (r.lista || []).forEach(function (l, i) {
      var id = 'pr-chk-' + i;
      var cb = h('input', { type: 'checkbox', id: id });
      cb.checked = !!P.marcas[i];
      cb.addEventListener('change', function () { P.marcas[i] = cb.checked; });
      lista.appendChild(h('li', null, cb, h('label', { for: id, text: txt(l) })));
    });
    cont.appendChild(h('section', { class: 'pr-fase pr-reto' },
      h('div', { class: 'pr-fase__cab' }, h('h1', { class: 'pr-consigna pr-consigna--h', text: txt(r.consigna) || t('pr.reto') })),
      ruta,
      h('label', { class: 'pr-mini', for: 'pr-reto-texto', text: t('reto.etiqueta') }),
      area,
      contador,
      (r.lista || []).length ? h('div', { class: 'pr-revisa' }, h('p', { class: 'pr-mini', text: t('reto.revisa') }), lista) : null,
      h('div', { class: 'pr-acciones' }, boton(t('b.terminar'), 'pb--pri pb--main', terminar, 'check'))));
    actualizar();
    setTimeout(function () { area.focus({ preventScroll: true }); }, 20);
  }

  /* ---------- final ---------- */
  function cifras() {
    var bien = 0, total = 0, porEj = [], errores = [], corregidos = 0, aRepetir = 0;
    P.datos.ejercicios.forEach(function (e, ej) {
      var b = 0, n = 0;
      P.res[ej].forEach(function (r, i) {
        n++;
        if (r && r.ok1) b++;
        if (!r || !r.ok1) {
          aRepetir++;
          if (r && r.rep) corregidos++;
          if (r && !r.rep) errores.push({ ej: ej, item: i, r: r });
        }
      });
      bien += b; total += n;
      porEj.push({ e: e, bien: b, total: n });
    });
    return { bien: bien, total: total, porEj: porEj, errores: errores, corregidos: corregidos, aRepetir: aRepetir };
  }
  function textoItem(ej, i) {
    var e = P.datos.ejercicios[ej];
    if (e.tipo === 'empareja') return (e.pares[i] || [''])[0];
    var it = e.items[i] || {};
    if (e.tipo === 'ordena') return it.g && typeof it.g === 'object' && it.g[AP] ? it.g[AP] : '';
    return it.p || '';
  }
  function terminar() {
    var c = cifras();
    var reg = EST.p[P.nombre] || {};
    reg.bien = c.bien; reg.total = c.total;
    reg.fecha = new Date().toISOString().slice(0, 10);
    reg.estado = (c.total && c.bien / c.total >= 0.8) ? 'hecho' : 'repasar';
    EST.p[P.nombre] = reg;
    guardar();
    P.fase = 'fin';
    pintarFase();
    enfocarTitulo();
  }
  function cerrarRepeticion() {
    P.cola = null;
    var c = cifras();
    var reg = EST.p[P.nombre] || {};
    if (c.aRepetir && c.corregidos === c.aRepetir) reg.estado = 'hecho';
    EST.p[P.nombre] = reg; guardar();
    P.fase = 'fin';
    pintarFase();
    enfocarTitulo();
  }
  function repetirFallos() {
    var cola = [];
    P.res.forEach(function (lista, ej) { lista.forEach(function (r, i) { if ((!r || !r.ok1) && !(r && r.rep)) cola.push({ ej: ej, item: i }); }); });
    if (!cola.length) return;
    P.cola = cola;
    for (var j = 0; j < P.datos.ejercicios.length; j++) if (itemsActivos(j).length) return irEjercicio(j, 0);
  }
  function textoProfe() {
    var c = cifras(), cat = CAT[P.nombre] || {};
    var hoy = new Date();
    var fecha = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0') + '/' + hoy.getFullYear();
    var l = [];
    l.push('Práctica · ' + tituloDe(P.nombre) + ' (' + (cat.nivel || nivelDe(P.nombre)) + ')');
    l.push(fecha);
    l.push('A la primera: ' + c.bien + ' de ' + c.total + (c.total ? ' (' + Math.round(100 * c.bien / c.total) + ' %)' : ''));
    c.porEj.forEach(function (x) { l.push('· ' + (txt(x.e.consigna, 'es') || txt(CONSIGNA_DEF[x.e.tipo], 'es')) + ' ' + x.bien + ' de ' + x.total); });
    if (c.corregidos) l.push('Corregí después: ' + c.corregidos + ' de ' + c.aRepetir);
    if (c.errores.length) {
      l.push('');
      l.push('Para repasar:');
      c.errores.slice(0, 10).forEach(function (x) {
        var e = P.datos.ejercicios[x.ej];
        var item = textoItem(x.ej, x.item);
        var correcta = x.r.correcta || '';
        if (e.tipo === 'empareja') l.push('· ' + item + ': elegí «' + x.r.resp + '»; era «' + correcta + '»');
        else l.push('· ' + (item ? item + ' ' : '') + '→ escribí «' + x.r.resp + '»; era «' + correcta + '»');
      });
    }
    var r = P.datos.reto || {};
    if (String(P.reto || '').trim()) {
      var u = r.unidad === 'palabras' ? 'palabras' : 'frases';
      l.push('');
      l.push('Reto (' + contar(P.reto, u) + ' ' + u + '):');
      l.push(String(P.reto).trim());
    }
    l.push('');
    l.push(URL_BASE + '?t=' + P.nombre + (TAREA && TAREA.t === P.nombre ? '&tarea=' + TAREA.codigo : ''));
    return l.join('\n');
  }
  function enviar(estado, caja) {
    var texto = textoProfe();
    var tactil = W.matchMedia && W.matchMedia('(pointer: coarse)').matches;
    function aviso(msg) { estado.textContent = msg; }
    function mostrarTexto() {
      caja.hidden = false;
      var ta = caja.querySelector('textarea'); ta.value = texto; ta.focus(); ta.select();
    }
    if (tactil && W.navigator.share) {
      W.navigator.share({ title: tituloDe(P.nombre), text: texto }).then(function () { aviso(t('fin.compartido')); }, function (err) {
        if (err && err.name === 'AbortError') return;
        copiar();
      });
      return;
    }
    copiar();
    function copiar() {
      if (W.navigator.clipboard && W.navigator.clipboard.writeText) {
        W.navigator.clipboard.writeText(texto).then(function () { aviso(t('fin.copiado')); }, function () { if (!copiarViejo()) { aviso(t('fin.no_copia')); mostrarTexto(); } else aviso(t('fin.copiado')); });
      } else if (copiarViejo()) aviso(t('fin.copiado'));
      else { aviso(t('fin.no_copia')); mostrarTexto(); }
    }
    function copiarViejo() {
      try {
        var ta = D.createElement('textarea'); ta.value = texto; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        D.body.appendChild(ta); ta.select(); var ok = D.execCommand('copy'); ta.remove(); return ok;
      } catch (e) { return false; }
    }
  }
  /* ---------- entregar la tarea (solo con ?tarea=): Firebase se carga al tocar «Entregar» ---------- */
  function cargarScript(src, listo) {
    return new Promise(function (ok, mal) {
      if (listo()) return ok();
      var s = D.createElement('script');
      s.src = src;
      s.onload = function () { listo() ? ok() : mal(new Error('red')); };
      s.onerror = function () { s.remove(); mal(new Error('red')); };
      D.head.appendChild(s);
    });
  }
  function cargarTareas() {
    return cargarScript('assets/fb.js?v=2026111801', function () { return !!W.LA_FB; })
      .then(function () { return cargarScript('assets/tareas.js?v=' + VERSION, function () { return !!W.LA_TAREAS; }); });
  }
  function datosEntrega(nombre) {
    var c = cifras(), errores = [];
    P.datos.ejercicios.forEach(function (e, ej) {
      P.res[ej].forEach(function (r, i) {
        if (r && !r.ok1) errores.push({ p: textoItem(ej, i), escrito: r.resp || '', correcto: r.correcta || '' });
      });
    });
    return {
      nombre: nombre,
      puntaje: { aciertos: c.bien, total: c.total },
      ejercicios: c.porEj.map(function (x) { return { tipo: x.e.tipo, aciertos: x.bien, total: x.total }; }),
      errores: errores.slice(0, 30),
      reto: String(P.reto || '').trim(),
      lengua: AP
    };
  }
  function fechaCorta(iso) {
    try { return new Date(iso).toLocaleString(AP === 'pt' ? 'pt-BR' : AP, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return String(iso).slice(0, 10); }
  }
  function bloqueEntrega(estado, caja, copiarBtn) {
    var cod = TAREA.codigo;
    var previa = EST.entregas[cod];
    var campo = h('input', { id: 'pr-ent-nombre', class: 'pr-campo pr-campo--nombre', type: 'text', maxlength: 60, autocomplete: 'given-name',
      autocapitalize: 'words', spellcheck: 'false', 'aria-describedby': 'pr-ent-error' });
    campo.value = EST.nombre || '';
    var error = h('p', { class: 'pr-entrega__error', id: 'pr-ent-error', hidden: true });
    var btn = boton(t(previa ? 'ent.otra_vez' : 'ent.entregar'), 'pb--pri pb--main', null, 'send');
    btn.type = 'submit';
    btn.setAttribute('data-accion', 'entregar');
    function rotulo(k) { btn.querySelector('span:last-child').textContent = t(k); }
    function marcar(ok, msg) {
      estado.textContent = '';
      estado.classList.toggle('pr-enviado--mal', !ok);
      if (ok) estado.appendChild(icono('circle-check'));
      estado.appendChild(h('span', { text: msg }));
    }
    if (previa) marcar(true, t('ent.lista_el', { f: fechaCorta(previa) }));
    var enviando = false;
    var form = h('form', { class: 'pr-entrega', novalidate: true, onsubmit: function (ev) {
      ev.preventDefault();
      if (enviando) return;
      var nombre = campo.value.replace(/\s+/g, ' ').trim();
      if (!nombre) {
        campo.setAttribute('aria-invalid', 'true');
        error.textContent = t('ent.nombre_falta'); error.hidden = false;
        campo.focus();
        return;
      }
      campo.removeAttribute('aria-invalid'); error.hidden = true;
      EST.nombre = nombre.slice(0, 60); guardar();
      enviando = true; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); rotulo('ent.entregando');
      cargarTareas().then(function () { return W.LA_TAREAS.entregar(cod, datosEntrega(nombre)); }).then(function () {
        EST.entregas[cod] = new Date().toISOString(); guardar();
        marcar(true, t('ent.lista'));
        anunciar(t('ent.lista'));
        rotulo('ent.otra_vez');
      }, function (err) {
        var cerrada = W.LA_FB && W.LA_FB.denegado && W.LA_FB.denegado(err);
        marcar(false, t(cerrada ? 'ent.cerrada' : 'ent.fallo'));
        rotulo(EST.entregas[cod] ? 'ent.otra_vez' : 'ent.entregar');
        copiarBtn.hidden = false;
      }).then(function () { enviando = false; btn.disabled = false; btn.removeAttribute('aria-busy'); });
    } },
      h('div', { class: 'pr-entrega__campo' }, h('label', { class: 'pr-mini', for: 'pr-ent-nombre', text: t('ent.nombre') }), campo),
      btn);
    return h('div', { class: 'pr-entrega__caja' }, form, error);
  }

  function faseFin(cont) {
    var c = cifras();
    var pct = c.total ? c.bien / c.total : 0;
    var tituloK = c.bien === c.total ? 'fin.t.todo' : pct >= 0.7 ? 'fin.t.bien' : 'fin.t.repasar';
    var lengua = idiomaDe(P.nombre);
    var bienLista = c.porEj.filter(function (x) { return x.total && x.bien === x.total; });
    var resumen = h('ul', { class: 'pr-res', role: 'list' }, c.porEj.map(function (x) {
      var completo = x.total && x.bien === x.total;
      return h('li', { class: completo ? 'completo' : '' },
        h('span', { class: 'pr-res__n', text: x.bien + '/' + x.total }),
        h('span', { class: 'pr-res__barra', 'aria-hidden': 'true' }, h('i', { style: 'width:' + (x.total ? Math.round(100 * x.bien / x.total) : 0) + '%' })),
        h('span', { class: 'pr-res__t', text: txt(x.e.consigna) || txt(CONSIGNA_DEF[x.e.tipo]) }));
    }));
    var errores = h('ul', { class: 'pr-errores', role: 'list' });
    c.errores.slice(0, 8).forEach(function (x) {
      var e = P.datos.ejercicios[x.ej];
      var item = textoItem(x.ej, x.item);
      errores.appendChild(h('li', null,
        item ? h('p', { class: 'pr-errores__p', lang: e.tipo === 'ordena' ? AP : lengua, text: item }) : null,
        h('p', { class: 'pr-errores__fila' },
          h('span', { class: 'pr-errores__mal' }, icono('x'), h('span', { class: 'visually-hidden', text: t('fin.escribiste') + ': ' }), h('span', { lang: lengua, text: x.r.resp || '—' })),
          h('span', { class: 'pr-errores__bien' }, icono('check'), h('span', { class: 'visually-hidden', text: t('fin.correcto') + ': ' }), h('span', { lang: lengua, text: x.r.correcta || '' })))));
    });
    var r = P.datos.reto || {};
    var unidad = r.unidad === 'palabras' ? 'palabras' : 'frases';
    var n = contar(P.reto, unidad);
    var estado = h('p', { class: 'pr-enviado', role: 'status', 'aria-live': 'polite' });
    var caja = h('div', { class: 'pr-copia', hidden: true }, h('textarea', { readonly: true, rows: 8, 'aria-label': t('fin.enviar') }));
    var enTarea = !!(TAREA && TAREA.t === P.nombre);
    var copiarBtn = enTarea ? boton(t('ent.copiar'), 'pb--ghost', function () { enviar(estado, caja); }, 'copy') : null;
    if (copiarBtn) { copiarBtn.hidden = true; copiarBtn.setAttribute('data-accion', 'copiar'); }
    var acciones = h('div', { class: 'pr-acciones' },
      enTarea ? null : boton(t('fin.enviar'), 'pb--pri pb--main', function () { enviar(estado, caja); }, 'send'),
      c.errores.length ? boton(t('fin.repetir'), 'pb--sec', repetirFallos, 'repeat-2') : null,
      P.volver.tema ? boton(t('fin.volver', { t: nombreTema(P.volver.tema) }), 'pb--ghost', function () { ir(P.volver); }, 'arrow-left') : null,
      copiarBtn);
    if (!enTarea) acciones.querySelector('.pb--pri').setAttribute('data-accion', 'enviar');
    cont.appendChild(h('section', { class: 'pr-fase pr-fin' },
      h('div', { class: 'pr-fin__cab' },
        h('p', { class: 'pr-fin__cifra' }, h('strong', { text: String(c.bien) }), h('span', { text: ' / ' + c.total })),
        h('div', null,
          h('h1', { class: 'pr-h2', text: t(tituloK) }),
          h('p', { class: 'pr-lead', text: t('fin.primera', { a: c.bien, b: c.total }) + (c.corregidos ? ' ' + t('fin.corregiste', { a: c.corregidos, b: c.aRepetir }) : '') }))),
      resumen,
      h('div', { class: 'pr-fin__cols' },
        h('div', { class: 'pr-fin__bloque' },
          h('h2', { class: 'pr-h3', text: t('fin.bien') }),
          bienLista.length ? h('ul', { class: 'pr-bien', role: 'list' }, bienLista.map(function (x) { return h('li', null, icono('check'), h('span', { text: txt(x.e.consigna) || txt(CONSIGNA_DEF[x.e.tipo]) })); }))
            : h('p', { class: 'pr-muted', text: t('fin.bien.nada') })),
        h('div', { class: 'pr-fin__bloque' },
          h('h2', { class: 'pr-h3', text: t('fin.repasar') }),
          c.errores.length ? errores : h('p', { class: 'pr-muted', text: t('fin.repasar.nada') }))),
      String(P.reto || '').trim() ? h('div', { class: 'pr-fin__bloque pr-fin__reto' },
        h('h2', { class: 'pr-h3', text: t('fin.reto') }),
        h('p', { class: 'pr-fin__texto', lang: lengua, text: String(P.reto).trim() }),
        h('p', { class: 'pr-muted', text: t('reto.u.' + unidad, { n: n }) + (n < (+r.min || 0) ? ' · ' + t('fin.reto.corto', { a: n, min: r.min }) : '') })) : null,
      enTarea ? bloqueEntrega(estado, caja, copiarBtn) : null,
      enTarea ? estado : null,
      acciones, enTarea ? null : estado, caja));
  }

  /* ---------------- arranque ---------------- */
  function arrancar() {
    main = D.getElementById('pr-app');
    vivo = D.getElementById('pr-vivo');
    selApoyo = D.getElementById('pr-apoyo');
    if (!main) return;
    D.documentElement.lang = AP === 'pt' ? 'pt-BR' : AP;
    pintarSelector();
    W.addEventListener('popstate', function () { pintar(params()); });
    /* Enter fuera de un campo: avanza si ya hay respuesta */
    D.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' || !P || P.fase !== 'ej' || !P.cerrado) return;
      var a = D.activeElement;
      if (a && (a.tagName === 'BUTTON' || a.tagName === 'A' || a.tagName === 'TEXTAREA' || a.tagName === 'INPUT')) return;
      ev.preventDefault(); siguiente();
    });
    pintar(params());
  }

  /* para las pruebas */
  W.LinguasPractica = { normalizar: normalizar, sinTildes: sinTildes, comparar: comparar, contar: contar, txt: txt };

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
