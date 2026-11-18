/* Práctica autónoma · A1 · Los números del pirata (niños, apoyo en inglés)
   Tema y gramática del catálogo: números del 9 al 15 y ¿Cuántos hay? */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-los-numeros-del-pirata"] = {
    tematica: "numeros",
    objetivo: t("Contar del 9 al 15 y responder «¿Cuántos hay?»", "Count from 9 to 15 and answer «¿Cuántos hay?»", "Contar de 9 a 15 e responder «¿Cuántos hay?»"),
    repaso: [
      t("nueve, diez, once, doce, trece, catorce, quince", "nine, ten, eleven, twelve, thirteen, fourteen, fifteen", "nove, dez, onze, doze, treze, catorze, quinze"),
      t("¿Cuántos diamantes hay?", "How many diamonds are there?", "Quantos diamantes há?"),
      t("Hay doce diamantes.", "There are twelve diamonds.", "Há doze diamantes."),
      t("Hay once diamantes rojos.", "There are eleven red diamonds.", "Há onze diamantes vermelhos."),
      t("El pirata tiene un mapa.", "The pirate has a map.", "O pirata tem um mapa.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada número.", "Match each number.", "Ligue cada número."),
        pares: [
          ["nueve", "9"], ["diez", "10"], ["once", "11"], ["doce", "12"],
          ["trece", "13"], ["catorce", "14"], ["quince", "15"]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Cuenta el tesoro: toca la respuesta.", "Count the treasure: tap the answer.", "Conte o tesouro: toque a resposta."),
        items: [
          { p: "10 + 1 = ___", o: ["once", "doce"], k: 0,
            e: t("10 + 1 = 11 = once.", "10 + 1 = 11 = once.", "10 + 1 = 11 = once."),
            h: t("Después del diez.", "It comes after diez.", "Vem depois do diez.") },
          { p: "7 + 7 = ___", o: ["cuatro", "catorce"], k: 1,
            e: t("14 = catorce.", "14 = catorce.", "14 = catorce."),
            h: t("Es más grande que diez.", "It's bigger than ten.", "É maior que dez.") },
          { p: "Hay ___ diamantes. (13)", g: g("There are thirteen diamonds.", "Há treze diamantes."), o: ["tres", "trece"], k: 1,
            e: t("13 = trece. 3 = tres.", "13 = trece. 3 = tres.", "13 = trece. 3 = tres."),
            h: t("Es la palabra más larga.", "It's the longer word.", "É a palavra mais longa.") },
          { p: "Hay ___ diamantes. (15)", g: g("There are fifteen diamonds.", "Há quinze diamantes."), o: ["cinco", "quince"], k: 1,
            e: t("15 = quince. 5 = cinco.", "15 = quince. 5 = cinco.", "15 = quince. 5 = cinco."),
            h: t("Empieza con q.", "It starts with q.", "Começa com q.") },
          { p: "Hay doce diamantes ___.", g: g("There are twelve red diamonds.", "Há doze diamantes vermelhos."), o: ["rojo", "rojos"], k: 1,
            e: t("Muchos diamantes → rojos.", "Many diamonds → rojos (-s).", "Muitos diamantes → rojos (-s)."),
            h: t("Doce es mucho: -s.", "Twelve is many: add -s.", "Doze é muito: -s.") },
          { p: "¿___ diamantes hay?", g: g("How many diamonds are there?", "Quantos diamantes há?"), o: ["Cuántos", "Qué"], k: 0,
            e: t("¿Cuántos…? = la pregunta del número.", "¿Cuántos…? = How many…?", "¿Cuántos…? = Quantos…?"),
            h: t("Preguntas por un número.", "You ask for a number.", "Você pergunta um número.") },
          { p: "Hay nueve ___ azules.", g: g("There are nine blue diamonds.", "Há nove diamantes azuis."), o: ["diamante", "diamantes"], k: 1,
            e: t("Nueve → diamantes.", "Nine → diamantes (-s).", "Nove → diamantes (-s)."),
            h: t("Más de uno: -s.", "More than one: -s.", "Mais de um: -s.") },
          { p: "12 - 1 = ___", o: ["once", "trece"], k: 0,
            e: t("12 - 1 = 11 = once.", "12 - 1 = 11 = once.", "12 - 1 = 11 = once."),
            h: t("Antes del doce.", "It comes before doce.", "Vem antes do doce.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el número con letras.", "Write the number in words.", "Escreva o número por extenso."),
        items: [
          { p: "Hay ___ diamantes. (14)", k: ["catorce"],
            e: t("14 = catorce.", "14 = catorce.", "14 = catorce."),
            h: t("c _ _ _ _ _ e", "c _ _ _ _ _ e", "c _ _ _ _ _ e") },
          { p: "Hay ___ diamantes. (9)", k: ["nueve"],
            e: t("9 = nueve.", "9 = nueve.", "9 = nueve."),
            h: t("n _ _ _ e", "n _ _ _ e", "n _ _ _ e") },
          { p: "Hay ___ diamantes. (11)", k: ["once"],
            e: t("11 = once.", "11 = once.", "11 = once."),
            h: t("o _ _ e", "o _ _ e", "o _ _ e") },
          { p: "Hay ___ diamantes. (15)", k: ["quince"],
            e: t("15 = quince.", "15 = quince.", "15 = quince."),
            h: t("q _ _ _ _ e", "q _ _ _ _ e", "q _ _ _ _ e") },
          { p: "Hay ___ diamantes. (13)", k: ["trece"],
            e: t("13 = trece.", "13 = trece.", "13 = trece."),
            h: t("t _ _ _ e", "t _ _ _ e", "t _ _ _ e") },
          { p: "Hay ___ diamantes. (12)", k: ["doce"],
            e: t("12 = doce.", "12 = doce.", "12 = doce."),
            h: t("d _ _ e", "d _ _ e", "d _ _ e") },
          { p: "Hay ___ diamantes. (10)", k: ["diez"],
            e: t("10 = diez.", "10 = diez.", "10 = diez."),
            h: t("d _ _ z", "d _ _ z", "d _ _ z") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase del pirata.", "Put the pirate's words in order.", "Coloque as palavras do pirata em ordem."),
        items: [
          { k: "¿Cuántos diamantes hay?", g: g("How many diamonds are there?", "Quantos diamantes há?"),
            e: t("¿Cuántos + cosa + hay?", "¿Cuántos + thing + hay?", "¿Cuántos + coisa + hay?"),
            h: t("Empieza con ¿Cuántos.", "Start with ¿Cuántos.", "Comece com ¿Cuántos.") },
          { k: "Hay quince diamantes.", g: g("There are fifteen diamonds.", "Há quinze diamantes."),
            e: t("Hay + número + cosa.", "Hay + number + thing.", "Hay + número + coisa."),
            h: t("Empieza con Hay.", "Start with Hay.", "Comece com Hay.") },
          { k: "Hay diez diamantes verdes.", g: g("There are ten green diamonds.", "Há dez diamantes verdes."),
            e: t("El color va al final.", "The colour goes at the end.", "A cor vai no final."),
            h: t("Empieza con Hay.", "Start with Hay.", "Comece com Hay.") },
          { k: "El pirata tiene un mapa.", g: g("The pirate has a map.", "O pirata tem um mapa."),
            e: t("El pirata + tiene + un mapa.", "El pirata + tiene + un mapa.", "El pirata + tiene + un mapa."),
            h: t("Empieza con El.", "Start with El.", "Comece com El.") },
          { k: "Hay trece diamantes azules.", g: g("There are thirteen blue diamonds.", "Há treze diamantes azuis."),
            e: t("Hay + trece + diamantes + azules.", "Hay + trece + diamantes + azules.", "Hay + trece + diamantes + azules."),
            h: t("El color va al final.", "The colour goes last.", "A cor vai por último.") },
          { k: "El pirata tiene doce diamantes.", g: g("The pirate has twelve diamonds.", "O pirata tem doze diamantes."),
            e: t("El pirata + tiene + doce diamantes.", "El pirata + tiene + doce diamantes.", "El pirata + tiene + doce diamantes."),
            h: t("Empieza con El.", "Start with El.", "Comece com El.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("¡Más tesoro! Escribe la frase con el número nuevo.", "More treasure! Write the sentence with the new number.", "Mais tesouro! Escreva a frase com o número novo."),
        items: [
          { p: "Hay un diamante rojo. (11)", k: ["Hay once diamantes rojos."],
            e: t("Once → diamantes rojos (-s).", "Eleven → diamantes rojos (add -s).", "Onze → diamantes rojos (-s)."),
            h: t("Tres cambios: once, -s, -s.", "Three changes: once, -s, -s.", "Três mudanças: once, -s, -s.") },
          { p: "Hay un diamante azul. (12)", k: ["Hay doce diamantes azules."],
            e: t("azul → azules.", "azul → azules.", "azul → azules."),
            h: t("azul + es.", "azul + es.", "azul + es.") },
          { p: "Hay un diamante verde. (9)", k: ["Hay nueve diamantes verdes."],
            e: t("verde → verdes.", "verde → verdes.", "verde → verdes."),
            h: t("verde + s.", "verde + s.", "verde + s.") },
          { p: "Hay un diamante amarillo. (14)", k: ["Hay catorce diamantes amarillos."],
            e: t("amarillo → amarillos.", "amarillo → amarillos.", "amarillo → amarillos."),
            h: t("amarillo + s.", "amarillo + s.", "amarillo + s.") },
          { p: "Hay un diamante morado. (15)", k: ["Hay quince diamantes morados."],
            e: t("morado → morados.", "morado → morados.", "morado → morados."),
            h: t("morado + s.", "morado + s.", "morado + s.") },
          { p: "Hay un diamante naranja. (13)", k: ["Hay trece diamantes naranjas.", "Hay trece diamantes naranja."],
            e: t("Hay trece diamantes naranjas.", "Hay trece diamantes naranjas.", "Hay trece diamantes naranjas."),
            h: t("trece + diamantes.", "trece + diamantes.", "trece + diamantes.") }
        ]
      }
    ],
    reto: {
      consigna: t("Busca de 9 a 15 cosas en tu casa. Escribe una frase.", "Find 9 to 15 things at home. Write one sentence.", "Procure de 9 a 15 coisas na sua casa. Escreva uma frase."),
      ruta: ["Hay … en mi casa.", "Tengo …"],
      lista: [
        t("Tiene un número del 9 al 15 con letras.", "It has a number from 9 to 15 in words.", "Tem um número de 9 a 15 por extenso."),
        t("La cosa termina en -s.", "The thing ends in -s.", "A coisa termina em -s.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
