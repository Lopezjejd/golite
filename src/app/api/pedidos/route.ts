// src/app/api/pedidos/route.ts
import { NextResponse } from "next/server";
import { getPedidos, createPedido } from "@/lib/pedidos";

type IncomingItem = {
  nombre?: unknown;
  precio?: unknown;
  nota?: unknown;
  estado?: unknown;
};

type IncomingBody = {
  mesa?: unknown;
  mesero?: unknown;
  items?: unknown;
  total?: unknown;
};

/** Validación simple: chequear forma de request */
function validateBody(body: IncomingBody): { ok: true; value: { mesa: string; mesero?: string; items: any[]; total?: number } } | { ok: false; message: string } {
  if (!body || typeof body.mesa !== "string") {
    return { ok: false, message: "Campo 'mesa' requerido y debe ser string." };
  }
  if (!Array.isArray(body.items)) {
    return { ok: false, message: "Campo 'items' requerido y debe ser un array." };
  }

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

export async function GET() {
  const pedidos = await getPedidos();
  return NextResponse.json(pedidos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as IncomingBody;
    const validation = validateBody(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const nuevoPedido = await createPedido(validation.value);
    // Opcional: devolver Location header a la URL del nuevo recurso
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Location", `/api/pedidos/${nuevoPedido.id}`);

    return new NextResponse(JSON.stringify(nuevoPedido), { status: 201, headers });
  } catch (error) {
    console.error("Error creando pedido:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
