<!-- src/lib/components/ui/ImageCarousel.svelte -->
<!-- ✅ CORREGIDO: Compatible con arrays de strings y objetos -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { ChevronLeft, ChevronRight, ShoppingBag, Star, Shield, Truck } from 'lucide-svelte';
  import { browser } from '$app/environment';

  // Props
  export let imagenes = [];
  export let titulo = '';
  export let subtitulo = '';
  export let ctaTexto = 'Explorar Catálogo';
  export let ctaEnlace = '/productos';
  export let tema = {
    primary: '#3B82F6',
    primaryLight: '#93C5FD',
    primaryDark: '#1D4ED8',
    text: '#FFFFFF'
  };

  // ✅ Normalizar imagenes: aceptar strings o objetos
  $: imagenesNormalizadas = imagenes.map(img => {
    if (typeof img === 'string') {
      return { url: img };
    }
    return img;
  });

  let currentIndex = 0;
  let intervalId = null;
  let isPaused = false;
  let isMobile = false;
  let touchStartX = 0;
  let touchEndX = 0;

  const AUTO_SLIDE_INTERVAL = 5000;

  // Características
  const features = [
    { icon: Star, text: 'Productos Premium', color: '#FBBF24' },
    { icon: Shield, text: 'Garantía de Calidad', color: '#10B981' },
    { icon: Truck, text: 'Envío Rápido', color: '#8B5CF6' }
  ];

  // ✅ Check móvil - solo en cliente
  function checkMobile() {
    if (!browser) return;
    isMobile = window.innerWidth < 768;
  }

  // Navegación
  function nextSlide() {
    currentIndex = (currentIndex + 1) % imagenesNormalizadas.length;
  }

  function prevSlide() {
    currentIndex = currentIndex === 0 ? imagenesNormalizadas.length - 1 : currentIndex - 1;
  }

  function goToSlide(index) {
    currentIndex = index;
    resetAutoSlide();
  }

  // Touch gestures
  function handleTouchStart(event) {
    if (!browser) return;
    touchStartX = event.touches[0].clientX;
    pauseCarousel();
  }

  function handleTouchEnd(event) {
    if (!browser) return;
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
    setTimeout(resumeCarousel, 1000);
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // Auto slide
  function startAutoSlide() {
    if (!browser) return;
    if (intervalId) clearInterval(intervalId);
    if (imagenesNormalizadas.length > 1) {
      intervalId = setInterval(() => {
        if (!isPaused) nextSlide();
      }, AUTO_SLIDE_INTERVAL);
    }
  }

  function resetAutoSlide() {
    if (!browser) return;
    if (intervalId) clearInterval(intervalId);
    startAutoSlide();
  }

  function pauseCarousel() {
    isPaused = true;
  }

  function resumeCarousel() {
    isPaused = false;
  }

  // Lifecycle
  onMount(() => {
    if (!browser) return;
    checkMobile();
    window.addEventListener('resize', checkMobile);
    startAutoSlide();
  });

  onDestroy(() => {
    if (!browser) return;
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener('resize', checkMobile);
  });

  // Estilos dinámicos
  function getGradient() {
    return `linear-gradient(135deg, ${tema.primary} 0%, ${tema.primaryDark} 100%)`;
  }

  function getOverlayGradient() {
    return `linear-gradient(to bottom, 
              rgba(0, 0, 0, 0.3) 0%,
              rgba(0, 0, 0, 0.5) 50%,
              rgba(0, 0, 0, 0.7) 100%)`;
  }
</script>

<div 
  class="carousel-container"
  on:mouseenter={pauseCarousel}
  on:mouseleave={resumeCarousel}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
>
  
  {#if imagenesNormalizadas && imagenesNormalizadas.length > 0}
    <!-- Carrusel principal -->
    <div class="carousel-wrapper">
      {#each imagenesNormalizadas as imagen, index}
        <div 
          class="carousel-slide {index === currentIndex ? 'active' : ''}"
          style="background-image: url('{imagen.url}');"
        >
          
          <!-- Overlay con gradiente -->
          <div class="image-overlay" style="background: {getOverlayGradient()}"></div>
          
          <!-- Contenido -->
          <div class="slide-content">
            <!-- Badge destacado -->
            <div class="feature-badge" style="background-color: {tema.primary}">
              <span>✨ Destacado</span>
            </div>
            
            <!-- Título principal -->
            <h1 class="slide-title" style="color: {tema.text}">
              {titulo}
            </h1>
            
            <!-- Subtítulo -->
            <p class="slide-subtitle">
              {subtitulo}
            </p>
            
            <!-- Características -->
            <div class="features-grid">
              {#each features as feature}
                <div class="feature-item">
                  <div class="feature-icon" style="color: {feature.color}">
                    <svelte:component this={feature.icon} class="w-5 h-5" />
                  </div>
                  <span class="feature-text">{feature.text}</span>
                </div>
              {/each}
            </div>
            
            <!-- CTA -->
            <div class="slide-actions">
              <a 
                href={ctaEnlace} 
                class="cta-button"
                style="background-color: {tema.primary}; color: {tema.text}"
              >
                <ShoppingBag class="w-4 h-4 md:w-5 md:h-5" />
                {ctaTexto}
              </a>
              
              <a 
                href="/contacto" 
                class="secondary-button"
                style="border-color: {tema.primary}; color: {tema.primary}"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      {/each}
      
      <!-- Controles - Solo si hay más de una imagen -->
      {#if imagenesNormalizadas.length > 1}
        <button 
          class="nav-button prev"
          on:click={prevSlide}
          style="background-color: {tema.primary}"
          aria-label="Anterior"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        
        <button 
          class="nav-button next"
          on:click={nextSlide}
          style="background-color: {tema.primary}"
          aria-label="Siguiente"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
        
        <!-- Indicadores -->
        <div class="indicators-container">
          <div class="indicators">
            {#each imagenesNormalizadas as _, index}
              <button 
                class="indicator {index === currentIndex ? 'active' : ''}"
                on:click={() => goToSlide(index)}
                style={index === currentIndex ? `background-color: ${tema.primary}` : ''}
                aria-label={`Slide ${index + 1}`}
              >
                <span class="indicator-number">{index + 1}</span>
              </button>
            {/each}
          </div>
          
          <!-- Contador -->
          <div class="slide-counter" style="color: {tema.text}">
            <span class="current">{currentIndex + 1}</span>
            <span class="separator">/</span>
            <span class="total">{imagenesNormalizadas.length}</span>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Fallback hero sin imágenes -->
    <div class="gradient-hero" style="background: {getGradient()}">
      <div class="gradient-content">
        <!-- Animación decorativa -->
        <div class="floating-shapes">
          <div class="shape shape-1" style="background-color: {tema.primaryLight}"></div>
          <div class="shape shape-2" style="background-color: {tema.primary}"></div>
          <div class="shape shape-3" style="background-color: {tema.primaryDark}"></div>
        </div>
        
        <h1 class="hero-title" style="color: {tema.text}">
          {titulo || 'Tu Tienda Online'}
        </h1>
        
        <p class="hero-subtitle">
          {subtitulo || 'Productos de calidad con envío a todo el país'}
        </p>
        
        <!-- Características en fallback -->
        <div class="features-fallback">
          {#each features as feature}
            <div class="feature-fallback">
              <svelte:component this={feature.icon} class="w-6 h-6" style="color: {feature.color}" />
              <span>{feature.text}</span>
            </div>
          {/each}
        </div>
        
        <!-- CTA -->
        <div class="hero-actions">
          <a 
            href={ctaEnlace} 
            class="cta-button-large"
            style="background-color: {tema.text}; color: {tema.primary}"
          >
            <ShoppingBag class="w-5 h-5" />
            {ctaTexto}
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .carousel-container {
    position: relative;
    width: 100%;
    height: 48vh;
    min-height: 400px;
    overflow: hidden;
    border-radius: 1rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 768px) {
    .carousel-container {
      height: 72vh;
      border-radius: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .carousel-container {
      height: 96vh;
      max-height: 900px;
      border-radius: 2rem;
    }
  }

  /* Carrusel principal */
  .carousel-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-slide.active {
    opacity: 1;
    z-index: 1;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .slide-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2rem;
    max-width: 90%;
    width: 100%;
  }

  @media (min-width: 768px) {
    .slide-content {
      max-width: 800px;
      padding: 3rem;
    }
  }

  /* Feature badge */
  .feature-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    margin-bottom: 1.5rem;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  /* Título */
  .slide-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
    text-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    line-height: 1.1;
  }

  @media (min-width: 768px) {
    .slide-title {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .slide-title {
      font-size: 5rem;
    }
  }

  /* Subtítulo */
  .slide-subtitle {
    font-size: 1.125rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    opacity: 0.9;
    color: white;
  }

  @media (min-width: 768px) {
    .slide-subtitle {
      font-size: 1.5rem;
      margin-bottom: 3rem;
    }
  }

  /* Features grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .feature-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  /* Acciones */
  .slide-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .slide-actions {
      flex-direction: row;
      justify-content: center;
    }
  }

  .cta-button, .secondary-button, .cta-button-large {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
  }

  .cta-button {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
  }

  .secondary-button {
    background: transparent;
  }

  .secondary-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .cta-button-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  /* Navegación */
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0.9;
  }

  .nav-button:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  .nav-button.prev {
    left: 1rem;
  }

  .nav-button.next {
    right: 1rem;
  }

  @media (min-width: 768px) {
    .nav-button {
      width: 4rem;
      height: 4rem;
    }
  }

  /* Indicadores */
  .indicators-container {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .indicators {
    display: flex;
    gap: 0.5rem;
  }

  .indicator {
    width: 2.5rem;
    height: 0.5rem;
    border-radius: 0.25rem;
    border: none;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  .indicator.active {
    width: 3rem;
  }

  .indicator:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .indicator-number {
    display: none;
  }

  .slide-counter {
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }

  .current {
    font-size: 1.25rem;
  }

  /* Fallback hero */
  .gradient-hero {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .gradient-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 800px;
    padding: 2rem;
  }

  /* Floating shapes */
  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }

  .shape-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 5%;
    animation-delay: 0s;
  }

  .shape-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }

  .shape-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 15%;
    animation-delay: 4s;
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }

  @media (min-width: 768px) {
    .hero-title {
      font-size: 4rem;
    }
  }

  .hero-subtitle {
    font-size: 1.125rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    opacity: 0.9;
    color: white;
  }

  @media (min-width: 768px) {
    .hero-subtitle {
      font-size: 1.5rem;
    }
  }

  /* Features fallback */
  .features-fallback {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (min-width: 768px) {
    .features-fallback {
      flex-direction: row;
      max-width: 600px;
    }
  }

  .feature-fallback {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
  }

  .feature-fallback span {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  .hero-actions {
    display: flex;
    justify-content: center;
  }
</style>