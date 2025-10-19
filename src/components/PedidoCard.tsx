// src/app/pedidos/components/PedidoCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Pedido } from "@/lib/pedidos";

export default function PedidoCard({ pedido }: { pedido: Pedido }) {




  return (
    <article className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
      <div>
        <Link href={`/pedidos/${pedido.id}`} className="block font-medium">
          Pedido  — {pedido.mesa}
        </Link>
        <p className="text-sm text-gray-500">Total: ${pedido.total.toLocaleString()}</p>
      </div>

    </article>
  );
}