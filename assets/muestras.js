/* Muestras gratis · Lingua's Academy
   Una muestra corta por tablero, que se juega en muestra.html?t=<archivo-sin-.html>.
   Contenido nuevo y breve: los tableros reales (t/*.bin) no se tocan.

   Campos de cada muestra
     nivel, titulo   copia de assets/catalogo.js (respaldo si el catálogo cambia)
     c               idioma de las consignas: "en", "pt" o "es"
     ninos           true si es un tablero para niños
     tipo            "elige" | "completa" | "ordena"
     sit             una línea de situación (en el idioma de las consignas)
     muestra         1–2 líneas de MUESTRA: [{es: expresión en lengua meta, gl: significado}]
     consigna        una línea de instrucción
     items           4–5 ítems (ver abajo)
     habla           línea final para hablar con el profe

   Ítems
     elige     {p: frase con ___ o pregunta, g: glosa, o: [opciones], k: índice correcto, e: explicación, h: pista, og?: glosas de opciones}
     completa  {p: frase con ___, g: glosa, k: respuesta o [respuestas], e, h}
     ordena    {k: frase correcta, g: glosa, e, h}   (las palabras se barajan solas) */
window.MUESTRAS = {

/* ───────────── A1 · niños (consignas en inglés) ───────────── */

"a1-esta-es-mi-familia": {
  nivel:"A1", titulo:"Esta es mi familia", c:"en", ninos:true, tipo:"elige",
  sit:"Look at the family photo!",
  muestra:[{es:"Este es mi papá.", gl:"This is my dad. (a boy or a man → este)"},
           {es:"Esta es mi mamá.", gl:"This is my mom. (a girl or a woman → esta)"}],
  consigna:"Tap: este or esta?",
  items:[
    {p:"___ es mi mamá.", g:"This is my mom.", o:["Este","Esta"], k:1, e:"Mom is a woman → esta.", h:"Man or woman?"},
    {p:"___ es mi papá.", g:"This is my dad.", o:["Este","Esta"], k:0, e:"Dad is a man → este.", h:"Man or woman?"},
    {p:"___ es mi hermana.", g:"This is my sister.", o:["Este","Esta"], k:1, e:"Sister is a girl → esta.", h:"Boy or girl?"},
    {p:"___ es mi abuelo.", g:"This is my grandpa.", o:["Este","Esta"], k:0, e:"Grandpa is a man → este.", h:"Man or woman?"},
    {p:"___ es mi tía.", g:"This is my aunt.", o:["Este","Esta"], k:1, e:"Aunt is a woman → esta.", h:"Man or woman?"}
  ],
  habla:"Now show your teacher a photo and say: «Esta es mi…» or «Este es mi…»."
},

"a1-que-me-pongo-hoy": {
  nivel:"A1", titulo:"¿Qué me pongo hoy?", c:"en", ninos:true, tipo:"ordena",
  sit:"Look out the window. What's the weather?",
  muestra:[{es:"Hace calor. · Hace frío. · Llueve.", gl:"It's hot. · It's cold. · It's raining."},
           {es:"Llevo una camiseta.", gl:"I'm wearing a T-shirt."}],
  consigna:"Tap the words in order.",
  items:[
    {k:"Hoy hace calor.", g:"Today it's hot.", e:"Hoy + hace calor.", h:"Start with «hoy»."},
    {k:"Hoy hace frío.", g:"Today it's cold.", e:"Hoy + hace frío.", h:"Start with «hoy»."},
    {k:"Hoy llueve mucho.", g:"Today it's raining a lot.", e:"Hoy + llueve + mucho.", h:"«mucho» goes at the end."},
    {k:"Llevo una camiseta.", g:"I'm wearing a T-shirt.", e:"Llevo + una camiseta.", h:"Start with «llevo»."},
    {k:"Hace frío y llevo un abrigo.", g:"It's cold and I'm wearing a coat.", e:"Hace frío + y + llevo un abrigo.", h:"Start with «hace»."}
  ],
  habla:"Now look outside and tell your teacher: «Hoy hace… y llevo…»."
},

"a1-el-menu-de-chispa": {
  nivel:"A1", titulo:"El menú de Chispa", c:"en", ninos:true, tipo:"elige",
  sit:"Chispa the chef is making the menu. Help Chispa!",
  muestra:[{es:"Me gusta la pizza.", gl:"I like pizza."},
           {es:"No me gusta el brócoli.", gl:"I don't like broccoli."}],
  consigna:"Tap the right one.",
  items:[
    {p:"___ la pizza.", g:"I like pizza.", o:["Me gusta","No me gusta"], k:0, e:"I like → me gusta.", h:"Like or don't like?"},
    {p:"___ el brócoli.", g:"I don't like broccoli.", o:["Me gusta","No me gusta"], k:1, e:"I don't like → no me gusta.", h:"Look for «don't»."},
    {p:"___ el helado.", g:"I like ice cream.", o:["Me gusta","No me gusta"], k:0, e:"I like → me gusta.", h:"Like or don't like?"},
    {p:"___ el pescado.", g:"I don't like fish.", o:["Me gusta","No me gusta"], k:1, e:"I don't like → no me gusta.", h:"Look for «don't»."},
    {p:"¿Te gusta la fruta? — Sí, ___.", g:"Do you like fruit? — Yes, I like it.", o:["me gusta","te gusta"], k:0, e:"Me = I. Te = you. You answer with «me gusta».", h:"Who answers? You!"}
  ],
  habla:"Now ask your teacher: «¿Te gusta la pizza?» and say what you like."
},

"a1-los-numeros-del-pirata": {
  nivel:"A1", titulo:"Los números del pirata", c:"en", ninos:true, tipo:"completa",
  sit:"The pirate is counting his gold coins!",
  muestra:[{es:"nueve 9 · diez 10 · once 11 · doce 12", gl:"trece 13 · catorce 14 · quince 15"},
           {es:"¿Cuántas monedas hay? — Hay doce.", gl:"How many coins are there? — There are twelve."}],
  consigna:"Write the number in Spanish.",
  items:[
    {p:"Hay ___ monedas. (11)", g:"There are 11 coins.", k:"once", e:"11 = once.", h:"It starts with «o»."},
    {p:"Hay ___ monedas. (15)", g:"There are 15 coins.", k:"quince", e:"15 = quince.", h:"It starts with «q»."},
    {p:"Hay ___ monedas. (13)", g:"There are 13 coins.", k:"trece", e:"13 = trece.", h:"It starts with «tr»."},
    {p:"Hay ___ monedas. (9)", g:"There are 9 coins.", k:"nueve", e:"9 = nueve.", h:"It starts with «n»."},
    {p:"Hay ___ monedas. (14)", g:"There are 14 coins.", k:"catorce", e:"14 = catorce.", h:"It starts with «c»."}
  ],
  habla:"Now count to fifteen with your teacher: «nueve, diez, once…»."
},

"a1-monstruos-gigantes": {
  nivel:"A1", titulo:"Monstruos gigantes", c:"en", ninos:true, tipo:"ordena",
  sit:"A giant monster is in the park! What does it look like?",
  muestra:[{es:"El monstruo es grande.", gl:"The monster is big. (pequeño = small)"},
           {es:"Tiene tres ojos.", gl:"It has three eyes."}],
  consigna:"Tap the words in order.",
  items:[
    {k:"El monstruo es grande.", g:"The monster is big.", e:"El monstruo + es + grande.", h:"Start with «el»."},
    {k:"El monstruo es pequeño.", g:"The monster is small.", e:"El monstruo + es + pequeño.", h:"Start with «el»."},
    {k:"Tiene tres ojos.", g:"It has three eyes.", e:"Tiene + tres ojos.", h:"Start with «tiene»."},
    {k:"Es verde y azul.", g:"It's green and blue.", e:"Es + verde y azul.", h:"Start with «es»."},
    {k:"Tiene dos bocas grandes.", g:"It has two big mouths.", e:"Tiene + dos bocas + grandes.", h:"«grandes» goes at the end."}
  ],
  habla:"Now draw a monster and tell your teacher: «Es… Tiene…»."
},

"a1-mision-cohete": {
  nivel:"A1", titulo:"Misión Cohete", c:"en", ninos:true, tipo:"elige",
  sit:"Mission control! Check the rocket before take-off.",
  muestra:[{es:"rojo · azul · verde · amarillo", gl:"red · blue · green · yellow"},
           {es:"El cohete es rojo.", gl:"The rocket is red."}],
  consigna:"Tap the right word.",
  items:[
    {p:"El cohete es ___.", g:"The rocket is red.", o:["rojo","azul"], k:0, e:"red = rojo.", h:"Red…"},
    {p:"La luna es ___.", g:"The moon is yellow.", o:["verde","amarilla"], k:1, e:"yellow = amarillo, and with la luna → amarilla.", h:"Yellow…"},
    {p:"El planeta es ___.", g:"The planet is blue.", o:["azul","rojo"], k:0, e:"blue = azul.", h:"Blue…"},
    {p:"Hay ___ estrellas. (5)", g:"There are five stars.", o:["cinco","seis"], k:0, e:"5 = cinco.", h:"Count: uno, dos, tres, cuatro…"},
    {p:"El astronauta es ___.", g:"The astronaut is green.", o:["verde","amarillo"], k:0, e:"green = verde.", h:"Green…"}
  ],
  habla:"Now tell your teacher about your rocket: «Mi cohete es…»."
},

"a1-mision-wild-park-donde-esta": {
  nivel:"A1", titulo:"Misión Wild Park: ¿Dónde está?", c:"en", ninos:true, tipo:"elige",
  sit:"The animals are hiding in Wild Park. Find them!",
  muestra:[{es:"¿Dónde está el mono? — Está en el árbol.", gl:"Where is the monkey? — It's in the tree."},
           {es:"en el agua · debajo de la mesa", gl:"in the water · under the table"}],
  consigna:"Tap the right place.",
  items:[
    {p:"El pez está ___.", g:"The fish is in the water.", o:["en el agua","en el árbol"], k:0, e:"Fish live in the water → en el agua.", h:"Where does a fish swim?"},
    {p:"El mono está ___.", g:"The monkey is in the tree.", o:["en el árbol","en el agua"], k:0, e:"Monkeys climb trees → en el árbol.", h:"Where does a monkey climb?"},
    {p:"El gato está ___.", g:"The cat is under the table.", o:["debajo de la mesa","en el agua"], k:0, e:"under = debajo de.", h:"Under…"},
    {p:"¿Dónde ___ el león?", g:"Where is the lion?", o:["está","es"], k:0, e:"Where something is → está.", h:"Look at the example."},
    {p:"El pájaro ___ en el árbol.", g:"The bird is in the tree.", o:["está","están"], k:0, e:"One bird → está.", h:"One or many?"}
  ],
  habla:"Now hide something in your room and ask your teacher: «¿Dónde está?»."
},

"a1-ranger-wild-park": {
  nivel:"A1", titulo:"Ranger · Wild Park", c:"en", ninos:true, tipo:"completa",
  sit:"You are the park ranger. Write the animal names!",
  muestra:[{es:"el león · el mono · el oso", gl:"the lion · the monkey · the bear"},
           {es:"la jirafa · el elefante", gl:"the giraffe · the elephant"}],
  consigna:"Write the animal.",
  items:[
    {p:"El ___ come plátanos.", g:"The monkey eats bananas.", k:"mono", e:"monkey = mono.", h:"m _ _ _"},
    {p:"El ___ es el rey.", g:"The lion is the king.", k:"león", e:"lion = león.", h:"l _ _ _"},
    {p:"La ___ es muy alta.", g:"The giraffe is very tall.", k:"jirafa", e:"giraffe = jirafa.", h:"j _ _ _ _ _"},
    {p:"El ___ es muy grande.", g:"The elephant is very big.", k:"elefante", e:"elephant = elefante.", h:"e _ _ _ _ _ _ _"},
    {p:"El ___ come miel.", g:"The bear eats honey.", k:"oso", e:"bear = oso.", h:"o _ _"}
  ],
  habla:"Now tell your teacher your favorite animal: «Mi animal favorito es…»."
},

/* ───────────── A1 · adultos ───────────── */

"a1-que-tal-tu-fin-de-semana": {
  nivel:"A1", titulo:"¿Qué tal tu fin de semana?", c:"en", tipo:"completa",
  sit:"It's Monday. A coworker asks about your weekend.",
  muestra:[{es:"¿Adónde fuiste? — Fui al parque.", gl:"Where did you go? — I went to the park."},
           {es:"¿Qué comiste? — Comí arepas. · Me gustó.", gl:"What did you eat? — I ate arepas. · I liked it."}],
  consigna:"Type the missing word.",
  items:[
    {p:"El sábado ___ al cine.", g:"On Saturday I went to the movies.", k:"fui", e:"I went = fui.", h:"Look at «Fui al parque»."},
    {p:"___ pizza con mi familia.", g:"I ate pizza with my family.", k:"comí", e:"I ate = comí, with an accent on the í.", h:"Look at «Comí arepas»."},
    {p:"El domingo ___ a la playa.", g:"On Sunday I went to the beach.", k:"fui", e:"I went = fui.", h:"Same as the first one."},
    {p:"¿Qué ___ el domingo?", g:"What did you eat on Sunday?", k:"comiste", e:"you ate = comiste.", h:"Look at the question in the example."},
    {p:"Me ___ mucho la película.", g:"I liked the movie a lot.", k:"gustó", e:"I liked it = me gustó, with an accent on the ó.", h:"Look at «Me gustó»."}
  ],
  habla:"Now tell your teacher about your weekend: «El sábado fui a… Comí…»."
},

"a1-fui-vi-y-comi": {
  nivel:"A1", titulo:"Fui, vi y comí", c:"en", tipo:"ordena",
  sit:"You're back from a trip to the Colombian coast. Tell the story.",
  muestra:[{es:"fui · vi · comí", gl:"I went · I saw · I ate"},
           {es:"Fui a Cartagena y vi el mar.", gl:"I went to Cartagena and I saw the sea."}],
  consigna:"Tap the words to build the sentence.",
  items:[
    {k:"Fui a la playa.", g:"I went to the beach.", e:"Fui + a la playa.", h:"Start with «fui»."},
    {k:"Vi el mar.", g:"I saw the sea.", e:"Vi + el mar.", h:"Start with «vi»."},
    {k:"Comí pescado frito.", g:"I ate fried fish.", e:"In Spanish the adjective goes after the noun: pescado frito.", h:"Start with «comí»."},
    {k:"Fui a la playa con mi familia.", g:"I went to the beach with my family.", e:"Fui + a la playa + con mi familia.", h:"«con mi familia» goes at the end."},
    {k:"Vi muchas casas de colores.", g:"I saw a lot of colorful houses.", e:"Vi + muchas casas + de colores.", h:"Start with «vi»."}
  ],
  habla:"Now tell your teacher about a trip: «Fui a… Vi… Comí…»."
},

"a1-un-cafe-por-favor": {
  nivel:"A1", titulo:"Un café, por favor", c:"en", tipo:"elige",
  sit:"You're at a café in Bogotá. Time to order.",
  muestra:[{es:"Quiero un café, por favor.", gl:"I'd like a coffee, please. (el café → un)"},
           {es:"Quiero una arepa.", gl:"I'd like an arepa. (la arepa → una)"}],
  consigna:"Tap un or una.",
  items:[
    {p:"Quiero ___ café.", g:"I'd like a coffee.", o:["un","una"], k:0, e:"el café → un café.", h:"El or la?"},
    {p:"Quiero ___ arepa.", g:"I'd like an arepa.", o:["un","una"], k:1, e:"la arepa → una arepa.", h:"It ends in -a."},
    {p:"Quiero ___ jugo de mango.", g:"I'd like a mango juice.", o:["un","una"], k:0, e:"el jugo → un jugo.", h:"It ends in -o."},
    {p:"___ empanada, por favor.", g:"An empanada, please.", o:["Un","Una"], k:1, e:"la empanada → una empanada.", h:"It ends in -a."},
    {p:"Quiero ___ té, por favor.", g:"I'd like a tea, please.", o:["un","una"], k:0, e:"el té → un té.", h:"El or la?"}
  ],
  habla:"Now order from your teacher: «Quiero un… y una…, por favor»."
},

"a1-mucho-gusto": {
  nivel:"A1", titulo:"Mucho gusto", c:"pt", tipo:"ordena",
  sit:"Primeira reunião com a equipe nova. Hora de se apresentar.",
  muestra:[{es:"Hola, me llamo Ana. Mucho gusto.", gl:"Oi, eu me chamo Ana. Muito prazer."},
           {es:"Soy ingeniera. Trabajo en una empresa.", gl:"Sou engenheira. Trabalho em uma empresa."}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"Hola, me llamo Ana.", g:"Oi, eu me chamo Ana.", e:"Em espanhol: me llamo (sem «eu»).", h:"Comece com «hola»."},
    {k:"Mucho gusto, soy Pedro.", g:"Muito prazer, sou o Pedro.", e:"Mucho gusto + soy + nome.", h:"Comece com «mucho»."},
    {k:"Soy ingeniera de software.", g:"Sou engenheira de software.", e:"Soy + profissão (sem «una»).", h:"Comece com «soy»."},
    {k:"Trabajo en una empresa grande.", g:"Trabalho em uma empresa grande.", e:"Trabajo + en una empresa + grande.", h:"Comece com «trabajo»."}
  ],
  habla:"Agora se apresente para o seu professor: «Hola, me llamo… Soy… Trabajo en…»."
},

"a1-mi-trabajo-mi-dia": {
  nivel:"A1", titulo:"Mi trabajo, mi día", c:"pt", tipo:"completa",
  sit:"Você conta como é o seu dia de trabalho.",
  muestra:[{es:"trabajar: yo trabajo · tú trabajas · él / ella trabaja", gl:"eu trabalho · você trabalha · ele / ela trabalha"},
           {es:"comer: yo como · tú comes · él / ella come", gl:"eu como · você come · ele / ela come"}],
  consigna:"Escreva o verbo na forma certa.",
  items:[
    {p:"Yo ___ en una oficina. (trabajar)", g:"Eu trabalho em um escritório.", k:"trabajo", e:"yo → trabajo.", h:"yo termina em -o."},
    {p:"Tú ___ en casa. (trabajar)", g:"Você trabalha em casa.", k:"trabajas", e:"tú → trabajas.", h:"tú termina em -s."},
    {p:"Ella ___ en un banco. (trabajar)", g:"Ela trabalha em um banco.", k:"trabaja", e:"ella → trabaja.", h:"Igual ao português."},
    {p:"Yo ___ a las doce. (comer)", g:"Eu como ao meio-dia.", k:"como", e:"yo → como.", h:"yo termina em -o."},
    {p:"Él ___ en la oficina. (comer)", g:"Ele come no escritório.", k:"come", e:"él → come.", h:"Igual ao português."}
  ],
  habla:"Agora conte para o seu professor: «Yo trabajo en… Como a las…»."
},

"a1-mi-dia-de-trabajo": {
  nivel:"A1", titulo:"Mi día de trabajo", c:"es", tipo:"elige",
  sit:"Miras la agenda del día con una compañera de trabajo.",
  muestra:[{es:"¿A qué hora empiezas? — Empiezo a las ocho.", gl:"a las + la hora"},
           {es:"yo empiezo · tú empiezas · ella empieza", gl:"el verbo cambia con la persona"}],
  consigna:"Toca la opción correcta.",
  items:[
    {p:"Empiezo ___ ocho.", g:"(8:00)", o:["a las","en las"], k:0, e:"Para la hora: a las ocho.", h:"Mira el ejemplo."},
    {p:"Ella ___ a las nueve.", g:"(ella)", o:["empieza","empiezo"], k:0, e:"ella → empieza.", h:"¿Yo o ella?"},
    {p:"¿A qué hora ___ tú?", g:"(tú)", o:["empiezas","empieza"], k:0, e:"tú → empiezas.", h:"tú termina en -s."},
    {p:"Yo ___ a las siete.", g:"(yo)", o:["empiezo","empieza"], k:0, e:"yo → empiezo.", h:"yo termina en -o."},
    {p:"La reunión es ___ diez.", g:"(10:00)", o:["a las","las"], k:0, e:"Para decir cuándo: a las diez.", h:"Falta una palabra pequeña."}
  ],
  habla:"Ahora cuéntale a tu profe tu día: «Empiezo a las… Termino a las…»."
},

"a1-te-queda-bien": {
  nivel:"A1", titulo:"¿Te queda bien?", c:"pt", tipo:"ordena",
  sit:"Você está numa loja de roupa com uma amiga.",
  muestra:[{es:"¿Te queda bien? — Me queda grande.", gl:"Ficou bem em você? — Ficou grande em mim."},
           {es:"la talla · la camisa azul", gl:"o tamanho · a camisa azul"}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"¿Te queda bien?", g:"Ficou bem em você?", e:"¿Te + queda + bien?", h:"Comece com «¿te»."},
    {k:"Me queda grande.", g:"Ficou grande em mim.", e:"Me + queda + grande.", h:"Comece com «me»."},
    {k:"Quiero la camisa azul.", g:"Quero a camisa azul.", e:"A cor vem depois: la camisa azul.", h:"Comece com «quiero»."},
    {k:"¿Tiene esta camisa en talla M?", g:"Tem esta camisa no tamanho M?", e:"¿Tiene + esta camisa + en talla M?", h:"Comece com «¿tiene»."},
    {k:"La talla M me queda bien.", g:"O tamanho M fica bem em mim.", e:"La talla M + me queda + bien.", h:"Comece com «la»."}
  ],
  habla:"Agora pergunte ao seu professor: «¿Me queda bien?» e descreva sua roupa."
},

/* ───────────── A2 ───────────── */

"a2-que-esta-pasando-aqui": {
  nivel:"A2", titulo:"¿Qué está pasando aquí?", c:"es", tipo:"completa",
  sit:"Miras una foto de un parque un domingo. ¿Qué hace la gente?",
  muestra:[{es:"estar + -ando / -iendo", gl:"hablar → hablando · comer → comiendo"},
           {es:"leer → leyendo · dormir → durmiendo", gl:"dos formas especiales"}],
  consigna:"Escribe el verbo con -ando o -iendo.",
  items:[
    {p:"A la izquierda, dos personas están ___. (hablar)", g:"", k:"hablando", e:"hablar → hablando.", h:"Verbos en -ar: -ando."},
    {p:"Un señor está ___ un helado. (comer)", g:"", k:"comiendo", e:"comer → comiendo.", h:"Verbos en -er: -iendo."},
    {p:"Los niños están ___ fútbol. (jugar)", g:"", k:"jugando", e:"jugar → jugando.", h:"Verbos en -ar: -ando."},
    {p:"Una mujer está ___ un libro. (leer)", g:"", k:"leyendo", e:"leer → leyendo, con y.", h:"Mira la muestra."},
    {p:"Al fondo, un perro está ___. (dormir)", g:"", k:"durmiendo", e:"dormir → durmiendo, con u.", h:"Mira la muestra."}
  ],
  habla:"Ahora mira por la ventana y cuéntale a tu profe qué está pasando."
},

"a2-ya-lo-has-probado": {
  nivel:"A2", titulo:"¿Ya lo has probado?", c:"en", tipo:"elige",
  sit:"You're planning a food trip to Colombia with a friend.",
  muestra:[{es:"Ya he probado el ajiaco.", gl:"I've already tried ajiaco."},
           {es:"Todavía no he probado la bandeja paisa. Voy a probarla.", gl:"I haven't tried it yet. I'm going to try it."}],
  consigna:"Tap the right option.",
  items:[
    {p:"Sí, ___ he probado el ajiaco.", g:"Yes, I've already tried ajiaco.", o:["ya","todavía no"], k:0, e:"already = ya.", h:"«Sí» → yes, you did it."},
    {p:"No, ___ he probado la arepa de huevo.", g:"No, I haven't tried the arepa de huevo yet.", o:["ya","todavía no"], k:1, e:"not yet = todavía no.", h:"«No» → you didn't."},
    {p:"Yo ___ comido patacones.", g:"I've eaten patacones.", o:["he","has"], k:0, e:"yo → he.", h:"Who? Yo."},
    {p:"¿Tú ___ probado el lulo?", g:"Have you tried lulo?", o:["he","has"], k:1, e:"tú → has.", h:"Who? Tú."},
    {p:"Mañana ___ a probar la bandeja paisa.", g:"Tomorrow I'm going to try the bandeja paisa.", o:["voy","he"], k:0, e:"Plans for tomorrow → voy a + verb.", h:"«Mañana» is the future."}
  ],
  habla:"Now tell your teacher one food you've tried and one you haven't tried yet."
},

"a2-me-lo-llevo": {
  nivel:"A2", titulo:"Me lo llevo", c:"en", tipo:"ordena",
  sit:"You're shopping for a bag at a market.",
  muestra:[{es:"este bolso (here) · ese bolso (there)", gl:"más caro que = more expensive than"},
           {es:"¿Cuánto cuesta? — Me lo llevo.", gl:"How much is it? — I'll take it."}],
  consigna:"Tap the words to build the sentence.",
  items:[
    {k:"¿Cuánto cuesta este bolso?", g:"How much is this bag?", e:"¿Cuánto + cuesta + este bolso?", h:"Start with «¿cuánto»."},
    {k:"Cuesta trescientos dólares.", g:"It costs three hundred dollars.", e:"Cuesta + the price.", h:"Start with «cuesta»."},
    {k:"Ese bolso es más caro que este.", g:"That bag is more expensive than this one.", e:"más + caro + que.", h:"Start with «ese»."},
    {k:"Este es más barato.", g:"This one is cheaper.", e:"más barato = cheaper.", h:"Start with «este»."},
    {k:"Bueno, me lo llevo.", g:"OK, I'll take it.", e:"me + lo + llevo.", h:"Start with «bueno»."}
  ],
  habla:"Now sell something to your teacher: «Este… cuesta… Es más barato que…»."
},

"a2-que-me-recomienda": {
  nivel:"A2", titulo:"¿Qué me recomienda?", c:"en", tipo:"elige",
  sit:"You're at a restaurant. The waiter comes to your table.",
  muestra:[{es:"¿Qué me recomienda?", gl:"What do you recommend?"},
           {es:"Para mí, las empanadas. · La cuenta, por favor.", gl:"For me, the empanadas. · The check, please."}],
  consigna:"What do you say? Tap it.",
  items:[
    {p:"You don't know what to order.", g:"", o:["¿Qué me recomienda?","La cuenta, por favor."], k:0, e:"Ask for advice → ¿Qué me recomienda?", h:"You need an idea."},
    {p:"The waiter asks: «¿Y para usted?»", g:"And for you?", o:["Para mí, las empanadas.","¿Qué me recomienda?"], k:0, e:"Answer with «Para mí…».", h:"He wants your order."},
    {p:"You finished and want to pay.", g:"", o:["Para mí, la cuenta.","La cuenta, por favor."], k:1, e:"To pay → La cuenta, por favor.", h:"Look at the example."},
    {p:"The waiter says: «Le recomiendo los patacones.» You want them.", g:"I recommend the patacones.", o:["Para mí, los patacones.","¿Qué me recomienda?"], k:0, e:"You order → Para mí, los patacones.", h:"You already have the idea."}
  ],
  habla:"Now order from your teacher, the waiter: «¿Qué me recomienda?… Para mí…»."
},

"a2-y-a-ti": {
  nivel:"A2", titulo:"¿Y a ti?", c:"en", tipo:"completa",
  sit:"You're chatting with a new friend about likes and dislikes.",
  muestra:[{es:"Me gusta el café. — A mí también.", gl:"I like coffee. — Me too."},
           {es:"No me gusta el frío. — A mí tampoco.", gl:"I don't like the cold. — Me neither."}],
  consigna:"Type the missing word.",
  items:[
    {p:"Me gusta la música. — A mí ___.", g:"I like music. — Me too.", k:"también", e:"Agree with a positive → también.", h:"Me too…"},
    {p:"No me gusta el frío. — A mí ___.", g:"I don't like the cold. — Me neither.", k:"tampoco", e:"Agree with a negative → tampoco.", h:"Me neither…"},
    {p:"Me ___ el fútbol.", g:"I like soccer.", k:"gusta", e:"One thing (el fútbol) → gusta.", h:"One thing or many?"},
    {p:"Me ___ las películas de terror.", g:"I like horror movies.", k:"gustan", e:"Many things (las películas) → gustan.", h:"One thing or many?"},
    {p:"No me gusta el café. — A mí ___.", g:"I don't like coffee. — Me neither.", k:"tampoco", e:"Agree with a negative → tampoco.", h:"There's a «no»."}
  ],
  habla:"Now tell your teacher three things you like. Your teacher answers «A mí también» or «A mí no»."
},

"a2-lo-mas-loco-que-he-hecho": {
  nivel:"A2", titulo:"Lo más loco que he hecho", c:"pt", tipo:"completa",
  sit:"Numa festa, vocês contam as coisas mais loucas que já fizeram.",
  muestra:[{es:"hacer → hecho · ver → visto · decir → dicho · volver → vuelto", gl:"fazer → feito · ver → visto · dizer → dito · voltar → voltado"},
           {es:"¿Alguna vez has…? · Se me cayó el celular.", gl:"Você já…? · Deixei o celular cair (sem querer)."}],
  consigna:"Escreva o particípio.",
  items:[
    {p:"¿Alguna vez has ___ paracaidismo? (hacer)", g:"Você já fez paraquedismo?", k:"hecho", e:"hacer → hecho.", h:"Veja a amostra."},
    {p:"He ___ un volcán de cerca. (ver)", g:"Já vi um vulcão de perto.", k:"visto", e:"ver → visto.", h:"Igual ao português."},
    {p:"Nunca he ___ una mentira en un viaje. (decir)", g:"Nunca contei uma mentira numa viagem.", k:"dicho", e:"decir → dicho.", h:"Veja a amostra."},
    {p:"Ya he ___ tres veces a Cartagena. (volver)", g:"Já voltei três vezes a Cartagena.", k:"vuelto", e:"volver → vuelto.", h:"Veja a amostra."},
    {p:"En la playa se me ___ el celular al mar. (caer)", g:"Na praia, meu celular caiu no mar.", k:"cayó", e:"se me cayó = deixei cair sem querer.", h:"Veja a segunda linha da amostra."}
  ],
  habla:"Agora conte ao seu professor: «Lo más loco que he hecho es…»."
},

"a2-a-como-esta-la-pina": {
  nivel:"A2", titulo:"¿A cómo está la piña?", c:"pt", tipo:"elige",
  sit:"Você está numa praça de mercado na Colômbia, comprando frutas.",
  muestra:[{es:"¿A cómo está la piña? — A cinco mil.", gl:"Quanto está o abacaxi? — Cinco mil."},
           {es:"me lo · me la · me los · me las llevo", gl:"eu levo (o · a · os · as)"}],
  consigna:"Toque a opção certa.",
  items:[
    {p:"La piña está buena. Me ___ llevo.", g:"O abacaxi está bom. Eu levo.", o:["lo","la"], k:1, e:"la piña → me la llevo.", h:"Em espanhol, «piña» é feminino."},
    {p:"El aguacate está barato. Me ___ llevo.", g:"O abacate está barato. Eu levo.", o:["lo","la"], k:0, e:"el aguacate → me lo llevo.", h:"el ou la?"},
    {p:"Los mangos están muy buenos. Me ___ llevo.", g:"As mangas estão muito boas. Eu levo.", o:["los","las"], k:0, e:"los mangos → me los llevo. Em espanhol, «mango» é masculino.", h:"Olhe o artigo: los."},
    {p:"Las fresas están frescas. Me ___ llevo.", g:"Os morangos estão frescos. Eu levo.", o:["los","las"], k:1, e:"las fresas → me las llevo.", h:"Olhe o artigo: las."},
    {p:"¿A cómo ___ la papaya?", g:"Quanto está o mamão?", o:["está","es"], k:0, e:"Para o preço de hoje: ¿A cómo está…?", h:"Veja a amostra."}
  ],
  habla:"Agora seu professor é o vendedor. Pergunte: «¿A cómo está…?» e compre duas frutas."
},

"a2-el-viaje-a-la-finca": {
  nivel:"A2", titulo:"El viaje a la finca", c:"pt", tipo:"elige",
  sit:"Fim de semana numa fazenda colombiana. Cuidado com o gênero!",
  muestra:[{es:"el viaje · el árbol · el color", gl:"a viagem · a árvore · a cor (em espanhol, masculino)"},
           {es:"la leche · la nariz · la sal", gl:"o leite · o nariz · o sal (em espanhol, feminino)"}],
  consigna:"Toque el ou la.",
  items:[
    {p:"___ viaje a la finca fue largo.", g:"A viagem para a fazenda foi longa.", o:["El","La"], k:0, e:"el viaje: palavras em -aje são masculinas.", h:"Veja a amostra."},
    {p:"Tomamos ___ leche de la vaca.", g:"Tomamos o leite da vaca.", o:["el","la"], k:1, e:"la leche é feminino em espanhol.", h:"Muda em relação ao português."},
    {p:"Dormimos debajo de ___ árbol.", g:"Dormimos debaixo da árvore.", o:["el","la"], k:0, e:"el árbol é masculino em espanhol.", h:"Muda em relação ao português."},
    {p:"Me gusta ___ color de la casa.", g:"Gosto da cor da casa.", o:["el","la"], k:0, e:"el color é masculino em espanhol.", h:"Muda em relação ao português."},
    {p:"¿Me pasas ___ sal, por favor?", g:"Você me passa o sal, por favor?", o:["el","la"], k:1, e:"la sal é feminino em espanhol.", h:"Muda em relação ao português."}
  ],
  habla:"Agora conte ao seu professor sobre um viaje. Use «el viaje», «la leche» ou «el árbol»."
},

"a2-a-dos-cuadras": {
  nivel:"A2", titulo:"A dos cuadras", c:"pt", tipo:"ordena",
  sit:"Um turista pergunta o caminho no seu bairro.",
  muestra:[{es:"Sigue derecho dos cuadras.", gl:"Siga reto dois quarteirões."},
           {es:"Gira a la derecha. · a + el = al · de + el = del", gl:"Vire à direita. · ao · do"}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"Sigue derecho dos cuadras.", g:"Siga reto dois quarteirões.", e:"Sigue + derecho + dos cuadras.", h:"Comece com «sigue»."},
    {k:"Gira a la derecha en la esquina.", g:"Vire à direita na esquina.", e:"Gira + a la derecha + en la esquina.", h:"Comece com «gira»."},
    {k:"El banco está al lado del parque.", g:"O banco fica ao lado do parque.", e:"al lado del: a + el = al, de + el = del.", h:"Comece com «el»."},
    {k:"La farmacia está a dos cuadras.", g:"A farmácia fica a dois quarteirões.", e:"está + a dos cuadras.", h:"Comece com «la»."},
    {k:"Gira a la izquierda y sigue derecho.", g:"Vire à esquerda e siga reto.", e:"Gira a la izquierda + y + sigue derecho.", h:"Comece com «gira»."}
  ],
  habla:"Agora explique ao seu professor como chegar à sua casa: «Sigue derecho… Gira…»."
},

"a2-y-tu-que-opinas": {
  nivel:"A2", titulo:"¿Y tú qué opinas?", c:"pt", tipo:"completa",
  sit:"Numa conversa com colegas, você dá a sua opinião.",
  muestra:[{es:"Creo que… · Para mí…", gl:"Acho que… · Para mim…"},
           {es:"Estoy de acuerdo. · Tienes razón.", gl:"Concordo. · Você tem razão."}],
  consigna:"Escreva a palavra que falta.",
  items:[
    {p:"___ que el centro es muy bonito.", g:"Acho que o centro é muito bonito.", k:"creo", e:"Acho que = Creo que.", h:"Veja a amostra."},
    {p:"Para ___, es mejor el bus.", g:"Para mim, o ônibus é melhor.", k:"mí", e:"Para mim = Para mí, com acento.", h:"Veja a amostra."},
    {p:"Sí, estoy de ___.", g:"Sim, concordo.", k:"acuerdo", e:"Concordo = Estoy de acuerdo.", h:"Veja a amostra."},
    {p:"Tienes ___, es muy caro.", g:"Você tem razão, é muito caro.", k:"razón", e:"Você tem razão = Tienes razón.", h:"Parece com o português."},
    {p:"No estoy de acuerdo. ___ que es barato.", g:"Não concordo. Acho que é barato.", k:"creo", e:"Acho que = Creo que.", h:"Veja a amostra."}
  ],
  habla:"Agora dê sua opinião ao seu professor: «Creo que… Para mí…»."
},

"a2-que-vamos-a-pedir": {
  nivel:"A2", titulo:"¿Qué vamos a pedir?", c:"pt", tipo:"elige",
  sit:"Vocês olham o cardápio e falam do que gostam.",
  muestra:[{es:"Me gusta el ajiaco. · Me gustan las arepas.", gl:"uma coisa → gusta · várias coisas → gustan"},
           {es:"Me encanta / Me encantan", gl:"Eu adoro"}],
  consigna:"Toque a opção certa.",
  items:[
    {p:"Me ___ las arepas.", g:"Eu gosto das arepas.", o:["gusta","gustan"], k:1, e:"las arepas (várias) → gustan.", h:"Uma ou várias?"},
    {p:"Me ___ el ajiaco.", g:"Eu gosto do ajiaco.", o:["gusta","gustan"], k:0, e:"el ajiaco (uma) → gusta.", h:"Uma ou várias?"},
    {p:"Nos ___ los postres.", g:"Nós adoramos as sobremesas.", o:["encanta","encantan"], k:1, e:"los postres (várias) → encantan.", h:"Uma ou várias?"},
    {p:"¿Te ___ la comida picante?", g:"Você gosta de comida apimentada?", o:["gusta","gustan"], k:0, e:"la comida (uma) → gusta. Sem «de».", h:"Uma ou várias?"},
    {p:"Me ___ los frijoles.", g:"Eu adoro feijão.", o:["encanta","encantan"], k:1, e:"los frijoles (várias) → encantan.", h:"Olhe o artigo: los."}
  ],
  habla:"Agora diga ao seu professor o que você vai pedir: «Me encanta… Me gustan…»."
},

"a2-ayer-fue-diferente": {
  nivel:"A2", titulo:"Ayer fue diferente", c:"pt", tipo:"ordena",
  sit:"Segunda-feira de manhã. O que você fez no fim de semana?",
  muestra:[{es:"fui · comí · hice · vimos", gl:"fui · comi · fiz · vimos"},
           {es:"El sábado fui al cine.", gl:"No sábado fui ao cinema."}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"El sábado fui al cine.", g:"No sábado fui ao cinema.", e:"El sábado + fui + al cine.", h:"Comece com «el»."},
    {k:"Ayer comí en casa de mis papás.", g:"Ontem comi na casa dos meus pais.", e:"Ayer + comí + en casa de mis papás.", h:"Comece com «ayer»."},
    {k:"El domingo no hice nada.", g:"No domingo não fiz nada.", e:"no + hice + nada.", h:"«nada» vai no fim."},
    {k:"Por la noche vimos una película.", g:"À noite vimos um filme.", e:"Por la noche = À noite.", h:"Comece com «por»."}
  ],
  habla:"Agora conte ao seu professor: «El sábado fui… El domingo…»."
},

"a2-cada-uno-a-su-hora": {
  nivel:"A2", titulo:"Cada uno a su hora", c:"pt", tipo:"completa",
  sit:"Você compara a sua rotina com a de um colega.",
  muestra:[{es:"Es la una. · Son las tres.", gl:"É uma hora. · São três horas."},
           {es:"a las siete · y cuarto (:15) · y media (:30)", gl:"às sete · e quinze · e meia"}],
  consigna:"Escreva a palavra que falta.",
  items:[
    {p:"Me levanto ___ las seis.", g:"Eu me levanto às seis.", k:"a", e:"às = a las.", h:"Uma palavra pequena."},
    {p:"Son ___ dos.", g:"São duas horas.", k:"las", e:"Son las + hora.", h:"Veja a amostra."},
    {p:"Es ___ una.", g:"É uma hora.", k:"la", e:"Uma hora → Es la una.", h:"Veja a amostra."},
    {p:"Almuerzo a las doce y ___. (12:30)", g:"Almoço ao meio-dia e meia.", k:"media", e:":30 = y media.", h:"Veja a amostra."},
    {p:"Me acuesto a las diez y ___. (10:15)", g:"Vou dormir às dez e quinze.", k:"cuarto", e:":15 = y cuarto.", h:"Veja a amostra."}
  ],
  habla:"Agora conte sua rotina ao seu professor: «Me levanto a las… Almuerzo a las…»."
},

"a2-casa-o-apartamento": {
  nivel:"A2", titulo:"¿Casa o apartamento?", c:"pt", tipo:"elige",
  sit:"Você está procurando um lugar para morar.",
  muestra:[{es:"más… que · menos… que · tan… como", gl:"mais… que · menos… que · tão… quanto"},
           {es:"mejor · peor", gl:"melhor · pior"}],
  consigna:"Toque a opção certa.",
  items:[
    {p:"El apartamento es ___ caro que la casa.", g:"O apartamento é mais caro que a casa.", o:["más","mas"], k:0, e:"mais = más, com acento.", h:"Atenção ao acento."},
    {p:"La casa es tan grande ___ el apartamento.", g:"A casa é tão grande quanto o apartamento.", o:["como","que"], k:0, e:"tan… como = tão… quanto.", h:"Veja a amostra."},
    {p:"Este barrio es ___ que el otro.", g:"Este bairro é melhor que o outro.", o:["mejor","más bueno"], k:0, e:"melhor = mejor.", h:"Veja a segunda linha."},
    {p:"El apartamento es ___ que la casa.", g:"O apartamento é pior que a casa.", o:["peor","más malo"], k:0, e:"pior = peor.", h:"Veja a segunda linha."},
    {p:"La casa es ___ moderna que el apartamento.", g:"A casa é menos moderna que o apartamento.", o:["menos","más"], k:0, e:"menos… que = menos… que.", h:"Igual ao português."}
  ],
  habla:"Agora conte ao seu professor: ¿casa o apartamento? «Para mí, … es mejor porque…»."
},

"a2-tres-dias-en-cartagena": {
  nivel:"A2", titulo:"Tres días en Cartagena", c:"pt", tipo:"ordena",
  sit:"Você planeja três dias em Cartagena com um amigo.",
  muestra:[{es:"Voy a ir · Vamos a visitar", gl:"Vou ir · Vamos visitar"},
           {es:"ir + a + verbo", gl:"em espanhol não se esquece o «a»"}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"El sábado voy a ir a la playa.", g:"No sábado vou à praia.", e:"voy + a + ir.", h:"Comece com «el»."},
    {k:"Vamos a visitar las islas.", g:"Vamos visitar as ilhas.", e:"vamos + a + visitar.", h:"Comece com «vamos»."},
    {k:"Vamos a comer pescado frito.", g:"Vamos comer peixe frito.", e:"vamos + a + comer.", h:"Não esqueça o «a»."},
    {k:"El último día voy a descansar.", g:"No último dia vou descansar.", e:"voy + a + descansar.", h:"Comece com «el»."}
  ],
  habla:"Agora conte ao seu professor o seu plano: «El primer día voy a… Vamos a…»."
},

"a2-mesa-para-dos": {
  nivel:"A2", titulo:"Mesa para dos", c:"pt", tipo:"completa",
  sit:"Você chega a um restaurante com a sua namorada.",
  muestra:[{es:"Una mesa para dos, por favor.", gl:"Uma mesa para dois, por favor."},
           {es:"una reserva · la carta · la cuenta", gl:"uma reserva · o cardápio · a conta"}],
  consigna:"Escreva a palavra que falta.",
  items:[
    {p:"Una mesa ___ dos, por favor.", g:"Uma mesa para dois, por favor.", k:"para", e:"Igual ao português: para.", h:"Igual ao português."},
    {p:"Tengo una ___ para las ocho.", g:"Tenho uma reserva para as oito.", k:"reserva", e:"reserva = reserva.", h:"Igual ao português."},
    {p:"¿Me trae la ___, por favor?", g:"Pode me trazer o cardápio, por favor?", k:"carta", e:"cardápio = la carta.", h:"Veja a amostra."},
    {p:"Para mí, el pescado, ___ favor.", g:"Para mim, o peixe, por favor.", k:"por", e:"por favor.", h:"Igual ao português."},
    {p:"La ___, por favor.", g:"A conta, por favor.", k:"cuenta", e:"a conta = la cuenta.", h:"Veja a amostra."}
  ],
  habla:"Agora o seu professor é o garçom. Peça: «Una mesa para dos… La carta…»."
},

"a2-habitacion-207": {
  nivel:"A2", titulo:"Habitación 207", c:"pt", tipo:"elige",
  sit:"Você está num hotel e precisa pedir algumas coisas na recepção.",
  muestra:[{es:"me gustaría · podría · sería", gl:"eu gostaria · poderia · seria (condicional)"},
           {es:"¿Podría cambiarme de habitación?", gl:"Poderia me trocar de quarto?"}],
  consigna:"Toque a forma mais educada.",
  items:[
    {p:"¿___ cambiarme de habitación?", g:"Poderia me trocar de quarto?", o:["Podría","Podía"], k:0, e:"Para pedir com educação: condicional (podría).", h:"Poderia…"},
    {p:"Me ___ una habitación con vista al mar.", g:"Eu gostaria de um quarto com vista para o mar.", o:["gustaría","gustaba"], k:0, e:"Gostaria = me gustaría.", h:"Gostaria…"},
    {p:"¿Me ___ traer otra toalla?", g:"Poderia me trazer outra toalha?", o:["podría","podía"], k:0, e:"Pedido educado → podría.", h:"Poderia…"},
    {p:"___ mejor una habitación más tranquila.", g:"Seria melhor um quarto mais tranquilo.", o:["Sería","Era"], k:0, e:"Seria = sería.", h:"Seria…"},
    {p:"Yo que usted, ___ el desayuno.", g:"No seu lugar, eu pediria o café da manhã.", o:["pediría","pedía"], k:0, e:"Conselho → condicional: pediría.", h:"Pediria…"}
  ],
  habla:"Agora o seu professor é o recepcionista. Peça duas coisas: «Me gustaría… ¿Podría…?»."
},

"a2-la-maleta-perdida": {
  nivel:"A2", titulo:"La maleta perdida", c:"es", tipo:"ordena",
  sit:"Llegas al aeropuerto y tu maleta no aparece.",
  muestra:[{es:"No encuentro mi maleta.", gl:"no aparece, no sé dónde está"},
           {es:"Es grande y negra. Tiene una cinta roja.", gl:"es + color y tamaño · tiene + un detalle"}],
  consigna:"Toca las palabras en orden.",
  items:[
    {k:"No encuentro mi maleta.", g:"", e:"No + encuentro + mi maleta.", h:"Empieza con «no»."},
    {k:"Mi maleta es grande y negra.", g:"", e:"Es + tamaño y color.", h:"Empieza con «mi»."},
    {k:"Tiene una cinta roja.", g:"", e:"Tiene + un detalle.", h:"Empieza con «tiene»."},
    {k:"Vengo en el vuelo de Bogotá.", g:"", e:"Vengo + en el vuelo + de Bogotá.", h:"Empieza con «vengo»."},
    {k:"¿Cuándo llega mi maleta?", g:"", e:"¿Cuándo + llega + mi maleta?", h:"Empieza con «¿cuándo»."}
  ],
  habla:"Ahora tu profe trabaja en el aeropuerto. Cuéntale cómo es tu maleta."
},

/* ───────────── B1 ───────────── */

"b1-ya-se-habia-ido": {
  nivel:"B1", titulo:"Ya se había ido", c:"en", tipo:"completa",
  sit:"You arrived late to a party. What had already happened?",
  muestra:[{es:"había · habías · había · habíamos · habían + participio", gl:"had + past participle"},
           {es:"Cuando llegué, Ana ya se había ido.", gl:"When I arrived, Ana had already left."}],
  consigna:"Type the right form of haber.",
  items:[
    {p:"Cuando llegué a la fiesta, Ana ya se ___ ido.", g:"Ana had already left.", k:"había", e:"Ana (ella) → había.", h:"Who? Ana."},
    {p:"Cuando llegamos al cine, la película ya ___ empezado.", g:"The movie had already started.", k:"había", e:"la película (ella) → había.", h:"Who? The movie."},
    {p:"Cuando llamé, ellos ya ___ salido.", g:"They had already gone out.", k:"habían", e:"ellos → habían.", h:"Who? Ellos."},
    {p:"Nosotros nunca ___ visto algo así.", g:"We had never seen anything like that.", k:"habíamos", e:"nosotros → habíamos.", h:"Who? Nosotros."},
    {p:"¿Tú ya ___ comido cuando llegaron?", g:"Had you already eaten when they arrived?", k:"habías", e:"tú → habías.", h:"Who? Tú."}
  ],
  habla:"Now tell your teacher about a time you arrived late: «Cuando llegué, ya…»."
},

"b1-todo-iba-bien-hasta-que": {
  nivel:"B1", titulo:"Todo iba bien hasta que…", c:"en", tipo:"elige",
  sit:"A friend tells you about a day trip that went wrong.",
  muestra:[{es:"Todo iba bien, hacía sol…", gl:"imperfect = the background"},
           {es:"…hasta que empezó a llover.", gl:"preterite = what happened"}],
  consigna:"Tap the right past tense.",
  items:[
    {p:"Todo ___ bien hasta que empezó a llover.", g:"Everything was going well until…", o:["iba","fue"], k:0, e:"Background → imperfect: iba.", h:"Background or event?"},
    {p:"Hacía sol y de repente se ___ el carro.", g:"…and suddenly the car broke down.", o:["dañó","dañaba"], k:0, e:"«De repente» marks an event → preterite.", h:"Look for «de repente»."},
    {p:"Mientras ___, sonó el teléfono.", g:"While I was cooking, the phone rang.", o:["cocinaba","cociné"], k:0, e:"«Mientras» + action in progress → imperfect.", h:"Look for «mientras»."},
    {p:"Eran las diez cuando ___ el bus.", g:"It was ten when the bus arrived.", o:["llegó","llegaba"], k:0, e:"The bus arriving is the event → preterite.", h:"Background or event?"},
    {p:"___ mucha gente en la calle cuando se fue la luz.", g:"There were a lot of people… when the power went out.", o:["Había","Hubo"], k:0, e:"Describing the scene → imperfect: había.", h:"Background or event?"}
  ],
  habla:"Now tell your teacher about a day that went wrong: «Todo iba bien hasta que…»."
},

"b1-que-harias-si": {
  nivel:"B1", titulo:"¿Qué harías si…?", c:"pt", tipo:"completa",
  sit:"Um jogo de perguntas: o que você faria se…?",
  muestra:[{es:"Si tuviera tiempo, viajaría.", gl:"Se eu tivesse tempo, viajaria."},
           {es:"si + imperfecto de subjuntivo → condicional", gl:"tuviera, pudiera, ganara → viajaría, haría"}],
  consigna:"Escreva o verbo na forma certa.",
  items:[
    {p:"Si ___ más tiempo, aprendería a bailar. (tener)", g:"Se eu tivesse mais tempo…", k:["tuviera","tuviese"], e:"Depois de «si»: tuviera.", h:"Veja a amostra."},
    {p:"Si ganara la lotería, ___ por el mundo. (viajar)", g:"…eu viajaria pelo mundo.", k:"viajaría", e:"Resultado → condicional: viajaría.", h:"Termina em -ía."},
    {p:"¿Qué ___ tú si perdieras el pasaporte? (hacer)", g:"O que você faria se…?", k:"harías", e:"hacer → haría, harías (irregular).", h:"Começa com «har-»."},
    {p:"Si ___ vivir en otro país, viviría en Chile. (poder)", g:"Se eu pudesse morar em outro país…", k:["pudiera","pudiese"], e:"Depois de «si»: pudiera.", h:"Parece com «pudesse»."},
    {p:"Yo que tú, no le ___ nada. (decir)", g:"No seu lugar, eu não diria nada a ele.", k:"diría", e:"decir → diría (irregular).", h:"Começa com «dir-»."}
  ],
  habla:"Agora pergunte ao seu professor: «¿Qué harías si…?» e responda também."
},

"b1-y-tu-que-investigas": {
  nivel:"B1", titulo:"¿Y tú qué investigas?", c:"pt", tipo:"elige",
  sit:"Num congresso, alguém pergunta sobre a sua pesquisa.",
  muestra:[{es:"el análisis · el origen · el método", gl:"a análise · a origem · o método"},
           {es:"la sangre · la señal", gl:"o sangue · o sinal"}],
  consigna:"Toque el ou la.",
  items:[
    {p:"Hice ___ análisis de los datos.", g:"Fiz a análise dos dados.", o:["el","la"], k:0, e:"el análisis é masculino em espanhol.", h:"Muda em relação ao português."},
    {p:"Estudio ___ origen de la enfermedad.", g:"Estudo a origem da doença.", o:["el","la"], k:0, e:"el origen é masculino em espanhol.", h:"Muda em relação ao português."},
    {p:"Tomamos muestras de ___ sangre.", g:"Coletamos amostras do sangue.", o:["el","la"], k:1, e:"la sangre é feminino em espanhol.", h:"Muda em relação ao português."},
    {p:"___ señal del sensor es muy débil.", g:"O sinal do sensor é muito fraco.", o:["El","La"], k:1, e:"la señal é feminino em espanhol.", h:"Muda em relação ao português."},
    {p:"Cambiamos ___ método el año pasado.", g:"Mudamos o método no ano passado.", o:["el","la"], k:0, e:"el método: igual ao português.", h:"Este não muda."}
  ],
  habla:"Agora explique a sua pesquisa ao seu professor em três frases: «Investigo… Hice el análisis de…»."
},

"b1-dice-un-estudio": {
  nivel:"B1", titulo:"Dice un estudio", c:"pt", tipo:"ordena",
  sit:"Você resume dois estudos para um colega.",
  muestra:[{es:"Según el estudio… · Los datos sugieren que…", gl:"Segundo o estudo… · Os dados sugerem que…"},
           {es:"Sin embargo… · Ambos coinciden en que…", gl:"No entanto… · Os dois concordam que…"}],
  consigna:"Toque as palavras na ordem certa.",
  items:[
    {k:"Según el estudio, el sueño mejora la memoria.", g:"Segundo o estudo, o sono melhora a memória.", e:"Según el estudio + a ideia.", h:"Comece com «según»."},
    {k:"Los datos sugieren que el café ayuda.", g:"Os dados sugerem que o café ajuda.", e:"Los datos sugieren que + a ideia.", h:"Comece com «los»."},
    {k:"Sin embargo, la muestra es pequeña.", g:"No entanto, a amostra é pequena.", e:"Sin embargo + vírgula + a ideia.", h:"Comece com «sin»."},
    {k:"Ambos estudios coinciden en que el ejercicio ayuda.", g:"Os dois estudos concordam que o exercício ajuda.", e:"coinciden en que (com «en»).", h:"Comece com «ambos»."}
  ],
  habla:"Agora conte ao seu professor sobre uma notícia científica: «Según un estudio… Sin embargo…»."
},

"b1-no-te-lo-vas-a-creer": {
  nivel:"B1", titulo:"No te lo vas a creer", c:"pt", tipo:"elige",
  sit:"Você conta uma história de viagem a um amigo, sem silêncios.",
  muestra:[{es:"¡No te lo vas a creer! · Resulta que…", gl:"Você não vai acreditar! · Acontece que…"},
           {es:"De repente… · Al final…", gl:"De repente… · No fim…"}],
  consigna:"Toque o conector certo.",
  items:[
    {p:"¡___! Me encontré a mi profesor en Cartagena.", g:"Você não vai acreditar!", o:["No te lo vas a creer","Al final"], k:0, e:"Para começar com surpresa.", h:"Começo da história."},
    {p:"___ perdí el pasaporte en el aeropuerto.", g:"Acontece que perdi o passaporte…", o:["Resulta que","Al final"], k:0, e:"Para apresentar o problema: Resulta que…", h:"É o começo do problema."},
    {p:"Estaba en la fila y, ___, sonó la alarma.", g:"…e, de repente, o alarme tocou.", o:["de repente","al final"], k:0, e:"Algo inesperado → de repente.", h:"Algo inesperado."},
    {p:"___, todo salió bien.", g:"No fim, tudo deu certo.", o:["Al final","De repente"], k:0, e:"O fim da história → Al final.", h:"O fim da história."}
  ],
  habla:"Agora conte ao seu professor uma história de viagem: «¡No te lo vas a creer! Resulta que…»."
},

"b1-lo-que-mas-me-gusto": {
  nivel:"B1", titulo:"Lo que más me gustó", c:"pt", tipo:"completa",
  sit:"Você voltou de uma viagem e conta o melhor e o pior.",
  muestra:[{es:"Lo que más me gustó fue…", gl:"O que eu mais gostei foi…"},
           {es:"me gustó (uma coisa) · me gustaron (várias)", gl:"lo que menos = o que menos"}],
  consigna:"Escreva a palavra que falta.",
  items:[
    {p:"Lo que más me ___ fue la comida.", g:"O que eu mais gostei foi a comida.", k:"gustó", e:"Uma coisa → gustó.", h:"Veja a amostra."},
    {p:"Lo que ___ me gustó fue el calor.", g:"O que eu menos gostei foi o calor.", k:"menos", e:"o que menos = lo que menos.", h:"Veja a segunda linha."},
    {p:"Me ___ mucho las playas.", g:"Eu gostei muito das praias.", k:"gustaron", e:"Várias coisas (las playas) → gustaron.", h:"Uma ou várias?"},
    {p:"Lo que ___ me gustó fue el centro histórico.", g:"O que eu mais gostei foi o centro histórico.", k:"más", e:"o que mais = lo que más, com acento.", h:"Veja a amostra."},
    {p:"No me ___ los precios.", g:"Eu não gostei dos preços.", k:"gustaron", e:"Várias coisas (los precios) → gustaron.", h:"Uma ou várias?"}
  ],
  habla:"Agora conte ao seu professor: «Lo que más me gustó de mi último viaje fue…»."
},

"b1-en-version-original": {
  nivel:"B1", titulo:"En versión original", c:"pt", tipo:"elige",
  sit:"Vocês conversam sobre séries e recomendam algumas.",
  muestra:[{es:"Te recomiendo que la veas.", gl:"Recomendo que você a veja. (subjuntivo)"},
           {es:"No creo que sea tan buena. · Vale la pena.", gl:"Não acho que seja tão boa. · Vale a pena."}],
  consigna:"Toque a opção certa.",
  items:[
    {p:"Te recomiendo que la ___ en versión original.", g:"Recomendo que você a veja…", o:["veas","ves"], k:0, e:"recomiendo que + subjuntivo: veas.", h:"Veja a amostra."},
    {p:"No creo que la segunda temporada ___ mejor.", g:"Não acho que a segunda temporada seja melhor.", o:["sea","es"], k:0, e:"no creo que + subjuntivo: sea.", h:"Veja a amostra."},
    {p:"Es larga, pero vale la ___.", g:"É longa, mas vale a pena.", o:["pena","pela"], k:0, e:"Vale a pena = vale la pena.", h:"Igual ao português."},
    {p:"—No me gustó el final. —A mí ___.", g:"—Eu não gostei do final. —Nem eu.", o:["tampoco","también"], k:0, e:"Concordar com algo negativo → tampoco.", h:"A frase é negativa."},
    {p:"Estoy de acuerdo ___.", g:"Concordo com você.", o:["contigo","con tú"], k:0, e:"com você = contigo.", h:"Uma palavra só."}
  ],
  habla:"Agora recomende uma série ao seu professor: «Te recomiendo que veas… porque…»."
},

"b1-aquel-dia": {
  nivel:"B1", titulo:"Aquel día", c:"en", tipo:"ordena",
  sit:"You tell a friend about a day you will never forget.",
  muestra:[{es:"Hacía frío. Estaba lloviendo.", gl:"imperfect: the scene"},
           {es:"Salí de casa y vi a un amigo.", gl:"preterite: what happened"}],
  consigna:"Tap the words to build the sentence.",
  items:[
    {k:"Aquel día hacía mucho frío.", g:"That day it was very cold.", e:"Aquel día + the scene (hacía).", h:"Start with «aquel»."},
    {k:"Cuando salí de casa, estaba lloviendo.", g:"When I left home, it was raining.", e:"Event (salí) + scene (estaba lloviendo).", h:"Start with «cuando»."},
    {k:"Mientras esperaba el bus, vi a un viejo amigo.", g:"While I was waiting for the bus, I saw an old friend.", e:"Mientras + imperfect, then preterite.", h:"Start with «mientras»."},
    {k:"Al final llegué tarde, pero feliz.", g:"In the end I arrived late, but happy.", e:"Al final + preterite.", h:"Start with «al»."}
  ],
  habla:"Now tell your teacher about a day you will never forget: «Aquel día hacía… Cuando…»."
},

"b1-escribir-sin-prisa": {
  nivel:"B1", titulo:"Escribir sin prisa", c:"en", tipo:"completa",
  sit:"You're writing a short travel diary entry.",
  muestra:[{es:"pero · porque · luego", gl:"but · because · then"},
           {es:"sin embargo · en resumen", gl:"however · in short"}],
  consigna:"Type the right connector.",
  items:[
    {p:"Quería ir a la playa, ___ llovió todo el día.", g:"…but it rained all day.", k:"pero", e:"Contrast → pero.", h:"but…"},
    {p:"No fuimos al museo ___ estaba cerrado.", g:"…because it was closed.", k:"porque", e:"Reason → porque.", h:"because…"},
    {p:"Primero visitamos el centro y ___ fuimos al mercado.", g:"…and then we went to the market.", k:["luego","después"], e:"Next step → luego.", h:"then…"},
    {p:"El viaje fue caro; ___, valió la pena.", g:"…however, it was worth it.", k:"sin embargo", e:"Formal contrast → sin embargo.", h:"however…"},
    {p:"___, fue un viaje inolvidable.", g:"In short, it was an unforgettable trip.", k:["en resumen","en conclusión"], e:"To close the text → en resumen.", h:"in short…"}
  ],
  habla:"Now tell your teacher about a trip using three connectors: pero, porque, sin embargo."
},

"b1-sin-spoilers-por-favor": {
  nivel:"B1", titulo:"Sin spoilers, por favor", c:"en", tipo:"elige",
  sit:"You're talking about series with a friend who loves spoilers.",
  muestra:[{es:"¡No me cuentes el final! · ¡Qué va!", gl:"Don't tell me the ending! · No way! (to disagree)"},
           {es:"Te va a encantar.", gl:"You're going to love it."}],
  consigna:"Tap the best reaction.",
  items:[
    {p:"—Al final, el detective es el asesino… —¡___!", g:"", o:["No me cuentes el final","Te va a encantar"], k:0, e:"Stop a spoiler → ¡No me cuentes el final!", h:"Stop the spoiler!"},
    {p:"—Esa serie es muy aburrida. —¡___! A mí me encantó.", g:"That show is really boring.", o:["Qué va","Tienes razón"], k:0, e:"Disagree strongly → ¡Qué va!", h:"You disagree."},
    {p:"Si te gustan los thrillers, te va a ___.", g:"If you like thrillers, you're going to love it.", o:["encantar","encantas"], k:0, e:"va a + infinitive: encantar.", h:"After «va a»: infinitive."},
    {p:"Por favor, no me ___ qué pasa.", g:"Please, don't tell me what happens.", o:["cuentes","cuentas"], k:0, e:"Negative command → subjunctive: no me cuentes.", h:"Look at the example."},
    {p:"—Es la mejor serie del año. —Totalmente de ___.", g:"Totally agree.", o:["acuerdo","razón"], k:0, e:"Totally agree → totalmente de acuerdo.", h:"Estar de…"}
  ],
  habla:"Now recommend a series to your teacher without spoilers: «Te va a encantar porque…»."
},

"b1-yo-que-tu": {
  nivel:"B1", titulo:"Yo que tú…", c:"en", tipo:"completa",
  sit:"A friend has a problem and asks you for advice.",
  muestra:[{es:"Yo que tú, hablaría con él.", gl:"If I were you, I'd talk to him."},
           {es:"deberías · podrías", gl:"you should · you could"}],
  consigna:"Type the verb in the conditional.",
  items:[
    {p:"Yo que tú, ___ con tu jefe. (hablar)", g:"If I were you, I'd talk to your boss.", k:"hablaría", e:"hablar → hablaría.", h:"Ends in -ía."},
    {p:"___ descansar más. (deber, tú)", g:"You should rest more.", k:"deberías", e:"tú → deberías.", h:"Look at the example."},
    {p:"Yo que tú, no ___ ese carro. (comprar)", g:"If I were you, I wouldn't buy that car.", k:"compraría", e:"comprar → compraría.", h:"Ends in -ía."},
    {p:"Yo que tú, ___ al médico. (ir)", g:"If I were you, I'd go to the doctor.", k:"iría", e:"ir → iría.", h:"Ends in -ía."},
    {p:"___ buscar otro apartamento. (poder, tú)", g:"You could look for another apartment.", k:"podrías", e:"poder → podrías (irregular).", h:"Look at the example."}
  ],
  habla:"Now tell your teacher a small problem. Your teacher answers: «Yo que tú…»."
},

"b1-pasajero-con-mala-pata": {
  nivel:"B1", titulo:"Pasajero con mala pata", c:"en", tipo:"ordena",
  sit:"Nothing is going right at the airport today.",
  muestra:[{es:"perder el vuelo · retrasado", gl:"to miss the flight · delayed"},
           {es:"el puesto · la puerta de embarque", gl:"the seat · the boarding gate"}],
  consigna:"Tap the words to build the sentence.",
  items:[
    {k:"Perdí mi vuelo por cinco minutos.", g:"I missed my flight by five minutes.", e:"Perdí + mi vuelo + por cinco minutos.", h:"Start with «perdí»."},
    {k:"El vuelo está retrasado dos horas.", g:"The flight is delayed two hours.", e:"está + retrasado + time.", h:"Start with «el»."},
    {k:"¿Me puede cambiar el puesto?", g:"Can you change my seat?", e:"¿Me + puede + cambiar + el puesto?", h:"Start with «¿me»."},
    {k:"¿Dónde queda la puerta de embarque?", g:"Where is the boarding gate?", e:"¿Dónde queda…? = Where is…?", h:"Start with «¿dónde»."}
  ],
  habla:"Now your teacher works at the airport. Tell them your problem and ask for help."
},

/* ───────────── B2 ───────────── */

"b2-si-pero-no": {
  nivel:"B2", titulo:"Sí, pero no", c:"en", tipo:"elige",
  sit:"Building residents' meeting: someone wants to paint the building pink.",
  muestra:[{es:"Entiendo tu punto, pero…", gl:"I see your point, but…"},
           {es:"No es que no me guste, sino que… · No digo que sea…", gl:"It's not that I don't like it, it's that… (+ subjunctive)"}],
  consigna:"Tap the polite, correct option.",
  items:[
    {p:"Entiendo tu punto, ___ no estoy del todo de acuerdo.", g:"", o:["pero","sino"], k:0, e:"Adding a contrast → pero.", h:"Look at the first example."},
    {p:"No es que no me guste, ___ que me parece caro.", g:"", o:["sino","pero"], k:0, e:"No es que…, sino que… corrects the idea.", h:"Look at the second example."},
    {p:"No digo que ___ una mala idea.", g:"", o:["sea","es"], k:0, e:"No digo que + subjunctive: sea.", h:"Look at the second example."},
    {p:"Puede que ___ razón, pero hay que votar.", g:"You may be right, but…", o:["tengas","tienes"], k:0, e:"Puede que + subjunctive: tengas.", h:"Puede que → subjunctive."},
    {p:"Con todo respeto, ___ que deberíamos esperar.", g:"With all due respect, I think…", o:["creo","crea"], k:0, e:"Affirmative creo que + indicative.", h:"No «no» before creo."}
  ],
  habla:"Now your teacher proposes something crazy for the building. Disagree politely: «Entiendo tu punto, pero…»."
},

"b2-se-me-fue-el-tren": {
  nivel:"B2", titulo:"Se me fue el tren", c:"pt", tipo:"completa",
  sit:"Um dia de azar: tudo acontece «sem querer».",
  muestra:[{es:"Se me olvidó la llave. · Se me olvidaron las llaves.", gl:"Esqueci a chave / as chaves (sem querer)."},
           {es:"se + me / te / le / nos + verbo", gl:"o verbo concorda com a coisa, não com a pessoa"}],
  consigna:"Escreva o verbo no passado.",
  items:[
    {p:"Se me ___ las llaves en la oficina. (olvidar)", g:"Esqueci as chaves no escritório.", k:"olvidaron", e:"las llaves (plural) → olvidaron.", h:"Concorda com «las llaves»."},
    {p:"Se nos ___ el bus. (ir)", g:"Perdemos o ônibus.", k:"fue", e:"el bus (singular) → fue.", h:"Concorda com «el bus»."},
    {p:"Se me ___ el café encima. (caer)", g:"Derrubei o café em mim.", k:"cayó", e:"el café → cayó.", h:"Com «y»."},
    {p:"A mi hermano se le ___ el carro. (dañar)", g:"O carro do meu irmão quebrou.", k:"dañó", e:"el carro → dañó.", h:"Concorda com «el carro»."},
    {p:"Se me ___ los documentos. (perder)", g:"Perdi os documentos.", k:"perdieron", e:"los documentos (plural) → perdieron.", h:"Concorda com «los documentos»."}
  ],
  habla:"Agora conte ao seu professor um dia de azar: «Se me olvidó… Se me cayó…»."
},

"b2-radio-chisme": {
  nivel:"B2", titulo:"Radio Chisme 98.7", c:"en", tipo:"ordena",
  sit:"You host a gossip radio show. Report the rumors… carefully.",
  muestra:[{es:"Dicen que… · A lo mejor + indicative", gl:"They say… · Maybe…"},
           {es:"Puede que + subjunctive · Estará en casa.", gl:"It may be that… · He's probably at home. (future = guess)"}],
  consigna:"Tap the words to build the sentence.",
  items:[
    {k:"Dicen que el alcalde se va a casar.", g:"They say the mayor is going to get married.", e:"Dicen que + the rumor.", h:"Start with «dicen»."},
    {k:"A lo mejor se mudó a otra ciudad.", g:"Maybe she moved to another city.", e:"A lo mejor + indicative.", h:"Start with «a»."},
    {k:"Puede que sea solo un rumor.", g:"It may just be a rumor.", e:"Puede que + subjunctive (sea).", h:"Start with «puede»."},
    {k:"Tendrá unos cuarenta años.", g:"He must be about forty.", e:"Future for a guess: tendrá.", h:"Start with «tendrá»."},
    {k:"Estará de vacaciones en la playa.", g:"He's probably on vacation at the beach.", e:"Future for a guess: estará.", h:"Start with «estará»."}
  ],
  habla:"Now you're on air. Tell your teacher a (made-up) rumor: «Dicen que… A lo mejor… Puede que…»."
}

};
