/* Práctica autónoma · A1 · ¿Qué me pongo hoy? (niños, apoyo en inglés)
   Tema y gramática del catálogo: hace calor / hace frío / llueve, Llevo… + colores */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-que-me-pongo-hoy"] = {
    tematica: "ropa-y-tiempo",
    objetivo: t("Decir qué tiempo hace y qué ropa llevas", "Say what the weather is like and what you wear", "Dizer como está o tempo e que roupa você usa"),
    repaso: [
      t("Hace calor. Llevo una camiseta.", "It's hot. I'm wearing a T-shirt.", "Está calor. Estou de camiseta."),
      t("Hace frío. Llevo una chaqueta.", "It's cold. I'm wearing a jacket.", "Está frio. Estou de jaqueta."),
      t("Llueve. Llevo un paraguas.", "It's raining. I've got an umbrella.", "Está chovendo. Levo um guarda-chuva."),
      t("Llevo la gorra amarilla y los pantalones azules.", "I'm wearing the yellow cap and the blue trousers.", "Estou com o boné amarelo e a calça azul."),
      t("Tengo frío.", "I'm cold.", "Estou com frio.")
    ],
    ejercicios: [
      {
        tipo: "elige",
        consigna: t("Toca la respuesta que va.", "Tap the answer that fits.", "Toque a resposta certa."),
        items: [
          { p: "Hace calor. Llevo ___.", g: g("It's hot. I'm wearing…", "Está calor. Estou de…"), o: ["una camiseta", "una chaqueta"], k: 0,
            e: t("Con calor, camiseta.", "Hot day → T-shirt.", "Dia quente → camiseta."),
            h: t("Hace calor = hot.", "Hace calor = it's hot.", "Hace calor = está calor.") },
          { p: "Hace frío. Llevo ___.", g: g("It's cold. I'm wearing…", "Está frio. Estou de…"), o: ["una camiseta", "una chaqueta"], k: 1,
            e: t("Con frío, chaqueta.", "Cold day → jacket.", "Dia frio → jaqueta."),
            h: t("Hace frío = cold.", "Hace frío = it's cold.", "Hace frío = está frio.") },
          { p: "Llueve. Llevo ___.", g: g("It's raining. I've got…", "Está chovendo. Levo…"), o: ["una gorra", "un paraguas"], k: 1,
            e: t("Con lluvia, paraguas.", "Rain → umbrella.", "Chuva → guarda-chuva."),
            h: t("Llueve = rain.", "Llueve = it's raining.", "Llueve = está chovendo.") },
          { p: "___ frío. Llevo una chaqueta.", g: g("It's cold. I'm wearing a jacket.", "Está frio. Estou de jaqueta."), o: ["Hace", "Es"], k: 0,
            e: t("El tiempo: hace frío.", "Weather uses hace: hace frío (not «es frío»).", "Para o tempo: hace frío (não «es frío»)."),
            h: t("Como «hace calor».", "Like «hace calor».", "Como «hace calor».") },
          { p: "Hace calor. ___ calor.", g: g("It's hot. I'm hot.", "Está calor. Estou com calor."), o: ["Tengo", "Estoy"], k: 0,
            e: t("Yo tengo calor.", "I HAVE heat: tengo calor (not «estoy calor»).", "Em espanhol: tengo calor (não «estoy calor»)."),
            h: t("Como «tengo frío».", "Like «tengo frío».", "Como «tengo frío».") },
          { p: "Llevo la gorra ___.", g: g("I'm wearing the yellow cap.", "Estou com o boné amarelo."), o: ["amarillo", "amarilla"], k: 1,
            e: t("la gorra → amarilla.", "la gorra → amarilla (-a).", "la gorra → amarilla (-a)."),
            h: t("la gorra termina en -a.", "la gorra ends in -a.", "la gorra termina em -a.") },
          { p: "Llevo los pantalones ___.", g: g("I'm wearing the blue trousers.", "Estou com a calça azul."), o: ["azul", "azules"], k: 1,
            e: t("los pantalones → azules.", "los pantalones (many) → azules.", "los pantalones (plural) → azules."),
            h: t("los = muchos.", "los = more than one.", "los = mais de um.") },
          { p: "Llevo la chaqueta ___.", g: g("I'm wearing the green jacket.", "Estou com a jaqueta verde."), o: ["verde", "verda"], k: 0,
            e: t("verde no cambia.", "verde never changes to -a.", "verde nunca muda para -a."),
            h: t("«verda» no existe.", "«verda» is not a word.", "«verda» não existe.") }
        ]
      },
      {
        tipo: "empareja",
        consigna: t("Une cada palabra con su pareja.", "Match each word.", "Ligue cada palavra ao seu par."),
        pares: [
          ["la camiseta", t("la camiseta", "T-shirt", "a camiseta")],
          ["la gorra", t("la gorra", "cap", "o boné")],
          ["la chaqueta", t("la chaqueta", "jacket", "a jaqueta")],
          ["los pantalones", t("los pantalones", "trousers", "a calça")],
          ["el paraguas", t("el paraguas", "umbrella", "o guarda-chuva")],
          ["hace calor", t("hace calor", "it's hot", "está calor")],
          ["hace frío", t("hace frío", "it's cold", "está frio")],
          ["llueve", t("llueve", "it's raining", "está chovendo")]
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "Hoy hace calor.", g: g("It's hot today.", "Hoje está calor."),
            e: t("Hoy + hace calor.", "Hoy + hace calor.", "Hoy + hace calor."),
            h: t("Empieza con Hoy.", "Start with Hoy.", "Comece com Hoy.") },
          { k: "Llevo una camiseta roja.", g: g("I'm wearing a red T-shirt.", "Estou com uma camiseta vermelha."),
            e: t("El color va después: camiseta roja.", "The colour goes after: camiseta roja.", "A cor vem depois: camiseta roja."),
            h: t("Empieza con Llevo.", "Start with Llevo.", "Comece com Llevo.") },
          { k: "Llueve y llevo un paraguas.", g: g("It's raining and I've got an umbrella.", "Está chovendo e levo um guarda-chuva."),
            e: t("Llueve + y + llevo…", "Llueve + y + llevo…", "Llueve + y + llevo…"),
            h: t("Empieza con Llueve.", "Start with Llueve.", "Comece com Llueve.") },
          { k: "Tengo frío y llevo una chaqueta.", g: g("I'm cold and I'm wearing a jacket.", "Estou com frio e estou de jaqueta."),
            e: t("Tengo frío + y + llevo…", "Tengo frío + y + llevo…", "Tengo frío + y + llevo…"),
            h: t("Empieza con Tengo.", "Start with Tengo.", "Comece com Tengo.") },
          { k: "El niño lleva una gorra amarilla.", g: g("The boy is wearing a yellow cap.", "O menino está com um boné amarelo."),
            e: t("Él lleva.", "He → lleva.", "Ele → lleva."),
            h: t("Empieza con El niño.", "Start with El niño.", "Comece com El niño.") },
          { k: "La niña lleva pantalones azules.", g: g("The girl is wearing blue trousers.", "A menina está de calça azul."),
            e: t("Ella lleva.", "She → lleva.", "Ela → lleva."),
            h: t("Empieza con La niña.", "Start with La niña.", "Comece com La niña.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe el color.", "Write the colour. Watch the ending!", "Escreva a cor. Cuidado com o final!"),
        items: [
          { p: "Llevo la gorra ___. (rojo)", g: g("I'm wearing the red cap.", "Estou com o boné vermelho."), k: ["roja"],
            e: t("la gorra → roja.", "la gorra → roja.", "la gorra → roja."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Llevo los pantalones ___. (negro)", g: g("I'm wearing the black trousers.", "Estou com a calça preta."), k: ["negros"],
            e: t("los pantalones → negros.", "los pantalones → negros (-os).", "los pantalones → negros (-os)."),
            h: t("Termina en -os.", "It ends in -os.", "Termina em -os.") },
          { p: "Llevo la chaqueta ___. (blanco)", g: g("I'm wearing the white jacket.", "Estou com a jaqueta branca."), k: ["blanca"],
            e: t("la chaqueta → blanca.", "la chaqueta → blanca.", "la chaqueta → blanca."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Llevo la camiseta ___. (verde)", g: g("I'm wearing the green T-shirt.", "Estou com a camiseta verde."), k: ["verde"],
            e: t("verde no cambia.", "verde stays the same.", "verde não muda."),
            h: t("No cambia.", "No change!", "Não muda!") },
          { p: "Llevo los pantalones ___. (azul)", g: g("I'm wearing the blue trousers.", "Estou com a calça azul."), k: ["azules"],
            e: t("azul → azules.", "azul + es → azules.", "azul + es → azules."),
            h: t("Termina en -es.", "It ends in -es.", "Termina em -es.") },
          { p: "Llevo la camiseta ___. (morado)", g: g("I'm wearing the purple T-shirt.", "Estou com a camiseta roxa."), k: ["morada"],
            e: t("la camiseta → morada.", "la camiseta → morada.", "la camiseta → morada."),
            h: t("Termina en -a.", "It ends in -a.", "Termina em -a.") },
          { p: "Llevo el paraguas ___. (amarillo)", g: g("I've got the yellow umbrella.", "Levo o guarda-chuva amarelo."), k: ["amarillo"],
            e: t("el paraguas → amarillo.", "el paraguas → amarillo (-o).", "el paraguas → amarillo (-o)."),
            h: t("Mira: el.", "Look: el.", "Olhe: el.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Mira el tiempo. Escribe qué llevas.", "Look at the weather. Write what you wear.", "Olhe o tempo. Escreva o que você usa."),
        items: [
          { p: "Hace frío. (chaqueta)", k: ["Llevo una chaqueta.", "Llevo la chaqueta.", "Hace frío. Llevo una chaqueta."],
            e: t("Llevo una chaqueta.", "Llevo una chaqueta.", "Llevo una chaqueta."),
            h: t("Empieza con Llevo una…", "Start with Llevo una…", "Comece com Llevo una…") },
          { p: "Hace calor. (camiseta)", k: ["Llevo una camiseta.", "Llevo la camiseta.", "Hace calor. Llevo una camiseta."],
            e: t("Llevo una camiseta.", "Llevo una camiseta.", "Llevo una camiseta."),
            h: t("Empieza con Llevo una…", "Start with Llevo una…", "Comece com Llevo una…") },
          { p: "Llueve. (paraguas)", k: ["Llevo un paraguas.", "Llevo el paraguas.", "Llueve. Llevo un paraguas."],
            e: t("el paraguas → un paraguas.", "el paraguas → un paraguas.", "el paraguas → un paraguas."),
            h: t("Es un, no una.", "It's un, not una.", "É un, não una.") },
          { p: "Hace frío. (chaqueta negra)", k: ["Llevo una chaqueta negra.", "Llevo la chaqueta negra.", "Hace frío. Llevo una chaqueta negra."],
            e: t("El color va después: chaqueta negra.", "Colour after: chaqueta negra.", "A cor depois: chaqueta negra."),
            h: t("Llevo una chaqueta…", "Llevo una chaqueta…", "Llevo una chaqueta…") },
          { p: "Hace calor. (gorra blanca)", k: ["Llevo una gorra blanca.", "Llevo la gorra blanca.", "Hace calor. Llevo una gorra blanca."],
            e: t("Llevo una gorra blanca.", "Llevo una gorra blanca.", "Llevo una gorra blanca."),
            h: t("Llevo una gorra…", "Llevo una gorra…", "Llevo una gorra…") },
          { p: "Hace frío. (pantalones azules)", k: ["Llevo pantalones azules.", "Llevo los pantalones azules.", "Llevo unos pantalones azules.", "Hace frío. Llevo pantalones azules."],
            e: t("Llevo pantalones azules.", "Llevo pantalones azules.", "Llevo pantalones azules."),
            h: t("Llevo pantalones…", "Llevo pantalones…", "Llevo pantalones…") }
        ]
      }
    ],
    reto: {
      consigna: t("Mira por la ventana. Escribe el tiempo y tu ropa.", "Look out of the window. Write the weather and what you wear.", "Olhe pela janela. Escreva o tempo e a sua roupa."),
      ruta: ["Hoy hace calor.", "Hoy hace frío.", "Hoy llueve.", "Llevo…"],
      lista: [
        t("Dice el tiempo.", "It says the weather.", "Diz o tempo."),
        t("Dice una prenda con su color.", "It says one piece of clothing and its colour.", "Diz uma roupa e a cor.")
      ],
      min: 1, max: 2, unidad: "frases"
    }
  };
})();
