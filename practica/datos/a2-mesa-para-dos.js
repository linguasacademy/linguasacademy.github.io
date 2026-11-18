(window.PRACTICA = window.PRACTICA || {})["a2-mesa-para-dos"] = {
  tematica: "comida",
  objetivo: { es: "Reservar una mesa por teléfono y pedir en el restaurante", en: "Book a table on the phone and order at the restaurant", pt: "Reservar uma mesa por telefone e pedir no restaurante" },
  repaso: [
    { es: "Buenas tardes. Quiero reservar una mesa para dos.", en: "Good afternoon. I'd like to book a table for two.", pt: "Boa tarde. Quero reservar uma mesa para dois." },
    { es: "¿Para qué día y a qué hora? — Para hoy, a las ocho.", en: "For what day and what time? — For today, at eight.", pt: "Para que dia e que horas? — Para hoje, às oito." },
    { es: "¿A nombre de quién? — A nombre de Ana López.", en: "Under what name? — Under the name Ana López.", pt: "Em nome de quem? — Em nome de Ana López." },
    { es: "Tengo una reserva para dos a las ocho.", en: "I have a reservation for two at eight.", pt: "Tenho uma reserva para dois às oito." },
    { es: "De plato fuerte, pescado con arroz. ¿Me trae la cuenta, por favor?", en: "For the main course, fish with rice. Could you bring me the bill, please?", pt: "De prato principal, peixe com arroz. O senhor me traz a conta, por favor?" }
  ],
  ejercicios: [
    {
      tipo: "ordena",
      consigna: { es: "Ordena las palabras de la llamada.", en: "Put the words of the phone call in order.", pt: "Ponha em ordem as palavras da ligação." },
      items: [
        { k: "Quiero reservar una mesa para dos.", e: { es: "reservar una mesa para + número.", en: "reservar una mesa para + number.", pt: "reservar una mesa para + número." }, h: { es: "Empieza por Quiero.", en: "Start with Quiero.", pt: "Comece por Quiero." } },
        { k: "¿Para qué día es la reserva?", e: { es: "¿Para qué día…?", en: "¿Para qué día…? = For which day…?", pt: "¿Para qué día…? = Para que dia…?" }, h: { es: "Empieza por ¿Para.", en: "Start with ¿Para.", pt: "Comece por ¿Para." } },
        { k: "Para el sábado a las ocho.", e: { es: "Para + día + a las + hora.", en: "Para + day + a las + time.", pt: "Para + dia + a las + hora." }, h: { es: "Termina con ocho.", en: "It ends with ocho.", pt: "Termina com ocho." } },
        { k: "¿A nombre de quién?", e: { es: "Pregunta por el nombre.", en: "It asks for the name.", pt: "Pergunta o nome." }, h: { es: "Empieza por ¿A.", en: "Start with ¿A.", pt: "Comece por ¿A." } },
        { k: "Tengo una reserva a nombre de Ana.", e: { es: "Tengo una reserva + nombre.", en: "Tengo una reserva + name.", pt: "Tengo una reserva + nome." }, h: { es: "Empieza por Tengo.", en: "Start with Tengo.", pt: "Comece por Tengo." } },
        { k: "¿Tienen una mesa en la terraza?", e: { es: "¿Tienen…? = ustedes.", en: "¿Tienen…? = do you (plural) have…?", pt: "¿Tienen…? = vocês têm…?" }, h: { es: "Empieza por ¿Tienen.", en: "Start with ¿Tienen.", pt: "Comece por ¿Tienen." } },
        { k: "Para empezar, una sopa de verduras.", e: { es: "Para empezar + plato.", en: "Para empezar + dish.", pt: "Para empezar + prato." }, h: { es: "Empieza por Para empezar.", en: "Start with Para empezar.", pt: "Comece por Para empezar." } },
        { k: "¿Me trae la cuenta, por favor?", e: { es: "¿Me trae…?", en: "¿Me trae…?", pt: "¿Me trae…?" }, h: { es: "Empieza por ¿Me.", en: "Start with ¿Me.", pt: "Comece por ¿Me." } }
      ]
    },
    {
      tipo: "elige",
      consigna: { es: "¿Qué dices o qué te preguntan?", en: "What do you say, or what are you asked?", pt: "O que você diz ou o que te perguntam?" },
      items: [
        { p: "Llamas al restaurante: «Buenas tardes. ___»", o: ["La cuenta, por favor.", "Quiero reservar una mesa.", "Está muy rico."], k: 1, e: { es: "Al llamar, reservas.", en: "When you call, you book.", pt: "Ao ligar, você reserva." }, h: { es: "Es el principio.", en: "It's the start.", pt: "É o começo." } },
        { p: "—¿Para cuántas personas? —___", o: ["Para cuatro.", "A las ocho.", "Para el sábado."], k: 0, e: { es: "¿Cuántas personas? → un número.", en: "How many people? → a number.", pt: "Quantas pessoas? → um número." }, h: { es: "Cuántas = número.", en: "Cuántas = how many.", pt: "Cuántas = quantas." } },
        { p: "—¿A qué hora? —___", o: ["Para dos.", "El viernes.", "A las nueve."], k: 2, e: { es: "¿A qué hora? → a las…", en: "What time? → a las…", pt: "Que horas? → a las…" }, h: { es: "Una hora.", en: "A time.", pt: "Um horário." } },
        { p: "—¿Para qué día? —___", o: ["Para dos.", "Para el viernes.", "A las siete."], k: 1, e: { es: "¿Qué día? → un día.", en: "Which day? → a day.", pt: "Que dia? → um dia." }, h: { es: "lunes, martes…", en: "lunes, martes…", pt: "lunes, martes…" } },
        { p: "—¿A nombre de quién? —___", o: ["Para mí, pescado.", "Muy bien, gracias.", "A nombre de Carlos Ruiz."], k: 2, e: { es: "A nombre de + nombre.", en: "A nombre de + name.", pt: "A nombre de + nome." }, h: { es: "Te piden un nombre.", en: "They ask for a name.", pt: "Pedem um nome." } },
        { p: "Llegas al restaurante: «___»", o: ["Tengo una reserva para dos.", "Quiero reservar para mañana.", "¿A nombre de quién?"], k: 0, e: { es: "Ya reservaste: tengo una reserva.", en: "You already booked: tengo una reserva.", pt: "Você já reservou: tengo una reserva." }, h: { es: "Ya hiciste la reserva.", en: "You already booked.", pt: "Você já reservou." } },
        { p: "El mesero: «___» — Para empezar, una sopa.", o: ["¿Qué desea?", "¿A qué hora?", "¿Para cuántas personas?"], k: 0, e: { es: "¿Qué desea? = ¿qué quiere pedir?", en: "¿Qué desea? = What would you like?", pt: "¿Qué desea? = O que deseja?" }, h: { es: "Pregunta por la comida.", en: "It's about food.", pt: "É sobre a comida." } },
        { p: "—¿Y para tomar? —___", o: ["Pescado con arroz.", "A las ocho.", "Un jugo de mango, por favor."], k: 2, e: { es: "Para tomar = una bebida.", en: "Para tomar = a drink.", pt: "Para tomar = uma bebida." }, h: { es: "Es una bebida.", en: "It's a drink.", pt: "É uma bebida." } },
        { p: "Al final: «___»", o: ["Una mesa para dos.", "¿Me trae la cuenta, por favor?", "¿Qué me recomienda?"], k: 1, e: { es: "Al final, la cuenta.", en: "At the end, the bill.", pt: "No final, a conta." }, h: { es: "Vas a pagar.", en: "You're going to pay.", pt: "Você vai pagar." } }
      ]
    },
    {
      tipo: "completa",
      consigna: { es: "Escribe la palabra que falta.", en: "Write the missing word.", pt: "Escreva a palavra que falta." },
      items: [
        { p: "Quiero ___ una mesa para esta noche.", k: ["reservar"], e: { es: "reservar una mesa.", en: "reservar = to book.", pt: "reservar." }, h: { es: "Igual en portugués.", en: "Same as Portuguese.", pt: "Igual ao português." } },
        { p: "Una mesa ___ dos, por favor.", k: ["para"], e: { es: "una mesa para + número.", en: "una mesa para + number.", pt: "una mesa para + número." }, h: { es: "Igual en portugués.", en: "Same as Portuguese.", pt: "Igual ao português." } },
        { p: "¿Para ___ personas?", k: ["cuántas"], e: { es: "¿cuántas?, con tilde.", en: "¿cuántas? = how many, with an accent.", pt: "¿cuántas? = quantas, com acento." }, h: { es: "personas: femenino.", en: "personas: feminine.", pt: "personas: feminino." } },
        { p: "¿A ___ de quién?", k: ["nombre"], e: { es: "a nombre de.", en: "a nombre de = under the name of.", pt: "a nombre de = em nome de." }, h: { es: "Lo que dices al presentarte.", en: "Your name.", pt: "O seu nome." } },
        { p: "Tengo una ___ para dos a las ocho.", k: ["reserva"], e: { es: "una reserva.", en: "una reserva = a reservation.", pt: "una reserva." }, h: { es: "Igual en portugués.", en: "Same as Portuguese.", pt: "Igual ao português." } },
        { p: "¿Qué ___? — Para mí, pescado. (el mesero, usted)", k: ["desea"], e: { es: "¿Qué desea? (usted).", en: "¿Qué desea? (formal).", pt: "¿Qué desea? (formal)." }, h: { es: "Verbo desear.", en: "Verb desear.", pt: "Verbo desear." } },
        { p: "De plato ___, pollo con arroz.", k: ["fuerte"], e: { es: "plato fuerte = plato principal.", en: "plato fuerte = main course.", pt: "plato fuerte = prato principal." }, h: { es: "Lo contrario de débil.", en: "Literally «strong».", pt: "Literalmente «forte»." } },
        { p: "¿Me ___ la cuenta, por favor?", k: ["trae"], e: { es: "¿Me trae…?", en: "¿Me trae…? = Could you bring me…?", pt: "¿Me trae…? = O senhor me traz…?" }, h: { es: "Verbo traer.", en: "Verb traer.", pt: "Verbo traer." } },
        { p: "La reserva es ___ las ocho y media.", k: ["a"], e: { es: "a las + hora.", en: "a las + time.", pt: "a las + hora." }, h: { es: "Una letra.", en: "One letter.", pt: "Uma letra." } }
      ]
    },
    {
      tipo: "transforma",
      consigna: { es: "Escribe la pregunta para esta respuesta.", en: "Write the question for this answer.", pt: "Escreva a pergunta para esta resposta." },
      items: [
        { p: "Para cuatro personas.", k: ["¿Para cuántas personas?"], e: { es: "¿Para cuántas personas?", en: "¿Para cuántas personas?", pt: "¿Para cuántas personas?" }, h: { es: "Empieza por ¿Para cuántas.", en: "Start with ¿Para cuántas.", pt: "Comece por ¿Para cuántas." } },
        { p: "A las ocho.", k: ["¿A qué hora?"], e: { es: "¿A qué hora?", en: "¿A qué hora?", pt: "¿A qué hora?" }, h: { es: "Empieza por ¿A qué.", en: "Start with ¿A qué.", pt: "Comece por ¿A qué." } },
        { p: "Para el sábado.", k: ["¿Para qué día?"], e: { es: "¿Para qué día?", en: "¿Para qué día?", pt: "¿Para qué día?" }, h: { es: "Empieza por ¿Para qué.", en: "Start with ¿Para qué.", pt: "Comece por ¿Para qué." } },
        { p: "A nombre de Ana López.", k: ["¿A nombre de quién?"], e: { es: "¿A nombre de quién?", en: "¿A nombre de quién?", pt: "¿A nombre de quién?" }, h: { es: "Termina con quién.", en: "It ends with quién.", pt: "Termina com quién." } },
        { p: "Para mí, una sopa.", k: ["¿Qué desea?", "¿Qué desea usted?", "¿Qué quiere?"], e: { es: "¿Qué desea?", en: "¿Qué desea?", pt: "¿Qué desea?" }, h: { es: "Lo pregunta el mesero.", en: "The waiter asks it.", pt: "O garçom pergunta." } },
        { p: "Un jugo de mango.", k: ["¿Y para tomar?", "¿Qué desea para tomar?", "¿Para tomar?"], e: { es: "¿Y para tomar?", en: "¿Y para tomar?", pt: "¿Y para tomar?" }, h: { es: "Es una bebida.", en: "It's a drink.", pt: "É uma bebida." } },
        { p: "Son cincuenta mil pesos.", k: ["¿Cuánto es?", "¿Me trae la cuenta, por favor?", "¿Me trae la cuenta?"], e: { es: "¿Cuánto es? o ¿Me trae la cuenta?", en: "¿Cuánto es? or ¿Me trae la cuenta?", pt: "¿Cuánto es? ou ¿Me trae la cuenta?" }, h: { es: "Quieres pagar.", en: "You want to pay.", pt: "Você quer pagar." } },
        { p: "Sí, tenemos una mesa en la terraza.", k: ["¿Tienen una mesa en la terraza?"], e: { es: "¿Tienen…? (ustedes).", en: "¿Tienen…? (plural you).", pt: "¿Tienen…? (vocês)." }, h: { es: "tenemos → tienen.", en: "tenemos → tienen.", pt: "tenemos → tienen." } },
        { p: "De plato fuerte, pescado con arroz.", k: ["¿Y de plato fuerte?", "¿Qué desea de plato fuerte?"], e: { es: "¿Y de plato fuerte?", en: "¿Y de plato fuerte?", pt: "¿Y de plato fuerte?" }, h: { es: "El plato principal.", en: "The main course.", pt: "O prato principal." } }
      ]
    }
  ],
  reto: {
    consigna: { es: "Escribe la llamada para reservar una mesa: día, hora, personas y nombre.", en: "Write the phone call to book a table: day, time, people and name.", pt: "Escreva a ligação para reservar uma mesa: dia, hora, pessoas e nome." },
    ruta: ["Buenas tardes. Quiero reservar…", "Para el…", "A las…", "Somos…", "A nombre de…"],
    lista: [
      { es: "Día y hora de la reserva", en: "Day and time of the booking", pt: "Dia e hora da reserva" },
      { es: "Número de personas", en: "Number of people", pt: "Número de pessoas" },
      { es: "1 pregunta tuya (¿Tienen…?)", en: "1 question of your own (¿Tienen…?)", pt: "1 pergunta sua (¿Tienen…?)" }
    ],
    min: 3, max: 5, unidad: "frases"
  }
};
