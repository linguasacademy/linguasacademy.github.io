/* Práctica autónoma · A1 · Fui, vi y comí (adultos, apoyo en inglés)
   Tema y gramática del catálogo: contar un viaje en pasado con «yo» (fui, viajé, visité, comí, vi, compré; ayer, el año pasado; al) */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-fui-vi-y-comi"] = {
    tematica: "viajes",
    objetivo: t("Contar tu último viaje en pasado", "Tell someone about your last trip in the past tense", "Contar sua última viagem no passado"),
    repaso: [
      t("El año pasado fui a Cartagena.", "Last year I went to Cartagena.", "No ano passado fui a Cartagena."),
      t("Viajé en avión.", "I travelled by plane.", "Viajei de avião."),
      t("Visité un museo y vi el mar.", "I visited a museum and saw the sea.", "Visitei um museu e vi o mar."),
      t("Comí pescado con arroz.", "I ate fish with rice.", "Comi peixe com arroz."),
      t("Ayer fui al mercado y compré fruta.", "Yesterday I went to the market and bought fruit.", "Ontem fui ao mercado e comprei fruta.")
    ],
    ejercicios: [
      {
        tipo: "elige",
        consigna: t("¿Hoy o ayer? Elige la forma.", "Today or yesterday? Choose the right form.", "Hoje ou ontem? Escolha a forma certa."),
        items: [
          { p: "Ayer ___ a la playa.", g: g("Yesterday I went to the beach.", "Ontem fui à praia."), o: ["fui", "voy"], k: 0,
            e: t("Ayer → pasado: fui.", "Ayer (yesterday) → past: fui.", "Ayer (ontem) → passado: fui."),
            h: t("Mira la primera palabra.", "Look at the first word.", "Olhe a primeira palavra.") },
          { p: "Hoy ___ sopa.", g: g("Today I'm eating soup.", "Hoje como sopa."), o: ["como", "comí"], k: 0,
            e: t("Hoy → presente: como.", "Hoy (today) → present: como.", "Hoy (hoje) → presente: como."),
            h: t("Es hoy, no ayer.", "It's today, not yesterday.", "É hoje, não ontem.") },
          { p: "El año pasado ___ en tren.", g: g("Last year I travelled by train.", "No ano passado viajei de trem."), o: ["viajé", "viajo"], k: 0,
            e: t("El año pasado → viajé.", "Last year → past: viajé.", "Ano passado → passado: viajé."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "Fui ___ museo.", g: g("I went to the museum.", "Fui ao museu."), o: ["al", "a el"], k: 0,
            e: t("a + el = al.", "a + el = al.", "a + el = al."),
            h: t("Dos palabras se juntan.", "Two words join.", "Duas palavras se juntam.") },
          { p: "Viajé ___ avión.", g: g("I travelled by plane.", "Viajei de avião."), o: ["en", "por"], k: 0,
            e: t("Transporte → en: en avión, en tren.", "By plane → en avión (not «por»).", "De avião → en avión (não «de»)."),
            h: t("en avión, en bus, en tren.", "en avión, en bus, en tren.", "en avión, en bus, en tren.") },
          { p: "Ayer ___ el mar.", g: g("Yesterday I saw the sea.", "Ontem vi o mar."), o: ["vi", "veo"], k: 0,
            e: t("Ayer → vi.", "Yesterday → vi (saw).", "Ontem → vi."),
            h: t("Pasado de ver.", "Past of ver.", "Passado de ver.") },
          { p: "Fui ___ playa.", g: g("I went to the beach.", "Fui à praia."), o: ["a la", "la"], k: 0,
            e: t("ir a + la playa.", "«to the beach» → a la playa.", "«à praia» → a la playa."),
            h: t("Falta una palabra pequeña.", "A small word is missing.", "Falta uma palavra pequena.") },
          { p: "El año pasado ___ Cartagena.", g: g("Last year I visited Cartagena.", "No ano passado visitei Cartagena."), o: ["visité", "visito"], k: 0,
            e: t("El año pasado → visité.", "Last year → visité.", "Ano passado → visité."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") }
        ]
      },
      {
        tipo: "empareja",
        consigna: t("Une cada expresión con su significado.", "Match each expression with its meaning.", "Ligue cada expressão ao seu significado."),
        pares: [
          ["fui a…", t("fui a…", "I went to…", "fui a…")],
          ["viajé en…", t("viajé en…", "I travelled by…", "viajei de…")],
          ["visité…", t("visité…", "I visited…", "visitei…")],
          ["comí…", t("comí…", "I ate…", "comi…")],
          ["vi…", t("vi…", "I saw…", "vi…")],
          ["compré…", t("compré…", "I bought…", "comprei…")],
          ["ayer", t("el día antes de hoy", "yesterday", "ontem")],
          ["el año pasado", t("hace un año", "last year", "o ano passado")]
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase del viaje.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "El año pasado fui a Cartagena.", g: g("Last year I went to Cartagena.", "No ano passado fui a Cartagena."),
            e: t("El año pasado + fui a + lugar.", "El año pasado + fui a + place.", "El año pasado + fui a + lugar."),
            h: t("Empieza con El año.", "Start with El año.", "Comece com El año.") },
          { k: "Viajé en avión con mi familia.", g: g("I travelled by plane with my family.", "Viajei de avião com minha família."),
            e: t("Viajé + en avión + con mi familia.", "Viajé + en avión + con mi familia.", "Viajé + en avión + con mi familia."),
            h: t("Empieza con Viajé.", "Start with Viajé.", "Comece com Viajé.") },
          { k: "Comí pescado y arroz.", g: g("I ate fish and rice.", "Comi peixe e arroz."),
            e: t("Comí + pescado + y + arroz.", "Comí + pescado + y + arroz.", "Comí + pescado + y + arroz."),
            h: t("Empieza con Comí.", "Start with Comí.", "Comece com Comí.") },
          { k: "Visité un museo muy bonito.", g: g("I visited a very nice museum.", "Visitei um museu muito bonito."),
            e: t("El adjetivo va después: museo bonito.", "The adjective goes after: museo bonito.", "O adjetivo vem depois: museo bonito."),
            h: t("Empieza con Visité.", "Start with Visité.", "Comece com Visité.") },
          { k: "Ayer fui al mercado.", g: g("Yesterday I went to the market.", "Ontem fui ao mercado."),
            e: t("Ayer + fui + al mercado.", "Ayer + fui + al mercado.", "Ayer + fui + al mercado."),
            h: t("Empieza con Ayer.", "Start with Ayer.", "Comece com Ayer.") },
          { k: "Compré fruta y café.", g: g("I bought fruit and coffee.", "Comprei fruta e café."),
            e: t("Compré + fruta + y + café.", "Compré + fruta + y + café.", "Compré + fruta + y + café."),
            h: t("Empieza con Compré.", "Start with Compré.", "Comece com Compré.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el verbo en pasado (yo).", "Write the verb in the past (I).", "Escreva o verbo no passado (eu)."),
        items: [
          { p: "El año pasado ___ a México. (ir)", g: g("Last year I went to Mexico.", "No ano passado fui ao México."), k: ["fui"],
            e: t("ir → fui.", "ir (go) → fui.", "ir → fui."),
            h: t("f _ _", "f _ _", "f _ _") },
          { p: "___ en tren. (viajar)", g: g("I travelled by train.", "Viajei de trem."), k: ["viajé"],
            e: t("viajar → viajé, con tilde.", "viajar → viajé (with an accent).", "viajar → viajé (com acento)."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "___ un museo. (visitar)", g: g("I visited a museum.", "Visitei um museu."), k: ["visité"],
            e: t("visitar → visité.", "visitar → visité.", "visitar → visité."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "___ arroz con pescado. (comer)", g: g("I ate rice with fish.", "Comi arroz com peixe."), k: ["comí"],
            e: t("comer → comí.", "comer → comí.", "comer → comí."),
            h: t("-er → -í.", "-er → -í.", "-er → -í.") },
          { p: "___ el mar. (ver)", g: g("I saw the sea.", "Vi o mar."), k: ["vi"],
            e: t("ver → vi, sin tilde.", "ver → vi (no accent).", "ver → vi (sem acento)."),
            h: t("Dos letras.", "Two letters.", "Duas letras.") },
          { p: "___ fruta en el mercado. (comprar)", g: g("I bought fruit at the market.", "Comprei fruta no mercado."), k: ["compré"],
            e: t("comprar → compré.", "comprar → compré.", "comprar → compré."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "Fui ___ parque. (a + el)", g: g("I went to the park.", "Fui ao parque."), k: ["al"],
            e: t("a + el = al.", "a + el = al.", "a + el = al."),
            h: t("a _", "a _", "a _") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("De hoy a ayer: escribe la frase en pasado.", "From today to yesterday: write the sentence in the past.", "De hoje para ontem: escreva a frase no passado."),
        items: [
          { p: "Hoy voy al mercado.", k: ["Ayer fui al mercado."],
            e: t("voy → fui.", "voy → fui.", "voy → fui."),
            h: t("Empieza con Ayer.", "Start with Ayer.", "Comece com Ayer.") },
          { p: "Hoy como sopa.", k: ["Ayer comí sopa."],
            e: t("como → comí.", "como → comí.", "como → comí."),
            h: t("-er → -í.", "-er → -í.", "-er → -í.") },
          { p: "Hoy viajo en bus.", k: ["Ayer viajé en bus."],
            e: t("viajo → viajé.", "viajo → viajé.", "viajo → viajé."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "Hoy visito el museo.", k: ["Ayer visité el museo."],
            e: t("visito → visité.", "visito → visité.", "visito → visité."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") },
          { p: "Hoy veo el mar.", k: ["Ayer vi el mar."],
            e: t("veo → vi.", "veo → vi.", "veo → vi."),
            h: t("Es corto: dos letras.", "It's short: two letters.", "É curto: duas letras.") },
          { p: "Hoy compro un mapa.", k: ["Ayer compré un mapa."],
            e: t("compro → compré.", "compro → compré.", "compro → compré."),
            h: t("-ar → -é.", "-ar → -é.", "-ar → -é.") }
        ]
      }
    ],
    reto: {
      consigna: t("Tu último viaje: escribe dos o tres frases.", "Your last trip: write two or three sentences.", "Sua última viagem: escreva duas ou três frases."),
      ruta: ["El año pasado fui a…", "Viajé en…", "Comí…", "Vi…"],
      lista: [
        t("Dice adónde fuiste.", "It says where you went.", "Diz aonde você foi."),
        t("Tiene al menos dos verbos en pasado.", "It has at least two past verbs.", "Tem pelo menos dois verbos no passado.")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
