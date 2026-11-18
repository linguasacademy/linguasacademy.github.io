/* Práctica autónoma · A1 · Misión Wild Park: ¿Dónde está? (niños, apoyo en inglés)
   Tema y gramática del catálogo: animales y ¿Dónde está? (encima de, debajo de, detrás de, en) */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-mision-wild-park-donde-esta"] = {
    tematica: "animales",
    objetivo: t("Preguntar y decir dónde está un animal", "Ask and say where an animal is", "Perguntar e dizer onde está um animal"),
    repaso: [
      t("¿Dónde está el pato? — Está en el lago.", "Where is the duck? — It's in the lake.", "Onde está o pato? — Está no lago."),
      t("El oso está detrás del árbol.", "The bear is behind the tree.", "O urso está atrás da árvore."),
      t("La serpiente está debajo de la roca.", "The snake is under the rock.", "A cobra está debaixo da pedra."),
      t("El gorila está encima de la roca.", "The gorilla is on top of the rock.", "O gorila está em cima da pedra."),
      t("de + el = del: detrás del arbusto", "de + el = del: behind the bush", "de + el = del: atrás do arbusto")
    ],
    ejercicios: [
      {
        tipo: "elige",
        consigna: t("¿Dónde está? Toca la palabra.", "Where is it? Tap the word.", "Onde está? Toque a palavra."),
        items: [
          { p: "El pez está ___ el lago.", g: g("The fish is in the lake.", "O peixe está no lago."), o: ["en", "encima de"], k: 0,
            e: t("El pez está en el lago.", "The fish is IN the lake → en.", "O peixe está DENTRO do lago → en."),
            h: t("El pez nada.", "The fish swims.", "O peixe nada.") },
          { p: "¿Dónde ___ el oso?", g: g("Where is the bear?", "Onde está o urso?"), o: ["está", "es"], k: 0,
            e: t("¿Dónde está…? para el lugar.", "Places → está: ¿Dónde está…?", "Lugar → está: ¿Dónde está…?"),
            h: t("Pregunta del lugar.", "It's a «where» question.", "É uma pergunta de lugar.") },
          { p: "El león está detrás ___ árbol.", g: g("The lion is behind the tree.", "O leão está atrás da árvore."), o: ["del", "de el"], k: 0,
            e: t("de + el = del.", "de + el = del.", "de + el = del."),
            h: t("Dos palabras se juntan.", "Two words join together.", "Duas palavras se juntam.") },
          { p: "La serpiente está debajo de ___ roca.", g: g("The snake is under the rock.", "A cobra está debaixo da pedra."), o: ["la", "el"], k: 0,
            e: t("la roca.", "We say la roca.", "Dizemos la roca."),
            h: t("roca termina en -a.", "roca ends in -a.", "roca termina em -a.") },
          { p: "El gorila ___ encima del árbol.", g: g("The gorilla is on top of the tree.", "O gorila está em cima da árvore."), o: ["está", "es"], k: 0,
            e: t("Lugar → está.", "Place → está.", "Lugar → está."),
            h: t("¿Dónde? → está.", "Where? → está.", "Onde? → está.") },
          { p: "El lobo está detrás ___ arbusto.", g: g("The wolf is behind the bush.", "O lobo está atrás do arbusto."), o: ["del", "de la"], k: 0,
            e: t("el arbusto → del arbusto.", "el arbusto → del arbusto.", "el arbusto → del arbusto."),
            h: t("Es el arbusto.", "It's el arbusto.", "É el arbusto.") },
          { p: "¿___ está el pato?", g: g("Where is the duck?", "Onde está o pato?"), o: ["Dónde", "Qué"], k: 0,
            e: t("¿Dónde…? = el lugar.", "¿Dónde…? = Where…?", "¿Dónde…? = Onde…?"),
            h: t("Preguntas por un lugar.", "You ask about a place.", "Você pergunta um lugar.") },
          { p: "El elefante está ___ árbol.", g: g("The elephant is under the tree.", "O elefante está debaixo da árvore."), o: ["debajo del", "debajo de"], k: 0,
            e: t("debajo de + el = debajo del.", "debajo de + el → debajo del.", "debajo de + el → debajo del."),
            h: t("Después viene «el».", "«el» comes next.", "Depois vem «el».") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "¿Dónde está el oso?", g: g("Where is the bear?", "Onde está o urso?"),
            e: t("¿Dónde + está + animal?", "¿Dónde + está + animal?", "¿Dónde + está + animal?"),
            h: t("Empieza con ¿Dónde.", "Start with ¿Dónde.", "Comece com ¿Dónde.") },
          { k: "El pato está en el lago.", g: g("The duck is in the lake.", "O pato está no lago."),
            e: t("Animal + está + lugar.", "Animal + está + place.", "Animal + está + lugar."),
            h: t("Empieza con El pato.", "Start with El pato.", "Comece com El pato.") },
          { k: "El lobo está detrás del árbol.", g: g("The wolf is behind the tree.", "O lobo está atrás da árvore."),
            e: t("detrás del árbol.", "detrás del árbol.", "detrás del árbol."),
            h: t("Empieza con El lobo.", "Start with El lobo.", "Comece com El lobo.") },
          { k: "La serpiente está debajo de la roca.", g: g("The snake is under the rock.", "A cobra está debaixo da pedra."),
            e: t("debajo de la roca.", "debajo de la roca.", "debajo de la roca."),
            h: t("Empieza con La.", "Start with La.", "Comece com La.") },
          { k: "El gorila está encima de la roca.", g: g("The gorilla is on top of the rock.", "O gorila está em cima da pedra."),
            e: t("encima de la roca.", "encima de la roca.", "encima de la roca."),
            h: t("Empieza con El gorila.", "Start with El gorila.", "Comece com El gorila.") },
          { k: "El león está detrás del arbusto.", g: g("The lion is behind the bush.", "O leão está atrás do arbusto."),
            e: t("detrás del arbusto.", "detrás del arbusto.", "detrás del arbusto."),
            h: t("Empieza con El león.", "Start with El león.", "Comece com El león.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "El pato está ___ el lago.", g: g("The duck is in the lake.", "O pato está no lago."), k: ["en"],
            e: t("en el lago.", "en = in.", "en = em."),
            h: t("e _", "e _", "e _") },
          { p: "El oso está detrás ___ árbol.", g: g("The bear is behind the tree.", "O urso está atrás da árvore."), k: ["del"],
            e: t("de + el = del.", "de + el = del.", "de + el = del."),
            h: t("d _ _", "d _ _", "d _ _") },
          { p: "¿Dónde ___ la serpiente?", g: g("Where is the snake?", "Onde está a cobra?"), k: ["está"],
            e: t("¿Dónde está…?", "¿Dónde está…? Don't forget the accent: á.", "¿Dónde está…? Não esqueça o acento: á."),
            h: t("e _ _ á", "e _ _ á", "e _ _ á") },
          { p: "El lobo está ___ de la roca. (behind)", g: g("The wolf is behind the rock.", "O lobo está atrás da pedra."), k: ["detrás"],
            e: t("detrás de = behind.", "detrás de = behind.", "detrás de = atrás de."),
            h: t("d _ _ _ _ á s", "d _ _ _ _ á s", "d _ _ _ _ á s") },
          { p: "La serpiente está ___ de la roca. (under)", g: g("The snake is under the rock.", "A cobra está debaixo da pedra."), k: ["debajo"],
            e: t("debajo de = under.", "debajo de = under.", "debajo de = debaixo de."),
            h: t("d _ _ _ _ o", "d _ _ _ _ o", "d _ _ _ _ o") },
          { p: "El gorila está ___ del árbol. (on top of)", g: g("The gorilla is on top of the tree.", "O gorila está em cima da árvore."), k: ["encima"],
            e: t("encima de = on top of.", "encima de = on top of.", "encima de = em cima de."),
            h: t("e _ _ _ _ a", "e _ _ _ _ a", "e _ _ _ _ a") },
          { p: "El león está debajo ___ arbusto.", g: g("The lion is under the bush.", "O leão está debaixo do arbusto."), k: ["del"],
            e: t("de + el = del.", "de + el = del.", "de + el = del."),
            h: t("d _ _", "d _ _", "d _ _") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Responde: ¿dónde está?", "Answer: where is it?", "Responda: onde está?"),
        items: [
          { p: "¿Dónde está el pato? (en · el lago)", k: ["Está en el lago.", "El pato está en el lago."],
            e: t("Está en el lago.", "Está en el lago.", "Está en el lago."),
            h: t("Empieza con Está.", "Start with Está.", "Comece com Está.") },
          { p: "¿Dónde está el oso? (detrás de · el árbol)", k: ["Está detrás del árbol.", "El oso está detrás del árbol."],
            e: t("de + el = del: detrás del árbol.", "de + el = del: detrás del árbol.", "de + el = del: detrás del árbol."),
            h: t("Ojo con del.", "Watch out: del.", "Cuidado: del.") },
          { p: "¿Dónde está la serpiente? (debajo de · la roca)", k: ["Está debajo de la roca.", "La serpiente está debajo de la roca."],
            e: t("debajo de la roca.", "debajo de la roca.", "debajo de la roca."),
            h: t("Con la no cambia.", "With la, nothing joins.", "Com la, nada se junta.") },
          { p: "¿Dónde está el gorila? (encima de · el árbol)", k: ["Está encima del árbol.", "El gorila está encima del árbol."],
            e: t("encima del árbol.", "encima del árbol.", "encima del árbol."),
            h: t("Ojo con del.", "Watch out: del.", "Cuidado: del.") },
          { p: "¿Dónde está el pez? (en · el lago)", k: ["Está en el lago.", "El pez está en el lago."],
            e: t("Está en el lago.", "Está en el lago.", "Está en el lago."),
            h: t("Empieza con Está.", "Start with Está.", "Comece com Está.") },
          { p: "¿Dónde está el lobo? (detrás de · el arbusto)", k: ["Está detrás del arbusto.", "El lobo está detrás del arbusto."],
            e: t("detrás del arbusto.", "detrás del arbusto.", "detrás del arbusto."),
            h: t("Ojo con del.", "Watch out: del.", "Cuidado: del.") }
        ]
      }
    ],
    reto: {
      consigna: t("Esconde un juguete en tu casa. Escribe dónde está.", "Hide a toy at home. Write where it is.", "Esconda um brinquedo em casa. Escreva onde ele está."),
      ruta: ["Mi oso está encima de…", "Está debajo de la mesa.", "Está detrás de…"],
      lista: [
        t("Usa está.", "It uses está.", "Usa está."),
        t("Usa encima de, debajo de, detrás de o en.", "It uses encima de, debajo de, detrás de or en.", "Usa encima de, debajo de, detrás de ou en.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
