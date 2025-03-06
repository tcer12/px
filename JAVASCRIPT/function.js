function mostrarModal(imagen, titulo, descripcion) {
                document.getElementById("modalImg").src = imagen;
                document.getElementById("modalTitulo").textContent = titulo;
                document.getElementById("modalTexto").textContent = descripcion;
            }