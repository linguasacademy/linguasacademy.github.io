/* Catálogo de tableros · Lingua's Academy
   Un objeto por tablero. Para añadir uno nuevo, copia una línea y cambia sus campos:
   archivo    nombre del .html (español: <nivel>-<tema>.html; inglés: en-<nivel>-<tema>.html; portugués: pt-<nivel>-<tema>.html)
   idioma     el idioma que se enseña: "es", "en" o "pt"
   nivel      "A1", "A2", "B1", "B2", "C1" o "C2"
   consignas  el idioma de las instrucciones: "en", "pt" o "es"
   publico    "ninos" o "adultos"
   prueba     true si es una clase de prueba
   vivo       true si el tablero funciona en sala en vivo */
window.CATALOGO = [
  {"archivo":"a1-que-me-pongo-hoy.html","idioma":"es","nivel":"A1","titulo":"¿Qué me pongo hoy?","desc":"El tiempo y la ropa: hace calor / hace frío / llueve, Llevo… + colores","consignas":"en","publico":"ninos","prueba":false,"vivo":true},
  {"archivo":"a1-el-menu-de-chispa.html","idioma":"es","nivel":"A1","titulo":"El menú de Chispa","desc":"La comida, Me gusta / No me gusta, ¿Te gusta…?","consignas":"en","publico":"ninos","prueba":false,"vivo":false},
  {"archivo":"a1-los-numeros-del-pirata.html","idioma":"es","nivel":"A1","titulo":"Los números del pirata","desc":"Números del 9 al 15 y ¿Cuántos hay?","consignas":"en","publico":"ninos","prueba":false,"vivo":false},
  {"archivo":"a1-monstruos-gigantes.html","idioma":"es","nivel":"A1","titulo":"Monstruos gigantes","desc":"Describir monstruos: tamaño, colores y partes del cuerpo","consignas":"en","publico":"ninos","prueba":false,"vivo":true},
  {"archivo":"a1-mision-cohete.html","idioma":"es","nivel":"A1","titulo":"Misión Cohete","desc":"Misión espacial con números y colores","consignas":"en","publico":"ninos","prueba":false,"vivo":false},
  {"archivo":"a1-mision-wild-park-donde-esta.html","idioma":"es","nivel":"A1","titulo":"Misión Wild Park: ¿Dónde está?","desc":"Animales y ¿Dónde está?","consignas":"en","publico":"ninos","prueba":false,"vivo":false},
  {"archivo":"a1-ranger-wild-park.html","idioma":"es","nivel":"A1","titulo":"Ranger · Wild Park","desc":"Animales del parque","consignas":"en","publico":"ninos","prueba":false,"vivo":false},
  {"archivo":"a1-que-tal-tu-fin-de-semana.html","idioma":"es","nivel":"A1","titulo":"¿Qué tal tu fin de semana?","desc":"¿Adónde fuiste? ¿Qué comiste? y me gustó / no me gustó","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a1-fui-vi-y-comi.html","idioma":"es","nivel":"A1","titulo":"Fui, vi y comí","desc":"Contar un viaje en pasado con «yo»","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a1-un-cafe-por-favor.html","idioma":"es","nivel":"A1","titulo":"Un café, por favor","desc":"Pedir en un bar: un / una, Quiero…","consignas":"en","publico":"adultos","prueba":true,"vivo":false},
  {"archivo":"a1-mucho-gusto.html","idioma":"es","nivel":"A1","titulo":"Mucho gusto","desc":"Presentarse en una reunión de trabajo","consignas":"pt","publico":"adultos","prueba":true,"vivo":false},
  {"archivo":"a1-mi-trabajo-mi-dia.html","idioma":"es","nivel":"A1","titulo":"Mi trabajo, mi día","desc":"El día de trabajo con el presente yo / tú / él","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a1-mi-dia-de-trabajo.html","idioma":"es","nivel":"A1","titulo":"Mi día de trabajo","desc":"La agenda del día: horas y yo / tú / ella","consignas":"es","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a1-te-queda-bien.html","idioma":"es","nivel":"A1","titulo":"¿Te queda bien?","desc":"Comprar ropa: tallas, colores y ¿Te queda bien?","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-que-esta-pasando-aqui.html","idioma":"es","nivel":"A2","titulo":"¿Qué está pasando aquí?","desc":"Describir fotos: hay, a la izquierda / al fondo, estar + -ando / -iendo","consignas":"es","publico":"adultos","prueba":false,"vivo":true},
  {"archivo":"a2-ya-lo-has-probado.html","idioma":"es","nivel":"A2","titulo":"¿Ya lo has probado?","desc":"Experiencias y planes de viaje: pretérito perfecto, ya / todavía no, voy a","consignas":"en","publico":"adultos","prueba":false,"vivo":true},
  {"archivo":"a2-me-lo-llevo.html","idioma":"es","nivel":"A2","titulo":"Me lo llevo","desc":"Comprar: precios, números hasta 1.000, la hora, este / ese, más… que","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-que-me-recomienda.html","idioma":"es","nivel":"A2","titulo":"¿Qué me recomienda?","desc":"Pedir en un restaurante de tapas con mucha práctica oral","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-y-a-ti.html","idioma":"es","nivel":"A2","titulo":"¿Y a ti?","desc":"Opinar, dar razones y discrepar: me gustan, también / tampoco, me parece","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-lo-mas-loco-que-he-hecho.html","idioma":"es","nivel":"A2","titulo":"Lo más loco que he hecho","desc":"Anécdotas de viaje: ¿Alguna vez has…?, participios irregulares, se me cayó","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-a-como-esta-la-pina.html","idioma":"es","nivel":"A2","titulo":"¿A cómo está la piña?","desc":"Comprar en la plaza de mercado: precios, regatear, me lo / me la llevo","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-el-viaje-a-la-finca.html","idioma":"es","nivel":"A2","titulo":"El viaje a la finca","desc":"Género español ↔ portugués, artículos y acento","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-a-dos-cuadras.html","idioma":"es","nivel":"A2","titulo":"A dos cuadras","desc":"Pedir y dar el camino en el barrio: sigue, gira, al / del","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-y-tu-que-opinas.html","idioma":"es","nivel":"A2","titulo":"¿Y tú qué opinas?","desc":"Opinar, reaccionar y no quedarse callado","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-que-vamos-a-pedir.html","idioma":"es","nivel":"A2","titulo":"¿Qué vamos a pedir?","desc":"Gustos (gustar, encantar) y pedir en un restaurante","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-ayer-fue-diferente.html","idioma":"es","nivel":"A2","titulo":"Ayer fue diferente","desc":"El fin de semana pasado con el pretérito indefinido","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-cada-uno-a-su-hora.html","idioma":"es","nivel":"A2","titulo":"Cada uno a su hora","desc":"La rutina y la hora","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-casa-o-apartamento.html","idioma":"es","nivel":"A2","titulo":"¿Casa o apartamento?","desc":"Comparar: más… que, menos… que, tan… como, mejor y peor","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-tres-dias-en-cartagena.html","idioma":"es","nivel":"A2","titulo":"Tres días en Cartagena","desc":"Planear un viaje de tres días","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-mesa-para-dos.html","idioma":"es","nivel":"A2","titulo":"Mesa para dos","desc":"Reservar y pedir en un restaurante","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-habitacion-207.html","idioma":"es","nivel":"A2","titulo":"Habitación 207","desc":"Condicional para pedir, desear y aconsejar en un hotel (A2+ → B1)","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"a2-la-maleta-perdida.html","idioma":"es","nivel":"A2","titulo":"La maleta perdida","desc":"Reclamar una maleta en el aeropuerto (A2+ → B1)","consignas":"es","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-ya-se-habia-ido.html","idioma":"es","nivel":"B1","titulo":"Ya se había ido","desc":"El pluscuamperfecto para contar lo que pasó antes","consignas":"en","publico":"adultos","prueba":false,"vivo":true},
  {"archivo":"b1-todo-iba-bien-hasta-que.html","idioma":"es","nivel":"B1","titulo":"Todo iba bien hasta que…","desc":"Contar en pasado con imperfecto e indefinido","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-que-harias-si.html","idioma":"es","nivel":"B1","titulo":"¿Qué harías si…?","desc":"Hipótesis con condicional y si + imperfecto de subjuntivo","consignas":"pt","publico":"adultos","prueba":false,"vivo":true},
  {"archivo":"b1-y-tu-que-investigas.html","idioma":"es","nivel":"B1","titulo":"¿Y tú qué investigas?","desc":"Explicar una investigación con fluidez: género, pasado y sonidos","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-dice-un-estudio.html","idioma":"es","nivel":"B1","titulo":"Dice un estudio","desc":"Comparar dos estudios y opinar con registro de artículo","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-no-te-lo-vas-a-creer.html","idioma":"es","nivel":"B1","titulo":"No te lo vas a creer","desc":"Contar una anécdota de viaje sin silencios","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-lo-que-mas-me-gusto.html","idioma":"es","nivel":"B1","titulo":"Lo que más me gustó","desc":"Contar un viaje con fluidez y entonación","consignas":"pt","publico":"adultos","prueba":true,"vivo":false},
  {"archivo":"b1-en-version-original.html","idioma":"es","nivel":"B1","titulo":"En versión original","desc":"Opinar, reaccionar, discrepar y recomendar series (B1+)","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-aquel-dia.html","idioma":"es","nivel":"B1","titulo":"Aquel día","desc":"Narrar en pasado: imperfecto e indefinido (B1+ → B2)","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-escribir-sin-prisa.html","idioma":"es","nivel":"B1","titulo":"Escribir sin prisa","desc":"Producción escrita: conectores y una entrada de viaje (B1+)","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-sin-spoilers-por-favor.html","idioma":"es","nivel":"B1","titulo":"Sin spoilers, por favor","desc":"Series, reacciones y recomendaciones (B1+, 60 min)","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-yo-que-tu.html","idioma":"es","nivel":"B1","titulo":"Yo que tú…","desc":"Dar consejos: Yo que tú…, deberías, podrías (B1+, 60 min)","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b1-pasajero-con-mala-pata.html","idioma":"es","nivel":"B1","titulo":"Pasajero con mala pata","desc":"Problemas de viaje en el aeropuerto","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b2-si-pero-no.html","idioma":"es","nivel":"B2","titulo":"Sí, pero no","desc":"Discrepar con cortesía en una junta de vecinos","consignas":"en","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b2-se-me-fue-el-tren.html","idioma":"es","nivel":"B2","titulo":"Se me fue el tren","desc":"Anécdotas con los pasados, verbos con se y fonética (60 min)","consignas":"pt","publico":"adultos","prueba":false,"vivo":false},
  {"archivo":"b2-radio-chisme.html","idioma":"es","nivel":"B2","titulo":"Radio Chisme 98.7","desc":"Rumores e hipótesis (60 min)","consignas":"en","publico":"adultos","prueba":false,"vivo":false}
];
