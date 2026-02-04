// src/routes/+page.server.js
import { supabase } from '$lib/supabaseClient';

export async function load() {
  try {
    // Cargar productos activos y NO eliminados con sus relaciones
    // La vista ya filtra productos eliminados y hace JOIN con categorías/marcas no eliminadas
    const { data: productos, error: errorProductos } = await supabase
      .from('vista_productos_completos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(50);

    // Cargar categorías activas y NO eliminadas
    const { data: categorias, error: errorCategorias } = await supabase
      .from('categorias')
      .select('id, nombre, slug')
      .eq('activo', true)
      .eq('eliminado', false)
      .order('orden', { ascending: true });

    // Cargar configuración
    const { data: configuracion, error: errorConfig } = await supabase
      .from('configuracion')
      .select('*')
      .single();

    // Si hay error, retornar arrays vacíos para que no rompa el frontend
    if (errorProductos || errorCategorias || errorConfig) {
      console.error('Error cargando datos:', {
        errorProductos,
        errorCategorias,
        errorConfig
      });
    }

    return {
      productos: productos || [],
      categorias: categorias || [],
      configuracion: configuracion || {
        nombre_empresa: 'CatálogoExpress',
        moneda_simbolo: '$',
        whatsapp_numero: '7121920418'
      }
    };
  } catch (error) {
    console.error('Error en load function:', error);
    return {
      productos: [],
      categorias: [],
      configuracion: {
        nombre_empresa: 'CatálogoExpress',
        moneda_simbolo: '$',
        whatsapp_numero: '7121920418'
      }
    };
  }
}