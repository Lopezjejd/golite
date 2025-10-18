import { Pedido, getPedidoById, getPedidos } from "@/lib/pedidos";
import { notFound } from "next/navigation";
import { ItemPedido } from "@/components/ItemPedido";
import { actualizarEstadoItem } from "@/lib/serverActions";

export const dynamic = 'force-dynamic';

interface PedidoPageProps {
    params: {
        pedidoId: string;
    };
}

export default async function PedidoPage({ params }: PedidoPageProps) {
    const { pedidoId } = params;
    
    console.log('🔍 Parámetros recibidos:', params);
    
    const pedidoTarget = await getPedidoById(pedidoId); 
    const pedidosDisponibles = await getPedidos();
    
    console.log('📋 Pedidos disponibles en el sistema:', pedidosDisponibles.map(p => p.id));
    
    if (!pedidoTarget) {
        console.log('❌ Pedido no encontrado. Disponibles:', pedidosDisponibles.map(p => p.id));
        notFound(); // ⚠️ Esto detiene la ejecución - nada después se ejecuta
    }
    
    // ✅ Este código solo se ejecuta si el pedido SÍ existe
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Detalle del Pedido</h1>
            <div>
                <p><strong>Mesa:</strong> {pedidoTarget.mesa}</p>
                <p><strong>Total:</strong> ${pedidoTarget.total}</p>
                <h2 className="text-lg font-semibold mt-4">Items:</h2>
                <ul>
                    {pedidoTarget.items.map((it) => (
                        <ItemPedido 
                            key={it.id} 
                            item={it} 
                            pedidoId={pedidoTarget.id} 
                            actualizarEstadoItem={actualizarEstadoItem}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
}