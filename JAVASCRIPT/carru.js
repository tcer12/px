document.addEventListener('DOMContentLoaded', function() {
    // Variables para el carrusel
    const carousel = document.getElementById('pezLoroCarousel');
    const carouselInner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    const prevButton = carousel.querySelector('.carousel-control-prev');
    const nextButton = carousel.querySelector('.carousel-control-next');
    const loader = carousel.querySelector('.loader');
    const swipeIndicator = carousel.querySelector('.swipe-indicator');
    
    let currentIndex = 0;
    let startX, moveX;
    let isAnimating = false;
    let autoplayInterval;
    let touchStarted = false;
    
    // Inicializar el carrusel
    function initCarousel() {
        // Establecer el primer elemento como activo
        items[0].classList.add('active');
        
        // Ocultar el loader cuando todas las imágenes estén cargadas
        const images = carousel.querySelectorAll('img');
        let loadedCount = 0;
        
        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        hideLoader();
                    }
                });
                
                img.addEventListener('error', () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        hideLoader();
                    }
                });
            }
        });
        
        if (loadedCount === images.length) {
            hideLoader();
        }
        
        // Iniciar autoplay
        startAutoplay();
        
        // Mostrar indicador de deslizamiento en móviles
        if (window.innerWidth <= 767) {
            setTimeout(() => {
                swipeIndicator.classList.add('visible');
                setTimeout(() => {
                    swipeIndicator.classList.remove('visible');
                }, 3000);
            }, 1000);
        }
    }
    
    function hideLoader() {
        loader.style.display = 'none';
    }
    
    // Función para cambiar a una diapositiva específica
    function goToSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Eliminar clase activa de todos los elementos
        items.forEach(item => item.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Aplicar nueva clase activa
        items[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Mover el carrusel
        carouselInner.style.transform = `translateX(-${index * 100}%)`;
        
        // Actualizar índice actual
        currentIndex = index;
        
        // Permitir nueva animación después de completar la transición
        setTimeout(() => {
            isAnimating = false;
        }, 600); // Coincidir con el tiempo de transición CSS
        
        // Reiniciar autoplay
        restartAutoplay();
    }
    
    // Navegar a la diapositiva anterior
    function prevSlide() {
        const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
    }
    
    // Navegar a la siguiente diapositiva
    function nextSlide() {
        const newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
        goToSlide(newIndex);
    }
    
    // Iniciar reproducción automática
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Cambiar cada 5 segundos
    }
    
    // Reiniciar reproducción automática
    function restartAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Event listeners
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
    
    // Event listeners para indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Soporte para pantallas táctiles (swipe)
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        touchStarted = true;
        
        // Detener autoplay durante el toque
        clearInterval(autoplayInterval);
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!touchStarted) return;
        moveX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        if (!touchStarted) return;
        touchStarted = false;
        
        const diff = startX - moveX;
        const threshold = 50; // Umbral mínimo para considerar como swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe izquierda -> siguiente
                nextSlide();
            } else {
                // Swipe derecha -> anterior
                prevSlide();
            }
        }
        
        // Reiniciar autoplay
        startAutoplay();
    }, { passive: true });
    
    // Pausar autoplay al pasar el mouse
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });
    
    // Reanudar autoplay al quitar el mouse
    carousel.addEventListener('mouseleave', () => {
        startAutoplay();
    });
    
    // Inicializar carrusel
    initCarousel();
    
    // Ajustar tamaño en cambio de orientación
    window.addEventListener('resize', () => {
        // Forzar reposicionamiento
        carouselInner.style.transition = 'none';
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        setTimeout(() => {
            carouselInner.style.transition = 'transform 0.6s ease-in-out';
        }, 50);
    });
});