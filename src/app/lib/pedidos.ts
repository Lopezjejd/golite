// src/lib/pedidos.ts
export type Estado = "pendiente" | "enviado" | "entregado";

export type Pedido = {
  id: string;
  cliente: string;
  total: number;
  estado: Estado;
  items?: { nombre: string; cantidad: number; precio: number }[];
};

export const SAMPLE_PEDIDOS: Pedido[] = [
  { id: "1", cliente: "Juan Pérez", total: 12000, estado: "pendiente" },
  { id: "2", cliente: "María Gómez", total: 23000, estado: "enviado" },
  { id: "3", cliente: "Carlos Díaz", total: 45000, estado: "entregado" },
];

export async function getPedidos(): Promise<Pedido[]> {
  // simula llamada a DB / API
  return SAMPLE_PEDIDOS;
}

export async function getPedidoById(id: string): Promise<Pedido | null> {
  return SAMPLE_PEDIDOS.find((p) => p.id === id) ?? null;
}
