// src/app/pedidos/components/PedidoCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Pedido } from "@/lib/pedidos";

export default function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [estado, setEstado] = useState<Pedido["estado"]>(pedido.estado);

  function avanzar() {
    if (estado === "pendiente") setEstado("enviado");
    else if (estado === "enviado") setEstado("entregado");
  }

  return (
    <article className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
      <div>
        <Link href={`/pedidos/${pedido.id}`} className="block font-medium">
          Pedido #{pedido.id} — {pedido.mesa}
        </Link>
        <p className="text-sm text-gray-500">Total: ${pedido.total.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-sm ${
          estado === "pendiente" ? "bg-yellow-100" :
          estado === "enviado" ? "bg-blue-100" : "bg-green-100"
        }`}>
          {estado}
        </span>

        <button onClick={avanzar} className="px-3 py-1 border rounded hover:bg-gray-50">
          Avanzar
        </button>
      </div>
    </article>
  );
}