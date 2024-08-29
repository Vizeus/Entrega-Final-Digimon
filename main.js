// URL base de la API
const urlBase = 'https://digi-api.com/api/v1/digimon';

// Seleccionar el elemento <ul> (unordered list) donde agregaremos los digimons
const listaDigimons = document.getElementById('listado-digimons');

// Seleccionar la barra de progreso
const barraProgreso = document.getElementById('carga');

// Seleccionar el botón de cambiar niveles
const botonCambiarNiveles = document.getElementById('cambiar-niveles');

// Seleccionar el botón de iniciar combate
const botonIniciarCombate = document.getElementById('iniciar-combate');

// Número total de Digimons 
const totalDigimons = 860;

// Número de páginas a recuperar
const totalPaginas = 172; // 5 digimons por página: 860 digimons en total

// Mapeo de atributos para la traducción
const traduccionAtributos = {
    'Data': 'Datos 🔢',
    'Vaccine': 'Vacuna 💉',
    'Virus': 'Virus 👾',
    'Free': 'Libre 🕊️',
    'Variable': 'Variable 🔀',
    'Unknown': 'Desconocido ❓',
};

// Mapeo de niveles para el cambio de sistema de clasificación de niveles
const nivelesAlternativos = {
    'Baby I': 'Fresh/Slime',
    'Baby II': 'In-Training',
    'Child': 'Rookie',
    'Adult': 'Champion',
    'Perfect': 'Ultimate ',
    'Ultimate': 'Mega',
    'Super Ultimate': 'Ultra' // ¿?
};

// Función para obtener los Digimons de una página
async function obtenerPagina(numeroPagina) {
    try {
        const respuesta = await fetch(`${urlBase}?page=${numeroPagina}`);
        const datos = await respuesta.json();
        return datos.content;
    } catch (error) {
        console.error('Error al obtener los Digimons de la página:', numeroPagina, error);
    }
}

// Función para obtener los detalles de un Digimon específico
async function obtenerDetallesDigimon(url) {
    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error('Error al obtener detalles del Digimon:', error);
        return null;
    }
}

// Función para obtener los Digimons de todas las páginas
async function crearArrayDeDatos() {
    try {
        // Generar array de promesas para todas las páginas
        const promesasPaginas = [];
        for (let i = 0; i < totalPaginas; i++) {
            promesasPaginas.push(obtenerPagina(i));
        }

        // Esperar a que se resuelvan todas las promesas
        const paginas = await Promise.all(promesasPaginas);
        console.log("Páginas 👇")
        console.info(paginas)

        // Combinar todos los sub-arrays de cada página en un solo array
        const digimons = paginas.flat();
        console.log("Digimons 👇")
        console.info(digimons)
        console.log("----------------------------------------------------------------------")

        return digimons; // Devolvemos el array aplanado de Digimons
    } catch (error) {
        console.error('Error al obtener todos los Digimons:', error);
        return [];
    }
}

// Función para actualizar la barra de progreso
function actualizarBarraProgreso(contador) {
    barraProgreso.value = contador;
    barraProgreso.max = totalDigimons;
}

let clasificacionAlternativa = sessionStorage.getItem('clasificacionAlternativa');

// Recuperar el valor de la clasificación alternativa desde sessionStorage
document.addEventListener('DOMContentLoaded', () => {
    clasificacionAlternativa = sessionStorage.getItem('clasificacionAlternativa') === 'true';
    if (clasificacionAlternativa) {
        botonCambiarNiveles.classList.add('nivel-eeuu');
        botonCambiarNiveles.classList.remove('nivel-japon');
    } else {
        botonCambiarNiveles.classList.add('nivel-japon');
        botonCambiarNiveles.classList.remove('nivel-eeuu');
    }
    // Llamar a la función para cargar los Digimons después de inicializar la configuración
    crearListaDeDigimons();
});

let contadorDigimons = 0; // Contador de Digimons cargados

// Array para almacenar los elementos seleccionados
const seleccionados = [];

// Función para manejar el boton de combate
function verificarSeleccion() {
    if (seleccionados.length === 2) {
        botonIniciarCombate.classList.add("animate__animated", "animate__pulse");
        botonIniciarCombate.disabled = false;
        botonIniciarCombate.style.backgroundColor = 'green';
    } else {
        botonIniciarCombate.classList.remove("animate__animated", "animate__pulse");
        botonIniciarCombate.disabled = true;
        botonIniciarCombate.style.backgroundColor = 'grey';
    }
}

// Función para crear la lista de Digimons
async function crearListaDeDigimons() {
    try {
        // Obtenemos el array de Digimons
        const digimons = await crearArrayDeDatos();

        // Recorremos toda la lista de Digimons
        for (const digimon of digimons) {
            // Obtenemos los detalles de cada Digimon
            const detalles = await obtenerDetallesDigimon(digimon.href);

            // Extraemos el atributo o, sino tiene, le ponemos "Desconocido"
            let atributoBruto;
            if (detalles.attributes.length > 0) {
                atributoBruto = detalles.attributes[0].attribute;
            } else {
                atributoBruto = 'Desconocido ❓';
            }

            // Extraemos el nivel o, sino tiene, le ponemos "Desconocido"
            let nivel;
            if (detalles.levels.length > 0) {
                nivel = detalles.levels[0].level;
            } else {
                nivel = 'Desconocido';
            }

            if (clasificacionAlternativa) {
                nivel = nivelesAlternativos[nivel] || nivel;
            }

            // Traducción de los atributos
            const atributoTraducido = traduccionAtributos[atributoBruto] || atributoBruto;

            // ---Creación de la lista con el DOM---
            const elementoLista = document.createElement('li');

            // Creamos la "carta" del digimon
            elementoLista.innerHTML = `
                <h4>${digimon.name}</h4>
                <p>ID: ${digimon.id}</p>
                <p>Nivel: ${nivel}</p>
                <p>Tipo: ${atributoTraducido}</p>
                <img src="${digimon.image}" alt="${digimon.name}">`;
                
            // Agregamos el manejador de eventos al <li>
            elementoLista.addEventListener('click', () => {
                elementoLista.classList.toggle('seleccionado');

                if (elementoLista.classList.contains('seleccionado')) {
                    if (seleccionados.length < 2) {
                        seleccionados.push(elementoLista);
                    } else {
                        const elementoAntiguo = seleccionados.shift();
                        elementoAntiguo.classList.toggle('seleccionado');
                        seleccionados.push(elementoLista);
                    }
                } else {
                    const index = seleccionados.indexOf(elementoLista);
                    if (index > -1) {
                        seleccionados.splice(index, 1);
                    }
                }
                // Llamar a la función para verificar y actualizar el botón
                verificarSeleccion();
            });

            // Agregamos el <li> a la lista de Digimons (<ul>)
            listaDigimons.appendChild(elementoLista);

            // Actualizamos el contador y la barra de progreso
            contadorDigimons++;
            actualizarBarraProgreso(contadorDigimons);

            // -----------------------------------------------------------------


        }
    } catch (error) {
        console.error('Error al crear la lista de Digimons:', error);
    }
}

// Agregar evento al botón de cambiar niveles
botonCambiarNiveles.addEventListener('click', () => {
    clasificacionAlternativa = sessionStorage.getItem('clasificacionAlternativa') === 'true';
    sessionStorage.setItem('clasificacionAlternativa', !clasificacionAlternativa);
    window.location.reload();
});

// -----------------------------------------------------------------------------------------------------------------

// Función para iniciar el combate
async function iniciarCombate() {

    console.log("--- Variables de los digimons seleccionados para el combate 👇 ---")

    const digimon1 = seleccionados[0];
    const digimon2 = seleccionados[1];

    // Extraemos el tipo del digimon para poder luego determinar la probabilidad de victoria
    const tipo1 = digimon1.querySelector(':nth-child(4)').textContent.split(': ')[1];
    const tipo2 = digimon2.querySelector(':nth-child(4)').textContent.split(': ')[1];
    console.log(tipo1)
    console.log(tipo2)

    // Extraemos los niveles también 
    const nivel1 = digimon1.querySelector(':nth-child(3)').textContent.split(': ')[1];
    const nivel2 = digimon2.querySelector(':nth-child(3)').textContent.split(': ')[1];
    console.log(nivel1)
    console.log(nivel2)

    const numeracionNiveles = {
        'Baby I': 1,
        'Fresh/Slime': 1,
        'Baby II': 3,
        'In-Training': 3,
        'Child': 4,
        'Rookie': 4,
        'Adult': 5,
        'Champion': 5,
        'Perfect': 6,
        'Ultimate ': 6,
        'Ultimate': 7,
        'Mega': 7,
        'Hybrid': 7,
        'Armor': 7,
    };

    nivel1Numerico = numeracionNiveles[nivel1];
    nivel2Numerico = numeracionNiveles[nivel2];
    console.log("(Niveles traducidos a números 👇")
    console.log(nivel1Numerico)
    console.log(nivel2Numerico + ")")
    console.log("----------------------------------------------------------------------")

    const ganador = determinarGanador(tipo1, tipo2, nivel1Numerico, nivel2Numerico);

    // Cuadros de animación
    try {
        reproducirSonido(audioMouse)
        reproducirPajita()
        await Swal.fire({
            title: `Preparando combate...`,
            imageUrl: `./img/Trabajando.gif`,
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image"
        });
        detenerSonido(audioMouse); // Detiene el sonido después de que se cierra la primera ventana
        detenerSonidoPajita();
    } catch (error) {
        detenerSonido(audioMouse); // Asegura que el sonido se detenga en caso de error
        detenerSonidoPajita();
    }

    try {
        reproducirSonido(battleMusic)
        await Swal.fire({
            title: `¡Los Digimons están peleando!`,
            imageUrl: `./img/Peleando.gif`,
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image"
        });
        detenerSonido(battleMusic);
    } catch (error) {
        detenerSonido(battleMusic);
    }

    try {
        reproducirSonido(winSound);
        reproducirConDelay(); // Llama a la función con delay para reproducir winMusic
        dialogoAbierto = true; // Marca que el diálogo está abierto
        await Swal.fire({
            title: `¡El ganador es ${ganador}!`,
            imageUrl: './img/Festejando.gif',
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image"
        });
        dialogoAbierto = false; // Marca que el diálogo está cerrado
        detenerSonido(winMusic);
    } catch (error) {
        dialogoAbierto = false; // Asegura que el diálogo esté cerrado en caso de error
        detenerSonido(winMusic);
    }
}

// Función para determinar el ganador considerando los niveles
function determinarGanador(tipo1, tipo2, nivel1, nivel2) {

    console.log("--- Cálculos del combate 👇 ---")

    // Probabilidades base según tipo
    const probabilidades = {
        'Virus 👾': { 'Datos 🔢': 0.7, 'Vacuna 💉': 0.3 },
        'Datos 🔢': { 'Vacuna 💉': 0.7, 'Virus 👾': 0.3 },
        'Vacuna 💉': { 'Virus 👾': 0.7, 'Datos 🔢': 0.3 },
    };

    // Probabilidad base según tipo
    const probabilidadBase = probabilidades[tipo1]?.[tipo2] || 0.5;
    console.log("Probabilidad del tipo 1 de ganarle al tipo 2 👇")
    console.log(probabilidadBase)

    // Ajuste de probabilidad según niveles
    const diferenciaDeNivel = nivel1 - nivel2;
    console.log("Diferencia de nivel 👇")
    console.log(diferenciaDeNivel)
    const ajuste = diferenciaDeNivel * 0.20; // Ajuste del 13% por nivel de diferencia
    console.log("Ajuste por la consideraciión de los niveles 👇")
    console.log(ajuste)
    const probabilidadAjustada = Math.min(1, Math.max(0, probabilidadBase + ajuste)); // Asegura que la probabilidad esté entre 0 y 1
    console.log("El N° aleatorio debe ser inferior a este 👇 para ganar")
    console.log(probabilidadAjustada)

    // Generación de resultado aleatorio
    const random = Math.random();
    console.log("Número aleatorio 👇")
    console.log(random)
    console.log("----------------------------------------------------------------------")

    if (random < probabilidadAjustada) {
        return seleccionados[0].querySelector(':nth-child(1)').textContent;
    } else {
        return seleccionados[1].querySelector(':nth-child(1)').textContent;
    }
}

// Agregar evento al botón de iniciar combate
botonIniciarCombate.addEventListener('click', iniciarCombate);

// ------------------------------------------------------------------------------------------------------

// Menú desplagable

// Función para mostrar alertas 
function mostrarInfo(titulo, texto) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}

// Agregar eventos a los botones del menú desplegable
document.getElementById('botonDatos').addEventListener('click', () => {
    mostrarInfo('Datos 🔢', 'Los Datos son Digimon con habilidades equilibradas, fuertes contra Vacuna pero débiles frente a Virus.');
});

document.getElementById('botonVirus').addEventListener('click', () => {
    mostrarInfo('Virus 👾', 'Los Virus tienen habilidades ofensivas, son fuertes contra Datos pero débiles frente a Vacuna.');
});

document.getElementById('botonVacuna').addEventListener('click', () => {
    mostrarInfo('Vacuna 💉', 'Los Vacuna se destacan por sus habilidades defensivas, son fuertes contra Virus y débiles frente a Datos.');
});

document.getElementById('botonLibre').addEventListener('click', () => {
    mostrarInfo('Libre 🕊️', 'Los Libres no tienen atributos definidos, por lo que son equilibrados en combate y no tienen debilidades ni fortalezas particulares.');
});

document.getElementById('botonVariable').addEventListener('click', () => {
    mostrarInfo('Variable 🔀', 'Los Variables son adaptables con habilidades cambiantes, capaces de ajustarse a diversas situaciones; pueden ser difíciles de predecir.');
});

document.getElementById('botonDesconocido').addEventListener('click', () => {
    mostrarInfo('Desconocido ❓', 'Los Desconocidos tienen atributos no clasificados, lo que los hace inesperados en combate.');
});

// ------------------------------------------------------------------------------------------------------

// Audios

const audioMouse = new Audio('audio/Mouse.mp3');
audioMouse.loop = true;

const winMusic = new Audio('audio/Digimon World 3 - Victory.mp3');
audioMouse.loop = true;

const battleMusic = new Audio('audio/Digimon World - Earlygame Battle.mp3');
audioMouse.loop = true;

const winSound = new Audio('audio/Digimon World - PSX Battle Win.mp3');

const audioPajita = new Audio('audio/Pajita.mp3');
let intervaloSonido;

function reproducirSonido(audio) {
    audio.play();
}

function detenerSonido(audio) {
    audio.pause();
    audio.currentTime = 0; 
}


function reproducirPajita() {
    intervaloSonido = setInterval(() => {
        audioPajita.play();
        setTimeout(() => {
            audioPajita.pause();
            audioPajita.currentTime = 0; 
        }, 650);
    }, 1500) 
}


function detenerSonidoPajita() {
    clearInterval(intervaloSonido);
    audioPajita.pause();
    audioPajita.currentTime = 0; 
}


function reproducirConDelay() {
    setTimeout(() => {
        if (dialogoAbierto) {
            winMusic.play();
        }
    }, 2450); 
}

// --------------------------------------------------------------------------------------------------------