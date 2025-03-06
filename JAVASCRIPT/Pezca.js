document.addEventListener('DOMContentLoaded', function() {
  const btnJugar = document.getElementById('btnJugar');
  const btnTutorial = document.getElementById('btnTutorial');
  const btnAprender = document.getElementById('btnAprender');
  const btnDificultad = document.getElementById('btnDificultad');
  const btnVolverMenu = document.getElementById('btnVolverMenu');
  const btnReintentar = document.getElementById('btnReintentar');
  const btnMenuGameOver = document.getElementById('btnMenuGameOver');

  const modalTutorial = new bootstrap.Modal(document.getElementById('modalTutorial'));
  const modalAprender = new bootstrap.Modal(document.getElementById('modalAprender'));
  const modalDificultad = new bootstrap.Modal(document.getElementById('modalDificultad'));

  btnTutorial.addEventListener('click', () => { modalTutorial.show(); });
  btnAprender.addEventListener('click', () => { modalAprender.show(); });
  btnDificultad.addEventListener('click', () => { modalDificultad.show(); });

  btnJugar.addEventListener('click', () => { iniciarJuego('normal'); });
  btnVolverMenu.addEventListener('click', volverAlMenu);
  btnReintentar.addEventListener('click', () => { reiniciarJuego('normal'); });
  btnMenuGameOver.addEventListener('click', volverAlMenu);

  let canvas, contexto;
  let peces = [];
  let intervaloJuego, intervaloAparicion, intervaloVelocidad;
  let multiplicadorVelocidad = 1;
  let configuracion = {};
  let puntos = 0;
  let vidas = 3;
  let pecesLoroMatados = 0;
  let lastMilestone = 0; // Variable para controlar el hito de 200 puntos

  class Pez {
      constructor(x, y, tipo) {
          this.x = x;
          this.y = y;
          this.tipo = tipo;
          this.tamano = 40;
          this.velocidadBase = Math.random() * 2 + 2;
          this.imagen = new Image();

          if (tipo === "loro") this.imagen.src = "/Acerca_Del_Pez_Loro/CSS/img/10.png";
          else if (tipo === "leon") this.imagen.src = "/Acerca_Del_Pez_Loro/CSS/img/8.png";
          else this.imagen.src = "/Acerca_Del_Pez_Loro/CSS/img/4.png";
      }

      dibujar() {
          contexto.drawImage(this.imagen, this.x - this.tamano, this.y - this.tamano, this.tamano * 2, this.tamano * 2);
      }

      actualizar() {
          this.x -= this.velocidadBase * multiplicadorVelocidad;
      }

      fueClickeado(xClick, yClick) {
          return (
              xClick >= this.x - this.tamano &&
              xClick <= this.x + this.tamano &&
              yClick >= this.y - this.tamano &&
              yClick <= this.y + this.tamano
          );
      }
  }

  canvas = document.getElementById("gameCanvas");
  contexto = canvas.getContext("2d");
  
  canvas.addEventListener("click", function(event) {
      const rect = canvas.getBoundingClientRect();
      const xClick = event.clientX - rect.left;
      const yClick = event.clientY - rect.top;

      for (let i = peces.length - 1; i >= 0; i--) {
          if (peces[i].fueClickeado(xClick, yClick)) {
              if (peces[i].tipo === "loro") {
                  perderVida();
              } else {
                  sumarPuntos(10);
              }
              peces.splice(i, 1);
              break;
          }
      }
  });

// Listener para touch en móviles
canvas.addEventListener("touchstart", function(event) {
  event.preventDefault(); // Evita el comportamiento por defecto del touch
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  const xClick = touch.clientX - rect.left;
  const yClick = touch.clientY - rect.top;

  for (let i = peces.length - 1; i >= 0; i--) {
      if (peces[i].fueClickeado(xClick, yClick)) {
          if (peces[i].tipo === "loro") {
              perderVida();
          } else {
              sumarPuntos(10);
          }
          peces.splice(i, 1);
          break;
      }
  }
}, false);
  function actualizarJuego() {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      contexto.fillStyle = "#004080";
      contexto.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = peces.length - 1; i >= 0; i--) {
          peces[i].actualizar();
          peces[i].dibujar();

          if (peces[i].x + peces[i].tamano < 0) {
              if (peces[i].tipo !== "loro") perderVida();
              peces.splice(i, 1);
          }
      }
  }

  function bucleJuego() {
      actualizarJuego();
  }

  function crearPez() {
      const tipos = ["leon", "invasor", "loro"];
      const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
      const y = Math.random() * (canvas.height - 40) + 20;
      peces.push(new Pez(canvas.width + 20, y, tipoAleatorio));
  }

  // Función para sumar puntos y, cada 200 puntos, incrementar la dificultad
  function sumarPuntos(valor) {
      puntos += valor;
      document.getElementById('contadorPuntos').innerText = puntos;
      if (puntos >= lastMilestone + 200) {
          multiplicadorVelocidad += 0.5; // Aumenta la velocidad extra cada 200 puntos
          lastMilestone = puntos;
      }
  }

  function perderVida() {
      if (vidas > 0) {
          vidas--;
          document.getElementById('contadorVidas').innerHTML = "❤️".repeat(vidas);
      }
      if (vidas <= 0) finalizarJuego();
  }

  function finalizarJuego() {
      clearInterval(intervaloJuego);
      clearInterval(intervaloAparicion);
      clearInterval(intervaloVelocidad);
      document.getElementById('overlayGameOver').style.display = 'flex';
  }

  function iniciarBucleJuego(nivel) {
      configuracion = {
          intervaloAparicion: nivel === "normal" ? 1500 : nivel === "dificil" ? 800 : 600,
          multiplicadorVelocidadInicial: nivel === "normal" ? 2 : nivel === "dificil" ? 3 : 5
      };

      multiplicadorVelocidad = configuracion.multiplicadorVelocidadInicial;
      puntos = 0;
      vidas = 3;
      lastMilestone = 0;
      document.getElementById('contadorPuntos').innerText = puntos;
      document.getElementById('contadorVidas').innerHTML = "❤️".repeat(vidas);

      peces = [];
      intervaloJuego = setInterval(bucleJuego, 30);
      intervaloAparicion = setInterval(crearPez, configuracion.intervaloAparicion);
      intervaloVelocidad = setInterval(() => {
          multiplicadorVelocidad += 0.05;
      }, 5000);
  }

  function iniciarJuego(nivel) {
      document.getElementById('menu').style.display = 'none';
      document.getElementById('seccionJuego').style.display = 'block';
      iniciarBucleJuego(nivel);
  }

  function volverAlMenu() {
      clearInterval(intervaloJuego);
      clearInterval(intervaloAparicion);
      clearInterval(intervaloVelocidad);
      document.getElementById('seccionJuego').style.display = 'none';
      document.getElementById('overlayGameOver').style.display = 'none';
      document.getElementById('menu').style.display = 'flex';
  }

  function reiniciarJuego(nivel) {
      clearInterval(intervaloJuego);
      clearInterval(intervaloAparicion);
      clearInterval(intervaloVelocidad);
      document.getElementById('overlayGameOver').style.display = 'none';
      iniciarJuego(nivel);
  }

  window.seleccionarDificultad = function(nivel) {
      modalDificultad.hide();
      iniciarJuego(nivel);
  };
});
