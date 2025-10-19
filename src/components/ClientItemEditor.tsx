    "use client";
import { useState } from "react";
import type { Item } from "@/types/pedidosType";
import { json } from "zod";


const itemsMock: Item[] = [
    { nombre: "Hamburguesa Clásica", precio: 8.99 },
    { nombre: "Pizza Margherita", precio: 12.50 },
    { nombre: "Ensalada César", precio: 7.75 },
    { nombre: "Pasta Carbonara", precio: 10.25 },
    { nombre: "Sushi Roll", precio: 15.99 },
    { nombre: "Tacos Mexicanos", precio: 9.50 },
    { nombre: "Pollo a la Parrilla", precio: 11.75 },
    { nombre: "Sándwich Club", precio: 6.99 },
    { nombre: "Sopa del Día", precio: 5.25 },
    { nombre: "Batido de Fresa", precio: 4.50 },
    { nombre: "Café Espresso", precio: 2.75 },
    { nombre: "Té Verde", precio: 3.00 },
    { nombre: "Agua Mineral", precio: 1.50 },
    { nombre: "Refresco Cola", precio: 2.25 },
    { nombre: "Jugo Natural", precio: 3.50 }
].map(item => ({
    ...item,
    estado: "pendiente" as const
}));
export default function ClientItemEditor() {
    const [items, setItems] = useState<Item[] | []>([]);

    function addItemToOrder(item: Item) {
        setItems(prevItems => [...prevItems, item]);


    }

    return (
        <div>
            <div className="mb-2 ">menu</div>
            <div className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto border p-2">
                {itemsMock.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => addItemToOrder(item)}
                    >
                        {item.nombre} - ${item.precio.toFixed(2)}
                    </button>
                ))}
            </div>

            <div className="mb-2"> items seleccionados </div>
            <div className="max-h-48 overflow-y-auto border p-2">
                {items && items.length > 0 ? (
                    <ul>
                        {items.map((item, index) => (
                            <li key={index} className="mb-1">
                                {item.nombre} - ${item.precio.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay ítems seleccionados.</p>
                )}
              

        </div>
        <input 
          type="hidden" 
          name="items"
          value={JSON.stringify(items)} 
        />
    </div>
    )
}