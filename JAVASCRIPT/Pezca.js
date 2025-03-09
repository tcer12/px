// Manejador de modales (sin usar Bootstrap, pa' que sea sencillo)
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Variables globales del juego
let canvas, contexto;
let peces = [];
let intervaloJuego, intervaloAparicion, intervaloVelocidad;
let multiplicadorVelocidad = 1;
let configuracion = {};
let puntos = 0;
let vidas = 3;
let lastMilestone = 0; // pa' saber cuando subir la dificultad cada 200 pts
let currentDifficulty = 'normal'; // guardamos la dificultad elegida

// Clase Pez: acá se definen los peces y sus características
class Pez {
  constructor(x, y, tipo) {
    this.x = x;
    this.y = y;
    this.tipo = tipo; // puede ser "leon", "invasor" o "loro"
    this.tamano = 40;
    this.velocidadBase = Math.random() * 2 + 2;
    this.imagen = new Image();

    // Asignamos imagen segun el tipo, las rutas son tal cual
    if (tipo === "loro") this.imagen.src = "../CSS/img/10.png";   // imagen del pez loro
    else if (tipo === "leon") this.imagen.src = "../CSS/img/8.png"; // imagen del pez león
    else this.imagen.src = "../CSS/img/3.png";                     // imagen del invasor
  }

  dibujar() {
    // Dibujamos la imagen del pez en el canvas
    contexto.drawImage(
      this.imagen,
      this.x - this.tamano,
      this.y - this.tamano,
      this.tamano * 2,
      this.tamano * 2
    );
  }

  actualizar() {
    // Mueve el pez de derecha a izquierda
    this.x -= this.velocidadBase * multiplicadorVelocidad;
  }

  fueClickeado(xClick, yClick) {
    // Aumentar el área sensible
    const areaSensibilidad = this.tamano * 1.5; // Aumenta el área sensible
    return (
      xClick >= this.x - areaSensibilidad &&
      xClick <= this.x + areaSensibilidad &&
      yClick >= this.y - areaSensibilidad &&
      yClick <= this.y + areaSensibilidad
    );
  }
}

// Cuando el DOM se cargue, arranca el juego
document.addEventListener('DOMContentLoaded', function() {
  // Referencias a los botones del menú y modales
  const btnJugar = document.getElementById('btnJugar');
  const btnTutorial = document.getElementById('btnTutorial');
  const btnAprender = document.getElementById('btnAprender');
  const btnDificultad = document.getElementById('btnDificultad');
  const btnVolverMenu = document.getElementById('btnVolverMenu');
  const btnReintentar = document.getElementById('btnReintentar');
  const btnMenuGameOver = document.getElementById('btnMenuGameOver');

  // Asignamos eventos a los botones para abrir modales
  btnTutorial.addEventListener('click', () => openModal('modalTutorial'));
  btnAprender.addEventListener('click', () => openModal('modalAprender'));
  btnDificultad.addEventListener('click', () => openModal('modalDificultad'));

  // Botones del menú para iniciar o volver
  btnJugar.addEventListener('click', () => { iniciarJuego('normal'); });
  btnVolverMenu.addEventListener('click', volverAlMenu);

  // Al reintentar, usamos la dificultad que ya eligió el jugador
  btnReintentar.addEventListener('click', () => { reiniciarJuego(); });
  btnMenuGameOver.addEventListener('click', volverAlMenu);

  // Selección de dificultad desde el modal
  window.seleccionarDificultad = function(nivel) {
    closeModal('modalDificultad');
    iniciarJuego(nivel);
  };

  // Obtenemos el canvas y el contexto
  canvas = document.getElementById("gameCanvas");
  contexto = canvas.getContext("2d");

  // Evento para clic en el canvas (para PC)
  canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const xClick = event.clientX - rect.left;
    const yClick = event.clientY - rect.top;
    procesarClic(xClick, yClick);
  });

  // Evento para touch en móviles
  canvas.addEventListener("touchstart", function(event) {
    event.preventDefault(); // pa' que no se generen otros eventos raros
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const xClick = touch.clientX - rect.left;
    const yClick = touch.clientY - rect.top;
    procesarClic(xClick, yClick);
  }, false);
});

// Procesa el clic o toque en el canvas y elimina el pez
function procesarClic(xClick, yClick) {
  for (let i = peces.length - 1; i >= 0; i--) {
    if (peces[i].fueClickeado(xClick, yClick)) {
      // Si se clica en el pez loro, se pierde una vida
      if (peces[i].tipo === "loro") {
        perderVida();
      } else {
        // Sino, se suman 10 puntos
        sumarPuntos(10);
      }
      peces.splice(i, 1);
      break;
    }
  }
}

// Función para actualizar y dibujar el juego en el canvas
function actualizarJuego() {
  // Limpiamos el canvas y pintamos el fondo marino
  contexto.clearRect(0, 0, canvas.width, canvas.height);
  contexto.fillStyle = "#004080"; // Azul marino
  contexto.fillRect(0, 0, canvas.width, canvas.height);

  // Mueve y dibuja cada pez
  for (let i = peces.length - 1; i >= 0; i--) {
    peces[i].actualizar();
    peces[i].dibujar();

    // Si un pez sale de la pantalla
    if (peces[i].x + peces[i].tamano < 0) {
      // Si no es pez loro, se pierde una vida
      if (peces[i].tipo !== "loro") {
        perderVida();
      }
      peces.splice(i, 1);
    }
  }
}

// El bucle principal del juego (se ejecuta cada 30ms)
function bucleJuego() {
  actualizarJuego();
}

// Crea un pez aleatorio (con tipo random)
function crearPez() {
  const tipos = ["leon", "invasor", "loro"];
  const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
  const y = Math.random() * (canvas.height - 40) + 20;
  peces.push(new Pez(canvas.width + 20, y, tipoAleatorio));
}

// Sumar puntos y, cada 200, sube la dificultad
function sumarPuntos(valor) {
  puntos += valor;
  document.getElementById('contadorPuntos').innerText = puntos;
  // Checamos si se pasó de un hito de 200 pts pa' aumentar la velocidad
  if (puntos >= lastMilestone + 200) {
    multiplicadorVelocidad += 0.5; // Subimos la dificultad un poco más
    lastMilestone = puntos;
  }
}

// Resta una vida y actualiza el contador, y si se acaban, Game Over
function perderVida() {
  if (vidas > 0) {
    vidas--;
    document.getElementById('contadorVidas').innerHTML = "❤️".repeat(vidas);
  }
  if (vidas <= 0) {
    finalizarJuego();
  }
}

// Finaliza el juego (Game Over), mostrando el overlay
function finalizarJuego() {
  clearInterval(intervaloJuego);
  clearInterval(intervaloAparicion);
  clearInterval(intervaloVelocidad);
  document.getElementById('overlayGameOver').style.display = 'flex';
}

// Inicia el bucle y la creación de peces según la dificultad seleccionada
function iniciarBucleJuego(nivel) {
  currentDifficulty = nivel; // Guardamos la dificultad elegida

  if (nivel === "normal") {
    configuracion.intervaloAparicion = 1500;
    configuracion.multiplicadorVelocidadInicial = 2;
  } else if (nivel === "dificil") {
    configuracion.intervaloAparicion = 800;
    configuracion.multiplicadorVelocidadInicial = 3;
  } else if (nivel === "superdificil") {
    configuracion.intervaloAparicion = 600;
    configuracion.multiplicadorVelocidadInicial = 5;
  }

  multiplicadorVelocidad = configuracion.multiplicadorVelocidadInicial;
  puntos = 0;
  vidas = 3;
  lastMilestone = 0;
  document.getElementById('contadorPuntos').innerText = puntos;
  document.getElementById('contadorVidas').innerHTML = "❤️".repeat(vidas);

  peces = [];
  intervaloJuego = setInterval(bucleJuego, 30);
  intervaloAparicion = setInterval(crearPez, configuracion.intervaloAparicion);

  // Aumento gradual de la velocidad cada 5 seg pa' que no se note mucho
  intervaloVelocidad = setInterval(() => {
    multiplicadorVelocidad += 0.05;
  }, 5000);
}

// Función para iniciar el juego: muestra el canvas y arranca el bucle
function iniciarJuego(nivel) {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('seccionJuego').style.display = 'block';
  iniciarBucleJuego(nivel);
}

// Función pa volver al menú
function volverAlMenu() {
  clearInterval(intervaloJuego);
  clearInterval(intervaloAparicion);
  clearInterval(intervaloVelocidad);
  document.getElementById('seccionJuego').style.display = 'none';
  document.getElementById('overlayGameOver').style.display = 'none';
  document.getElementById('menu').style.display = 'flex';
}

// Función pa' reiniciar el juego usando la dificultad que ya eligió el jugador
function reiniciarJuego() {
  clearInterval(intervaloJuego);
  clearInterval(intervaloAparicion);
  clearInterval(intervaloVelocidad);
  document.getElementById('overlayGameOver').style.display = 'none';
  iniciarJuego(currentDifficulty);
}