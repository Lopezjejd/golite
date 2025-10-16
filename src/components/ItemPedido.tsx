"use client";
import { useState } from "react"

import type { Item,Estado } from "@/lib/pedidos"
import type {ActionResponse,ActualizarEstadoParams} from '@/types/pedidosType'

interface itemPedidoProps {
    item: Item;
    pedidoId: string;
    actualizarEstadoItem: (params: ActualizarEstadoParams) => Promise<ActionResponse>;
}

export function ItemPedido({item,pedidoId,actualizarEstadoItem}: itemPedidoProps) {
    // Usamos useState para la interactividad (la razón de ser de un Client Component)
    // Inicialmente, el estado se toma de las props que vienen del Server Component
    const [estadoActual, setEstadoActual] = useState(item.estado);
    const [loading,setLoading ] = useState(false);
     //probando autosave
    // Función de ejemplo para cambiar el estado (simulación de una interacción)
    const  handleToggleEstado = async () => {
if(estadoActual === 'entregado') return; //si ya esta entregado no hacer nada
setLoading(true);
try {
    const res = await actualizarEstadoItem({ pedidoId, itemId: item.id, estado: 'entregado' })
    if(!res.success){
       alert(res.message || 'Error al actualizar estado');
         return;
    }
    const updatedItem = res.pedido.items.find((it:any) => it.id === item.id);
    setEstadoActual(updatedItem?.estado ?? "entregado");
}catch (error) {
    console.error('Error al actualizar estado:', error);
    alert('Error al actualizar estado');
} finally {
    setLoading(false);
}

   
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

