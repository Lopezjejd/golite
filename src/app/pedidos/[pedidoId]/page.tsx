import { Pedido,getPedidoById } from "@/lib/pedidos";
import { notFound } from "next/navigation";

// ⚠️ CORRECCIÓN CLAVE: El tipo de 'params' debe ser un objeto
// cuya clave coincida con el nombre de tu carpeta dinámica (ej: [pedidoId])
interface PedidoPageProps {
    params: {
        pedidoId: string; // <-- La clave debe coincidir con el nombre del segmento [pedidoId]
    };
}
export default async function PedidoPage({ params }: PedidoPageProps) {
    const { pedidoId } = params; // Extraer el valor de pedidoId de params
    
console.log('parametros',params)
const pedidoTarget = await getPedidoById(pedidoId); 
if (!pedidoTarget) {
    notFound();
}
return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Detalle del Pedido</h1>
        {pedidoTarget ? (
            <div>
                <p>{pedidoTarget.mesa}</p>
                <p>{pedidoTarget.total}</p>
                <ul>
                    {pedidoTarget.items.map((it)=>{
                        return <li key={it.id}>{it.nombre} ${it.precio} {it.nota && it.nota } <span className={it.estado === "pendiente" ?`text-red-600` : `text-green-500`}>{it.estado}</span></li>
                    } )}
                </ul>
            </div>
        ) : (
            <p>Pedido no encontrado</p>
        )}

    </div>
)
}