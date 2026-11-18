/* Práctica autónoma · A1 · ¿Te queda bien? (adultos, apoyo en portugués)
   Tema y gramática del catálogo: comprar ropa: tallas, colores y ¿Te queda bien? */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-te-queda-bien"] = {
    tematica: "compras",
    objetivo: t("Comprar ropa: pedir talla y color y decir cómo te queda", "Buy clothes: ask for a size and colour and say how it fits", "Comprar roupa: pedir tamanho e cor e dizer como fica"),
    repaso: [
      t("Busco una camisa azul.", "I'm looking for a blue shirt.", "Procuro uma camisa azul."),
      t("¿Qué talla? — Talla M.", "What size? — Size M.", "Que tamanho? — Tamanho M."),
      t("¿Te queda bien? — Sí, me queda bien.", "Does it fit you? — Yes, it fits.", "Fica bem em você? — Sim, fica bem."),
      t("No, me queda grande. Quiero la talla S.", "No, it's too big. I want size S.", "Não, fica grande. Quero o tamanho P."),
      t("Los pantalones negros, por favor.", "The black trousers, please.", "A calça preta, por favor.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada palabra con su significado.", "Match each word with its meaning.", "Ligue cada palavra ao seu significado."),
        pares: [
          ["la camisa", t("la camisa", "shirt", "a camisa")],
          ["la camiseta", t("la camiseta", "T-shirt", "a camiseta")],
          ["el vestido", t("el vestido", "dress", "o vestido")],
          ["la falda", t("la falda", "skirt", "a saia")],
          ["los pantalones", t("los pantalones", "trousers", "a calça")],
          ["la chaqueta", t("la chaqueta", "jacket", "a jaqueta")],
          ["me queda bien", t("es de mi talla", "it fits me", "fica bem em mim")],
          ["me queda grande", t("no es de mi talla", "it's too big for me", "fica grande em mim")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Elige la forma en español.", "Choose the Spanish form.", "Escolha a forma em espanhol (cuidado com o portunhol)."),
        items: [
          { p: "¿Te ___ bien?", g: g("Does it fit you?", "Fica bem em você?"), o: ["queda", "fica"], k: 0,
            e: t("En español: ¿Te queda bien?", "In Spanish: ¿Te queda bien?", "«Fica» é português; em espanhol: ¿Te queda bien?"),
            h: t("q _ _ _ a", "q _ _ _ a", "q _ _ _ a") },
          { p: "La falda me queda ___.", g: g("The skirt is too small for me.", "A saia fica pequena em mim."), o: ["pequeña", "pequeño"], k: 0,
            e: t("la falda → pequeña.", "la falda → pequeña.", "la falda → pequeña."),
            h: t("Mira: la.", "Look: la.", "Olhe: la.") },
          { p: "El vestido me queda ___.", g: g("The dress fits me well.", "O vestido fica bem em mim."), o: ["bien", "bueno"], k: 0,
            e: t("Me queda bien (no «bueno»).", "It fits → me queda bien (not «bueno»).", "Fica bem → me queda bien (não «bueno»)."),
            h: t("Como en la pregunta.", "Like in the question.", "Como na pergunta.") },
          { p: "Busco pantalones ___.", g: g("I'm looking for black trousers.", "Procuro uma calça preta."), o: ["negros", "negro"], k: 0,
            e: t("pantalones → negros.", "pantalones (plural) → negros.", "pantalones é plural → negros."),
            h: t("Termina en -s.", "It ends in -s.", "Termina em -s.") },
          { p: "Quiero una camisa ___.", g: g("I want a white shirt.", "Quero uma camisa branca."), o: ["blanca", "blanco"], k: 0,
            e: t("una camisa → blanca.", "una camisa → blanca.", "una camisa → blanca."),
            h: t("Mira: una.", "Look: una.", "Olhe: una.") },
          { p: "Me queda grande. Quiero la talla ___.", g: g("It's too big. I want size…", "Fica grande. Quero o tamanho…"), o: ["S", "L"], k: 0,
            e: t("Grande → una talla más pequeña.", "Too big → a smaller size: S.", "Grande → um tamanho menor: S."),
            h: t("Más pequeña.", "Smaller.", "Menor.") },
          { p: "Me queda pequeña. Quiero la talla ___.", g: g("It's too small. I want size…", "Fica pequena. Quero o tamanho…"), o: ["L", "S"], k: 0,
            e: t("Pequeña → una talla más grande.", "Too small → a bigger size: L.", "Pequena → um tamanho maior: L."),
            h: t("Más grande.", "Bigger.", "Maior.") },
          { p: "___ pantalones azules.", g: g("The blue trousers.", "A calça azul."), o: ["Los", "La"], k: 0,
            e: t("los pantalones: plural en español.", "In Spanish it's plural: los pantalones.", "Em português é «a calça»; em espanhol, plural: los pantalones."),
            h: t("Termina en -es.", "It ends in -es.", "Termina em -es.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "¿Te queda ___?", g: g("Does it fit you?", "Fica bem em você?"), k: ["bien"],
            e: t("¿Te queda bien?", "¿Te queda bien?", "¿Te queda bien?"),
            h: t("b _ _ n", "b _ _ n", "b _ _ n") },
          { p: "No, me ___ grande.", g: g("No, it's too big for me.", "Não, fica grande em mim."), k: ["queda"],
            e: t("me queda grande.", "me queda grande.", "me queda grande."),
            h: t("q _ _ _ a", "q _ _ _ a", "q _ _ _ a") },
          { p: "Busco una falda ___. (rojo)", g: g("I'm looking for a red skirt.", "Procuro uma saia vermelha."), k: ["roja"],
            e: t("una falda → roja.", "una falda → roja.", "una falda → roja."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Busco los pantalones ___. (azul)", g: g("I'm looking for the blue trousers.", "Procuro a calça azul."), k: ["azules"],
            e: t("azul → azules.", "azul + es → azules.", "azul + es → azules."),
            h: t("Termina en -es.", "It ends in -es.", "Termina em -es.") },
          { p: "La chaqueta me queda ___. (pequeño)", g: g("The jacket is too small for me.", "A jaqueta fica pequena em mim."), k: ["pequeña"],
            e: t("la chaqueta → pequeña.", "la chaqueta → pequeña.", "la chaqueta → pequeña."),
            h: t("Ojo con la ñ.", "Watch the ñ.", "Cuidado com o ñ.") },
          { p: "Quiero la ___ M.", g: g("I want size M.", "Quero o tamanho M."), k: ["talla"],
            e: t("la talla = el número de la ropa.", "la talla = the size.", "la talla = o tamanho."),
            h: t("t _ _ _ a", "t _ _ _ a", "t _ _ _ a") },
          { p: "Busco una ___ negra. (saia)", g: g("I'm looking for a black skirt.", "Procuro uma saia preta."), k: ["falda"],
            e: t("saia → falda.", "skirt → falda.", "saia → falda."),
            h: t("f _ _ _ a", "f _ _ _ a", "f _ _ _ a") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase del probador.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "¿Te queda bien la camisa?", g: g("Does the shirt fit you?", "A camisa fica bem em você?"),
            e: t("¿Te queda bien + la camisa?", "¿Te queda bien + la camisa?", "¿Te queda bien + la camisa?"),
            h: t("Empieza con ¿Te.", "Start with ¿Te.", "Comece com ¿Te.") },
          { k: "Sí, me queda bien.", g: g("Yes, it fits me.", "Sim, fica bem em mim."),
            e: t("Sí, + me queda bien.", "Sí, + me queda bien.", "Sí, + me queda bien."),
            h: t("Empieza con Sí,", "Start with Sí,", "Comece com Sí,") },
          { k: "La falda me queda grande.", g: g("The skirt is too big for me.", "A saia fica grande em mim."),
            e: t("La falda + me queda + grande.", "La falda + me queda + grande.", "La falda + me queda + grande."),
            h: t("Empieza con La.", "Start with La.", "Comece com La.") },
          { k: "Busco una chaqueta negra.", g: g("I'm looking for a black jacket.", "Procuro uma jaqueta preta."),
            e: t("El color va después.", "The colour goes after.", "A cor vem depois."),
            h: t("Empieza con Busco.", "Start with Busco.", "Comece com Busco.") },
          { k: "Quiero la talla M, por favor.", g: g("I want size M, please.", "Quero o tamanho M, por favor."),
            e: t("Quiero + la talla M + por favor.", "Quiero + la talla M + por favor.", "Quiero + la talla M + por favor."),
            h: t("Empieza con Quiero.", "Start with Quiero.", "Comece com Quiero.") },
          { k: "Busco pantalones azules.", g: g("I'm looking for blue trousers.", "Procuro uma calça azul."),
            e: t("Busco + pantalones + azules.", "Busco + pantalones + azules.", "Busco + pantalones + azules."),
            h: t("Empieza con Busco.", "Start with Busco.", "Comece com Busco.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Cambia la prenda y escribe la frase. Ojo con el color y la talla.", "Change the item and rewrite the sentence. Watch the endings.", "Mude a peça e reescreva a frase. Cuidado com os finais."),
        items: [
          { p: "El vestido me queda pequeño. (la falda)", k: ["La falda me queda pequeña."],
            e: t("la falda → pequeña.", "la falda → pequeña.", "la falda → pequeña."),
            h: t("-o → -a.", "-o → -a.", "-o → -a.") },
          { p: "La camisa es blanca. (el vestido)", k: ["El vestido es blanco."],
            e: t("el vestido → blanco.", "el vestido → blanco.", "el vestido → blanco."),
            h: t("-a → -o.", "-a → -o.", "-a → -o.") },
          { p: "Busco una chaqueta roja. (pantalones)", k: ["Busco pantalones rojos.", "Busco unos pantalones rojos.", "Busco los pantalones rojos."],
            e: t("pantalones → rojos.", "pantalones → rojos.", "pantalones → rojos."),
            h: t("Plural: -os.", "Plural: -os.", "Plural: -os.") },
          { p: "La camiseta me queda grande. (el vestido)", k: ["El vestido me queda grande."],
            e: t("grande no cambia.", "grande doesn't change.", "grande não muda."),
            h: t("Solo cambia la prenda.", "Only the item changes.", "Só muda a peça.") },
          { p: "Busco un vestido negro. (una camisa)", k: ["Busco una camisa negra."],
            e: t("una camisa → negra.", "una camisa → negra.", "una camisa → negra."),
            h: t("-o → -a.", "-o → -a.", "-o → -a.") },
          { p: "La falda me queda pequeña. (el vestido)", k: ["El vestido me queda pequeño."],
            e: t("el vestido → pequeño.", "el vestido → pequeño.", "el vestido → pequeño."),
            h: t("-a → -o.", "-a → -o.", "-a → -o.") }
        ]
      }
    ],
    reto: {
      consigna: t("Estás en el probador. Escribe dos o tres frases.", "You're in the fitting room. Write two or three sentences.", "Você está no provador. Escreva duas ou três frases."),
      ruta: ["Busco…", "¿Te queda bien?", "Me queda… Quiero la talla…"],
      lista: [
        t("Una prenda con su color.", "One item with its colour.", "Uma peça com a cor."),
        t("Dices cómo te queda.", "You say how it fits.", "Você diz como fica.")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
