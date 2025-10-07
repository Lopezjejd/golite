type Pedido = { //siempre en mayuscula la primera letra
    id: number;
    mesa: number;
    total: number;
    estado: string;

}
// ⚠️ CORRECCIÓN CLAVE: El tipo de 'params' debe ser un objeto
// cuya clave coincida con el nombre de tu carpeta dinámica (ej: [pedidoId])
interface PedidoPageProps {
    params: {
        pedidoId: string; // <-- La clave debe coincidir con el nombre del segmento [pedidoId]
    };
}
export default function PedidoPage({ params }: PedidoPageProps) {
    const { pedidoId } = params; // Extraer el valor de pedidoId de params
const id  = Number(pedidoId); // Convertir a número si es necesario

console.log('parametros',params)
const pedidoTarget = pedidos.find(p => p.id === Number(id));//NUmber() to convert string to number
return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Detalle del Pedido</h1>
        {pedidoTarget ? (
            <div>
                <p>{pedidoTarget.mesa}</p>
                <p>{pedidoTarget.total}</p>
                <p>{pedidoTarget.estado}</p>
            </div>
        ) : (
            <p>Pedido no encontrado</p>
        )}

    </div>
)
}