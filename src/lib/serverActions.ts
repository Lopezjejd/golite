// src/lib/actions.ts
"use server"; // 👈 DIRECTIVA CLAVE

import { createPedido, Pedido, Item } from './pedidos'; // Asegúrate de importar tus tipos y lógica
import { revalidatePath } from 'next/cache'; // Para que los Server Components se actualicen

// --- 1. Lógica de Validación (Copiada y Aislada del API Route) ---
// NOTA: Asumimos que IncomingBody e IncomingItem están definidos en algún lugar o se infieren.
interface IncomingItem { nombre: string; precio: number | string; nota?: string; estado?: string; }
interface IncomingBody { mesa: string; mesero?: string; items: IncomingItem[]; total?: number; }

function validateBody(body: IncomingBody): { ok: true; value: { mesa: string; mesero?: string; items: any[]; total?: number } } | { ok: false; message: string } {
    // ... Tu lógica de validación de validateBody copiada aquí ...
    if (!body || typeof body.mesa !== "string") {
        return { ok: false, message: "Campo 'mesa' requerido y debe ser string." };
    }
    if (!Array.isArray(body.items)) {
        return { ok: false, message: "Campo 'items' requerido y debe ser un array." };
    }
//hola 
    const itemsValidated = [];
    for (const raw of body.items as any[]) {
        const it = raw as IncomingItem;
        if (typeof it.nombre !== "string" || it.nombre.trim() === "") {
            return { ok: false, message: "Cada item debe tener 'nombre' string no vacío." };
        }
        const precio = Number(it.precio);
        if (Number.isNaN(precio) || precio < 0) {
            return { ok: false, message: "Cada item debe tener 'precio' numérico >= 0." };
        }
        const estado = it.estado === "entregado" ? "entregado" : "pendiente";
        itemsValidated.push({
            nombre: it.nombre,
            precio,
            nota: typeof it.nota === "string" ? it.nota : undefined,
            estado
        });
    }

    const total = typeof body.total === "number" ? body.total : undefined;
    return { ok: true, value: { mesa: body.mesa as string, mesero: typeof body.mesero === "string" ? body.mesero : undefined, items: itemsValidated, total } };
}

// --- 2. La Server Action Principal (Fusionando Validación y Mutación) ---

export async function crearNuevoPedido(formData: FormData): Promise<{ success: true; pedido: Pedido } | { success: false; message: string }> {
    // ⚠️ NOTA: Las Server Actions reciben por defecto un objeto 'FormData' de los formularios.
    // Aquí tenemos que convertirlo a un objeto JSON compatible con tu estructura.
    
    // Simulación rápida de conversión de FormData a un objeto JSON:
    const rawData = Object.fromEntries(formData.entries());
    // Aquí se requiere lógica de conversión más compleja para el array de 'items', 
    // pero para mantenerlo simple, simularemos que viene como JSON simple.
    
    // **ASUMIMOS** que el Cliente Component nos enviará un JSON directo (ver siguiente paso)
    // Para Server Actions llamadas directamente (no desde un <form action>), es más fácil 
    // recibir el objeto tipado en lugar de FormData. Cambiemos la firma de la función:

    const body: IncomingBody = {
        mesa: String(rawData.mesa),
        mesero: String(rawData.mesero || ''),
        items: JSON.parse(String(rawData.items)), // Requiere serialización del lado del cliente
        total: Number(rawData.total) || undefined
    };

    // 1. VALIDACIÓN
    const validationResult = validateBody(body);

    if (!validationResult.ok) {
        return { success: false, message: validationResult.message };
    }

    // 2. MUTACIÓN
    const nuevoPedido = await createPedido(validationResult.value);

    // 3. REVALIDACIÓN (Crucial: Le dice a Next.js que recargue la data de los SC)
    revalidatePath('/pedidos'); // O la ruta donde se muestra la lista

    // 4. RESPUESTA DE ÉXITO
    return { success: true, pedido: nuevoPedido };
}

// Nota: Si quieres llamarla directamente desde un botón y pasar el objeto ya formado, 
// la firma sería: export async function crearNuevoPedido(data: IncomingBody) { ... }