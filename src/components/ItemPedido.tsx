"use client";
import { useState } from "react"

import type { Item,Estado } from "@/lib/pedidos"

interface ItemPedidoProps {
    item: Item;
    pedidoId: string;
}
export function ItemPedido({item,pedidoId}:ItemPedidoProps) {
    // Usamos useState para la interactividad (la razón de ser de un Client Component)
    // Inicialmente, el estado se toma de las props que vienen del Server Component
    const [estadoActual, setEstadoActual] = useState(item.estado);
     //probando autosave
    // Función de ejemplo para cambiar el estado (simulación de una interacción)
    const handleToggleEstado = () => {
        const nuevoEstado: Estado = estadoActual === "pendiente" ? "entregado" : "pendiente";
        setEstadoActual(nuevoEstado);
        
        // ⚠️ NOTA: Aquí iría la lógica de MUTACIÓN SEGURA
        // Esto sería un fetch POST/PATCH a una API Route o una Server Action
        // para persistir el cambio en la base de datos.
        console.log(`Intentando cambiar ítem ${item.id} del pedido ${pedidoId} a: ${nuevoEstado}`);
    };

    const estadoClase = estadoActual === "pendiente" ? 'text-red-600' : 'text-green-500';

    return (
        <li className="flex justify-between items-center p-2 border-b border-gray-200">
            {/* Detalles del Ítem */}
            <div>
                <span className="font-medium">{item.nombre}</span>
                <span className="ml-3 text-gray-700">${item.precio.toFixed(2)}</span>
                {item.nota && <span className="ml-2 text-sm text-gray-500">({item.nota})</span>}
            </div>

            {/* Interacción y Estado */}
            <div className="flex items-center">
                <span className={`font-semibold ${estadoClase} mr-4`}>
                    {estadoActual.toUpperCase()}
                </span>
                
                {/* Botón de Interacción (Ejemplo de por qué necesita ser un CC) */}
                <button
                    onClick={handleToggleEstado}
                    className="ml-4 px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    {estadoActual === "pendiente" ? "Marcar Entregado" : "Marcar Pendiente"}
                </button>
            </div>
        </li>
    );
}

