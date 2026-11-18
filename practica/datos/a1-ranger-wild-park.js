/* Práctica autónoma · A1 · Ranger · Wild Park (niños, apoyo en inglés)
   Tema y gramática del catálogo: animales del parque (¿Qué es? Es un / una…, ¿Qué hace? corre, nada, salta, vuela) */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-ranger-wild-park"] = {
    tematica: "animales",
    objetivo: t("Decir qué animal es y qué hace", "Say what animal it is and what it does", "Dizer que animal é e o que ele faz"),
    repaso: [
      t("¿Qué es? — Es un león.", "What is it? — It's a lion.", "O que é? — É um leão."),
      t("Es una serpiente. Es verde.", "It's a snake. It's green.", "É uma cobra. É verde."),
      t("¿Qué hace? — Corre.", "What does it do? — It runs.", "O que ele faz? — Corre."),
      t("El pato nada y vuela.", "The duck swims and flies.", "O pato nada e voa."),
      t("¡Corre como un lobo!", "Run like a wolf!", "Corra como um lobo!")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada animal.", "Match each animal.", "Ligue cada animal."),
        pares: [
          ["el elefante", t("el elefante", "elephant", "o elefante")],
          ["el gorila", t("el gorila", "gorilla", "o gorila")],
          ["el león", t("el león", "lion", "o leão")],
          ["el lobo", t("el lobo", "wolf", "o lobo")],
          ["el oso", t("el oso", "bear", "o urso")],
          ["el pato", t("el pato", "duck", "o pato")],
          ["el pez", t("el pez", "fish", "o peixe")],
          ["la serpiente", t("la serpiente", "snake", "a cobra")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Ficha del ranger: toca la palabra.", "Ranger card: tap the word.", "Ficha do guarda: toque a palavra."),
        items: [
          { p: "Es ___ león.", g: g("It's a lion.", "É um leão."), o: ["un", "una"], k: 0,
            e: t("el león → un león.", "el león → un león.", "el león → un león."),
            h: t("Es el león.", "It's el león.", "É el león.") },
          { p: "Es ___ serpiente.", g: g("It's a snake.", "É uma cobra."), o: ["un", "una"], k: 1,
            e: t("la serpiente → una serpiente.", "la serpiente → una serpiente.", "la serpiente → una serpiente."),
            h: t("Es la serpiente.", "It's la serpiente.", "É la serpiente.") },
          { p: "El elefante ___.", g: g("The elephant runs.", "O elefante corre."), o: ["corre", "vuela"], k: 0,
            e: t("El elefante corre. ¡No vuela!", "Elephants run. They don't fly!", "O elefante corre. Não voa!"),
            h: t("¿Tiene alas?", "Has it got wings?", "Ele tem asas?") },
          { p: "El pez ___.", g: g("The fish swims.", "O peixe nada."), o: ["nada", "corre"], k: 0,
            e: t("El pez nada.", "Fish swim → nada.", "Peixe nada → nada."),
            h: t("Vive en el agua.", "It lives in water.", "Vive na água.") },
          { p: "¿Qué ___? — Es un oso.", g: g("What is it? — It's a bear.", "O que é? — É um urso."), o: ["es", "hace"], k: 0,
            e: t("¿Qué es? → Es un…", "¿Qué es? = What is it?", "¿Qué es? = O que é?"),
            h: t("La respuesta dice el animal.", "The answer names the animal.", "A resposta diz o animal.") },
          { p: "¿Qué ___ el pato? — Vuela.", g: g("What does the duck do? — It flies.", "O que o pato faz? — Voa."), o: ["hace", "es"], k: 0,
            e: t("¿Qué hace? → corre, nada, salta, vuela.", "¿Qué hace? = What does it do?", "¿Qué hace? = O que ele faz?"),
            h: t("La respuesta es una acción.", "The answer is an action.", "A resposta é uma ação.") },
          { p: "Es ___ gorila.", g: g("It's a gorilla.", "É um gorila."), o: ["un", "una"], k: 0,
            e: t("el gorila → un gorila.", "el gorila → un gorila (even with -a!).", "el gorila → un gorila (mesmo com -a!)."),
            h: t("Es el gorila.", "It's el gorila.", "É el gorila.") },
          { p: "El pato ___ y vuela.", g: g("The duck swims and flies.", "O pato nada e voa."), o: ["nada", "es"], k: 0,
            e: t("El pato nada y vuela.", "The duck swims and flies.", "O pato nada e voa."),
            h: t("Dos acciones.", "Two actions.", "Duas ações.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Es ___ serpiente.", g: g("It's a snake.", "É uma cobra."), k: ["una"],
            e: t("la serpiente → una.", "la serpiente → una.", "la serpiente → una."),
            h: t("u _ _", "u _ _", "u _ _") },
          { p: "Es ___ oso.", g: g("It's a bear.", "É um urso."), k: ["un"],
            e: t("el oso → un.", "el oso → un.", "el oso → un."),
            h: t("u _", "u _", "u _") },
          { p: "El pez ___. (swims)", g: g("The fish swims.", "O peixe nada."), k: ["nada"],
            e: t("nada = swims.", "nada = swims.", "nada = nada!"),
            h: t("n _ _ a", "n _ _ a", "n _ _ a") },
          { p: "El lobo ___. (runs)", g: g("The wolf runs.", "O lobo corre."), k: ["corre"],
            e: t("corre = runs.", "corre = runs.", "corre = corre!"),
            h: t("c _ _ _ e", "c _ _ _ e", "c _ _ _ e") },
          { p: "El pato ___. (flies)", g: g("The duck flies.", "O pato voa."), k: ["vuela"],
            e: t("vuela = flies.", "vuela = flies.", "vuela = voa."),
            h: t("v _ _ _ a", "v _ _ _ a", "v _ _ _ a") },
          { p: "¿Qué ___ el gorila? — Salta.", g: g("What does the gorilla do? — It jumps.", "O que o gorila faz? — Pula."), k: ["hace"],
            e: t("¿Qué hace…?", "¿Qué hace…? = What does it do?", "¿Qué hace…? = O que faz?"),
            h: t("h _ _ e", "h _ _ e", "h _ _ e") },
          { p: "¡___ como un gorila! (jump)", g: g("Jump like a gorilla!", "Pule como um gorila!"), k: ["salta"],
            e: t("¡Salta! = jump!", "¡Salta! = Jump!", "¡Salta! = Pule!"),
            h: t("s _ _ _ a", "s _ _ _ a", "s _ _ _ a") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("¿Qué es? Escribe la respuesta con un o una.", "What is it? Write the answer with un or una.", "O que é? Escreva a resposta com un ou una."),
        items: [
          { p: "el león", k: ["Es un león."],
            e: t("el → un: Es un león.", "el → un: Es un león.", "el → un: Es un león."),
            h: t("Empieza con Es.", "Start with Es.", "Comece com Es.") },
          { p: "la serpiente", k: ["Es una serpiente."],
            e: t("la → una: Es una serpiente.", "la → una: Es una serpiente.", "la → una: Es una serpiente."),
            h: t("la → una.", "la → una.", "la → una.") },
          { p: "el pato", k: ["Es un pato."],
            e: t("Es un pato.", "Es un pato.", "Es un pato."),
            h: t("el → un.", "el → un.", "el → un.") },
          { p: "el gorila", k: ["Es un gorila."],
            e: t("el gorila → un gorila.", "el gorila → un gorila.", "el gorila → un gorila."),
            h: t("Mira: el.", "Look: el.", "Olhe: el.") },
          { p: "el elefante", k: ["Es un elefante."],
            e: t("Es un elefante.", "Es un elefante.", "Es un elefante."),
            h: t("el → un.", "el → un.", "el → un.") },
          { p: "el pez", k: ["Es un pez."],
            e: t("Es un pez.", "Es un pez.", "Es un pez."),
            h: t("el → un.", "el → un.", "el → un.") }
        ]
      }
    ],
    reto: {
      consigna: t("Tu animal favorito: escribe una o dos frases.", "Your favourite animal: write one or two sentences.", "Seu animal favorito: escreva uma ou duas frases."),
      ruta: ["Mi animal favorito es…", "Es un… / Es una…", "Corre. / Nada. / Salta. / Vuela."],
      lista: [
        t("Dice el animal con un o una.", "It names the animal with un or una.", "Diz o animal com un ou una."),
        t("Dice qué hace.", "It says what it does.", "Diz o que ele faz.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
