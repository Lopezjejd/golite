// src/lib/pedidos.ts
/**
 * Store / helpers para órdenes (restaurant manager).
 * - Items NO tienen cantidad; duplicar un item = más unidades.
 * - Cada Item tiene su propio estado y su propio id (para identificarlo sin depender de índices).
 *
 * Nota: almacenamiento en memoria (dev). Reiniciar el servidor borra todo.
 */

/* ------------------------------ Tipos ------------------------------ */

/** Estado posible por item */
export type Estado = "pendiente" | "entregado";

/** Item dentro de una orden */
export type Item = {
  id: string;         // id único del item (string)
  nombre: string;
  precio: number;
  nota?: string;      // ej: "sin cebolla"
  estado: Estado;     // "pendiente" | "entregado"
};

/** Pedido / Orden */
export type Pedido = { 
  id: string;
  mesa: string;
  mesero?: string;
  total: number;      // suma de precios de items
  items: Item[];      // NO opcional: siempre un array
  creadoEn: string;   // ISO timestamp
};

/* ------------------------------ STORE en memoria (ejemplos) ------------------------------ */

/**
 * Datos de ejemplo para desarrollo.
 * En production reemplazar por una DB (Postgres, SQLite, Mongo, etc.)
 */
/* ------------------------------ STORE en memoria (SINGLETON) ------------------------------ */

class PedidosStore {
  private static instance: PedidosStore;
  private pedidos: Pedido[];

  private constructor() {
    // Datos iniciales - EXACTAMENTE igual que antes
    this.pedidos = [
      {
        id: "1",
        mesa: "Mesa 1",
        mesero: "Juan",
        items: [
          { id: "i-1", nombre: "Hamburguesa", precio: 12000, estado: "pendiente" },
          { id: "i-2", nombre: "Papas fritas", precio: 8000, estado: "pendiente" }
        ],
        total: 20000,
        creadoEn: new Date().toISOString()
      },
      {
        id: "2",
        mesa: "Mesa 2",
        mesero: "Maria",
        items: [
          { id: "i-3", nombre: "Ensalada", precio: 10000, estado: "entregado" }
        ],
        total: 10000,
        creadoEn: new Date().toISOString()
      }
    ];
  }

  public static getInstance(): PedidosStore {
    if (!PedidosStore.instance) {
      PedidosStore.instance = new PedidosStore();
    }
    return PedidosStore.instance;
  }

  public getPedidos(): Pedido[] {
    return this.pedidos;
  }

  public getPedidoById(id: string): Pedido | null {
    return this.pedidos.find(pedido => pedido.id === id) || null;
  }

  public addPedido(pedido: Pedido): void {
    this.pedidos.unshift(pedido); // agregar al inicio (igual que antes)
  }

  public updateItemEstado(pedidoId: string, itemId: string, nuevoEstado: Estado): boolean {
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return false;

    const item = pedido.items.find(it => it.id === itemId);
    if (!item) return false;

    item.estado = nuevoEstado;
    return true;
  }

  // Para las funciones de debugging
  public clearPedidos(): void {
    this.pedidos.length = 0;
  }

  public setPedidos(data: Pedido[]): void {
    this.pedidos.length = 0;
    this.pedidos.push(...data);
  }
}

// ✅ UNA sola instancia para toda la aplicación
const pedidosStore = PedidosStore.getInstance();

/* ------------------------------ Helpers ------------------------------ */

/** Calcula total (suma de item.precio) */
function calcTotal(items: Item[]) {
  return items.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);
}

/** Generador de IDs simple y seguro cuando está disponible */
function genId(prefix = ""): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return prefix + crypto.randomUUID();
  }
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ------------------------------ API del módulo ------------------------------ */

/**
 * getPedidos
 * Devuelve la lista completa de pedidos.
 * Mantengo async para compatibilidad futura con DB/fetch.
 */
export async function getPedidos(): Promise<Pedido[]> {
  return pedidosStore.getPedidos();
}

/**
 * getPedidoById
 * Retorna el pedido si existe, o null si no.
 */
export async function getPedidoById(id: string): Promise<Pedido | null> {
  return pedidosStore.getPedidoById(id);
}

/**
 * createPedido
 * - Normaliza items: si vienen sin item.id, asigna id nuevo.
 * - Calcula total si no envían total.
 * - Inserta pedido al inicio del array y devuelve el pedido creado.
 *
 * data.items puede ser Item[] (con o sin id). La función asegura ids únicos.
 */
export async function createPedido(data: {
  mesa: string;
  mesero?: string;
  items?: Partial<Omit<Item, "id">>[]; // permitimos items sin id (client puede enviar nombre/precio/nota/estado)
  total?: number;
}): Promise<Pedido> {
  const id = genId("p-");

  // Normalizar items: asegurar id y campos correctos
  const rawItems = data.items ?? [];
  const items: Item[] = rawItems.map((it) => ({
    id: genId("i-"),
    nombre: String(it.nombre ?? "sin-nombre"),
    precio: Number(it.precio ?? 0),
    nota: it.nota ? String(it.nota) : undefined,
    estado: (it as any).estado === "entregado" ? "entregado" : "pendiente"
  }));

  const total = typeof data.total === "number" ? data.total : calcTotal(items);

  const nuevoPedido: Pedido = {
    id,
    mesa: data.mesa,
    mesero: data.mesero,
    items,
    total,
    creadoEn: new Date().toISOString()
  };

  pedidosStore.addPedido(nuevoPedido);
  return nuevoPedido;
}
//con este creador de pedidos tenemos una seguridad robusta con los datos que llegan
//siempre debemos controlar los datos que llegan del cliente

/**
 * updateItemEstadoById
 * Actualiza el estado de un item dentro de un pedido buscando por itemId.
 * Retorna el pedido actualizado o null si no encuentra pedido/item.
 *
 * Uso recomendado (más robusto que index-based): se puede llamar desde una ruta PATCH.
 */
export async function updateItemEstadoById(
  pedidoId: string,
  itemId: string,
  nuevoEstado: Estado
): Promise<Pedido | null> {
  const pedido = pedidosStore.getPedidoById(pedidoId);
  if (!pedido) return null;

  const item = pedido.items.find(it => it.id === itemId);
  if (!item) return null;

  item.estado = nuevoEstado;
  // No recalculamos total porque precio no cambia; si modificaras precio, recalcular.
  return pedido;
}

/* ------------------------------ Utilidades de debugging (opcionales) ------------------------------ */

/** Borra todos los pedidos (dev) */
export function _clearPedidosForDev() {
  pedidosStore.clearPedidos();
}

/** Reemplaza store con datos (dev) */
export function _setPedidosForDev(data: Pedido[]) {
  pedidosStore.setPedidos(data);
  
}
