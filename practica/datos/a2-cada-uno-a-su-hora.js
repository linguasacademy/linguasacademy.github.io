(window.PRACTICA = window.PRACTICA || {})["a2-cada-uno-a-su-hora"] = {
  tematica: "rutina",
  objetivo: { es: "Contar tu rutina y decir a qué hora haces cada cosa", en: "Describe your routine and say what time you do each thing", pt: "Contar a sua rotina e dizer a que horas você faz cada coisa" },
  repaso: [
    { es: "Me levanto a las seis y media.", en: "I get up at half past six.", pt: "Eu me levanto às seis e meia." },
    { es: "Desayuno y salgo de casa a las siete y cuarto.", en: "I have breakfast and leave home at a quarter past seven.", pt: "Tomo café da manhã e saio de casa às sete e quinze." },
    { es: "¿A qué hora almuerzas? — A la una.", en: "What time do you have lunch? — At one.", pt: "A que horas você almoça? — À uma." },
    { es: "Por la noche ceno y me acuesto a las diez menos cuarto.", en: "In the evening I have dinner and go to bed at a quarter to ten.", pt: "À noite eu janto e me deito às quinze para as dez." }
  ],
  ejercicios: [
    {
      tipo: "elige",
      consigna: { es: "Elige la forma correcta.", en: "Choose the right form.", pt: "Escolha a forma certa." },
      items: [
        { p: "Yo ___ levanto a las seis.", o: ["te", "me", "se"], k: 1, e: { es: "yo → me levanto.", en: "yo → me levanto.", pt: "yo → me levanto." }, h: { es: "yo → me.", en: "yo → me.", pt: "yo → me." } },
        { p: "¿A qué hora ___ acuestas tú?", o: ["te", "me", "se"], k: 0, e: { es: "tú → te acuestas.", en: "tú → te acuestas.", pt: "tú → te acuestas." }, h: { es: "tú → te.", en: "tú → te.", pt: "tú → te." } },
        { p: "Mi hermana ___ ducha por la noche.", o: ["me", "te", "se"], k: 2, e: { es: "ella → se ducha.", en: "she → se ducha.", pt: "ela → se ducha." }, h: { es: "ella → se.", en: "she → se.", pt: "ela → se." } },
        { p: "Salgo de casa ___ las siete.", o: ["en", "a", "de"], k: 1, e: { es: "a las + hora.", en: "a las + time.", pt: "a las + hora (às)." }, h: { es: "¿A qué hora? → a las.", en: "¿A qué hora? → a las.", pt: "¿A qué hora? → a las." } },
        { p: "Almuerzo a ___ una.", o: ["las", "el", "la"], k: 2, e: { es: "La una: singular.", en: "La una: singular.", pt: "La una: singular." }, h: { es: "Solo una hora.", en: "Just one o'clock.", pt: "Só uma hora." } },
        { p: "7:15 → Son las siete y ___.", o: ["cuarto", "media", "quince minutos de"], k: 0, e: { es: ":15 = y cuarto.", en: ":15 = y cuarto (quarter past).", pt: ":15 = y cuarto (e quinze)." }, h: { es: "Un cuarto de hora.", en: "A quarter of an hour.", pt: "Um quarto de hora." } },
        { p: "6:30 → Me levanto a las seis y ___.", o: ["media", "cuarto", "mitad"], k: 0, e: { es: ":30 = y media.", en: ":30 = y media (half past).", pt: ":30 = y media (e meia)." }, h: { es: "Media hora.", en: "Half an hour.", pt: "Meia hora." } },
        { p: "9:45 → Me acuesto a las diez ___ cuarto.", o: ["y", "para", "menos"], k: 2, e: { es: ":45 = la hora siguiente menos cuarto.", en: ":45 = next hour menos cuarto.", pt: ":45 = a hora seguinte menos cuarto." }, h: { es: "Faltan 15 minutos.", en: "15 minutes to go.", pt: "Faltam 15 minutos." } },
        { p: "Llego al trabajo a las ocho de la ___.", o: ["noche", "mañana", "tarde"], k: 1, e: { es: "8:00 temprano = de la mañana.", en: "8:00 early = de la mañana.", pt: "8:00 cedo = de la mañana." }, h: { es: "Es temprano.", en: "It's early.", pt: "É cedo." } }
      ]
    },
    {
      tipo: "empareja",
      consigna: { es: "Une cada verbo de la rutina con su significado.", en: "Match each routine verb with its meaning.", pt: "Ligue cada verbo da rotina ao seu significado." },
      pares: [
        ["me levanto", { es: "salgo de la cama", en: "I get up", pt: "eu me levanto" }],
        ["me ducho", { es: "con agua", en: "I take a shower", pt: "eu tomo banho" }],
        ["desayuno", { es: "comida de la mañana", en: "I have breakfast", pt: "tomo café da manhã" }],
        ["salgo de casa", { es: "voy afuera", en: "I leave home", pt: "saio de casa" }],
        ["llego al trabajo", { es: "estoy en el trabajo", en: "I get to work", pt: "chego ao trabalho" }],
        ["almuerzo", { es: "comida del mediodía", en: "I have lunch", pt: "almoço" }],
        ["vuelvo a casa", { es: "regreso", en: "I come back home", pt: "volto para casa" }],
        ["ceno", { es: "comida de la noche", en: "I have dinner", pt: "janto" }],
        ["me acuesto", { es: "voy a la cama", en: "I go to bed", pt: "eu me deito" }]
      ]
    },
    {
      tipo: "transforma",
      consigna: { es: "Cambia la persona como dice el paréntesis.", en: "Change the person as the brackets say.", pt: "Mude a pessoa como diz o parêntese." },
      items: [
        { p: "Me levanto a las seis. (tú)", k: ["Te levantas a las seis.", "Tú te levantas a las seis."], e: { es: "tú → te levantas.", en: "tú → te levantas.", pt: "tú → te levantas." }, h: { es: "me → te, -o → -as.", en: "me → te, -o → -as.", pt: "me → te, -o → -as." } },
        { p: "Me ducho por la mañana. (mi hermano)", k: ["Mi hermano se ducha por la mañana."], e: { es: "él → se ducha.", en: "he → se ducha.", pt: "ele → se ducha." }, h: { es: "me → se.", en: "me → se.", pt: "me → se." } },
        { p: "Desayuno a las siete. (nosotros)", k: ["Desayunamos a las siete.", "Nosotros desayunamos a las siete."], e: { es: "nosotros → -amos.", en: "nosotros → -amos.", pt: "nosotros → -amos." }, h: { es: "Termina en -amos.", en: "It ends in -amos.", pt: "Termina em -amos." } },
        { p: "Salgo de casa a las ocho. (ella)", k: ["Ella sale de casa a las ocho.", "Sale de casa a las ocho."], e: { es: "salgo → sale.", en: "salgo → sale.", pt: "salgo → sale." }, h: { es: "Sin g.", en: "No g.", pt: "Sem g." } },
        { p: "Almuerzo a la una. (ustedes)", k: ["Ustedes almuerzan a la una.", "Almuerzan a la una."], e: { es: "ustedes → almuerzan.", en: "ustedes → almuerzan.", pt: "ustedes → almuerzan." }, h: { es: "Termina en -an.", en: "It ends in -an.", pt: "Termina em -an." } },
        { p: "Vuelvo a casa a las seis. (tú)", k: ["Vuelves a casa a las seis.", "Tú vuelves a casa a las seis."], e: { es: "tú → vuelves.", en: "tú → vuelves.", pt: "tú → vuelves." }, h: { es: "-o → -es.", en: "-o → -es.", pt: "-o → -es." } },
        { p: "Me acuesto tarde. (mis papás)", k: ["Mis papás se acuestan tarde."], e: { es: "ellos → se acuestan.", en: "they → se acuestan.", pt: "eles → se acuestan." }, h: { es: "me → se, -o → -an.", en: "me → se, -o → -an.", pt: "me → se, -o → -an." } },
        { p: "Ceno a las ocho. (pregunta para tú: ¿A qué hora…?)", k: ["¿A qué hora cenas?", "¿A qué hora cenas tú?"], e: { es: "¿A qué hora + verbo con tú?", en: "¿A qué hora + verb for tú?", pt: "¿A qué hora + verbo com tú?" }, h: { es: "ceno → cenas.", en: "ceno → cenas.", pt: "ceno → cenas." } },
        { p: "Me levanto a las seis. (pregunta para tú: ¿A qué hora…?)", k: ["¿A qué hora te levantas?", "¿A qué hora te levantas tú?"], e: { es: "¿A qué hora te levantas?", en: "¿A qué hora te levantas?", pt: "¿A qué hora te levantas?" }, h: { es: "me → te.", en: "me → te.", pt: "me → te." } }
      ]
    },
    {
      tipo: "completa",
      consigna: { es: "Escribe la hora en letras.", en: "Write the time in words.", pt: "Escreva a hora por extenso." },
      items: [
        { p: "(6:30) Me levanto a las seis y ___.", k: ["media"], e: { es: ":30 = y media.", en: ":30 = y media.", pt: ":30 = y media." }, h: { es: "Media hora.", en: "Half an hour.", pt: "Meia hora." } },
        { p: "(7:15) Desayuno a las siete y ___.", k: ["cuarto"], e: { es: ":15 = y cuarto.", en: ":15 = y cuarto.", pt: ":15 = y cuarto." }, h: { es: "Un cuarto de hora.", en: "A quarter.", pt: "Um quarto." } },
        { p: "(1:00) Almuerzo a la ___.", k: ["una"], e: { es: "la una.", en: "la una = one o'clock.", pt: "la una = uma hora." }, h: { es: "Femenino: una.", en: "Feminine: una.", pt: "Feminino: una." } },
        { p: "(9:45) Me acuesto a las diez ___ cuarto.", k: ["menos"], e: { es: ":45 = menos cuarto.", en: ":45 = menos cuarto.", pt: ":45 = menos cuarto." }, h: { es: "Faltan 15 minutos.", en: "15 minutes to go.", pt: "Faltam 15 minutos." } },
        { p: "(8:00) Llego al trabajo a las ___.", k: ["ocho"], e: { es: "a las ocho.", en: "a las ocho.", pt: "a las ocho." }, h: { es: "8 = ocho.", en: "8 = ocho.", pt: "8 = ocho." } },
        { p: "(12:00) Salgo a almorzar a las ___.", k: ["doce"], e: { es: "a las doce.", en: "a las doce.", pt: "a las doce." }, h: { es: "12 = doce.", en: "12 = doce.", pt: "12 = doce." } },
        { p: "(6:00 p. m.) Vuelvo a casa a las seis de la ___.", k: ["tarde"], e: { es: "6 p. m. = de la tarde.", en: "6 p.m. = de la tarde.", pt: "18h = de la tarde." }, h: { es: "No es de mañana ni de noche.", en: "Not morning, not night.", pt: "Nem manhã nem noite." } },
        { p: "(10:00 p. m.) Me acuesto a las diez de la ___.", k: ["noche"], e: { es: "10 p. m. = de la noche.", en: "10 p.m. = de la noche.", pt: "22h = de la noche." }, h: { es: "Ya está oscuro.", en: "It's dark.", pt: "Já está escuro." } },
        { p: "¿A qué hora te ___? — A las seis. (levantarse)", k: ["levantas"], e: { es: "tú → te levantas.", en: "tú → te levantas.", pt: "tú → te levantas." }, h: { es: "tú → -as.", en: "tú → -as.", pt: "tú → -as." } }
      ]
    }
  ],
  reto: {
    consigna: { es: "Escribe tu rutina de un día de semana, con la hora de cada cosa.", en: "Write your weekday routine, with the time of each thing.", pt: "Escreva a sua rotina de um dia de semana, com a hora de cada coisa." },
    ruta: ["Me levanto a las…", "Desayuno y salgo de casa a las…", "Almuerzo a la…", "Vuelvo a casa…", "Me acuesto a las…"],
    lista: [
      { es: "4 actividades de tu día", en: "4 activities of your day", pt: "4 atividades do seu dia" },
      { es: "3 horas (y cuarto, y media o menos cuarto)", en: "3 times (y cuarto, y media or menos cuarto)", pt: "3 horas (y cuarto, y media ou menos cuarto)" },
      { es: "2 verbos con me (me levanto, me acuesto…)", en: "2 verbs with me (me levanto, me acuesto…)", pt: "2 verbos com me (me levanto, me acuesto…)" }
    ],
    min: 3, max: 5, unidad: "frases"
  }
};
