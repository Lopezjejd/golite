import Link from "next/link";
import { getPedidos } from "@/lib/pedidos";
import PedidoCard from "@/components/PedidoCard";

export default async function PedidosPage()  {
const pedidos = await getPedidos(); // Asegúrate de que getPedidos es una función asíncrona que devuelve una promesa

return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">pedidos</h1>
        <p>ruta funcionando</p>
  <ul>
    {pedidos.map((pedido) => (
        <li key={pedido.id} className="mb-2">
         <PedidoCard pedido={pedido}  />
        </li>
    )
    )}

  </ul>
</div>

)


}