/* Práctica autónoma · A1 · Misión Cohete (niños, apoyo en inglés)
   Tema y gramática del catálogo: misión espacial con números y colores (cuenta atrás) */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-mision-cohete"] = {
    tematica: "numeros",
    objetivo: t("Contar hacia atrás y decir de qué color es", "Count down and say what colour something is", "Fazer a contagem regressiva e dizer de que cor é"),
    repaso: [
      t("diez, nueve, ocho, siete, seis, cinco, cuatro, tres, dos, uno", "ten, nine, eight, seven, six, five, four, three, two, one", "dez, nove, oito, sete, seis, cinco, quatro, três, dois, um"),
      t("¿De qué color es el cohete? — Es rojo.", "What colour is the rocket? — It's red.", "De que cor é o foguete? — É vermelho."),
      t("¿Cuántos cohetes hay? — Hay tres cohetes.", "How many rockets are there? — There are three rockets.", "Quantos foguetes há? — Há três foguetes."),
      t("Hay dos cohetes azules.", "There are two blue rockets.", "Há dois foguetes azuis.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada color.", "Match each colour.", "Ligue cada cor."),
        pares: [
          ["rojo", t("rojo", "red", "vermelho")],
          ["azul", t("azul", "blue", "azul")],
          ["verde", t("verde", "green", "verde")],
          ["amarillo", t("amarillo", "yellow", "amarelo")],
          ["blanco", t("blanco", "white", "branco")],
          ["negro", t("negro", "black", "preto")],
          ["morado", t("morado", "purple", "roxo")],
          ["naranja", t("naranja", "orange", "laranja")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Cuenta atrás: toca la respuesta.", "Countdown! Tap the answer.", "Contagem regressiva! Toque a resposta."),
        items: [
          { p: "diez, nueve, ___", o: ["ocho", "siete"], k: 0,
            e: t("10, 9, 8: ocho.", "10, 9, 8 → ocho.", "10, 9, 8 → ocho."),
            h: t("Es el 8.", "It's 8.", "É o 8.") },
          { p: "cinco, cuatro, ___", o: ["dos", "tres"], k: 1,
            e: t("5, 4, 3: tres.", "5, 4, 3 → tres.", "5, 4, 3 → tres."),
            h: t("Es el 3.", "It's 3.", "É o 3.") },
          { p: "siete, ___, cinco", o: ["seis", "ocho"], k: 0,
            e: t("7, 6, 5: seis.", "7, 6, 5 → seis.", "7, 6, 5 → seis."),
            h: t("Va en el medio.", "It goes in the middle.", "Fica no meio.") },
          { p: "3 + 2 = ___", o: ["cuatro", "cinco"], k: 1,
            e: t("3 + 2 = 5 = cinco.", "3 + 2 = 5 = cinco.", "3 + 2 = 5 = cinco."),
            h: t("Cuenta con los dedos.", "Count on your fingers.", "Conte nos dedos.") },
          { p: "Hay ___ cohetes. (6)", g: g("There are six rockets.", "Há seis foguetes."), o: ["seis", "siete"], k: 0,
            e: t("6 = seis.", "6 = seis.", "6 = seis."),
            h: t("Es el 6.", "It's 6.", "É o 6.") },
          { p: "Hay dos cohetes ___.", g: g("There are two red rockets.", "Há dois foguetes vermelhos."), o: ["rojo", "rojos"], k: 1,
            e: t("Dos cohetes → rojos.", "Two rockets → rojos (-s).", "Dois foguetes → rojos (-s)."),
            h: t("Más de uno: -s.", "More than one: -s.", "Mais de um: -s.") },
          { p: "¿De qué ___ es el cohete?", g: g("What colour is the rocket?", "De que cor é o foguete?"), o: ["color", "número"], k: 0,
            e: t("¿De qué color es? = la pregunta del color.", "¿De qué color es? = What colour is it?", "¿De qué color es? = De que cor é?"),
            h: t("Preguntas por el rojo, el azul…", "You ask about red, blue…", "Você pergunta sobre vermelho, azul…") },
          { p: "¿___ cohetes hay? — Hay cuatro.", g: g("How many rockets are there? — Four.", "Quantos foguetes há? — Quatro."), o: ["Cuántos", "De qué color"], k: 0,
            e: t("Número → ¿Cuántos…?", "A number → ¿Cuántos…?", "Um número → ¿Cuántos…?"),
            h: t("La respuesta es un número.", "The answer is a number.", "A resposta é um número.") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "El cohete es azul.", g: g("The rocket is blue.", "O foguete é azul."),
            e: t("El cohete + es + color.", "El cohete + es + colour.", "El cohete + es + cor."),
            h: t("Empieza con El.", "Start with El.", "Comece com El.") },
          { k: "¿De qué color es el cohete?", g: g("What colour is the rocket?", "De que cor é o foguete?"),
            e: t("¿De qué color + es + el cohete?", "¿De qué color + es + el cohete?", "¿De qué color + es + el cohete?"),
            h: t("Empieza con ¿De.", "Start with ¿De.", "Comece com ¿De.") },
          { k: "Hay cuatro cohetes verdes.", g: g("There are four green rockets.", "Há quatro foguetes verdes."),
            e: t("Hay + número + cohetes + color.", "Hay + number + cohetes + colour.", "Hay + número + cohetes + cor."),
            h: t("Empieza con Hay.", "Start with Hay.", "Comece com Hay.") },
          { k: "¿Cuántos cohetes hay?", g: g("How many rockets are there?", "Quantos foguetes há?"),
            e: t("¿Cuántos + cohetes + hay?", "¿Cuántos + cohetes + hay?", "¿Cuántos + cohetes + hay?"),
            h: t("Empieza con ¿Cuántos.", "Start with ¿Cuántos.", "Comece com ¿Cuántos.") },
          { k: "Hay un cohete blanco.", g: g("There is one white rocket.", "Há um foguete branco."),
            e: t("Uno → un cohete blanco.", "One → un cohete blanco.", "Um → un cohete blanco."),
            h: t("Empieza con Hay.", "Start with Hay.", "Comece com Hay.") },
          { k: "seis, cinco, cuatro, tres", g: g("six, five, four, three", "seis, cinco, quatro, três"),
            e: t("6, 5, 4, 3.", "6, 5, 4, 3.", "6, 5, 4, 3."),
            h: t("Del más grande al más pequeño.", "From big to small.", "Do maior para o menor.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el número o el color.", "Write the number or the colour.", "Escreva o número ou a cor."),
        items: [
          { p: "diez, nueve, ocho, ___", k: ["siete"],
            e: t("7 = siete.", "7 = siete.", "7 = siete."),
            h: t("s _ _ _ e", "s _ _ _ e", "s _ _ _ e") },
          { p: "Hay ___ cohetes. (5)", g: g("There are five rockets.", "Há cinco foguetes."), k: ["cinco"],
            e: t("5 = cinco.", "5 = cinco.", "5 = cinco."),
            h: t("c _ _ _ o", "c _ _ _ o", "c _ _ _ o") },
          { p: "uno, dos, ___", k: ["tres"],
            e: t("3 = tres.", "3 = tres.", "3 = tres."),
            h: t("t _ _ s", "t _ _ s", "t _ _ s") },
          { p: "Hay dos cohetes ___. (verde)", g: g("There are two green rockets.", "Há dois foguetes verdes."), k: ["verdes"],
            e: t("Dos → verdes.", "Two → verdes (-s).", "Dois → verdes (-s)."),
            h: t("verde + s.", "verde + s.", "verde + s.") },
          { p: "El cohete es ___. (amarillo)", g: g("The rocket is yellow.", "O foguete é amarelo."), k: ["amarillo"],
            e: t("Un cohete → amarillo.", "One rocket → amarillo.", "Um foguete → amarillo."),
            h: t("a _ _ _ _ _ _ o", "a _ _ _ _ _ _ o", "a _ _ _ _ _ _ o") },
          { p: "Hay tres cohetes ___. (blanco)", g: g("There are three white rockets.", "Há três foguetes brancos."), k: ["blancos"],
            e: t("Tres → blancos.", "Three → blancos (-s).", "Três → blancos (-s)."),
            h: t("blanco + s.", "blanco + s.", "blanco + s.") },
          { p: "Hay ___ cohetes. (10)", g: g("There are ten rockets.", "Há dez foguetes."), k: ["diez"],
            e: t("10 = diez.", "10 = diez.", "10 = diez."),
            h: t("d _ _ z", "d _ _ z", "d _ _ z") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Responde con una frase.", "Answer with a sentence.", "Responda com uma frase."),
        items: [
          { p: "¿De qué color es el cohete? (azul)", k: ["Es azul.", "El cohete es azul."],
            e: t("Es azul.", "Es azul. = It's blue.", "Es azul. = É azul."),
            h: t("Empieza con Es.", "Start with Es.", "Comece com Es.") },
          { p: "¿Cuántos cohetes hay? (4)", k: ["Hay cuatro cohetes.", "Hay cuatro."],
            e: t("Hay cuatro cohetes.", "Hay cuatro cohetes.", "Hay cuatro cohetes."),
            h: t("Empieza con Hay.", "Start with Hay.", "Comece com Hay.") },
          { p: "¿De qué color es el cohete? (negro)", k: ["Es negro.", "El cohete es negro."],
            e: t("Es negro.", "Es negro.", "Es negro."),
            h: t("Empieza con Es.", "Start with Es.", "Comece com Es.") },
          { p: "¿Cuántos cohetes hay? (8)", k: ["Hay ocho cohetes.", "Hay ocho."],
            e: t("Hay ocho cohetes.", "Hay ocho cohetes.", "Hay ocho cohetes."),
            h: t("8 = ocho.", "8 = ocho.", "8 = ocho.") },
          { p: "¿De qué color es el cohete? (morado)", k: ["Es morado.", "El cohete es morado."],
            e: t("Es morado.", "Es morado.", "Es morado."),
            h: t("Empieza con Es.", "Start with Es.", "Comece com Es.") },
          { p: "¿Cuántos cohetes rojos hay? (9)", k: ["Hay nueve cohetes rojos.", "Hay nueve."],
            e: t("Hay nueve cohetes rojos.", "Hay nueve cohetes rojos.", "Hay nueve cohetes rojos."),
            h: t("9 = nueve.", "9 = nueve.", "9 = nueve.") }
        ]
      }
    ],
    reto: {
      consigna: t("Dibuja tu cohete. Escribe una frase: el color o cuántos hay.", "Draw your rocket. Write one sentence: its colour or how many.", "Desenhe seu foguete. Escreva uma frase: a cor ou quantos há."),
      ruta: ["Mi cohete es…", "Hay … cohetes."],
      lista: [
        t("Tiene un color o un número.", "It has a colour or a number.", "Tem uma cor ou um número."),
        t("Empieza con mayúscula y termina con punto.", "It starts with a capital letter and ends with a full stop.", "Começa com letra maiúscula e termina com ponto.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
