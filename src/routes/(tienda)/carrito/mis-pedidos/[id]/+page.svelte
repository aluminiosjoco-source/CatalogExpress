<!-- src/routes/(tienda)/carrito/mis-pedidos/[id]/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { 
    ArrowLeft, Package, User, Phone, MapPin, Calendar,
    Upload, CheckCircle, AlertCircle, Truck, MessageCircle, Clock,
    ChevronDown, ChevronUp, Eye, Copy, Check
  } from 'lucide-svelte';
  import { CONFIG_ESTADOS, obtenerColorEstado } from '$lib/pedidos/estadosCliente';
  import TimelinePedido from '$lib/components/cliente/TimelinePedido.svelte';
  import SubirComprobante from '$lib/components/cliente/SubirComprobante.svelte';
  import ConfirmarRecepcion from '$lib/components/cliente/ConfirmarRecepcion.svelte';
  import FormularioDireccion from '$lib/components/cliente/FormularioDireccion.svelte';
  
  export let data;
  
  let pedido = data.pedido;
  let loading = false;
  let error = '';
  let success = '';
  let mostrarFormularioDireccion = false;
  let direccionGuardada = false;
  
  // Estados de expansión para acordeones
  let timelineExpandido = false;
  let productosExpandidos = false;
  let direccionExpandida = false;
  let guiaExpandida = true;
  let copiado = false;
  
  // Tab activo
  let tabActivo = 'detalles'; // detalles | productos | envio
  
  $: colores = obtenerColorEstado(pedido?.estado);
  $: config = CONFIG_ESTADOS[pedido?.estado];
  $: whatsappParam = $page.url.searchParams.get('whatsapp');
  
  // Calcular progreso
  $: progresoTotal = calcularProgreso(pedido);
  
  function calcularProgreso(p) {
    if (!p) return 0;
    const estados = ['confirmado', 'preparando', 'enviado', 'entregado'];
    const index = estados.indexOf(p.estado);
    if (index === -1) return 0;
    return ((index + 1) / estados.length) * 100;
  }
  
  async function recargarPedido() {
    loading = true;
    error = '';
    
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`);
      const contentType = res.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Error del servidor');
      }
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar el pedido');
      }
      
      pedido = result.data;
      
    } catch (err) {
      console.error('❌ Error recargando pedido:', err);
      error = 'No pudimos actualizar la información';
      setTimeout(() => error = '', 3000);
    } finally {
      loading = false;
    }
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function formatDateShort(date) {
    return new Date(date).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  function contactarWhatsApp() {
    const tel = data.configuracion?.whatsapp_numero || '';
    const mensaje = `Hola, tengo una consulta sobre mi pedido #${pedido.numero_pedido}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
  
  function handleDireccionGuardada(event) {
    direccionGuardada = true;
    mostrarFormularioDireccion = false;
    success = 'Dirección guardada';
    recargarPedido();
    setTimeout(() => success = '', 3000);
  }
  
  function volver() {
    goto('/carrito/mis-pedidos' + (whatsappParam ? `?whatsapp=${whatsappParam}` : ''));
  }
  
  async function copiarGuia() {
    if (pedido.guia_envio?.numero_guia) {
      await navigator.clipboard.writeText(pedido.guia_envio.numero_guia);
      copiado = true;
      setTimeout(() => copiado = false, 2000);
    }
  }
</script>

<svelte:head>
  <title>Pedido #{pedido?.numero_pedido} | {data.configuracion?.nombre_empresa || 'Tienda'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-24">
  
  {#if pedido}
    <!-- Header Sticky -->
    <div class="sticky top-0 bg-white border-b z-40 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            on:click={volver}
            class="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          
          <div class="flex-1 mx-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-gray-900">#{pedido.numero_pedido}</span>
              <span class="text-xs text-gray-400">•</span>
              <span class="text-xs text-gray-500">{formatDateShort(pedido.created_at)}</span>
            </div>
            <div class="mt-0.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-600 transition-all duration-500 rounded-full"
                style="width: {progresoTotal}%"
              ></div>
            </div>
          </div>
          
          <span class="px-3 py-1.5 text-xs font-bold rounded-xl {colores.bg} {colores.text} border {colores.border}">
            {config.icon}
          </span>
        </div>
      </div>
    </div>
    
    <div class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Estado Actual -->
      <div class="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-5 mb-6 border border-primary-100">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
            {config.icon}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">Estado actual</p>
            <p class="text-sm font-semibold text-gray-900 leading-snug">{config.descripcion}</p>
          </div>
        </div>
        
        <!-- Timeline Colapsable -->
        <button
          on:click={() => timelineExpandido = !timelineExpandido}
          class="w-full mt-4 pt-4 border-t border-primary-200/50 flex items-center justify-between text-xs font-bold text-primary-700 hover:text-primary-900 transition-colors"
        >
          <span>Ver historial completo</span>
          {#if timelineExpandido}
            <ChevronUp class="w-4 h-4" />
          {:else}
            <ChevronDown class="w-4 h-4" />
          {/if}
        </button>
        
        {#if timelineExpandido}
          <div class="mt-4 animate-fade-in">
            <TimelinePedido {pedido} />
          </div>
        {/if}
      </div>
      
      <!-- Tabs de Navegación -->
      <div class="flex overflow-x-auto no-scrollbar gap-2 mb-6 p-1.5 bg-white rounded-2xl border shadow-sm">
        <button 
          class={`tab-btn ${tabActivo === 'detalles' ? 'active' : ''}`} 
          on:click={() => tabActivo = 'detalles'}
        >
          <Calendar class="w-4 h-4" /> <span>Detalles</span>
        </button>
        <button 
          class={`tab-btn ${tabActivo === 'productos' ? 'active' : ''}`} 
          on:click={() => tabActivo = 'productos'}
        >
          <Package class="w-4 h-4" /> <span>Productos</span>
        </button>
        <button 
          class={`tab-btn ${tabActivo === 'envio' ? 'active' : ''}`} 
          on:click={() => tabActivo = 'envio'}
        >
          <Truck class="w-4 h-4" /> <span>Envío</span>
        </button>
      </div>
      
      <!-- Contenido de Tabs -->
      <div class="space-y-4">
        
        {#if tabActivo === 'detalles'}
          <div class="animate-fade-in space-y-4">
            
            <!-- Estado: CONFIRMADO -->
            {#if pedido.estado === 'confirmado'}
              
              <!-- Card Comprobante -->
              <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Upload class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">Comprobante de Pago</p>
                      <p class="text-xs text-gray-500">
                        {#if pedido.estado_pago === 'rechazado'}
                          Rechazado - Subir nuevo
                        {:else if !pedido.constancia_pago_url}
                          Pendiente de subir
                        {:else if pedido.estado_pago === 'pendiente_validacion'}
                          En validación
                        {:else}
                          Validado
                        {/if}
                      </p>
                    </div>
                  </div>
                  
                  <span class="px-3 py-1 text-xs font-bold rounded-lg
                    {pedido.estado_pago === 'rechazado' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                    {!pedido.constancia_pago_url ? 'bg-gray-50 text-gray-600 border border-gray-200' : ''}
                    {pedido.estado_pago === 'pendiente_validacion' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                    {pedido.estado_pago === 'aprobado' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                  ">
                    {#if pedido.estado_pago === 'rechazado'}
                      ❌
                    {:else if !pedido.constancia_pago_url}
                      ⏳
                    {:else if pedido.estado_pago === 'pendiente_validacion'}
                      🔍
                    {:else}
                      ✅
                    {/if}
                  </span>
                </div>
                
                <div class="px-4 pb-4">
                  {#if pedido.estado_pago === 'rechazado'}
                    <div class="bg-red-50 rounded-xl p-3 mb-3 border border-red-100">
                      <p class="text-xs font-semibold text-red-800 mb-1">Motivo del rechazo:</p>
                      <p class="text-xs text-red-700">{pedido.motivo_rechazo_pago}</p>
                    </div>
                    <SubirComprobante 
                      {pedido} 
                      esReenvio={true}
                      on:success={() => {
                        success = 'Comprobante subido';
                        recargarPedido();
                      }}
                    />
                  {:else if !pedido.constancia_pago_url}
                    <SubirComprobante 
                      {pedido} 
                      on:success={() => {
                        success = 'Comprobante subido';
                        recargarPedido();
                      }}
                    />
                  {:else if pedido.estado_pago === 'pendiente_validacion'}
                    <div class="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p class="text-xs text-amber-800">
                        ⏳ Estamos revisando tu comprobante. Te notificaremos pronto.
                      </p>
                      {#if pedido.constancia_pago_url}
                        <a 
                          href={pedido.constancia_pago_url} 
                          target="_blank"
                          class="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium mt-2"
                        >
                          <Eye class="w-3 h-3" />
                          Ver comprobante
                        </a>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Card Dirección -->
              <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <MapPin class="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">Dirección de Envío</p>
                      <p class="text-xs text-gray-500">
                        {#if pedido.cliente_direccion?.calle}
                          {pedido.cliente_direccion.ciudad}, {pedido.cliente_direccion.estado}
                        {:else}
                          Pendiente de confirmar
                        {/if}
                      </p>
                    </div>
                  </div>
                  
                  <span class="px-3 py-1 text-xs font-bold rounded-lg
                    {pedido.cliente_direccion?.calle ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}
                  ">
                    {pedido.cliente_direccion?.calle ? '✅' : '⏳'}
                  </span>
                </div>
                
                <div class="px-4 pb-4">
                  <FormularioDireccion 
                    {pedido}
                    direccionInicial={pedido.cliente_direccion}
                    on:guardado={handleDireccionGuardada}
                  />
                </div>
              </div>
              
              <!-- Mensaje de Progreso -->
              {#if pedido.constancia_pago_url && pedido.cliente_direccion?.calle && pedido.estado_pago === 'pendiente_validacion'}
                <div class="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-green-900 mb-1">¡Todo listo!</p>
                      <p class="text-xs text-green-800">
                        Recibimos tu información. Validaremos tu pago en 1-2 horas.
                      </p>
                    </div>
                  </div>
                </div>
              {/if}
              
            {:else if pedido.estado === 'preparando'}
              
              <!-- Vista Preparando -->
              <div class="bg-white rounded-2xl border shadow-sm p-5">
                <div class="flex items-start gap-3 mb-4">
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Package class="w-5 h-5 text-indigo-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-900 mb-1">
                      📦 Preparando tu pedido
                    </p>
                    <p class="text-xs text-gray-600">
                      Estamos empaquetando tus productos con cuidado
                    </p>
                  </div>
                </div>
                
                {#if pedido.cliente_direccion}
                  <button
                    on:click={() => direccionExpandida = !direccionExpandida}
                    class="w-full flex items-center justify-between py-3 px-4 bg-indigo-50 rounded-xl text-left"
                  >
                    <span class="text-xs font-bold text-indigo-900">Ver dirección de envío</span>
                    {#if direccionExpandida}
                      <ChevronUp class="w-4 h-4 text-indigo-600" />
                    {:else}
                      <ChevronDown class="w-4 h-4 text-indigo-600" />
                    {/if}
                  </button>
                  
                  {#if direccionExpandida}
                    <div class="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-700 space-y-1 animate-fade-in">
                      <p class="font-semibold text-gray-900">{pedido.cliente_direccion.nombre_destinatario}</p>
                      <p>
                        {pedido.cliente_direccion.calle} {pedido.cliente_direccion.numero_exterior}
                        {pedido.cliente_direccion.numero_interior ? `, Int. ${pedido.cliente_direccion.numero_interior}` : ''}
                      </p>
                      <p>{pedido.cliente_direccion.colonia}</p>
                      <p>
                        {pedido.cliente_direccion.codigo_postal} - {pedido.cliente_direccion.ciudad}, {pedido.cliente_direccion.estado}
                      </p>
                      <p class="text-indigo-600 font-medium pt-2">
                        📞 {pedido.cliente_direccion.telefono}
                      </p>
                    </div>
                  {/if}
                {/if}
              </div>
              
            {:else if pedido.estado === 'enviado'}
              
              <!-- Vista Enviado -->
              <div class="bg-white rounded-2xl border shadow-sm p-5">
                <div class="flex items-start gap-3 mb-4">
                  <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Truck class="w-5 h-5 text-purple-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-900 mb-1">
                      🚚 En camino
                    </p>
                    <p class="text-xs text-gray-600">
                      Tu paquete está siendo transportado
                    </p>
                  </div>
                </div>
                
                {#if pedido.guia_envio}
                  <div class="space-y-3">
                    <div class="flex items-center justify-between py-2">
                      <span class="text-xs text-gray-600">Paquetería:</span>
                      <span class="text-xs font-bold text-gray-900">{pedido.guia_envio.paqueteria}</span>
                    </div>
                    
                    {#if pedido.guia_envio.numero_guia && pedido.guia_envio.numero_guia !== 'LOCAL'}
                      <div class="flex items-center justify-between py-2 border-t">
                        <span class="text-xs text-gray-600">Guía:</span>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold text-gray-900">{pedido.guia_envio.numero_guia}</span>
                          <button
                            on:click={copiarGuia}
                            class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copiar"
                          >
                            {#if copiado}
                              <Check class="w-4 h-4 text-green-600" />
                            {:else}
                              <Copy class="w-4 h-4 text-gray-400" />
                            {/if}
                          </button>
                        </div>
                      </div>
                    {/if}
                    
                    {#if pedido.cliente_direccion}
                      <div class="flex items-center justify-between py-2 border-t">
                        <span class="text-xs text-gray-600">Destino:</span>
                        <span class="text-xs font-bold text-gray-900">
                          {pedido.cliente_direccion.ciudad}, {pedido.cliente_direccion.estado}
                        </span>
                      </div>
                    {/if}
                    
                    {#if pedido.fecha_enviado}
                      <div class="flex items-center justify-between py-2 border-t">
                        <span class="text-xs text-gray-600">Enviado:</span>
                        <span class="text-xs font-medium text-gray-900">{formatDate(pedido.fecha_enviado)}</span>
                      </div>
                    {/if}
                    
                    {#if pedido.guia_envio.url_rastreo}
                      <a
                        href={pedido.guia_envio.url_rastreo}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block w-full text-center py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all mt-4 text-sm font-bold"
                      >
                        🔍 Rastrear Pedido
                      </a>
                    {/if}
                  </div>
                {/if}
              </div>
              
              <ConfirmarRecepcion 
                {pedido}
                on:success={() => {
                  success = '¡Gracias por confirmar!';
                  recargarPedido();
                }}
              />
            {/if}
            
            <!-- Info Contacto -->
            <div class="bg-white rounded-2xl border shadow-sm p-5">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contacto</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <User class="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Nombre</p>
                    <p class="text-sm font-semibold text-gray-900">{pedido.cliente_nombre}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Phone class="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">WhatsApp</p>
                    <p class="text-sm font-semibold text-gray-900">{pedido.cliente_whatsapp}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Resumen -->
            <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div class="p-5">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Resumen</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span class="font-medium">{formatCurrency(pedido.subtotal)}</span>
                  </div>
                  
                  {#if pedido.impuesto > 0}
                    <div class="flex justify-between text-gray-600">
                      <span>IVA:</span>
                      <span class="font-medium">{formatCurrency(pedido.impuesto)}</span>
                    </div>
                  {/if}
                  
                  {#if pedido.costo_envio > 0}
                    <div class="flex justify-between text-gray-600">
                      <span>Envío:</span>
                      <span class="font-medium">{formatCurrency(pedido.costo_envio)}</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              <div class="bg-primary-600 px-5 py-4 flex justify-between items-center">
                <span class="text-white font-bold">Total:</span>
                <span class="text-2xl font-black text-white">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>
        {/if}
        
        {#if tabActivo === 'productos'}
          <div class="animate-fade-in">
            <div class="bg-white rounded-2xl border shadow-sm p-5">
              <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Productos ({pedido.items?.length || 0})
                </p>
                {#if !productosExpandidos && pedido.items?.length > 3}
                  <button
                    on:click={() => productosExpandidos = true}
                    class="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    Ver todos
                  </button>
                {/if}
              </div>
              
              <div class="space-y-3">
                {#each (productosExpandidos ? pedido.items : pedido.items?.slice(0, 3)) || [] as item}
                  <div class="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
                    {#if item.imagen_url}
                      <img 
                        src={item.imagen_url} 
                        alt={item.producto_nombre}
                        class="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    {:else}
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package class="w-5 h-5 text-gray-400" />
                      </div>
                    {/if}
                    
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 truncate">{item.producto_nombre}</p>
                      <p class="text-xs text-gray-500">
                        {formatCurrency(item.precio_unitario)} × {item.cantidad}
                      </p>
                    </div>
                    
                    <div class="text-right">
                      <p class="text-sm font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                {/each}
              </div>
              
              {#if !productosExpandidos && pedido.items?.length > 3}
                <button
                  on:click={() => productosExpandidos = true}
                  class="w-full mt-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  Ver {pedido.items.length - 3} más
                </button>
              {/if}
            </div>
          </div>
        {/if}
        
        {#if tabActivo === 'envio'}
          <div class="animate-fade-in">
            {#if pedido.guia_envio}
              <div class="bg-white rounded-2xl border shadow-sm p-5">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Información de Envío</p>
                
                <div class="space-y-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Paquetería</p>
                    <p class="text-sm font-semibold text-gray-900">{pedido.guia_envio.paqueteria}</p>
                  </div>
                  
                  {#if pedido.guia_envio.numero_guia && pedido.guia_envio.numero_guia !== 'LOCAL'}
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Número de guía</p>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-mono font-semibold text-gray-900">{pedido.guia_envio.numero_guia}</p>
                        <button
                          on:click={copiarGuia}
                          class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {#if copiado}
                            <Check class="w-4 h-4 text-green-600" />
                          {:else}
                            <Copy class="w-4 h-4 text-gray-400" />
                          {/if}
                        </button>
                      </div>
                    </div>
                  {/if}
                  
                  {#if pedido.guia_envio.url_rastreo}
                    <a
                      href={pedido.guia_envio.url_rastreo}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block w-full text-center py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold"
                    >
                      🔍 Rastrear en tiempo real
                    </a>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="bg-white rounded-2xl border shadow-sm p-8 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-sm font-semibold text-gray-900 mb-1">Sin información de envío</p>
                <p class="text-xs text-gray-500">La información estará disponible cuando se envíe el pedido</p>
              </div>
            {/if}
            
            {#if pedido.cliente_direccion}
              <div class="bg-white rounded-2xl border shadow-sm p-5 mt-4">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Dirección de Entrega</p>
                <div class="text-sm text-gray-700 space-y-1">
                  <p class="font-semibold text-gray-900">{pedido.cliente_direccion.nombre_destinatario}</p>
                  <p>
                    {pedido.cliente_direccion.calle} {pedido.cliente_direccion.numero_exterior}
                    {pedido.cliente_direccion.numero_interior ? `, Int. ${pedido.cliente_direccion.numero_interior}` : ''}
                  </p>
                  <p>{pedido.cliente_direccion.colonia}</p>
                  <p>
                    {pedido.cliente_direccion.codigo_postal} - {pedido.cliente_direccion.ciudad}, {pedido.cliente_direccion.estado}
                  </p>
                  <p class="text-primary-600 font-medium pt-2">
                    📞 {pedido.cliente_direccion.telefono}
                  </p>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        
      </div>
    </div>
    
    <!-- Botón Flotante de Ayuda -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-30">
      <div class="max-w-4xl mx-auto">
        <button
          on:click={contactarWhatsApp}
          class="w-full bg-green-600 text-white rounded-2xl py-4 hover:bg-green-700 transition-all shadow-xl flex items-center justify-center gap-3 font-bold"
        >
          <MessageCircle class="w-5 h-5" />
          ¿Necesitas ayuda?
        </button>
      </div>
    </div>
    
  {:else}
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="bg-white rounded-2xl border shadow-sm p-12 text-center">
        <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-bold text-gray-900 mb-2">Pedido no encontrado</h3>
        <p class="text-sm text-gray-600 mb-6">No pudimos cargar este pedido</p>
        <button on:click={volver} class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold">
          Volver a mis pedidos
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Notificaciones -->
  {#if success}
    <div class="fixed top-4 right-4 z-50 animate-slide-in">
      <div class="bg-white border border-green-200 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle class="w-5 h-5 text-green-600" />
        </div>
        <span class="text-sm font-semibold text-gray-900">{success}</span>
      </div>
    </div>
  {/if}
  
  {#if error}
    <div class="fixed top-4 right-4 z-50 animate-slide-in">
      <div class="bg-white border border-red-200 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3">
        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <AlertCircle class="w-5 h-5 text-red-600" />
        </div>
        <span class="text-sm font-semibold text-gray-900">{error}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Tabs */
  .tab-btn {
    @apply flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap text-gray-500;
  }
  .tab-btn.active {
    @apply bg-primary-50 text-primary-700 ring-1 ring-primary-200;
  }

  /* Scroll sin barra */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Animaciones */
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fade-in 0.3s ease-out; }

  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in { animation: slide-in 0.3s ease-out; }
</style>
