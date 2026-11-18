/* Práctica autónoma · A1 · Esta es mi familia (niños, apoyo en inglés)
   Tema y gramática del catálogo: este / esta es mi…, mi / mis, se llama, tengo … años, -o / -a */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-esta-es-mi-familia"] = {
    tematica: "familia",
    objetivo: t("Presentar a tu familia", "Introduce your family", "Apresentar sua família"),
    repaso: [
      t("Este es mi papá.", "This is my dad.", "Este é meu pai."),
      t("Esta es mi mamá. Se llama Ana.", "This is my mom. Her name is Ana.", "Esta é minha mãe. Ela se chama Ana."),
      t("Mis abuelos son simpáticos.", "My grandparents are nice.", "Meus avós são simpáticos."),
      t("Mi hermano tiene ocho años.", "My brother is eight.", "Meu irmão tem oito anos."),
      t("Tengo diez años.", "I am ten.", "Tenho dez anos.")
    ],
    ejercicios: [
      {
        tipo: "empareja",
        consigna: t("Une cada palabra con su pareja.", "Match each family word.", "Ligue cada palavra ao seu par."),
        pares: [
          ["el papá", t("el papá", "dad", "o pai")],
          ["la mamá", t("la mamá", "mom", "a mãe")],
          ["el hermano", t("el hermano", "brother", "o irmão")],
          ["la hermana", t("la hermana", "sister", "a irmã")],
          ["el abuelo", t("el papá de mi papá", "grandad", "o avô")],
          ["la abuela", t("la mamá de mi mamá", "grandma", "a avó")],
          ["el bebé", t("el bebé", "baby", "o bebê")]
        ]
      },
      {
        tipo: "elige",
        consigna: t("Toca la palabra que va.", "Tap the word that fits.", "Toque a palavra certa."),
        items: [
          { p: "___ es mi mamá.", g: g("This is my mom.", "Esta é minha mãe."), o: ["Este", "Esta"], k: 1,
            e: t("mamá → esta.", "mamá is a girl → esta.", "mamá é menina → esta."),
            h: t("¿Niño o niña?", "Boy or girl?", "Menino ou menina?") },
          { p: "___ es mi abuelo.", g: g("This is my grandad.", "Este é meu avô."), o: ["Este", "Esta"], k: 0,
            e: t("abuelo → este.", "abuelo is a boy → este.", "abuelo é menino → este."),
            h: t("abuelo termina en -o.", "abuelo ends in -o.", "abuelo termina em -o.") },
          { p: "___ es mi hermana.", g: g("This is my sister.", "Esta é minha irmã."), o: ["Este", "Esta"], k: 1,
            e: t("hermana → esta.", "hermana ends in -a → esta.", "hermana termina em -a → esta."),
            h: t("Mira la última letra.", "Look at the last letter.", "Olhe a última letra.") },
          { p: "___ hermanos se llaman Leo y Tom.", g: g("My brothers are called Leo and Tom.", "Meus irmãos se chamam Leo e Tom."), o: ["Mi", "Mis"], k: 1,
            e: t("Dos hermanos → mis.", "Two brothers → mis.", "Dois irmãos → mis."),
            h: t("¿Uno o dos?", "One or two?", "Um ou dois?") },
          { p: "___ abuela se llama Rosa.", g: g("My grandma is called Rosa.", "Minha avó se chama Rosa."), o: ["Mi", "Mis"], k: 0,
            e: t("Una abuela → mi.", "One grandma → mi.", "Uma avó → mi."),
            h: t("Es una sola persona.", "It's one person.", "É uma pessoa só.") },
          { p: "Mi mamá es ___.", g: g("My mom is nice.", "Minha mãe é simpática."), o: ["simpático", "simpática"], k: 1,
            e: t("mamá → simpática.", "mamá is a girl → simpática.", "mamá é menina → simpática."),
            h: t("Niña → -a.", "Girl → -a.", "Menina → -a.") },
          { p: "Mi hermano ___ ocho años.", g: g("My brother is eight.", "Meu irmão tem oito anos."), o: ["tiene", "es"], k: 0,
            e: t("Los años van con tiene.", "In Spanish you HAVE years: tiene ocho años.", "Em espanhol a idade vai com tiene: tiene ocho años."),
            h: t("No es «es».", "Not «is».", "Não é «é».") },
          { p: "El bebé tiene un ___.", g: g("The baby is one.", "O bebê tem um ano."), o: ["año", "años"], k: 0,
            e: t("Un año, dos años.", "un año (one), dos años (two).", "un año, dos años."),
            h: t("Es solo uno.", "It's only one.", "É só um.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Mi hermana ___ Ana.", g: g("My sister is called Ana.", "Minha irmã se chama Ana."), k: ["se llama"],
            e: t("se llama = su nombre es.", "se llama = her name is.", "se llama = se chama."),
            h: t("Dos palabras: se …", "Two words: se …", "Duas palavras: se …") },
          { p: "Mi hermano ___ ocho años.", g: g("My brother is eight.", "Meu irmão tem oito anos."), k: ["tiene"],
            e: t("Él tiene ocho años.", "He tiene (has) eight years.", "Ele tiene (tem) oito anos."),
            h: t("t _ _ _ _ e", "t _ _ _ _ e", "t _ _ _ _ e") },
          { p: "Yo ___ diez años.", g: g("I am ten.", "Eu tenho dez anos."), k: ["tengo"],
            e: t("Yo tengo.", "yo (I) → tengo.", "yo (eu) → tengo."),
            h: t("t _ _ _ o", "t _ _ _ o", "t _ _ _ o") },
          { p: "___ es mi papá.", g: g("This is my dad.", "Este é meu pai."), k: ["este"],
            e: t("papá → este.", "papá is a boy → este.", "papá é menino → este."),
            h: t("e _ _ e", "e _ _ e", "e _ _ e") },
          { p: "___ es mi abuela.", g: g("This is my grandma.", "Esta é minha avó."), k: ["esta"],
            e: t("abuela → esta.", "abuela is a girl → esta.", "abuela é menina → esta."),
            h: t("e _ _ a", "e _ _ a", "e _ _ a") },
          { p: "El oso es simpático. La osa es ___.", g: g("The bear is nice. The she-bear is nice.", "O urso é simpático. A ursa é simpática."), k: ["simpática"],
            e: t("osa → simpática.", "osa is a girl → simpática.", "osa é menina → simpática."),
            h: t("Cambia la -o por -a.", "Change -o to -a.", "Troque -o por -a.") },
          { p: "___ abuelos se llaman Rosa y Pedro.", g: g("My grandparents are called Rosa and Pedro.", "Meus avós se chamam Rosa e Pedro."), k: ["mis"],
            e: t("Dos abuelos → mis.", "Two grandparents → mis.", "Dois avós → mis."),
            h: t("m _ _", "m _ _", "m _ _") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "Esta es mi hermana.", g: g("This is my sister.", "Esta é minha irmã."),
            e: t("Esta es mi + persona.", "Esta es mi + person.", "Esta es mi + pessoa."),
            h: t("Empieza con Esta.", "Start with Esta.", "Comece com Esta.") },
          { k: "Mi papá se llama Luis.", g: g("My dad is called Luis.", "Meu pai se chama Luis."),
            e: t("Mi papá + se llama + nombre.", "Mi papá + se llama + name.", "Mi papá + se llama + nome."),
            h: t("Empieza con Mi.", "Start with Mi.", "Comece com Mi.") },
          { k: "Tengo diez años.", g: g("I am ten.", "Tenho dez anos."),
            e: t("Tengo + número + años.", "Tengo + number + años.", "Tengo + número + años."),
            h: t("Empieza con Tengo.", "Start with Tengo.", "Comece com Tengo.") },
          { k: "Este es mi abuelo.", g: g("This is my grandad.", "Este é meu avô."),
            e: t("Este es mi + persona.", "Este es mi + person.", "Este es mi + pessoa."),
            h: t("Empieza con Este.", "Start with Este.", "Comece com Este.") },
          { k: "El bebé tiene un año.", g: g("The baby is one.", "O bebê tem um ano."),
            e: t("El bebé + tiene + un año.", "El bebé + tiene + un año.", "El bebé + tiene + un año."),
            h: t("Empieza con El.", "Start with El.", "Comece com El.") },
          { k: "Mis abuelos son simpáticos.", g: g("My grandparents are nice.", "Meus avós são simpáticos."),
            e: t("Mis abuelos + son + simpáticos.", "Mis abuelos + son + simpáticos.", "Mis abuelos + son + simpáticos."),
            h: t("Empieza con Mis.", "Start with Mis.", "Comece com Mis.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Cambia a niña. Escribe la frase.", "Change it to a girl! Write the sentence.", "Mude para menina! Escreva a frase."),
        items: [
          { p: "Este es mi hermano.", k: ["Esta es mi hermana."],
            e: t("este → esta, hermano → hermana.", "este → esta, hermano → hermana.", "este → esta, hermano → hermana."),
            h: t("Cambia dos palabras.", "Change two words.", "Mude duas palavras.") },
          { p: "Este es mi abuelo.", k: ["Esta es mi abuela."],
            e: t("este → esta, abuelo → abuela.", "este → esta, abuelo → abuela.", "este → esta, abuelo → abuela."),
            h: t("Cambia dos palabras.", "Change two words.", "Mude duas palavras.") },
          { p: "El oso es simpático.", k: ["La osa es simpática."],
            e: t("el → la, oso → osa, simpático → simpática.", "el → la, oso → osa, simpático → simpática.", "el → la, oso → osa, simpático → simpática."),
            h: t("Tres cambios.", "Three changes.", "Três mudanças.") },
          { p: "Mi hermano es pequeño.", k: ["Mi hermana es pequeña."],
            e: t("hermano → hermana, pequeño → pequeña.", "hermano → hermana, pequeño → pequeña.", "hermano → hermana, pequeño → pequeña."),
            h: t("-o → -a.", "-o → -a.", "-o → -a.") },
          { p: "Mi abuelo es simpático.", k: ["Mi abuela es simpática."],
            e: t("abuelo → abuela, simpático → simpática.", "abuelo → abuela, simpático → simpática.", "abuelo → abuela, simpático → simpática."),
            h: t("-o → -a.", "-o → -a.", "-o → -a.") },
          { p: "Mi papá es grande.", k: ["Mi mamá es grande."],
            e: t("papá → mamá. grande no cambia.", "papá → mamá. grande stays the same!", "papá → mamá. grande não muda!"),
            h: t("grande no termina en -o.", "grande doesn't end in -o.", "grande não termina em -o.") }
        ]
      }
    ],
    reto: {
      consigna: t("Piensa en tu familia. Escribe una frase sobre una persona.", "Think of your family. Write one sentence about one person.", "Pense na sua família. Escreva uma frase sobre uma pessoa."),
      ruta: ["Este es mi…", "Esta es mi…", "Se llama…", "Tiene … años."],
      lista: [
        t("Empieza con Este o Esta.", "It starts with Este or Esta.", "Começa com Este ou Esta."),
        t("Dice el nombre o los años.", "It says the name or the age.", "Diz o nome ou a idade.")
      ],
      min: 1, max: 3, unidad: "frases"
    }
  };
})();
