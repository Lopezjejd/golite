import Link from "next/link";

export default function PedidosPage()  {


return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">pedidos</h1>
        <p>ruta funcionando</p>
  <ul>
    {pedidos.map((pedido) => (
        <li key={pedido.id} className="mb-2">
            <Link href={`/pedidos/${pedido.id}`} className="text-blue-500 hover:underline">
                Pedido #{pedido.id} - Mesa {pedido.mesa} - Total: ${pedido.total.toFixed(2)} - Estado: {pedido.estado}
            </Link>
        </li>
    )
    )}

  </ul>
</div>

)


}