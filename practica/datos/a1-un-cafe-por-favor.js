/* Práctica autónoma · A1 · Un café, por favor (adultos, apoyo en inglés)
   Tema y gramática del catálogo: pedir en un bar: un / una, Quiero… */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-un-cafe-por-favor"] = {
    tematica: "comida",
    objetivo: t("Pedir algo en un café", "Order something in a café", "Pedir algo num café"),
    repaso: [
      t("Un café, por favor.", "A coffee, please.", "Um café, por favor."),
      t("Quiero una cerveza.", "I'd like a beer.", "Quero uma cerveja."),
      t("¿Quieres un té?", "Would you like a tea?", "Você quer um chá?"),
      t("Quiero un jugo y una arepa, por favor.", "I'd like a juice and an arepa, please.", "Quero um suco e uma arepa, por favor."),
      t("La cuenta, por favor.", "The bill, please.", "A conta, por favor.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada palabra con su significado.", "Match each word with its meaning.", "Ligue cada palavra ao seu significado."),
        pares: [
          ["un café", t("un café", "a coffee", "um café")],
          ["un té", t("un té", "a tea", "um chá")],
          ["un jugo", t("un jugo", "a juice", "um suco")],
          ["una cerveza", t("una cerveza", "a beer", "uma cerveja")],
          ["una tortilla", t("una tortilla", "an omelette", "uma omelete")],
          ["un sándwich", t("un sándwich", "a sandwich", "um sanduíche")],
          ["agua", t("agua", "water", "água")],
          ["la cuenta", t("lo que pagas", "the bill", "a conta")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("¿Un o una? Elige.", "Un or una? Choose.", "Un ou una? Escolha."),
        items: [
          { p: "Quiero ___ café.", g: g("I'd like a coffee.", "Quero um café."), o: ["un", "una"], k: 0,
            e: t("café → un café.", "café → un café.", "café → un café."),
            h: t("No termina en -a.", "It doesn't end in -a.", "Não termina em -a.") },
          { p: "Quiero ___ cerveza.", g: g("I'd like a beer.", "Quero uma cerveja."), o: ["un", "una"], k: 1,
            e: t("cerveza → una cerveza.", "cerveza ends in -a → una.", "cerveza termina em -a → una."),
            h: t("Mira la última letra.", "Look at the last letter.", "Olhe a última letra.") },
          { p: "Quiero ___ tortilla.", g: g("I'd like an omelette.", "Quero uma omelete."), o: ["un", "una"], k: 1,
            e: t("tortilla → una.", "tortilla ends in -a → una.", "tortilla termina em -a → una."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Quiero ___ jugo.", g: g("I'd like a juice.", "Quero um suco."), o: ["un", "una"], k: 0,
            e: t("jugo → un.", "jugo ends in -o → un.", "jugo termina em -o → un."),
            h: t("Termina en -o.", "It ends in -o.", "Termina em -o.") },
          { p: "Quiero ___ arepa.", g: g("I'd like an arepa.", "Quero uma arepa."), o: ["un", "una"], k: 1,
            e: t("arepa → una.", "arepa ends in -a → una.", "arepa termina em -a → una."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Quiero ___ té.", g: g("I'd like a tea.", "Quero um chá."), o: ["un", "una"], k: 0,
            e: t("té → un té.", "té → un té.", "té → un té."),
            h: t("Como un café.", "Like un café.", "Como un café.") },
          { p: "___ un sándwich, por favor.", g: g("I'd like a sandwich, please.", "Quero um sanduíche, por favor."), o: ["Quiero", "Quieres"], k: 0,
            e: t("Yo → quiero.", "I → quiero.", "Eu → quiero."),
            h: t("Tú pides para ti.", "You order for yourself.", "Você pede para você.") },
          { p: "¿___ una cerveza?", g: g("Would you like a beer?", "Você quer uma cerveja?"), o: ["Quieres", "Quiero"], k: 0,
            e: t("Pregunta a tú → ¿quieres?", "You ask a friend → ¿quieres?", "Você pergunta a um amigo → ¿quieres?"),
            h: t("Es una pregunta.", "It's a question.", "É uma pergunta.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Quiero ___ cerveza.", g: g("I'd like a beer.", "Quero uma cerveja."), k: ["una"],
            e: t("una cerveza.", "una cerveza.", "una cerveza."),
            h: t("u _ _", "u _ _", "u _ _") },
          { p: "Quiero ___ café.", g: g("I'd like a coffee.", "Quero um café."), k: ["un"],
            e: t("un café.", "un café.", "un café."),
            h: t("u _", "u _", "u _") },
          { p: "¿___ un té? (do you want)", g: g("Would you like a tea?", "Você quer um chá?"), k: ["quieres"],
            e: t("¿Quieres…? = la pregunta.", "¿Quieres…? = Do you want…?", "¿Quieres…? = Você quer…?"),
            h: t("q _ _ _ _ _ s", "q _ _ _ _ _ s", "q _ _ _ _ _ s") },
          { p: "___ un jugo, por favor. (I want)", g: g("I'd like a juice, please.", "Quero um suco, por favor."), k: ["quiero"],
            e: t("Quiero = yo.", "Quiero = I want.", "Quiero = eu quero."),
            h: t("q _ _ _ _ o", "q _ _ _ _ o", "q _ _ _ _ o") },
          { p: "La ___, por favor. (the bill)", g: g("The bill, please.", "A conta, por favor."), k: ["cuenta"],
            e: t("La cuenta, por favor.", "la cuenta = the bill.", "la cuenta = a conta."),
            h: t("c _ _ _ _ a", "c _ _ _ _ a", "c _ _ _ _ a") },
          { p: "Quiero un café ___ una arepa. (and)", g: g("I'd like a coffee and an arepa.", "Quero um café e uma arepa."), k: ["y"],
            e: t("y = and.", "y = and.", "y = e."),
            h: t("Una letra.", "One letter.", "Uma letra.") },
          { p: "Un café, ___ favor.", g: g("A coffee, please.", "Um café, por favor."), k: ["por"],
            e: t("por favor.", "por favor = please.", "por favor."),
            h: t("p _ r", "p _ r", "p _ r") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena el pedido.", "Put the order in the right order.", "Coloque o pedido em ordem."),
        items: [
          { k: "Quiero un café, por favor.", g: g("I'd like a coffee, please.", "Quero um café, por favor."),
            e: t("Quiero + un café + por favor.", "Quiero + un café + por favor.", "Quiero + un café + por favor."),
            h: t("Empieza con Quiero.", "Start with Quiero.", "Comece com Quiero.") },
          { k: "¿Quieres una cerveza?", g: g("Would you like a beer?", "Você quer uma cerveja?"),
            e: t("¿Quieres + una cerveza?", "¿Quieres + una cerveza?", "¿Quieres + una cerveza?"),
            h: t("Empieza con ¿Quieres.", "Start with ¿Quieres.", "Comece com ¿Quieres.") },
          { k: "Un jugo y una arepa, por favor.", g: g("A juice and an arepa, please.", "Um suco e uma arepa, por favor."),
            e: t("Un jugo + y + una arepa + por favor.", "Un jugo + y + una arepa + por favor.", "Un jugo + y + una arepa + por favor."),
            h: t("Empieza con Un.", "Start with Un.", "Comece com Un.") },
          { k: "La cuenta, por favor.", g: g("The bill, please.", "A conta, por favor."),
            e: t("La cuenta + por favor.", "La cuenta + por favor.", "La cuenta + por favor."),
            h: t("Empieza con La.", "Start with La.", "Comece com La.") },
          { k: "Quiero agua, por favor.", g: g("I'd like some water, please.", "Quero água, por favor."),
            e: t("Quiero agua: sin un ni una.", "Quiero agua (no un / una here).", "Quiero agua (sem un / una)."),
            h: t("Empieza con Quiero.", "Start with Quiero.", "Comece com Quiero.") },
          { k: "Quiero un té y un sándwich.", g: g("I'd like a tea and a sandwich.", "Quero um chá e um sanduíche."),
            e: t("Quiero + un té + y + un sándwich.", "Quiero + un té + y + un sándwich.", "Quiero + un té + y + un sándwich."),
            h: t("Empieza con Quiero.", "Start with Quiero.", "Comece com Quiero.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Haz el pedido con Quiero… y un / una.", "Place the order: Quiero… + un / una.", "Faça o pedido: Quiero… + un / una."),
        items: [
          { p: "café + tortilla", k: ["Quiero un café y una tortilla.", "Quiero un café y una tortilla, por favor.", "Un café y una tortilla, por favor."],
            e: t("Quiero un café y una tortilla.", "Quiero un café y una tortilla.", "Quiero un café y una tortilla."),
            h: t("café → un, tortilla → una.", "café → un, tortilla → una.", "café → un, tortilla → una.") },
          { p: "jugo + arepa", k: ["Quiero un jugo y una arepa.", "Quiero un jugo y una arepa, por favor.", "Un jugo y una arepa, por favor."],
            e: t("Quiero un jugo y una arepa.", "Quiero un jugo y una arepa.", "Quiero un jugo y una arepa."),
            h: t("jugo → un, arepa → una.", "jugo → un, arepa → una.", "jugo → un, arepa → una.") },
          { p: "cerveza + sándwich", k: ["Quiero una cerveza y un sándwich.", "Quiero una cerveza y un sándwich, por favor.", "Una cerveza y un sándwich, por favor."],
            e: t("Quiero una cerveza y un sándwich.", "Quiero una cerveza y un sándwich.", "Quiero una cerveza y un sándwich."),
            h: t("cerveza → una.", "cerveza → una.", "cerveza → una.") },
          { p: "té + tortilla", k: ["Quiero un té y una tortilla.", "Quiero un té y una tortilla, por favor.", "Un té y una tortilla, por favor."],
            e: t("Quiero un té y una tortilla.", "Quiero un té y una tortilla.", "Quiero un té y una tortilla."),
            h: t("té → un.", "té → un.", "té → un.") },
          { p: "café + agua", k: ["Quiero un café y agua.", "Quiero un café y agua, por favor.", "Un café y agua, por favor."],
            e: t("agua va sin un / una.", "agua: no un / una.", "agua: sem un / una."),
            h: t("Solo café lleva un.", "Only café takes un.", "Só café leva un.") },
          { p: "jugo + sándwich", k: ["Quiero un jugo y un sándwich.", "Quiero un jugo y un sándwich, por favor.", "Un jugo y un sándwich, por favor."],
            e: t("Quiero un jugo y un sándwich.", "Quiero un jugo y un sándwich.", "Quiero un jugo y un sándwich."),
            h: t("Los dos con un.", "Both take un.", "Os dois levam un.") }
        ]
      }
    ],
    reto: {
      consigna: t("Estás en un café en Bogotá. Escribe tu pedido.", "You're in a café in Bogotá. Write your order.", "Você está num café em Bogotá. Escreva seu pedido."),
      ruta: ["Hola, quiero…", "… y …, por favor.", "La cuenta, por favor."],
      lista: [
        t("Pides dos cosas con un o una.", "You order two things with un or una.", "Você pede duas coisas com un ou una."),
        t("Usas por favor.", "You use por favor.", "Você usa por favor.")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
