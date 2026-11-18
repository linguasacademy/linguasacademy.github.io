/* Práctica autónoma · A1 · ¿Qué tal tu fin de semana? (adultos, apoyo en inglés)
   Tema y gramática del catálogo: ¿Adónde fuiste? ¿Qué comiste? y me gustó / no me gustó */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-que-tal-tu-fin-de-semana"] = {
    tematica: "ocio",
    objetivo: t("Preguntar por el fin de semana y contar el tuyo", "Ask about someone's weekend and tell them about yours", "Perguntar sobre o fim de semana de alguém e contar o seu"),
    repaso: [
      t("¿Qué tal tu fin de semana? — ¡Muy bien!", "How was your weekend? — Really good!", "Como foi seu fim de semana? — Muito bom!"),
      t("¿Adónde fuiste? — Fui al parque.", "Where did you go? — I went to the park.", "Aonde você foi? — Fui ao parque."),
      t("¿Qué comiste? — Comí arepas.", "What did you eat? — I ate arepas.", "O que você comeu? — Comi arepas."),
      t("¿Qué viste? — Vi una película.", "What did you see? — I saw a film.", "O que você viu? — Vi um filme."),
      t("¿Te gustó? — Sí, me gustó. / No, no me gustó.", "Did you like it? — Yes, I did. / No, I didn't.", "Você gostou? — Sim, gostei. / Não, não gostei.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada pregunta con su significado.", "Match each question with its meaning.", "Ligue cada pergunta ao seu significado."),
        pares: [
          ["¿Adónde fuiste?", t("pregunta por el lugar", "Where did you go?", "Aonde você foi?")],
          ["¿Con quién fuiste?", t("pregunta por la persona", "Who did you go with?", "Com quem você foi?")],
          ["¿Qué comiste?", t("pregunta por la comida", "What did you eat?", "O que você comeu?")],
          ["¿Qué viste?", t("pregunta por la película o el lugar", "What did you see / watch?", "O que você viu?")],
          ["¿Qué compraste?", t("pregunta por las compras", "What did you buy?", "O que você comprou?")],
          ["¿Te gustó?", t("pregunta por tu opinión", "Did you like it?", "Você gostou?")],
          ["Más o menos", t("ni bien ni mal", "So-so", "Mais ou menos")],
          ["el fin de semana", t("sábado y domingo", "the weekend", "o fim de semana")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("¿Pregunta (tú) o respuesta (yo)? Elige.", "Question (tú) or answer (yo)? Choose.", "Pergunta (tú) ou resposta (yo)? Escolha."),
        items: [
          { p: "¿Adónde ___ el sábado?", g: g("Where did you go on Saturday?", "Aonde você foi no sábado?"), o: ["fuiste", "fui"], k: 0,
            e: t("Pregunta a tú → fuiste.", "You ask «you» (tú) → fuiste.", "Pergunta para tú (você) → fuiste."),
            h: t("Es una pregunta.", "It's a question.", "É uma pergunta.") },
          { p: "— ___ a la playa con mi familia.", g: g("I went to the beach with my family.", "Fui à praia com minha família."), o: ["Fui", "Fuiste"], k: 0,
            e: t("Yo → fui.", "I (yo) → fui.", "Eu (yo) → fui."),
            h: t("Habla de sí mismo: mi familia.", "Look: mi familia → it's «I».", "Olhe: mi familia → é «eu».") },
          { p: "¿Qué ___? — Vi una película.", g: g("What did you see? — I saw a film.", "O que você viu? — Vi um filme."), o: ["viste", "vi"], k: 0,
            e: t("vi (yo) → viste (tú).", "vi (I) → viste (you).", "vi (eu) → viste (você)."),
            h: t("Es la pregunta.", "It's the question.", "É a pergunta.") },
          { p: "¿Qué compraste? — ___ un libro.", g: g("What did you buy? — I bought a book.", "O que você comprou? — Comprei um livro."), o: ["Compré", "Compraste"], k: 0,
            e: t("Yo → compré.", "I → compré.", "Eu → compré."),
            h: t("Es la respuesta.", "It's the answer.", "É a resposta.") },
          { p: "¿Te gustó la película? — Sí, me ___ mucho.", g: g("Did you like the film? — Yes, I liked it a lot.", "Você gostou do filme? — Sim, gostei muito."), o: ["gustó", "gusta"], k: 0,
            e: t("Pasado → gustó.", "Past → gustó (liked).", "Passado → gustó (gostei)."),
            h: t("La pregunta es en pasado.", "The question is in the past.", "A pergunta está no passado.") },
          { p: "¿Con quién fuiste? — Fui ___ mis amigos.", g: g("Who did you go with? — I went with my friends.", "Com quem você foi? — Fui com meus amigos."), o: ["con", "a"], k: 0,
            e: t("¿Con quién? → con…", "¿Con quién? → con (with)…", "¿Con quién? → con (com)…"),
            h: t("Repite la palabra de la pregunta.", "Repeat a word from the question.", "Repita uma palavra da pergunta.") },
          { p: "¿Qué tal tu fin de semana? — ___, gracias.", g: g("How was your weekend? — Really good, thanks.", "Como foi seu fim de semana? — Muito bom, obrigado."), o: ["Muy bien", "Muy bueno"], k: 0,
            e: t("¿Qué tal…? → Muy bien.", "¿Qué tal…? → Muy bien (not «muy bueno»).", "¿Qué tal…? → Muy bien (não «muy bueno»)."),
            h: t("Como «¿Cómo estás? — Bien».", "Like «¿Cómo estás? — Bien».", "Como «¿Cómo estás? — Bien».") },
          { p: "Fui ___ parque.", g: g("I went to the park.", "Fui ao parque."), o: ["al", "a el"], k: 0,
            e: t("a + el = al.", "a + el = al.", "a + el = al."),
            h: t("Dos palabras se juntan.", "Two words join.", "Duas palavras se juntam.") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la conversación.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "¿Qué tal tu fin de semana?", g: g("How was your weekend?", "Como foi seu fim de semana?"),
            e: t("¿Qué tal + tu fin de semana?", "¿Qué tal + tu fin de semana?", "¿Qué tal + tu fin de semana?"),
            h: t("Empieza con ¿Qué.", "Start with ¿Qué.", "Comece com ¿Qué.") },
          { k: "¿Adónde fuiste el sábado?", g: g("Where did you go on Saturday?", "Aonde você foi no sábado?"),
            e: t("¿Adónde + fuiste + el sábado?", "¿Adónde + fuiste + el sábado?", "¿Adónde + fuiste + el sábado?"),
            h: t("Empieza con ¿Adónde.", "Start with ¿Adónde.", "Comece com ¿Adónde.") },
          { k: "Fui al cine con mis amigos.", g: g("I went to the cinema with my friends.", "Fui ao cinema com meus amigos."),
            e: t("Fui + al cine + con mis amigos.", "Fui + al cine + con mis amigos.", "Fui + al cine + con mis amigos."),
            h: t("Empieza con Fui.", "Start with Fui.", "Comece com Fui.") },
          { k: "¿Te gustó la película?", g: g("Did you like the film?", "Você gostou do filme?"),
            e: t("¿Te gustó + la película?", "¿Te gustó + la película?", "¿Te gustó + la película?"),
            h: t("Empieza con ¿Te.", "Start with ¿Te.", "Comece com ¿Te.") },
          { k: "No, no me gustó mucho.", g: g("No, I didn't like it much.", "Não, não gostei muito."),
            e: t("No, + no me gustó + mucho.", "No, + no me gustó + mucho.", "No, + no me gustó + mucho."),
            h: t("Empieza con No,", "Start with No,", "Comece com No,") },
          { k: "¿Qué comiste el domingo?", g: g("What did you eat on Sunday?", "O que você comeu no domingo?"),
            e: t("¿Qué + comiste + el domingo?", "¿Qué + comiste + el domingo?", "¿Qué + comiste + el domingo?"),
            h: t("Empieza con ¿Qué.", "Start with ¿Qué.", "Comece com ¿Qué.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el verbo en pasado.", "Write the verb in the past.", "Escreva o verbo no passado."),
        items: [
          { p: "¿Qué ___ el domingo? (comer, tú)", g: g("What did you eat on Sunday?", "O que você comeu no domingo?"), k: ["comiste"],
            e: t("comí → comiste.", "comí (I) → comiste (you).", "comí (eu) → comiste (você)."),
            h: t("Termina en -iste.", "It ends in -iste.", "Termina em -iste.") },
          { p: "¿Adónde ___? (ir, tú)", g: g("Where did you go?", "Aonde você foi?"), k: ["fuiste"],
            e: t("fui → fuiste.", "fui (I) → fuiste (you).", "fui (eu) → fuiste (você)."),
            h: t("f _ _ _ _ _ e", "f _ _ _ _ _ e", "f _ _ _ _ _ e") },
          { p: "¿Qué ___ en el cine? (ver, tú)", g: g("What did you see at the cinema?", "O que você viu no cinema?"), k: ["viste"],
            e: t("vi → viste.", "vi (I) → viste (you).", "vi (eu) → viste (você)."),
            h: t("v _ _ _ e", "v _ _ _ e", "v _ _ _ e") },
          { p: "¿Qué ___ en el mercado? (comprar, tú)", g: g("What did you buy at the market?", "O que você comprou no mercado?"), k: ["compraste"],
            e: t("compré → compraste.", "compré (I) → compraste (you).", "compré (eu) → compraste (você)."),
            h: t("Termina en -aste.", "It ends in -aste.", "Termina em -aste.") },
          { p: "¿___ a tu familia? (visitar, tú)", g: g("Did you visit your family?", "Você visitou sua família?"), k: ["visitaste"],
            e: t("visité → visitaste.", "visité (I) → visitaste (you).", "visité (eu) → visitaste (você)."),
            h: t("Termina en -aste.", "It ends in -aste.", "Termina em -aste.") },
          { p: "¿Te ___ la película? (gustar)", g: g("Did you like the film?", "Você gostou do filme?"), k: ["gustó"],
            e: t("¿Te gustó? Lleva tilde: gustó.", "¿Te gustó? Accent on the o: gustó.", "¿Te gustó? Acento no o: gustó."),
            h: t("g _ _ _ ó", "g _ _ _ ó", "g _ _ _ ó") },
          { p: "Yo ___ arepas con queso. (comer)", g: g("I ate arepas with cheese.", "Eu comi arepas com queijo."), k: ["comí"],
            e: t("Yo → comí, con tilde.", "I → comí, with an accent.", "Eu → comí, com acento."),
            h: t("c _ _ í", "c _ _ í", "c _ _ í") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Haz la pregunta: de yo a tú.", "Turn it into a question: from yo to tú.", "Faça a pergunta: de yo para tú."),
        items: [
          { p: "Fui al parque.", k: ["¿Fuiste al parque?"],
            e: t("fui → ¿fuiste?", "fui → ¿fuiste?", "fui → ¿fuiste?"),
            h: t("No olvides ¿ ?", "Don't forget ¿ ?", "Não esqueça ¿ ?") },
          { p: "Comí pescado.", k: ["¿Comiste pescado?"],
            e: t("comí → ¿comiste?", "comí → ¿comiste?", "comí → ¿comiste?"),
            h: t("-í → -iste.", "-í → -iste.", "-í → -iste.") },
          { p: "Vi una serie.", k: ["¿Viste una serie?"],
            e: t("vi → ¿viste?", "vi → ¿viste?", "vi → ¿viste?"),
            h: t("-i → -iste.", "-i → -iste.", "-i → -iste.") },
          { p: "Compré un libro.", k: ["¿Compraste un libro?"],
            e: t("compré → ¿compraste?", "compré → ¿compraste?", "compré → ¿compraste?"),
            h: t("-é → -aste.", "-é → -aste.", "-é → -aste.") },
          { p: "Visité a mi familia.", k: ["¿Visitaste a tu familia?"],
            e: t("visité → ¿visitaste? y mi → tu.", "visité → ¿visitaste? and mi → tu.", "visité → ¿visitaste? e mi → tu."),
            h: t("Cambia también mi.", "Change mi too.", "Mude mi também.") },
          { p: "Me gustó la película.", k: ["¿Te gustó la película?"],
            e: t("me gustó → ¿te gustó?", "me gustó → ¿te gustó?", "me gustó → ¿te gustó?"),
            h: t("me → te.", "me → te.", "me → te.") }
        ]
      }
    ],
    reto: {
      consigna: t("Cuenta tu fin de semana en dos o tres frases y termina con una pregunta para tu profe.", "Tell your weekend in two or three sentences and end with a question for your teacher.", "Conte seu fim de semana em duas ou três frases e termine com uma pergunta para seu professor."),
      ruta: ["El sábado fui a…", "Comí…", "Me gustó… / No me gustó…", "¿Y tú? ¿Adónde fuiste?"],
      lista: [
        t("Una frase con fui.", "One sentence with fui.", "Uma frase com fui."),
        t("Una frase con me gustó o no me gustó.", "One sentence with me gustó or no me gustó.", "Uma frase com me gustó ou no me gustó."),
        t("Una pregunta con -aste o -iste.", "One question with -aste or -iste.", "Uma pergunta com -aste ou -iste.")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
