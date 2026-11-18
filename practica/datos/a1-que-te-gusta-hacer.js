/* Práctica autónoma · A1 · ¿Qué te gusta hacer? (niños, apoyo en inglés)
   Tema y gramática del catálogo: me gusta / no me gusta / ¿te gusta? + verbo, mucho */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-que-te-gusta-hacer"] = {
    tematica: "ocio",
    objetivo: t("Decir qué te gusta hacer", "Say what you like doing", "Dizer o que você gosta de fazer"),
    repaso: [
      t("Me gusta nadar.", "I like swimming.", "Eu gosto de nadar."),
      t("Me gusta mucho dibujar.", "I really like drawing.", "Eu gosto muito de desenhar."),
      t("No me gusta correr.", "I don't like running.", "Eu não gosto de correr."),
      t("¿Te gusta bailar?", "Do you like dancing?", "Você gosta de dançar?"),
      t("Sí, me gusta. / No, no me gusta.", "Yes, I like it. / No, I don't like it.", "Sim, gosto. / Não, não gosto.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada actividad con su significado.", "Match each activity with its meaning.", "Ligue cada atividade ao seu significado."),
        pares: [
          ["nadar", t("nadar", "to swim", "nadar")],
          ["correr", t("correr", "to run", "correr")],
          ["dibujar", t("dibujar", "to draw", "desenhar")],
          ["leer", t("leer", "to read", "ler")],
          ["bailar", t("bailar", "to dance", "dançar")],
          ["jugar al fútbol", t("jugar al fútbol", "to play football", "jogar futebol")],
          ["montar en bicicleta", t("montar en bicicleta", "to ride a bike", "andar de bicicleta")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Toca la palabra que va.", "Tap the word that fits.", "Toque a palavra certa."),
        items: [
          { p: "Me gusta ___.", g: g("I like swimming.", "Eu gosto de nadar."), o: ["nadar", "nadando"], k: 0,
            e: t("Después de gusta va nadar.", "After gusta use the basic form: nadar (not nadando).", "Depois de gusta vem nadar."),
            h: t("Termina en -ar.", "It ends in -ar.", "Termina em -ar.") },
          { p: "___ me gusta leer.", g: g("I don't like reading.", "Eu não gosto de ler."), o: ["No", "Me"], k: 0,
            e: t("No va primero: No me gusta.", "«No» goes first: No me gusta leer.", "«No» vem primeiro: No me gusta."),
            h: t("«don't»", "«don't»", "«não»") },
          { p: "¿___ gusta bailar?", g: g("Do you like dancing?", "Você gosta de dançar?"), o: ["Te", "Me"], k: 0,
            e: t("Para preguntar: ¿Te gusta…?", "To ask a friend: ¿Te gusta…?", "Para perguntar: ¿Te gusta…?"),
            h: t("Es una pregunta.", "It's a question.", "É uma pergunta.") },
          { p: "¿Te gusta correr? — Sí, me ___.", g: g("Do you like running? — Yes, I like it.", "Você gosta de correr? — Sim, gosto."), o: ["gusta", "gusto"], k: 0,
            e: t("La respuesta copia la pregunta: me gusta.", "The answer copies the question: me gusta.", "A resposta copia a pergunta: me gusta."),
            h: t("Mira la pregunta.", "Look at the question.", "Olhe a pergunta.") },
          { p: "Me gusta jugar ___ fútbol.", g: g("I like playing football.", "Eu gosto de jogar futebol."), o: ["al", "el"], k: 0,
            e: t("jugar al fútbol (a + el = al).", "jugar al fútbol (a + el = al).", "jugar al fútbol (a + el = al)."),
            h: t("a + el = …", "a + el = …", "a + el = …") },
          { p: "Me gusta ___ dibujar.", g: g("I really like drawing.", "Eu gosto muito de desenhar."), o: ["mucho", "muy"], k: 0,
            e: t("Me gusta mucho = me gusta un montón.", "mucho = a lot: Me gusta mucho dibujar.", "mucho = muito: Me gusta mucho dibujar."),
            h: t("«a lot»", "«a lot»", "«muito»") },
          { p: "Tengo diez años y me gusta ___ en bicicleta.", g: g("I'm ten and I like riding a bike.", "Tenho dez anos e gosto de andar de bicicleta."), o: ["montar", "jugar"], k: 0,
            e: t("Montar en bicicleta.", "montar en bicicleta = to ride a bike.", "montar en bicicleta = andar de bicicleta."),
            h: t("Con la bicicleta…", "With a bike you…", "Com a bicicleta…") },
          { p: "___ diez años.", g: g("I am ten.", "Tenho dez anos."), o: ["Tengo", "Soy"], k: 0,
            e: t("Los años van con tengo.", "In Spanish you HAVE years: Tengo diez años.", "A idade vai com tengo: Tengo diez años."),
            h: t("No es «soy».", "Not «I am».", "Não é «soy».") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Me ___ nadar.", g: g("I like swimming.", "Eu gosto de nadar."), k: ["gusta"],
            e: t("Me gusta + actividad.", "Me gusta + activity.", "Me gusta + atividade."),
            h: t("g _ _ _ a", "g _ _ _ a", "g _ _ _ a") },
          { p: "¿Te gusta ___?", g: g("Do you like drawing?", "Você gosta de desenhar?"), k: ["dibujar"],
            e: t("dibujar = hacer un dibujo.", "dibujar = to draw.", "dibujar = desenhar."),
            h: t("d _ _ _ _ _ r", "d _ _ _ _ _ r", "d _ _ _ _ _ r") },
          { p: "No me gusta ___.", g: g("I don't like reading.", "Eu não gosto de ler."), k: ["leer"],
            e: t("leer un libro.", "leer = to read.", "leer = ler."),
            h: t("l _ _ r", "l _ _ r", "l _ _ r") },
          { p: "Me gusta jugar al ___.", g: g("I like playing football.", "Eu gosto de jogar futebol."), k: ["fútbol", "futbol"],
            e: t("fútbol lleva tilde en la u.", "fútbol has an accent on the u.", "fútbol tem acento no u."),
            h: t("f _ _ _ _ l", "f _ _ _ _ l", "f _ _ _ _ l") },
          { p: "___ me gusta bailar.", g: g("I don't like dancing.", "Eu não gosto de dançar."), k: ["no"],
            e: t("No va primero.", "«No» goes first.", "«No» vem primeiro."),
            h: t("n _", "n _", "n _") },
          { p: "Me gusta montar en ___.", g: g("I like riding a bike.", "Eu gosto de andar de bicicleta."), k: ["bicicleta"],
            e: t("montar en bicicleta.", "bicicleta = bike.", "bicicleta = bicicleta."),
            h: t("b _ _ _ _ _ _ _ a", "b _ _ _ _ _ _ _ a", "b _ _ _ _ _ _ _ a") },
          { p: "Me gusta ___ nadar.", g: g("I really like swimming.", "Eu gosto muito de nadar."), k: ["mucho"],
            e: t("mucho = un montón.", "mucho = a lot.", "mucho = muito."),
            h: t("m _ _ _ o", "m _ _ _ o", "m _ _ _ o") },
          { p: "¿Te ___ correr?", g: g("Do you like running?", "Você gosta de correr?"), k: ["gusta"],
            e: t("¿Te gusta + actividad?", "¿Te gusta + activity?", "¿Te gusta + atividade?"),
            h: t("g _ _ _ a", "g _ _ _ a", "g _ _ _ a") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "Me gusta mucho dibujar.", g: g("I really like drawing.", "Eu gosto muito de desenhar."),
            e: t("Me gusta + mucho + actividad.", "Me gusta + mucho + activity.", "Me gusta + mucho + atividade."),
            h: t("Empieza con Me.", "Start with Me.", "Comece com Me.") },
          { k: "No me gusta correr.", g: g("I don't like running.", "Eu não gosto de correr."),
            e: t("No + me gusta + actividad.", "No + me gusta + activity.", "No + me gusta + atividade."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { k: "¿Te gusta leer?", g: g("Do you like reading?", "Você gosta de ler?"),
            e: t("¿Te gusta + actividad?", "¿Te gusta + activity?", "¿Te gusta + atividade?"),
            h: t("Empieza con ¿Te.", "Start with ¿Te.", "Comece com ¿Te.") },
          { k: "Me gusta jugar al fútbol.", g: g("I like playing football.", "Eu gosto de jogar futebol."),
            e: t("jugar al fútbol.", "jugar al fútbol.", "jugar al fútbol."),
            h: t("Termina con fútbol.", "It ends with fútbol.", "Termina com fútbol.") },
          { k: "Sí, me gusta nadar.", g: g("Yes, I like swimming.", "Sim, eu gosto de nadar."),
            e: t("Sí, + me gusta + actividad.", "Sí, + me gusta + activity.", "Sí, + me gusta + atividade."),
            h: t("Empieza con Sí.", "Start with Sí.", "Comece com Sí.") },
          { k: "Me gusta montar en bicicleta.", g: g("I like riding a bike.", "Eu gosto de andar de bicicleta."),
            e: t("montar en bicicleta.", "montar en bicicleta.", "montar en bicicleta."),
            h: t("Termina con bicicleta.", "It ends with bicicleta.", "Termina com bicicleta.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Cambia la frase: escribe lo contrario.", "Write the opposite sentence!", "Escreva a frase contrária!"),
        items: [
          { p: "Me gusta nadar.", k: ["No me gusta nadar."],
            e: t("Pon No al principio.", "Put No at the start.", "Coloque No no começo."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "No me gusta bailar.", k: ["Me gusta bailar."],
            e: t("Quita el No.", "Take away No.", "Tire o No."),
            h: t("Empieza con Me.", "Start with Me.", "Comece com Me.") },
          { p: "Me gusta leer.", k: ["No me gusta leer."],
            e: t("Pon No al principio.", "Put No at the start.", "Coloque No no começo."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "No me gusta correr.", k: ["Me gusta correr."],
            e: t("Quita el No.", "Take away No.", "Tire o No."),
            h: t("Empieza con Me.", "Start with Me.", "Comece com Me.") },
          { p: "Me gusta dibujar.", k: ["No me gusta dibujar."],
            e: t("Pon No al principio.", "Put No at the start.", "Coloque No no começo."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "No me gusta jugar al fútbol.", k: ["Me gusta jugar al fútbol.", "Me gusta jugar al futbol."],
            e: t("Quita el No.", "Take away No.", "Tire o No."),
            h: t("Empieza con Me.", "Start with Me.", "Comece com Me.") }
        ]
      }
    ],
    reto: {
      consigna: t("Escribe sobre ti: qué te gusta hacer y qué no.", "Write about you: what you like doing and what you don't.", "Escreva sobre você: o que você gosta de fazer e o que não."),
      ruta: ["Me gusta…", "Me gusta mucho…", "No me gusta…", "¿Y tú? ¿Te gusta…?"],
      lista: [
        t("Tiene una frase con Me gusta.", "It has a sentence with Me gusta.", "Tem uma frase com Me gusta."),
        t("Tiene una frase con No me gusta.", "It has a sentence with No me gusta.", "Tem uma frase com No me gusta."),
        t("Termina con una pregunta: ¿Te gusta…?", "It ends with a question: ¿Te gusta…?", "Termina com uma pergunta: ¿Te gusta…?")
      ],
      min: 3, max: 5, unidad: "frases"
    }
  };
})();
