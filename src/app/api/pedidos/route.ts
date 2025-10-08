import { NextResponse } from "next/server";
import{getPedidos,createPedido} from "@/lib/pedidos";

export async function GET() {
    const pedidos = await getPedidos();
    return NextResponse.json(pedidos);//retorna un json
}
export async function POST(request: Request) {
    try {
        const body = await request.json();//lee el body de la request
        //validar body
        if (!body || typeof body.mesa !== 'string' || !Array.isArray(body.items)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        };
        const nuevoPedido = await createPedido({
            mesa: body.mesa,
            mesero: body.mesero,
            items: body.items,
            total: typeof body.total === 'number' ? body.total : undefined //total es opcional
        });
        return NextResponse.json(nuevoPedido, { status: 201 });
    }catch (error) {
        console.error('Error creating pedido:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}