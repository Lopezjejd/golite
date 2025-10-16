import { createPedido, Pedido, Item, Estado, updateItemEstadoById } from './pedidos';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Tipos de errores de Zod que podemos recibir
type ZodErrorCode = 
  | "invalid_type"
  | "invalid_string"
  | "invalid_number"
  | "invalid_date"
  | "invalid_array"
  | "too_small"
  | "too_big"
  | "invalid_union"
  | "invalid_enum_value"
  | "invalid_arguments"
  | "invalid_return_type"
  | "custom";

/**
 * Mapea los códigos de error de Zod a nuestros códigos de error
 */
function mapZodErrorCode(code: string): ZodErrorCode {
  switch (code) {
    case "invalid_type":
    case "invalid_string":
    case "invalid_number":
    case "invalid_date":
    case "invalid_array":
    case "too_small":
    case "too_big":
    case "invalid_union":
    case "invalid_enum_value":
    case "invalid_arguments":
    case "invalid_return_type":
      return code as ZodErrorCode;
    default:
      return "custom";
  }
}

/**
 * Esquema de validación para un ítem individual del pedido
 * - Validación en runtime usando Zod
 * - Asegura tipos correctos y restricciones de negocio
 */
const ItemSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre del ítem es requerido")
    .max(100, "El nombre es demasiado largo"),
  precio: z.number()
    .min(0, "El precio debe ser mayor o igual a 0")
    .max(1000000, "El precio excede el límite permitido"),
  nota: z.string().optional(),
  estado: z.enum(["pendiente", "entregado"] as const)
    .default("pendiente")
}).strict(); // No permite campos adicionales

/**
 * Esquema de validación para los datos de entrada de un nuevo pedido
 * - Incluye validaciones de negocio
 * - Asegura la integridad de los datos
 */
const PedidoInputSchema = z.object({
  mesa: z.string()
    .min(1, "La mesa es requerida")
    .max(50, "Identificador de mesa demasiado largo"),
  mesero: z.string()
    .min(1, "Nombre del mesero requerido")
    .max(20, "Nombre del mesero demasiado largo")
    .optional(),
  items: z.array(ItemSchema)
    .min(1, "Se requiere al menos un ítem en el pedido")
    .max(50, "Demasiados ítems en un solo pedido"),
  total: z.number()
    .optional()
}).strict();

// Tipo inferido del esquema para uso en TypeScript
type PedidoInput = z.infer<typeof PedidoInputSchema>;

/**
 * Parsea y valida los datos del FormData
 * @param formData - Datos crudos del formulario
 * @throws Error si los datos no pueden ser parseados
 */
function parseFormData(formData: FormData): PedidoInput {
  try {
    const rawData = {
      mesa: formData.get('mesa'),
      mesero: formData.get('mesero'),
      items: formData.get('items'),
      total: formData.get('total'),
    };

    return {
      mesa: String(rawData.mesa || '').trim(),
      mesero: rawData.mesero ? String(rawData.mesero).trim() : undefined,
      // Intentamos parsear items; si falla, lanzaremos para que el caller maneje y devuelva un error de validación
      items: JSON.parse(String(rawData.items || '[]')),
      total: rawData.total ? Number(rawData.total) : undefined
    };
  } catch (error) {
    throw new Error('Error al parsear los datos del formulario');
  }
}

/**
 * Tipo para errores de validación
 */
type ValidationError = {
  code: ZodErrorCode;
  message: string;
  path: string[];
};

/**
 * Respuesta tipada para la Server Action
 */
type ActionResponse = 
  | { success: true; pedido: Pedido }
  | { success: false; message: string; errors?: ValidationError[] };

/**
 * Server Action principal para crear un nuevo pedido
 * 
 * Esta función maneja la creación completa de un pedido, incluyendo:
 * - Validación de datos de entrada
 * - Creación del pedido en la base de datos
 * - Revalidación de caché
 * - Manejo de errores
 * 
 * @param formData - Datos del formulario (puede venir de un form HTML o de un submit programático)
 * @returns Objeto con el resultado de la operación
 * 
 */
export async function crearNuevoPedido(formData: FormData): Promise<ActionResponse> {
  "use server";

  // Capturar errores de parseo y devolver un ActionResponse consistente
  let rawData;
  try {
    rawData = parseFormData(formData);
  } catch (err) {
    return {
      success: false,
      message: "Datos inválidos en el formulario",
      errors: [
        { code: "custom", message: err instanceof Error ? err.message : "Error al parsear datos", path: [] }
      ]
    };
  }

  const validationResult = await PedidoInputSchema.safeParseAsync(rawData);
  
  if (!validationResult.success) {
    return {
      success: false,
      message: "Datos inválidos en el formulario",
      errors: validationResult.error.issues.map(issue => ({
        code: mapZodErrorCode(String(issue.code)),
        message: issue.message,
        path: issue.path.map(p => String(p))
      }))
    };
  }

  try {
    const nuevoPedido = await createPedido(validationResult.data);
    revalidatePath('/pedidos');
    revalidatePath(`/pedidos/${String(nuevoPedido.id)}`); // Explicit String conversion

    return {
      success: true,
      pedido: nuevoPedido
    };
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return {
      success: false,
      // Mensaje genérico al cliente; el detalle está en el log
      message: "Error interno al procesar el pedido"
    };
  }
}

/**
 * Server Action para actualizar el estado de un ítem
 * 
 * @param formData - Datos del formulario con itemId y nuevo estado
 */
export async function actualizarEstadoItem(formData: FormData): Promise<ActionResponse> {
  "use server";

  try {
    const itemId = formData.get('itemId');
    const pedidoId = formData.get('pedidoId');
    const nuevoEstado = formData.get('estado');

    if (!itemId || !pedidoId || !nuevoEstado) {
      return {
        success: false,
        message: "Faltan datos requeridos"
      };
    }

    // Validar que el estado sea válido
    if (nuevoEstado !== 'pendiente' && nuevoEstado !== 'entregado') {
      return {
        success: false,
        message: "Estado inválido"
      };
    }

    // Actualizar estado (asumiendo que tienes una función updateItemEstadoById)
    const pedidoActualizado = await updateItemEstadoById(
      String(pedidoId),
      String(itemId),
      nuevoEstado as Estado
    );

    if (!pedidoActualizado) {
      return {
        success: false,
        message: "No se encontró el pedido o el ítem"
      };
    }

    // Revalidar rutas afectadas
    revalidatePath('/pedidos');
    revalidatePath(`/pedidos/${String(pedidoId)}`);

    return {
      success: true,
      pedido: pedidoActualizado
    };

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return {
      success: false,
      message: "Error al actualizar el estado del ítem"
    };
  }
}

/**
 * Test manual 1: Crear nuevo pedido
 * 1. Navegar a /pedidos/nuevo
 * 2. Llenar formulario con datos válidos
 * 3. Submit form
 * 4. Verificar que redirige a /pedidos y muestra el nuevo pedido
 * 
 * Test manual 2: Actualizar estado de item
 * 1. En la lista de pedidos, encontrar un item pendiente
 * 2. Click en "Marcar entregado"
 * 3. Verificar que el estado cambia visualmente
 * 4. Recargar página y confirmar persistencia
 */