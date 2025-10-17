import Link from "next/link";
import { getPedidos } from "@/lib/pedidos";
import { crearNuevoPedido } from "@/lib/serverActions";
import PedidoCard from "@/components/PedidoCard";
import ClientItemEditor from "@/components/ClientItemEditor";
import { redirect } from "next/navigation";

export default async function PedidosPage() {
  const pedidos = await getPedidos();

  async function action(formData: FormData) {
    "use server";
    try {
      const result = await crearNuevoPedido(formData);
      
      if (!result.success) {
        // Manejar el error aquí
        console.error('Error al crear pedido:', result.message);
        return; // No redirigir si hay error
      }

      // Opcional: redirigir a la página del nuevo pedido
      redirect(`/pedidos/${result.pedido.id}`);
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }
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
 <form action={action}>
  <input type="text" name="mesa" required placeholder="nombre de mesa"
  className="border-amber-500 rounded-2xl border-2 p-1 mb-2 w-full "
   />
  <input type="text" name="mesero" placeholder="nombre de mesero"
  className="border-amber-500 rounded-2xl border-2 p-1 mb-2 w-full" />
  <ClientItemEditor />
  <button type="submit" className=" bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600
    mt-2  ">crear</button>
 </form>
</div>

)


}