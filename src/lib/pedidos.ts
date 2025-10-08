// src/lib/pedidos.ts
/**
 * Tipos y store en memoria para el manager del restaurante.
 * - Items NO tienen cantidad; duplicar un item equivale a pedir más unidades.
 * - Cada item tiene su propio estado (ej: "pendiente" o "entregado").
 *
 * Nota: este módulo usa almacenamiento en memoria (PEDIDOS). Reiniciar el servidor borra todo.
 */

/** Estado posible por item */
export type Estado = "pendiente" | "entregado";

/** Item en una orden (sin cantidad; duplicados = multiplicidad) */
export type Item = {
  nombre: string;
  precio: number;
  nota?: string;   // "sin cebolla", "bien cocida", etc.
  estado: Estado;  // cada item puede avanzar independiente
};

/** Pedido/Orden de mesa */
export type Pedido = {
  id: string;
  mesa: string;
  mesero?: string;
  total: number;   // suma de precios de items
  items: Item[];   // **requerido**: array (mejor evitar `items?`)
  creadoEn: string;
};

/** STORE EN MEMORIA — datos de ejemplo */
const PEDIDOS: Pedido[] = [
  {
    id: "1",
    mesa: "Mesa 1",
    mesero: "Juan",
    items: [
      { nombre: "Hamburguesa", precio: 12000, estado: "pendiente" },
      { nombre: "Papas fritas", precio: 8000, estado: "pendiente" }
    ],
    total: 20000,
    creadoEn: new Date().toISOString()
  },
  {
    id: "2",
    mesa: "Mesa 2",
    mesero: "Maria",
    items: [
      { nombre: "Ensalada", precio: 10000, estado: "entregado" }
    ],
    total: 10000,
    creadoEn: new Date().toISOString()
  }
];

/** Calcula total sumando precios de items (siempre Number) */
function calcTotal(items: Item[]) {
  return items.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);
}

/**
 * Devuelve la lista completa de pedidos (simula lectura desde DB).
 * Mantener async para que sea compatible con fetch/DB más adelante.
 */
export async function getPedidos(): Promise<Pedido[]> {
  return PEDIDOS;
}

/** Devuelve un pedido o null si no existe */
export async function getPedidoById(id: string): Promise<Pedido | null> {
  return PEDIDOS.find(p => p.id === id) ?? null;
}

/**
 * Crea un nuevo pedido.
 * - data.items debe ser un array de Item (si falta, se normaliza a []).
 * - Si no envían total, lo calcula con calcTotal.
 */
export async function createPedido(data: {
  mesa: string;
  mesero?: string;
  items?: Item[];
  total?: number;
}): Promise<Pedido> {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now().toString();

  const items = data.items ?? []; // garantizar array
  const total = typeof data.total === "number" ? data.total : calcTotal(items);

  const nuevoPedido: Pedido = {
    id,
    mesa: data.mesa,
    mesero: data.mesero,
    items,
    total,
    creadoEn: new Date().toISOString()
  };

  PEDIDOS.unshift(nuevoPedido); // agrega al inicio (más visible en las listas)
  return nuevoPedido;
}

/**
 * Actualiza el estado de un item dentro de un pedido (por índice).
 * - pedidoId: id del pedido
 * - itemIndex: índice dentro de pedido.items (0-based)
 * - nuevoEstado: nuevo estado (ej "entregado")
 *
 * Retorna el pedido actualizado o null si no se encontró pedido/item.
 *
 * Nota: usar índices funciona, pero es frágil si la UI reordena o elimina items.
 * Recomiendo más adelante añadir un `itemId` a Item y actualizar por id.
 */
export async function updateItemEstado(
  pedidoId: string,
  itemIndex: number,
  nuevoEstado: Estado
): Promise<Pedido | null> {
  const pedido = PEDIDOS.find(p => p.id === pedidoId);
  if (!pedido) return null;
  if (!pedido.items || itemIndex < 0 || itemIndex >= pedido.items.length) return null;

  pedido.items[itemIndex].estado = nuevoEstado;
  // Si quisieras recalcular total (no es necesario aquí porque precio no cambia):
  // pedido.total = calcTotal(pedido.items);

  return pedido;
}
//debe mejorar