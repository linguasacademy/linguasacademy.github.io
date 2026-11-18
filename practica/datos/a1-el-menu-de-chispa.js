/* Práctica autónoma · A1 · El menú de Chispa (niños, apoyo en inglés)
   Tema y gramática del catálogo: la comida, Me gusta / No me gusta, ¿Te gusta…? */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-el-menu-de-chispa"] = {
    tematica: "comida",
    objetivo: t("Decir qué comida te gusta y preguntar «¿Te gusta…?»", "Say what food you like and ask «¿Te gusta…?»", "Dizer que comida você gosta e perguntar «¿Te gusta…?»"),
    repaso: [
      t("Me gusta el helado.", "I like ice cream.", "Eu gosto de sorvete."),
      t("No me gusta la sopa.", "I don't like soup.", "Eu não gosto de sopa."),
      t("¿Te gusta el pollo?", "Do you like chicken?", "Você gosta de frango?"),
      t("Sí, me gusta. / No, no me gusta.", "Yes, I do. / No, I don't.", "Sim, gosto. / Não, não gosto."),
      t("Me gusta el pollo con arroz. ¿Y tú?", "I like chicken with rice. And you?", "Eu gosto de frango com arroz. E você?")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada comida con su pareja.", "Match each food.", "Ligue cada comida ao seu par."),
        pares: [
          ["el pollo", t("el pollo", "chicken", "o frango")],
          ["el arroz", t("el arroz", "rice", "o arroz")],
          ["el queso", t("el queso", "cheese", "o queijo")],
          ["la manzana", t("la manzana", "apple", "a maçã")],
          ["el helado", t("el helado", "ice cream", "o sorvete")],
          ["la sopa", t("la sopa", "soup", "a sopa")],
          ["la pizza", t("la pizza", "pizza", "a pizza")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Ayuda a Chispa: toca la palabra que va.", "Help Chispa: tap the word that fits.", "Ajude a Chispa: toque a palavra certa."),
        items: [
          { p: "Me gusta ___ helado.", g: g("I like ice cream.", "Eu gosto de sorvete."), o: ["el", "la"], k: 0,
            e: t("el helado.", "We say el helado.", "Dizemos el helado."),
            h: t("helado termina en -o.", "helado ends in -o.", "helado termina em -o.") },
          { p: "Me gusta ___ manzana.", g: g("I like apples.", "Eu gosto de maçã."), o: ["el", "la"], k: 1,
            e: t("la manzana.", "We say la manzana.", "Dizemos la manzana."),
            h: t("manzana termina en -a.", "manzana ends in -a.", "manzana termina em -a.") },
          { p: "___ gusta el pollo.", g: g("I like chicken.", "Eu gosto de frango."), o: ["Me", "Yo"], k: 0,
            e: t("Se dice «Me gusta».", "We say «Me gusta», not «Yo gusta».", "Dizemos «Me gusta», não «Yo gusta»."),
            h: t("Me gusta…", "Think: Me gusta…", "Pense: Me gusta…") },
          { p: "¿Te gusta el queso? — ___, me gusta.", g: g("Do you like cheese? — Yes, I do.", "Você gosta de queijo? — Sim, gosto."), o: ["Sí", "No"], k: 0,
            e: t("Sí, me gusta.", "Sí (yes) goes with me gusta.", "Sí (sim) combina com me gusta."),
            h: t("No hay «no» en la frase.", "There is no «no» after it.", "Não tem «no» depois.") },
          { p: "¿Te gusta la sopa? — No, ___ me gusta.", g: g("Do you like soup? — No, I don't.", "Você gosta de sopa? — Não, não gosto."), o: ["no", "sí"], k: 0,
            e: t("No, no me gusta: dos veces «no».", "No, no me gusta: «no» two times!", "No, no me gusta: «no» duas vezes!"),
            h: t("Dos veces la misma palabra.", "The same word two times.", "A mesma palavra duas vezes.") },
          { p: "Me gusta el arroz. ¿Y ___?", g: g("I like rice. And you?", "Eu gosto de arroz. E você?"), o: ["tú", "yo"], k: 0,
            e: t("¿Y tú? = la pregunta para el otro.", "¿Y tú? = And you?", "¿Y tú? = E você?"),
            h: t("Le preguntas al otro.", "You ask the other person.", "Você pergunta para o outro.") },
          { p: "No me gusta ___ queso.", g: g("I don't like cheese.", "Eu não gosto de queijo."), o: ["el", "la"], k: 0,
            e: t("el queso.", "We say el queso.", "Dizemos el queso."),
            h: t("queso termina en -o.", "queso ends in -o.", "queso termina em -o.") },
          { p: "¿Te gusta ___ pizza?", g: g("Do you like pizza?", "Você gosta de pizza?"), o: ["el", "la"], k: 1,
            e: t("la pizza.", "We say la pizza.", "Dizemos la pizza."),
            h: t("pizza termina en -a.", "pizza ends in -a.", "pizza termina em -a.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Me ___ el helado.", g: g("I like ice cream.", "Eu gosto de sorvete."), k: ["gusta"],
            e: t("Me gusta.", "Me gusta = I like.", "Me gusta = eu gosto."),
            h: t("g _ _ _ a", "g _ _ _ a", "g _ _ _ a") },
          { p: "No me gusta ___ sopa.", g: g("I don't like soup.", "Eu não gosto de sopa."), k: ["la"],
            e: t("la sopa.", "la sopa.", "la sopa."),
            h: t("sopa termina en -a.", "sopa ends in -a.", "sopa termina em -a.") },
          { p: "¿Te gusta ___ pollo?", g: g("Do you like chicken?", "Você gosta de frango?"), k: ["el"],
            e: t("el pollo.", "el pollo.", "el pollo."),
            h: t("pollo termina en -o.", "pollo ends in -o.", "pollo termina em -o.") },
          { p: "¿___ gusta la manzana?", g: g("Do you like apples?", "Você gosta de maçã?"), k: ["te"],
            e: t("¿Te gusta…? es la pregunta.", "¿Te gusta…? = Do you like…?", "¿Te gusta…? = Você gosta…?"),
            h: t("t _", "t _", "t _") },
          { p: "¿Te gusta el queso? — Sí, me ___.", g: g("Do you like cheese? — Yes, I do.", "Você gosta de queijo? — Sim, gosto."), k: ["gusta"],
            e: t("Sí, me gusta.", "Sí, me gusta.", "Sí, me gusta."),
            h: t("g _ _ _ a", "g _ _ _ a", "g _ _ _ a") },
          { p: "¿Te gusta la sopa? — No, ___ me gusta.", g: g("Do you like soup? — No, I don't.", "Você gosta de sopa? — Não, não gosto."), k: ["no"],
            e: t("No, no me gusta.", "No, no me gusta: «no» two times.", "No, no me gusta: «no» duas vezes."),
            h: t("n _", "n _", "n _") },
          { p: "Me gusta el pollo con ___. (rice)", g: g("I like chicken with rice.", "Eu gosto de frango com arroz."), k: ["arroz", "el arroz"],
            e: t("el arroz = rice.", "arroz = rice.", "arroz = arroz!"),
            h: t("a _ _ _ z", "a _ _ _ z", "a _ _ _ z") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Chispa dice lo contrario. Escribe la frase con NO.", "Chispa says the opposite! Write it with NO.", "A Chispa diz o contrário! Escreva com NO."),
        items: [
          { p: "Me gusta la sopa.", k: ["No me gusta la sopa."],
            e: t("No va primero: No me gusta…", "«No» goes first: No me gusta…", "«No» vem primeiro: No me gusta…"),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "Me gusta el queso.", k: ["No me gusta el queso."],
            e: t("No me gusta el queso.", "No me gusta el queso.", "No me gusta el queso."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "Me gusta la manzana.", k: ["No me gusta la manzana."],
            e: t("No me gusta la manzana.", "No me gusta la manzana.", "No me gusta la manzana."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "Sí, me gusta.", k: ["No, no me gusta."],
            e: t("Sí, me gusta → No, no me gusta.", "Sí, me gusta → No, no me gusta.", "Sí, me gusta → No, no me gusta."),
            h: t("Dos veces «no».", "«no» two times.", "«no» duas vezes.") },
          { p: "Me gusta el pollo.", k: ["No me gusta el pollo."],
            e: t("No me gusta el pollo.", "No me gusta el pollo.", "No me gusta el pollo."),
            h: t("Empieza con No.", "Start with No.", "Comece com No.") },
          { p: "Me gusta el arroz con pollo.", k: ["No me gusta el arroz con pollo."],
            e: t("No me gusta el arroz con pollo.", "No me gusta el arroz con pollo.", "No me gusta el arroz con pollo."),
            h: t("Solo añades No.", "Just add No.", "Só coloque No.") }
        ]
      }
    ],
    reto: {
      consigna: t("Tu menú: escribe una frase con una comida. Si quieres, otra con una pregunta.", "Your menu: write one sentence about a food. If you want, add a question.", "Seu cardápio: escreva uma frase sobre uma comida. Se quiser, faça uma pergunta."),
      ruta: ["Me gusta el…", "No me gusta la…", "¿Te gusta…?"],
      lista: [
        t("Dice Me gusta o No me gusta.", "It says Me gusta or No me gusta.", "Diz Me gusta ou No me gusta."),
        t("Tiene el o la antes de la comida.", "It has el or la before the food.", "Tem el ou la antes da comida.")
      ],
      min: 1, max: 3, unidad: "frases"
    }
  };
})();
