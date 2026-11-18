/* Práctica autónoma · A1 · Mucho gusto (adultos, apoyo en portugués)
   Tema y gramática del catálogo: presentarse en una reunión de trabajo (me llamo, soy de, vivo en, trabajo en, hablo; yo / tú) */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-mucho-gusto"] = {
    tematica: "presentaciones",
    objetivo: t("Presentarte en una reunión de trabajo", "Introduce yourself in a work meeting", "Se apresentar numa reunião de trabalho"),
    repaso: [
      t("Hola, me llamo Ana. ¡Mucho gusto!", "Hi, my name is Ana. Nice to meet you!", "Oi, eu me chamo Ana. Muito prazer!"),
      t("Soy de Brasil y vivo en São Paulo.", "I'm from Brazil and I live in São Paulo.", "Sou do Brasil e moro em São Paulo."),
      t("Soy ingeniera. Trabajo en un banco.", "I'm an engineer. I work at a bank.", "Sou engenheira. Trabalho num banco."),
      t("Hablo portugués y un poco de español.", "I speak Portuguese and a little Spanish.", "Falo português e um pouco de espanhol."),
      t("¿Y tú? ¿En qué trabajas?", "And you? What do you do?", "E você? Com o que você trabalha?")
    ],
    ejercicios: [
      {
        tipo: "elige",
        consigna: t("Elige la forma en español.", "Choose the Spanish form.", "Escolha a forma em espanhol (cuidado com o portunhol)."),
        items: [
          { p: "___ Carlos.", g: g("My name is Carlos.", "Eu me chamo Carlos."), o: ["Me llamo", "Me chamo"], k: 0,
            e: t("En español: me llamo.", "In Spanish: me llamo.", "«Me chamo» é português; em espanhol: me llamo."),
            h: t("Con ll.", "It has ll.", "Tem ll.") },
          { p: "___ en Bogotá.", g: g("I live in Bogotá.", "Moro em Bogotá."), o: ["Vivo", "Moro"], k: 0,
            e: t("vivir: vivo en…", "To live → vivo en…", "Morar → vivo en… («moro» não se usa assim)."),
            h: t("Verbo vivir.", "The verb is vivir.", "O verbo é vivir.") },
          { p: "Soy ___.", g: g("I'm an engineer.", "Sou engenheiro."), o: ["ingeniero", "un ingeniero"], k: 0,
            e: t("Profesión sin un / una: Soy ingeniero.", "No «a/an» with jobs: Soy ingeniero.", "Profissão sem artigo: Soy ingeniero."),
            h: t("Como en portugués: Sou engenheiro.", "Like «Soy profesor».", "Igual ao português: Sou engenheiro.") },
          { p: "Trabajo ___ un banco.", g: g("I work at a bank.", "Trabalho num banco."), o: ["en", "em"], k: 0,
            e: t("en un banco.", "en = at / in.", "«em» é português; em espanhol: en."),
            h: t("Termina en -n.", "It ends in -n.", "Termina em -n.") },
          { p: "___ portugués e inglés.", g: g("I speak Portuguese and English.", "Falo português e inglês."), o: ["Hablo", "Falo"], k: 0,
            e: t("hablar: hablo.", "To speak → hablo.", "Falar → hablo."),
            h: t("Empieza con h.", "It starts with h.", "Começa com h.") },
          { p: "¿De dónde ___?", g: g("Where are you from?", "De onde você é?"), o: ["eres", "es"], k: 0,
            e: t("tú → eres.", "tú (you) → eres.", "tú (você) → eres."),
            h: t("Pregunta a tú.", "You ask «tú».", "Pergunta para tú.") },
          { p: "¿Cómo te ___?", g: g("What's your name?", "Como você se chama?"), o: ["llamas", "llamo"], k: 0,
            e: t("tú → te llamas.", "tú → te llamas.", "tú → te llamas."),
            h: t("Termina en -s.", "It ends in -s.", "Termina em -s.") },
          { p: "¿Qué idiomas ___?", g: g("What languages do you speak?", "Que idiomas você fala?"), o: ["hablas", "hablo"], k: 0,
            e: t("tú → hablas.", "tú → hablas.", "tú → hablas."),
            h: t("Termina en -s.", "It ends in -s.", "Termina em -s.") }
        ]
      },
      {
        tipo: "empareja",
        consigna: t("Une cada expresión con su significado.", "Match each expression with its meaning.", "Ligue cada expressão ao seu significado."),
        pares: [
          ["¿Cómo te llamas?", t("pregunta por el nombre", "What's your name?", "Como você se chama?")],
          ["¿De dónde eres?", t("pregunta por el país", "Where are you from?", "De onde você é?")],
          ["¿Dónde vives?", t("pregunta por la ciudad", "Where do you live?", "Onde você mora?")],
          ["¿En qué trabajas?", t("pregunta por el trabajo", "What do you do?", "Com o que você trabalha?")],
          ["¿Qué idiomas hablas?", t("pregunta por los idiomas", "What languages do you speak?", "Que idiomas você fala?")],
          ["¡Mucho gusto!", t("lo dices al conocer a alguien", "Nice to meet you!", "Muito prazer!")],
          ["un poco de", t("no mucho", "a little", "um pouco de")],
          ["la empresa", t("donde trabajas", "the company", "a empresa")]
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la presentación.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "Hola, me llamo Lucía.", g: g("Hi, my name is Lucía.", "Oi, eu me chamo Lucía."),
            e: t("Hola, + me llamo + nombre.", "Hola, + me llamo + name.", "Hola, + me llamo + nome."),
            h: t("Empieza con Hola,", "Start with Hola,", "Comece com Hola,") },
          { k: "Soy analista de marketing.", g: g("I'm a marketing analyst.", "Sou analista de marketing."),
            e: t("Soy + profesión, sin un.", "Soy + job (no «a»).", "Soy + profissão (sem artigo)."),
            h: t("Empieza con Soy.", "Start with Soy.", "Comece com Soy.") },
          { k: "Trabajo en una empresa de tecnología.", g: g("I work at a tech company.", "Trabalho numa empresa de tecnologia."),
            e: t("Trabajo en + una empresa de…", "Trabajo en + una empresa de…", "Trabajo en + una empresa de…"),
            h: t("Empieza con Trabajo.", "Start with Trabajo.", "Comece com Trabajo.") },
          { k: "Hablo portugués y un poco de español.", g: g("I speak Portuguese and a little Spanish.", "Falo português e um pouco de espanhol."),
            e: t("Hablo + idioma + y + un poco de…", "Hablo + language + y + un poco de…", "Hablo + idioma + y + un poco de…"),
            h: t("Empieza con Hablo.", "Start with Hablo.", "Comece com Hablo.") },
          { k: "¿Y tú? ¿De dónde eres?", g: g("And you? Where are you from?", "E você? De onde você é?"),
            e: t("¿Y tú? + pregunta.", "¿Y tú? + question.", "¿Y tú? + pergunta."),
            h: t("Empieza con ¿Y.", "Start with ¿Y.", "Comece com ¿Y.") },
          { k: "Soy de Brasil y vivo en Recife.", g: g("I'm from Brazil and I live in Recife.", "Sou do Brasil e moro em Recife."),
            e: t("Soy de + país + y + vivo en + ciudad.", "Soy de + country + y + vivo en + city.", "Soy de + país + y + vivo en + cidade."),
            h: t("Empieza con Soy.", "Start with Soy.", "Comece com Soy.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "Me ___ Tomás.", g: g("My name is Tomás.", "Eu me chamo Tomás."), k: ["llamo"],
            e: t("Me llamo.", "Me llamo = my name is.", "Me llamo = eu me chamo."),
            h: t("ll _ _ _ o", "ll _ _ _ o", "ll _ _ _ o") },
          { p: "Soy ___ Brasil.", g: g("I'm from Brazil.", "Sou do Brasil."), k: ["de"],
            e: t("Soy de + país.", "Soy de + country (no article).", "Soy de + país (sem «do»)."),
            h: t("d _", "d _", "d _") },
          { p: "___ en Río de Janeiro. (vivir)", g: g("I live in Rio de Janeiro.", "Moro no Rio de Janeiro."), k: ["vivo"],
            e: t("vivir → vivo.", "vivir → vivo.", "morar → vivo."),
            h: t("v _ _ o", "v _ _ o", "v _ _ o") },
          { p: "Trabajo en una ___ de tecnología.", g: g("I work at a tech company.", "Trabalho numa empresa de tecnologia."), k: ["empresa"],
            e: t("una empresa.", "empresa = company.", "empresa = empresa."),
            h: t("e _ _ _ _ _ a", "e _ _ _ _ _ a", "e _ _ _ _ _ a") },
          { p: "Hablo ___ poco de español.", g: g("I speak a little Spanish.", "Falo um pouco de espanhol."), k: ["un"],
            e: t("un poco de.", "un poco de = a little.", "un poco de = um pouco de."),
            h: t("u _", "u _", "u _") },
          { p: "¿En qué ___? (trabajar, tú)", g: g("What do you do?", "Com o que você trabalha?"), k: ["trabajas"],
            e: t("tú → trabajas.", "tú → trabajas.", "tú → trabajas."),
            h: t("Termina en -as.", "It ends in -as.", "Termina em -as.") },
          { p: "¡Mucho ___!", g: g("Nice to meet you!", "Muito prazer!"), k: ["gusto"],
            e: t("¡Mucho gusto!", "¡Mucho gusto! = Nice to meet you!", "¡Mucho gusto! = Muito prazer!"),
            h: t("g _ _ _ o", "g _ _ _ o", "g _ _ _ o") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Pregúntale a tu colega: de yo a tú.", "Ask your colleague: from yo to tú.", "Pergunte ao seu colega: de yo para tú."),
        items: [
          { p: "Vivo en Lima.", k: ["¿Vives en Lima?"],
            e: t("vivo → ¿vives?", "vivo → ¿vives?", "vivo → ¿vives?"),
            h: t("-o → -es.", "-o → -es.", "-o → -es.") },
          { p: "Soy de Brasil.", k: ["¿Eres de Brasil?"],
            e: t("soy → ¿eres?", "soy → ¿eres?", "soy → ¿eres?"),
            h: t("Es irregular: eres.", "Irregular: eres.", "Irregular: eres.") },
          { p: "Hablo inglés.", k: ["¿Hablas inglés?"],
            e: t("hablo → ¿hablas?", "hablo → ¿hablas?", "hablo → ¿hablas?"),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Trabajo en un banco.", k: ["¿Trabajas en un banco?"],
            e: t("trabajo → ¿trabajas?", "trabajo → ¿trabajas?", "trabajo → ¿trabajas?"),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Soy gerente.", k: ["¿Eres gerente?"],
            e: t("soy → ¿eres?", "soy → ¿eres?", "soy → ¿eres?"),
            h: t("Sin un.", "No «a».", "Sem artigo.") },
          { p: "Me llamo Paula.", k: ["¿Te llamas Paula?"],
            e: t("me llamo → ¿te llamas?", "me llamo → ¿te llamas?", "me llamo → ¿te llamas?"),
            h: t("me → te.", "me → te.", "me → te.") }
        ]
      }
    ],
    reto: {
      consigna: t("Preséntate en la reunión: dos o tres frases.", "Introduce yourself in the meeting: two or three sentences.", "Apresente-se na reunião: duas ou três frases."),
      ruta: ["Hola, me llamo…", "Soy de… y vivo en…", "Soy… Trabajo en…", "Hablo…"],
      lista: [
        t("Dices tu nombre y de dónde eres.", "You say your name and where you're from.", "Você diz seu nome e de onde é."),
        t("Dices tu trabajo sin un / una.", "You say your job without un / una.", "Você diz sua profissão sem un / una.")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
