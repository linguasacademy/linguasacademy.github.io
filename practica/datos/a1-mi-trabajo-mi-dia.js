/* Práctica autónoma · A1 · Mi trabajo, mi día (adultos, apoyo en portugués)
   Tema y gramática del catálogo: el día de trabajo con el presente yo / tú / él */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-mi-trabajo-mi-dia"] = {
    tematica: "trabajo",
    objetivo: t("Contar tu día de trabajo con yo, tú y él / ella", "Describe your work day with I, you and he / she", "Contar seu dia de trabalho com eu, você e ele / ela"),
    repaso: [
      t("Por la mañana abro el correo.", "In the morning I open my email.", "De manhã abro o e-mail."),
      t("Empiezo a las ocho.", "I start at eight.", "Começo às oito."),
      t("Respondo mensajes y escribo un informe.", "I answer messages and write a report.", "Respondo mensagens e escrevo um relatório."),
      t("Como con el equipo a la una.", "I have lunch with the team at one.", "Almoço com a equipe à uma."),
      t("Ella termina a las cinco. ¿Y tú?", "She finishes at five. And you?", "Ela termina às cinco. E você?")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada expresión con su significado.", "Match each expression with its meaning.", "Ligue cada expressão ao seu significado."),
        pares: [
          ["llego a la oficina", t("llego a la oficina", "I get to the office", "chego ao escritório")],
          ["empiezo", t("empiezo", "I start", "começo")],
          ["abro el correo", t("abro el correo", "I open my email", "abro o e-mail")],
          ["respondo mensajes", t("respondo mensajes", "I answer messages", "respondo mensagens")],
          ["escribo un informe", t("escribo un informe", "I write a report", "escrevo um relatório")],
          ["como con el equipo", t("como con el equipo", "I have lunch with the team", "almoço com a equipe")],
          ["termino", t("termino", "I finish", "termino")],
          ["por la tarde", t("después de la una", "in the afternoon", "à tarde")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("¿Yo, tú o él / ella? Elige la forma.", "I, you or he / she? Choose the form.", "Eu, você ou ele / ela? Escolha a forma."),
        items: [
          { p: "Yo ___ a las ocho.", g: g("I start at eight.", "Eu começo às oito."), o: ["empiezo", "empieza"], k: 0,
            e: t("yo → -o: empiezo.", "yo → -o: empiezo.", "yo (eu) → -o: empiezo."),
            h: t("yo termina en -o.", "yo forms end in -o.", "yo termina em -o.") },
          { p: "¿Tú ___ el correo?", g: g("Do you open the email?", "Você abre o e-mail?"), o: ["abres", "abre"], k: 0,
            e: t("tú → -es: abres.", "tú → -es: abres.", "tú (você) → -es: abres."),
            h: t("tú termina en -s.", "tú forms end in -s.", "tú termina em -s.") },
          { p: "Ella ___ mensajes.", g: g("She answers messages.", "Ela responde mensagens."), o: ["responde", "respondo"], k: 0,
            e: t("ella → -e: responde.", "she → -e: responde.", "ela → -e: responde."),
            h: t("Sin -o y sin -s.", "No -o, no -s.", "Sem -o e sem -s.") },
          { p: "Yo ___ un informe.", g: g("I write a report.", "Eu escrevo um relatório."), o: ["escribo", "escribe"], k: 0,
            e: t("yo → escribo.", "yo → escribo.", "yo → escribo."),
            h: t("yo → -o.", "yo → -o.", "yo → -o.") },
          { p: "¿Tú ___ con el equipo?", g: g("Do you have lunch with the team?", "Você almoça com a equipe?"), o: ["comes", "como"], k: 0,
            e: t("tú → comes.", "tú → comes.", "tú → comes."),
            h: t("tú → -s.", "tú → -s.", "tú → -s.") },
          { p: "Él ___ a las seis.", g: g("He finishes at six.", "Ele termina às seis."), o: ["termina", "terminas"], k: 0,
            e: t("él → -a: termina.", "he → -a: termina.", "ele → -a: termina."),
            h: t("Sin -s.", "No -s.", "Sem -s.") },
          { p: "Como con el equipo ___ una.", g: g("I have lunch with the team at one.", "Almoço com a equipe à uma."), o: ["a la", "a las"], k: 0,
            e: t("La una es una hora: a la una.", "One o'clock → a la una.", "Uma hora → a la una."),
            h: t("Solo una hora.", "Just one hour.", "Só uma hora.") },
          { p: "Empiezo ___ ocho.", g: g("I start at eight.", "Começo às oito."), o: ["a las", "a la"], k: 0,
            e: t("Las demás horas: a las…", "Other hours → a las…", "As outras horas → a las…"),
            h: t("Ocho horas: plural.", "Eight is plural.", "Oito é plural.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el verbo.", "Write the verb.", "Escreva o verbo."),
        items: [
          { p: "Yo ___ el correo. (abrir)", g: g("I open the email.", "Eu abro o e-mail."), k: ["abro"],
            e: t("yo → abro.", "yo → abro.", "yo → abro."),
            h: t("-ir → -o.", "-ir → -o.", "-ir → -o.") },
          { p: "Tú ___ mensajes. (responder)", g: g("You answer messages.", "Você responde mensagens."), k: ["respondes"],
            e: t("tú → respondes.", "tú → respondes.", "tú → respondes."),
            h: t("-er → -es.", "-er → -es.", "-er → -es.") },
          { p: "Él ___ un informe. (escribir)", g: g("He writes a report.", "Ele escreve um relatório."), k: ["escribe"],
            e: t("él → escribe.", "he → escribe.", "ele → escribe."),
            h: t("-ir → -e.", "-ir → -e.", "-ir → -e.") },
          { p: "Yo ___ con el equipo. (comer)", g: g("I have lunch with the team.", "Eu almoço com a equipe."), k: ["como"],
            e: t("yo → como.", "yo → como.", "yo → como."),
            h: t("-er → -o.", "-er → -o.", "-er → -o.") },
          { p: "Ella ___ a las cinco. (terminar)", g: g("She finishes at five.", "Ela termina às cinco."), k: ["termina"],
            e: t("ella → termina.", "she → termina.", "ela → termina."),
            h: t("-ar → -a.", "-ar → -a.", "-ar → -a.") },
          { p: "¿Tú ___ a la oficina a las ocho? (llegar)", g: g("Do you get to the office at eight?", "Você chega ao escritório às oito?"), k: ["llegas"],
            e: t("tú → llegas.", "tú → llegas.", "tú → llegas."),
            h: t("-ar → -as.", "-ar → -as.", "-ar → -as.") },
          { p: "Yo ___ a las nueve. (empezar)", g: g("I start at nine.", "Eu começo às nove."), k: ["empiezo"],
            e: t("empezar → empiezo (con ie).", "empezar → empiezo (e → ie).", "empezar → empiezo (e → ie)."),
            h: t("e m p i e…", "e m p i e…", "e m p i e…") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Cambia la persona y escribe la frase.", "Change the person and write the sentence.", "Mude a pessoa e escreva a frase."),
        items: [
          { p: "Abro el correo. (ella)", k: ["Ella abre el correo.", "Abre el correo."],
            e: t("abro → abre.", "abro → abre.", "abro → abre."),
            h: t("-o → -e.", "-o → -e.", "-o → -e.") },
          { p: "Respondo mensajes. (él)", k: ["Él responde mensajes.", "Responde mensajes."],
            e: t("respondo → responde.", "respondo → responde.", "respondo → responde."),
            h: t("-o → -e.", "-o → -e.", "-o → -e.") },
          { p: "Escribo un informe. (tú)", k: ["Tú escribes un informe.", "Escribes un informe."],
            e: t("escribo → escribes.", "escribo → escribes.", "escribo → escribes."),
            h: t("-o → -es.", "-o → -es.", "-o → -es.") },
          { p: "Como con el equipo. (ella)", k: ["Ella come con el equipo.", "Come con el equipo."],
            e: t("como → come.", "como → come.", "como → come."),
            h: t("-o → -e.", "-o → -e.", "-o → -e.") },
          { p: "Termino a las seis. (tú)", k: ["Tú terminas a las seis.", "Terminas a las seis."],
            e: t("termino → terminas.", "termino → terminas.", "termino → terminas."),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Llego a la oficina. (él)", k: ["Él llega a la oficina.", "Llega a la oficina."],
            e: t("llego → llega.", "llego → llega.", "llego → llega."),
            h: t("-o → -a.", "-o → -a.", "-o → -a.") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase de tu día.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "Por la mañana abro el correo.", g: g("In the morning I open my email.", "De manhã abro o e-mail."),
            e: t("Por la mañana + abro + el correo.", "Por la mañana + abro + el correo.", "Por la mañana + abro + el correo."),
            h: t("Empieza con Por.", "Start with Por.", "Comece com Por.") },
          { k: "Empiezo a trabajar a las ocho.", g: g("I start work at eight.", "Começo a trabalhar às oito."),
            e: t("Empiezo a + verbo + a las + hora.", "Empiezo a + verb + a las + hour.", "Empiezo a + verbo + a las + hora."),
            h: t("Empieza con Empiezo.", "Start with Empiezo.", "Comece com Empiezo.") },
          { k: "Como con el equipo a la una.", g: g("I have lunch with the team at one.", "Almoço com a equipe à uma."),
            e: t("Como + con el equipo + a la una.", "Como + con el equipo + a la una.", "Como + con el equipo + a la una."),
            h: t("Empieza con Como.", "Start with Como.", "Comece com Como.") },
          { k: "Por la tarde escribo un informe.", g: g("In the afternoon I write a report.", "À tarde escrevo um relatório."),
            e: t("Por la tarde + escribo + un informe.", "Por la tarde + escribo + un informe.", "Por la tarde + escribo + un informe."),
            h: t("Empieza con Por.", "Start with Por.", "Comece com Por.") },
          { k: "Ella termina a las seis.", g: g("She finishes at six.", "Ela termina às seis."),
            e: t("Ella + termina + a las seis.", "Ella + termina + a las seis.", "Ella + termina + a las seis."),
            h: t("Empieza con Ella.", "Start with Ella.", "Comece com Ella.") },
          { k: "¿Qué haces tú por la mañana?", g: g("What do you do in the morning?", "O que você faz de manhã?"),
            e: t("¿Qué haces + tú + por la mañana?", "¿Qué haces + tú + por la mañana?", "¿Qué haces + tú + por la mañana?"),
            h: t("Empieza con ¿Qué.", "Start with ¿Qué.", "Comece com ¿Qué.") }
        ]
      }
    ],
    reto: {
      consigna: t("Tu día de trabajo: escribe dos o tres frases.", "Your work day: write two or three sentences.", "Seu dia de trabalho: escreva duas ou três frases."),
      ruta: ["Por la mañana…", "Empiezo a las…", "Por la tarde…", "Termino a las…"],
      lista: [
        t("Dices dos horas con a las o a la una.", "You give two times with a las or a la una.", "Você diz dois horários com a las ou a la una."),
        t("Usas dos verbos con yo (-o).", "You use two verbs with yo (-o).", "Você usa dois verbos com yo (-o).")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
