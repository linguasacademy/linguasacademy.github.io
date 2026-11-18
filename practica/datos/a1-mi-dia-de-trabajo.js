/* Práctica autónoma · A1 · Mi día de trabajo (adultos, consignas en español)
   Tema y gramática del catálogo: la agenda del día: horas (¿A qué hora…?, a las / a la una) y yo / tú / ella */
(function () {
  var t = function (es, en, pt) { return { es: es, en: en, pt: pt }; };
  var g = function (en, pt) { return { en: en, pt: pt }; };

  (window.PRACTICA = window.PRACTICA || {})["a1-mi-dia-de-trabajo"] = {
    tematica: "rutina",
    objetivo: t("Decir y preguntar a qué hora haces las cosas del día", "Say and ask what time you do things during the day", "Dizer e perguntar a que horas você faz as coisas do dia"),
    repaso: [
      t("¿A qué hora llegas a la oficina? — Llego a las ocho.", "What time do you get to the office? — At eight.", "A que horas você chega ao escritório? — Chego às oito."),
      t("Tengo una reunión a las diez.", "I have a meeting at ten.", "Tenho uma reunião às dez."),
      t("Ella almuerza con el equipo a la una.", "She has lunch with the team at one.", "Ela almoça com a equipe à uma."),
      t("Reviso el correo por la mañana.", "I check my email in the morning.", "Vejo o e-mail de manhã."),
      t("Termino a las siete. ¡Qué tarde!", "I finish at seven. That's late!", "Termino às sete. Que tarde!")
    ],
    ejercicios: [
      {
        tipo: "elige",
        consigna: t("Elige la forma correcta.", "Choose the correct form.", "Escolha a forma correta."),
        items: [
          { p: "Llego a la oficina ___ ocho.", g: g("I get to the office at eight.", "Chego ao escritório às oito."), o: ["a las", "a la"], k: 0,
            e: t("a las + hora; solo «a la una».", "a las + time; only «a la una».", "a las + hora; só «a la una»."),
            h: t("Ocho no es una.", "Eight isn't one.", "Oito não é uma.") },
          { p: "Almuerzo ___ una.", g: g("I have lunch at one.", "Almoço à uma."), o: ["a la", "a las"], k: 0,
            e: t("La una: a la una.", "One o'clock → a la una.", "Uma hora → a la una."),
            h: t("Es la una.", "It's one o'clock.", "É uma hora.") },
          { p: "¿A qué hora ___ tú?", g: g("What time do you finish?", "A que horas você termina?"), o: ["terminas", "termina"], k: 0,
            e: t("tú → terminas.", "tú → terminas.", "tú → terminas."),
            h: t("tú termina en -s.", "tú forms end in -s.", "tú termina em -s.") },
          { p: "Ella ___ una reunión a las diez.", g: g("She has a meeting at ten.", "Ela tem uma reunião às dez."), o: ["tiene", "tengo"], k: 0,
            e: t("ella → tiene. yo → tengo.", "she → tiene; I → tengo.", "ela → tiene; eu → tengo."),
            h: t("Habla de ella.", "It's about her.", "Fala dela.") },
          { p: "Yo ___ con el equipo.", g: g("I have lunch with the team.", "Eu almoço com a equipe."), o: ["almuerzo", "almuerza"], k: 0,
            e: t("yo → almuerzo.", "yo → almuerzo.", "yo → almuerzo."),
            h: t("yo → -o.", "yo → -o.", "yo → -o.") },
          { p: "¿A qué hora ___ usted?", g: g("What time do you start? (formal)", "A que horas o senhor começa?"), o: ["empieza", "empiezas"], k: 0,
            e: t("usted = forma de ella: empieza.", "usted uses the she-form: empieza.", "usted usa a forma de ela: empieza."),
            h: t("Como «ella empieza».", "Like «ella empieza».", "Como «ella empieza».") },
          { p: "Llego a las cinco. ¡Qué ___!", g: g("I arrive at five. That's early!", "Chego às cinco. Que cedo!"), o: ["temprano", "tarde"], k: 0,
            e: t("Las cinco es muy temprano para la oficina.", "Five is early → ¡Qué temprano!", "Cinco é cedo → ¡Qué temprano!"),
            h: t("Antes de las ocho.", "Before eight.", "Antes das oito.") },
          { p: "Termino a las nueve. ¡Qué ___!", g: g("I finish at nine. That's late!", "Termino às nove. Que tarde!"), o: ["tarde", "temprano"], k: 0,
            e: t("Las nueve es tarde para terminar.", "Finishing at nine is late → ¡Qué tarde!", "Terminar às nove é tarde → ¡Qué tarde!"),
            h: t("Después de las seis.", "After six.", "Depois das seis.") }
        ]
      },
      {
        tipo: "ordena",
        consigna: t("Ordena la frase de la agenda.", "Put the words in order.", "Coloque as palavras em ordem."),
        items: [
          { k: "¿A qué hora llegas a la oficina?", g: g("What time do you get to the office?", "A que horas você chega ao escritório?"),
            e: t("¿A qué hora + verbo + …?", "¿A qué hora + verb + …?", "¿A qué hora + verbo + …?"),
            h: t("Empieza con ¿A.", "Start with ¿A.", "Comece com ¿A.") },
          { k: "Tengo una reunión a las diez.", g: g("I have a meeting at ten.", "Tenho uma reunião às dez."),
            e: t("Tengo + una reunión + a las diez.", "Tengo + una reunión + a las diez.", "Tengo + una reunión + a las diez."),
            h: t("Empieza con Tengo.", "Start with Tengo.", "Comece com Tengo.") },
          { k: "Almuerzo con el equipo a la una.", g: g("I have lunch with the team at one.", "Almoço com a equipe à uma."),
            e: t("Almuerzo + con el equipo + a la una.", "Almuerzo + con el equipo + a la una.", "Almuerzo + con el equipo + a la una."),
            h: t("Empieza con Almuerzo.", "Start with Almuerzo.", "Comece com Almuerzo.") },
          { k: "Por la tarde hablo con clientes.", g: g("In the afternoon I talk to clients.", "À tarde falo com clientes."),
            e: t("Por la tarde + hablo + con clientes.", "Por la tarde + hablo + con clientes.", "Por la tarde + hablo + con clientes."),
            h: t("Empieza con Por.", "Start with Por.", "Comece com Por.") },
          { k: "Ella termina a las seis.", g: g("She finishes at six.", "Ela termina às seis."),
            e: t("Ella + termina + a las seis.", "Ella + termina + a las seis.", "Ella + termina + a las seis."),
            h: t("Empieza con Ella.", "Start with Ella.", "Comece com Ella.") },
          { k: "Reviso el correo por la mañana.", g: g("I check my email in the morning.", "Vejo o e-mail de manhã."),
            e: t("Reviso + el correo + por la mañana.", "Reviso + el correo + por la mañana.", "Reviso + el correo + por la mañana."),
            h: t("Empieza con Reviso.", "Start with Reviso.", "Comece com Reviso.") }
        ]
      },
      {
        tipo: "completa",
        consigna: t("Escribe la palabra que falta.", "Write the missing word.", "Escreva a palavra que falta."),
        items: [
          { p: "¿A qué ___ empiezas?", g: g("What time do you start?", "A que horas você começa?"), k: ["hora"],
            e: t("¿A qué hora…?", "¿A qué hora…? = What time…?", "¿A qué hora…? = A que horas…?"),
            h: t("h _ _ a", "h _ _ a", "h _ _ a") },
          { p: "Yo ___ una reunión a las once. (tener)", g: g("I have a meeting at eleven.", "Tenho uma reunião às onze."), k: ["tengo"],
            e: t("yo → tengo.", "yo → tengo.", "yo → tengo."),
            h: t("t _ _ _ o", "t _ _ _ o", "t _ _ _ o") },
          { p: "Ella ___ con clientes. (hablar)", g: g("She talks to clients.", "Ela fala com clientes."), k: ["habla"],
            e: t("ella → habla.", "she → habla.", "ela → habla."),
            h: t("-ar → -a.", "-ar → -a.", "-ar → -a.") },
          { p: "Tú ___ el correo a las nueve. (revisar)", g: g("You check the email at nine.", "Você vê o e-mail às nove."), k: ["revisas"],
            e: t("tú → revisas.", "tú → revisas.", "tú → revisas."),
            h: t("-ar → -as.", "-ar → -as.", "-ar → -as.") },
          { p: "Yo ___ a la una. (almorzar)", g: g("I have lunch at one.", "Almoço à uma."), k: ["almuerzo"],
            e: t("almorzar → almuerzo (o → ue).", "almorzar → almuerzo (o → ue).", "almorzar → almuerzo (o → ue)."),
            h: t("a l m u e…", "a l m u e…", "a l m u e…") },
          { p: "Ella ___ a las cinco. (terminar)", g: g("She finishes at five.", "Ela termina às cinco."), k: ["termina"],
            e: t("ella → termina.", "she → termina.", "ela → termina."),
            h: t("-ar → -a.", "-ar → -a.", "-ar → -a.") },
          { p: "¿A qué hora ___ tú? (llegar)", g: g("What time do you arrive?", "A que horas você chega?"), k: ["llegas"],
            e: t("tú → llegas.", "tú → llegas.", "tú → llegas."),
            h: t("-ar → -as.", "-ar → -as.", "-ar → -as.") }
        ]
      },
      {
        tipo: "transforma",
        consigna: t("Escribe la pregunta con ¿A qué hora…? (tú).", "Write the question with ¿A qué hora…? (tú).", "Escreva a pergunta com ¿A qué hora…? (tú)."),
        items: [
          { p: "Llego a la oficina a las ocho.", k: ["¿A qué hora llegas a la oficina?", "¿A qué hora llegas?"],
            e: t("llego → ¿A qué hora llegas…?", "llego → ¿A qué hora llegas…?", "llego → ¿A qué hora llegas…?"),
            h: t("La hora no va en la pregunta.", "Leave the time out of the question.", "A hora não vai na pergunta.") },
          { p: "Almuerzo a la una.", k: ["¿A qué hora almuerzas?"],
            e: t("almuerzo → almuerzas.", "almuerzo → almuerzas.", "almuerzo → almuerzas."),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Termino a las seis.", k: ["¿A qué hora terminas?"],
            e: t("termino → terminas.", "termino → terminas.", "termino → terminas."),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Empiezo a las nueve.", k: ["¿A qué hora empiezas?", "¿A qué hora empiezas a trabajar?"],
            e: t("empiezo → empiezas.", "empiezo → empiezas.", "empiezo → empiezas."),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") },
          { p: "Tengo una reunión a las diez.", k: ["¿A qué hora tienes una reunión?", "¿A qué hora tienes la reunión?"],
            e: t("tengo → tienes.", "tengo → tienes.", "tengo → tienes."),
            h: t("t i e n…", "t i e n…", "t i e n…") },
          { p: "Reviso el correo a las ocho.", k: ["¿A qué hora revisas el correo?"],
            e: t("reviso → revisas.", "reviso → revisas.", "reviso → revisas."),
            h: t("-o → -as.", "-o → -as.", "-o → -as.") }
        ]
      }
    ],
    reto: {
      consigna: t("Tu agenda de un día normal: escribe dos o tres frases con horas.", "Your agenda on a normal day: write two or three sentences with times.", "Sua agenda num dia normal: escreva duas ou três frases com horários."),
      ruta: ["Llego a las…", "Tengo una reunión a las…", "Almuerzo a la una.", "Termino a las…"],
      lista: [
        t("Cada frase tiene una hora.", "Each sentence has a time.", "Cada frase tem um horário."),
        t("Una pregunta para tu profe: ¿A qué hora…?", "One question for your teacher: ¿A qué hora…?", "Uma pergunta para seu professor: ¿A qué hora…?")
      ],
      min: 2, max: 3, unidad: "frases"
    }
  };
})();
