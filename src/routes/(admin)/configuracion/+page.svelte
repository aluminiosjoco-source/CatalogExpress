<script>
  import { onMount } from 'svelte';
  import { 
    Settings, Save, Loader2, CheckCircle2, Palette, Share2, MapPin, 
    Image as ImageIcon, CreditCard, Truck, FileText, DollarSign,
    Store, Info, RotateCcw, LayoutPanelTop, AlertCircle
  } from 'lucide-svelte';
  
  import ColorPalettePicker from '$lib/components/ui/ColorPalettePicker.svelte';
  import SocialMediaLinks from '$lib/components/ui/SocialMediaLinks.svelte';
  import LocationPicker from '$lib/components/ui/LocationPicker.svelte';
  import MultipleImageUploader from '$lib/components/ui/MultipleImageUploader.svelte';
  import ImageUploader from '$lib/components/ui/ImageUploader.svelte';
  import BankAccountsManager from '$lib/components/ui/BankAccountsManager.svelte';
  import { getPaletteById } from '$lib/data/colorPalettes';

  let loading = true;
  let guardando = false;
  let mensaje = { tipo: '', texto: '', visible: false };
  let activeTab = 'identidad'; // Tabs: identidad, multimedia, diseño, contacto, pagos
  
  let formData = {
    nombre_empresa: '',
    whatsapp_numero: '',
    email: '',
    direccion: '',
    horario_atencion: '',
    moneda_simbolo: '$',
    impuesto_porcentaje: 18,
    descripcion_empresa: '',
    colores_tema: null,
    redes_sociales: null,
    logo_url: '',
    imagenes_tienda: [],
    ubicacion: {
      latitud: null, longitud: null, direccion_completa: '',
      ciudad: '', estado: '', codigo_postal: '', google_maps_url: ''
    },
    cuentas_pago: [],
    envio_visible: true, envio_disponible: true,
    facturacion_visible: true, facturacion_disponible: true,
    pago_deposito_visible: true, pago_deposito_disponible: true,
    pago_transferencia_visible: true, pago_transferencia_disponible: true
  };

  let initialDataString = '';
  $: isDirty = initialDataString !== JSON.stringify(formData);
  $: whatsappValido = formData.whatsapp_numero?.toString().length === 10;

  onMount(async () => {
    await cargarConfiguracion();
  });

  async function cargarConfiguracion() {
    loading = true;
    try {
      const response = await fetch('/api/configuracion');
      const result = await response.json();
      if (result.success) {
        // Mapeo exacto con los nullish coalescing (??) que proporcionaste
        formData = {
          nombre_empresa: result.data.nombre_empresa || '',
          whatsapp_numero: result.data.whatsapp_numero || '',
          email: result.data.email || '',
          direccion: result.data.direccion || '',
          horario_atencion: result.data.horario_atencion || '',
          moneda_simbolo: result.data.moneda_simbolo || '$',
          impuesto_porcentaje: result.data.impuesto_porcentaje || 18,
          descripcion_empresa: result.data.descripcion_empresa || '',
          colores_tema: result.data.colores_tema || null,
          redes_sociales: result.data.redes_sociales || null,
          logo_url: result.data.logo_url || '',
          imagenes_tienda: result.data.imagenes_tienda || [],
          ubicacion: result.data.ubicacion || formData.ubicacion,
          cuentas_pago: result.data.cuentas_pago || [],
          envio_visible: result.data.envio_visible ?? true,
          envio_disponible: result.data.envio_disponible ?? true,
          facturacion_visible: result.data.facturacion_visible ?? true,
          facturacion_disponible: result.data.facturacion_disponible ?? true,
          pago_deposito_visible: result.data.pago_deposito_visible ?? true,
          pago_deposito_disponible: result.data.pago_deposito_disponible ?? true,
          pago_transferencia_visible: result.data.pago_transferencia_visible ?? true,
          pago_transferencia_disponible: result.data.pago_transferencia_disponible ?? true
        };
        initialDataString = JSON.stringify(formData);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error de conexión');
    } finally {
      loading = false;
    }
  }

  async function guardarConfiguracion() {
    if (!whatsappValido) {
      mostrarMensaje('error', 'El WhatsApp debe tener 10 dígitos');
      return;
    }
    guardando = true;
    try {
      if (formData.colores_tema?.palette_id) {
        const palette = getPaletteById(formData.colores_tema.palette_id);
        formData.colores_tema = { palette_id: palette.id, palette_name: palette.name, colors: palette };
      }

      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        initialDataString = JSON.stringify(formData);
        mostrarMensaje('success', '✅ Configuración guardada correctamente');
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al guardar');
    } finally {
      guardando = false;
    }
  }

  function mostrarMensaje(tipo, texto) {
    mensaje = { tipo, texto, visible: true };
    setTimeout(() => { mensaje.visible = false; }, 4000);
  }

  function restablecer() {
    if (confirm('¿Deseas descartar los cambios actuales?')) {
      formData = JSON.parse(initialDataString);
    }
  }
</script>

<div class="max-w-6xl mx-auto pb-32 px-4 sm:px-6">
  <div class="mb-8 pt-4">
    <h1 class="text-3xl font-black text-gray-900 flex items-center gap-3">
      <Settings class="w-9 h-9 text-primary-600" />
      Panel de Configuración
    </h1>
    <p class="text-gray-500 mt-1">Control total sobre la información y reglas de tu tienda.</p>
  </div>

  <div class="flex overflow-x-auto no-scrollbar gap-2 mb-8 p-1.5 bg-gray-200/50 rounded-2xl border border-gray-200">
    <button class={`tab-btn ${activeTab === 'identidad' ? 'active' : ''}`} on:click={() => activeTab = 'identidad'}>
      <Store class="w-4 h-4" /> <span>Negocio</span>
    </button>
    <button class={`tab-btn ${activeTab === 'multimedia' ? 'active' : ''}`} on:click={() => activeTab = 'multimedia'}>
      <ImageIcon class="w-4 h-4" /> <span>Multimedia</span>
    </button>
    <button class={`tab-btn ${activeTab === 'diseño' ? 'active' : ''}`} on:click={() => activeTab = 'diseño'}>
      <Palette class="w-4 h-4" /> <span>Diseño</span>
    </button>
    <button class={`tab-btn ${activeTab === 'contacto' ? 'active' : ''}`} on:click={() => activeTab = 'contacto'}>
      <Share2 class="w-4 h-4" /> <span>Contacto</span>
    </button>
    <button class={`tab-btn ${activeTab === 'pagos' ? 'active' : ''}`} on:click={() => activeTab = 'pagos'}>
      <CreditCard class="w-4 h-4" /> <span>Pagos</span>
    </button>
  </div>

  {#if loading}
    <div class="bg-white rounded-3xl p-24 text-center border shadow-sm flex flex-col items-center">
      <Loader2 class="w-12 h-12 animate-spin text-primary-600 mb-4" />
      <p class="text-gray-500 font-bold italic">Cargando parámetros...</p>
    </div>
  {:else}
    <div class="animate-fade-in">
      
      {#if activeTab === 'identidad'}
        <div class="space-y-6">
          <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <Info class="w-6 h-6 text-blue-500" /> Información Principal
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="label">Nombre de la Empresa</label>
                <input type="text" bind:value={formData.nombre_empresa} class="input-modern" placeholder="Ej. Mi Tienda Online" />
              </div>
              
              <div class="md:col-span-2">
                <label class="label">Descripción Estratégica</label>
                <textarea bind:value={formData.descripcion_empresa} rows="3" class="input-modern" placeholder="Breve texto sobre tu negocio..."></textarea>
              </div>

              <div>
                <label class="label">WhatsApp de Contacto (10 dígitos)</label>
                <div class="relative">
                  <input 
                    type="number" 
                    bind:value={formData.whatsapp_numero} 
                    class={`input-modern pr-10 ${!whatsappValido && formData.whatsapp_numero ? 'border-red-400' : ''}`}
                    placeholder="7121920418"
                  />
                  {#if !whatsappValido && formData.whatsapp_numero}
                    <AlertCircle class="w-5 h-5 text-red-500 absolute right-3 top-3" />
                  {/if}
                </div>
                <p class="text-[10px] mt-1 {whatsappValido ? 'text-gray-400' : 'text-red-500'}">
                  {formData.whatsapp_numero?.toString().length || 0} / 10 dígitos requeridos
                </p>
              </div>

              <div>
                <label class="label">Horario de Atención</label>
                <input type="text" bind:value={formData.horario_atencion} class="input-modern" placeholder="Ej. Lunes a Viernes 9am - 6pm" />
              </div>
            </div>
          </div>

          <div class="bg-blue-50/50 p-6 sm:p-8 rounded-3xl border border-blue-100">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-blue-900">
              <DollarSign class="w-6 h-6 text-blue-600" /> Moneda e Impuestos
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="label">Símbolo de Moneda</label>
                <select bind:value={formData.moneda_simbolo} class="input-modern bg-white">
                  <option value="$">$ (Peso/Dólar)</option>
                  <option value="S/">S/ (Sol Peruano)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="Q">Q (Quetzal)</option>
                </select>
              </div>
              <div>
                <label class="label">Porcentaje de Impuesto (%)</label>
                <div class="relative">
                  <input type="number" bind:value={formData.impuesto_porcentaje} class="input-modern bg-white pr-10" step="0.1" />
                  <span class="absolute right-4 top-3 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'multimedia'}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
              <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <LayoutPanelTop class="w-5 h-5 text-indigo-500" /> Logo Oficial
              </h2>
              <ImageUploader bind:imageUrl={formData.logo_url} label="Logo (PNG/JPG)" />
              <p class="text-xs text-gray-400 mt-4 italic text-center">Se recomienda fondo transparente.</p>
            </div>
          </div>
          <div class="lg:col-span-2">
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon class="w-5 h-5 text-purple-500" /> Banners de Portada
              </h2>
              <MultipleImageUploader bind:images={formData.imagenes_tienda} maxImages={5} />
              <div class="mt-4 p-4 bg-gray-50 rounded-2xl text-xs text-gray-500">
                💡 Estos banners aparecerán en la parte superior de tu tienda móvil. Puedes subir hasta 5 imágenes.
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'diseño'}
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
            <Palette class="w-6 h-6 text-pink-500" /> Identidad Visual
          </h2>
          <p class="text-gray-500 mb-8 text-sm">Elige una combinación de colores que refleje la personalidad de tu marca.</p>
          <ColorPalettePicker 
            selectedPaletteId={formData.colores_tema?.palette_id} 
            on:change={(e) => formData.colores_tema = e.detail} 
          />
        </div>
      {/if}

      {#if activeTab === 'contacto'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <Share2 class="w-5 h-5 text-cyan-500" /> Redes y Email
            </h2>
            <SocialMediaLinks bind:socialLinks={formData.redes_sociales} />
            <div class="mt-6 pt-6 border-t">
              <label class="label">Correo Electrónico Público</label>
              <input type="email" bind:value={formData.email} class="input-modern" placeholder="contacto@empresa.com" />
            </div>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-red-500" /> Localización
            </h2>
            <LocationPicker bind:ubicacion={formData.ubicacion} on:change={(e) => formData.ubicacion = e.detail} />
          </div>
        </div>
      {/if}

      {#if activeTab === 'pagos'}
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard class="w-5 h-5 text-amber-500" /> Cuentas Bancarias
            </h2>
            <BankAccountsManager bind:cuentas={formData.cuentas_pago} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="toggle-card">
              <h3 class="toggle-title"><Truck class="w-4 h-4" /> Envíos</h3>
              <div class="space-y-3">
                <label class="toggle-row">
                  <span>Mostrar sección</span>
                  <input type="checkbox" bind:checked={formData.envio_visible} class="toggle-switch" />
                </label>
                <label class="toggle-row">
                  <span>Disponible</span>
                  <input type="checkbox" bind:checked={formData.envio_disponible} class="toggle-switch" />
                </label>
              </div>
            </div>

            <div class="toggle-card">
              <h3 class="toggle-title"><FileText class="w-4 h-4" /> Factura</h3>
              <div class="space-y-3">
                <label class="toggle-row">
                  <span>Mostrar opción</span>
                  <input type="checkbox" bind:checked={formData.facturacion_visible} class="toggle-switch" />
                </label>
                <label class="toggle-row">
                  <span>Disponible</span>
                  <input type="checkbox" bind:checked={formData.facturacion_disponible} class="toggle-switch" />
                </label>
              </div>
            </div>

            <div class="toggle-card border-amber-100 bg-amber-50/20">
              <h3 class="toggle-title text-amber-700"><DollarSign class="w-4 h-4" /> Depósito</h3>
              <div class="space-y-3">
                <label class="toggle-row">
                  <span>Visible</span>
                  <input type="checkbox" bind:checked={formData.pago_deposito_visible} class="toggle-switch" />
                </label>
                <label class="toggle-row">
                  <span>Habilitado</span>
                  <input type="checkbox" bind:checked={formData.pago_deposito_disponible} class="toggle-switch" />
                </label>
              </div>
            </div>

            <div class="toggle-card border-blue-100 bg-blue-50/20">
              <h3 class="toggle-title text-blue-700"><RotateCcw class="w-4 h-4" /> Transfer</h3>
              <div class="space-y-3">
                <label class="toggle-row">
                  <span>Visible</span>
                  <input type="checkbox" bind:checked={formData.pago_transferencia_visible} class="toggle-switch" />
                </label>
                <label class="toggle-row">
                  <span>Habilitado</span>
                  <input type="checkbox" bind:checked={formData.pago_transferencia_disponible} class="toggle-switch" />
                </label>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if isDirty && !loading}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-gray-900/95 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl z-50 flex items-center justify-between animate-slide-up border border-white/10">
      <div class="flex flex-col ml-2">
        <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Cambios detectados</span>
        <span class="text-sm font-medium">¿Deseas aplicar las actualizaciones?</span>
      </div>
      <div class="flex gap-3">
        <button on:click={restablecer} class="p-3 hover:bg-white/10 rounded-2xl transition-colors text-gray-300" title="Descartar">
          <RotateCcw class="w-5 h-5" />
        </button>
        <button 
          on:click={guardarConfiguracion} 
          disabled={guardando || !whatsappValido} 
          class="px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 disabled:text-gray-500 font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-primary-900/20"
        >
          {#if guardando}
            <Loader2 class="w-5 h-5 animate-spin" />
          {:else}
            <Save class="w-5 h-5" /> Guardar
          {#if !whatsappValido} (10 dígitos) {/if}
          {/if}
        </button>
      </div>
    </div>
  {/if}

  {#if mensaje.visible}
    <div class="fixed top-8 right-8 z-[100] animate-slide-in">
      <div class={`px-6 py-4 rounded-3xl shadow-2xl border flex items-center gap-4 ${mensaje.tipo === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'}`}>
        <div class={`p-2 rounded-full ${mensaje.tipo === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
          {#if mensaje.tipo === 'success'}<CheckCircle2 class="w-5 h-5" />{:else}<AlertCircle class="w-5 h-5" />{/if}
        </div>
        <span class="font-bold text-sm">{mensaje.texto}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Botones de Pestañas */
  .tab-btn {
    @apply flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap text-gray-500;
  }
  .tab-btn.active {
    @apply bg-white text-primary-600 shadow-md ring-1 ring-black/5;
  }

  /* Inputs Modernos */
  .input-modern {
    @apply w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none transition-all bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500;
  }
  .label {
    @apply block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1;
  }

  /* Cards de Toggles */
  .toggle-card {
    @apply bg-white p-5 rounded-3xl border border-gray-100 shadow-sm;
  }
  .toggle-title {
    @apply font-black text-xs uppercase tracking-tighter mb-4 flex items-center gap-2 text-gray-400;
  }
  .toggle-row {
    @apply flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700;
  }

  /* Switch Estilizado */
  .toggle-switch {
    @apply appearance-none w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer transition-colors checked:bg-primary-600;
  }
  .toggle-switch::after {
    content: '';
    @apply absolute w-4 h-4 bg-white rounded-full top-1 left-1 transition-transform;
  }
  .toggle-switch:checked::after {
    @apply translate-x-4;
  }

  /* Animaciones */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes slide-up {
    from { transform: translate(-50%, 120%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1); }

  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>