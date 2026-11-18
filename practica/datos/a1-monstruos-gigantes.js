/* Práctica autónoma · A1 · Monstruos gigantes (niños, apoyo en inglés)
   Tema y gramática del catálogo: describir monstruos: tamaño, colores y partes del cuerpo */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-monstruos-gigantes"] = {
    tematica: "animales",
    objetivo: t("Describir un monstruo: cómo es y qué tiene", "Describe a monster: what it's like and what it has", "Descrever um monstro: como ele é e o que ele tem"),
    repaso: [
      t("Mi monstruo es enorme.", "My monster is huge.", "Meu monstro é enorme."),
      t("Tiene tres ojos.", "It has three eyes.", "Ele tem três olhos."),
      t("Tiene la cola verde.", "It has a green tail.", "Ele tem o rabo verde."),
      t("Tiene las alas negras y los cuernos blancos.", "It has black wings and white horns.", "Ele tem as asas pretas e os chifres brancos."),
      t("Es pequeño, pero es feroz.", "It's small, but it's fierce.", "É pequeno, mas é feroz.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada parte del monstruo.", "Match each monster part.", "Ligue cada parte do monstro."),
        pares: [
          ["los ojos", t("los ojos", "eyes", "os olhos")],
          ["la boca", t("la boca", "mouth", "a boca")],
          ["los dientes", t("los dientes", "teeth", "os dentes")],
          ["la cola", t("la cola", "tail", "o rabo")],
          ["las alas", t("las alas", "wings", "as asas")],
          ["los cuernos", t("los cuernos", "horns", "os chifres")],
          ["las piernas", t("las piernas", "legs", "as pernas")],
          ["el pelo", t("el pelo", "hair", "o pelo")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("¿Es o tiene? Toca la palabra.", "Es or tiene? Tap the word.", "Es ou tiene? Toque a palavra."),
        items: [
          { p: "El monstruo ___ grande.", g: g("The monster is big.", "O monstro é grande."), o: ["es", "tiene"], k: 0,
            e: t("Cómo es → es grande.", "What it's like → es: es grande.", "Como ele é → es: es grande."),
            h: t("grande = cómo es.", "grande = what it's like.", "grande = como ele é.") },
          { p: "El monstruo ___ cuatro brazos.", g: g("The monster has four arms.", "O monstro tem quatro braços."), o: ["es", "tiene"], k: 1,
            e: t("Partes del cuerpo → tiene.", "Body parts → tiene (has).", "Partes do corpo → tiene (tem)."),
            h: t("brazos = una parte.", "brazos = a body part.", "brazos = uma parte do corpo.") },
          { p: "___ las alas rojas.", g: g("It has red wings.", "Ele tem as asas vermelhas."), o: ["Tiene", "Es"], k: 0,
            e: t("Tiene + parte + color.", "Tiene + body part + colour.", "Tiene + parte + cor."),
            h: t("alas = una parte.", "alas = a body part.", "alas = uma parte do corpo.") },
          { p: "El monstruo ___ verde.", g: g("The monster is green.", "O monstro é verde."), o: ["es", "tiene"], k: 0,
            e: t("Todo el monstruo es verde.", "The whole monster is green → es.", "O monstro todo é verde → es."),
            h: t("No hay una parte.", "There's no body part.", "Não tem parte do corpo.") },
          { p: "Tiene la cola ___.", g: g("It has a black tail.", "Ele tem o rabo preto."), o: ["negro", "negra"], k: 1,
            e: t("la cola → negra.", "la cola → negra (-a).", "la cola → negra (-a)."),
            h: t("Mira: la.", "Look: la.", "Olhe: la.") },
          { p: "Tiene los cuernos ___.", g: g("It has white horns.", "Ele tem os chifres brancos."), o: ["blanco", "blancos"], k: 1,
            e: t("los cuernos → blancos.", "los cuernos → blancos (-os).", "los cuernos → blancos (-os)."),
            h: t("Mira: los.", "Look: los.", "Olhe: los.") },
          { p: "Tiene las alas ___.", g: g("It has pink wings.", "Ele tem as asas cor-de-rosa."), o: ["rosadas", "rosado"], k: 0,
            e: t("las alas → rosadas.", "las alas → rosadas (-as).", "las alas → rosadas (-as)."),
            h: t("Mira: las.", "Look: las.", "Olhe: las.") },
          { p: "El monstruo ___ pequeño.", g: g("The monster is small.", "O monstro é pequeno."), o: ["es", "tiene"], k: 0,
            e: t("pequeño = cómo es → es.", "pequeño = what it's like → es.", "pequeño = como ele é → es."),
            h: t("Como «es grande».", "Like «es grande».", "Como «es grande».") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Pinta con palabras: escribe el color.", "Paint with words: write the colour. Watch the ending!", "Pinte com palavras: escreva a cor. Cuidado com o final!"),
        items: [
          { p: "Tiene la cola ___. (rosado)", g: g("It has a pink tail.", "Ele tem o rabo cor-de-rosa."), k: ["rosada"],
            e: t("la cola → rosada.", "la cola → rosada.", "la cola → rosada."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Tiene los cuernos ___. (negro)", g: g("It has black horns.", "Ele tem os chifres pretos."), k: ["negros"],
            e: t("los cuernos → negros.", "los cuernos → negros.", "los cuernos → negros."),
            h: t("Termina en -os.", "It ends in -os.", "Termina em -os.") },
          { p: "Tiene las alas ___. (blanco)", g: g("It has white wings.", "Ele tem as asas brancas."), k: ["blancas"],
            e: t("las alas → blancas.", "las alas → blancas.", "las alas → blancas."),
            h: t("Termina en -as.", "It ends in -as.", "Termina em -as.") },
          { p: "Tiene el pelo ___. (verde)", g: g("It has green hair.", "Ele tem o pelo verde."), k: ["verde"],
            e: t("verde no cambia con el.", "verde stays the same.", "verde não muda."),
            h: t("No cambia.", "No change!", "Não muda!") },
          { p: "Tiene la boca ___. (rojo)", g: g("It has a red mouth.", "Ele tem a boca vermelha."), k: ["roja"],
            e: t("la boca → roja.", "la boca → roja.", "la boca → roja."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Tiene los dientes ___. (amarillo)", g: g("It has yellow teeth.", "Ele tem os dentes amarelos."), k: ["amarillos"],
            e: t("los dientes → amarillos.", "los dientes → amarillos.", "los dientes → amarillos."),
            h: t("Termina en -os.", "It ends in -os.", "Termina em -os.") },
          { p: "Tiene las orejas ___. (azul)", g: g("It has blue ears.", "Ele tem as orelhas azuis."), k: ["azules"],
            e: t("azul → azules.", "azul + es → azules.", "azul + es → azules."),
            h: t("azul + es.", "azul + es.", "azul + es.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("El robot escribe mal. Arregla la frase.", "The robot made a mistake. Fix the sentence!", "O robô errou. Corrija a frase!"),
        items: [
          { p: "El monstruo tiene enorme.", k: ["El monstruo es enorme."],
            e: t("Cómo es → es enorme.", "What it's like → es enorme.", "Como ele é → es enorme."),
            h: t("Cambia una palabra.", "Change one word.", "Mude uma palavra.") },
          { p: "Tiene la cola negro.", k: ["Tiene la cola negra."],
            e: t("la cola → negra.", "la cola → negra.", "la cola → negra."),
            h: t("Mira el final del color.", "Look at the end of the colour.", "Olhe o final da cor.") },
          { p: "Es dos cuernos.", k: ["Tiene dos cuernos."],
            e: t("Partes → tiene.", "Body parts → tiene.", "Partes do corpo → tiene."),
            h: t("Cambia la primera palabra.", "Change the first word.", "Mude a primeira palavra.") },
          { p: "Tiene las alas blanco.", k: ["Tiene las alas blancas."],
            e: t("las alas → blancas.", "las alas → blancas.", "las alas → blancas."),
            h: t("Mira el final del color.", "Look at the end of the colour.", "Olhe o final da cor.") },
          { p: "El monstruo tiene verde.", k: ["El monstruo es verde."],
            e: t("Todo el monstruo → es verde.", "The whole monster → es verde.", "O monstro todo → es verde."),
            h: t("Cambia una palabra.", "Change one word.", "Mude uma palavra.") },
          { p: "Tiene los dientes rosado.", k: ["Tiene los dientes rosados."],
            e: t("los dientes → rosados.", "los dientes → rosados.", "los dientes → rosados."),
            h: t("Falta una letra.", "One letter is missing.", "Falta uma letra.") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase del monstruo.", "Put the monster's words in order.", "Coloque as palavras do monstro em ordem."),
        items: [
          { k: "Mi monstruo es enorme.", g: g("My monster is huge.", "Meu monstro é enorme."),
            e: t("Mi monstruo + es + enorme.", "Mi monstruo + es + enorme.", "Mi monstruo + es + enorme."),
            h: t("Empieza con Mi.", "Start with Mi.", "Comece com Mi.") },
          { k: "Tiene tres ojos azules.", g: g("It has three blue eyes.", "Ele tem três olhos azuis."),
            e: t("El color va después: ojos azules.", "Colour after: ojos azules.", "A cor depois: ojos azules."),
            h: t("Empieza con Tiene.", "Start with Tiene.", "Comece com Tiene.") },
          { k: "Tiene la cola verde.", g: g("It has a green tail.", "Ele tem o rabo verde."),
            e: t("Tiene + la cola + verde.", "Tiene + la cola + verde.", "Tiene + la cola + verde."),
            h: t("Empieza con Tiene.", "Start with Tiene.", "Comece com Tiene.") },
          { k: "El monstruo tiene dos alas negras.", g: g("The monster has two black wings.", "O monstro tem duas asas pretas."),
            e: t("El color va al final.", "The colour goes at the end.", "A cor vai no final."),
            h: t("Empieza con El.", "Start with El.", "Comece com El.") },
          { k: "Es pequeño y tiene cuernos.", g: g("It's small and it has horns.", "É pequeno e tem chifres."),
            e: t("Es + pequeño + y + tiene + cuernos.", "Es + pequeño + y + tiene + cuernos.", "Es + pequeño + y + tiene + cuernos."),
            h: t("Empieza con Es.", "Start with Es.", "Comece com Es.") },
          { k: "Mi monstruo tiene el pelo rosado.", g: g("My monster has pink hair.", "Meu monstro tem o pelo cor-de-rosa."),
            e: t("Mi monstruo + tiene + el pelo + rosado.", "Mi monstruo + tiene + el pelo + rosado.", "Mi monstruo + tiene + el pelo + rosado."),
            h: t("Empieza con Mi.", "Start with Mi.", "Comece com Mi.") }
        ]
      }
    ],
    reto: {
      consigna: t("Inventa tu monstruo. Escribe una o dos frases.", "Invent your monster! Write one or two sentences.", "Invente seu monstro! Escreva uma ou duas frases."),
      ruta: ["Mi monstruo es…", "Tiene…", "Tiene la cola…"],
      lista: [
        t("Usa es para cómo es.", "It uses es for what it's like.", "Usa es para como ele é."),
        t("Usa tiene con una parte y un color.", "It uses tiene with a body part and a colour.", "Usa tiene com uma parte do corpo e uma cor.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
