"use client";
import { useState,useEffect,useTransition } from "react"
import { useRouter } from "next/navigation";
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
    useEffect(() => {
        setEstadoActual(item.estado);
    }, [item.estado]);// Asegura que si el item cambia, el estado se actualice
    const [loading,setLoading ] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
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

    startTransition(()=> {
        router.refresh();
    });
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
  disabled={loading || isPending || estadoActual === "entregado"}
  aria-label={estadoActual === "entregado" ? "Item entregado" : "Marcar como entregado"}
  className={`ml-4 px-3 py-1 text-xs text-white rounded ${estadoActual === "entregado" ? "bg-gray-400 opacity-50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
>
  {loading || isPending ? "..." : (estadoActual === "pendiente" ? "Entregar" : "Pedido entregado")}
</button>

            </div>
        </li>
    );
}

