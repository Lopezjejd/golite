// types/pedidos.ts

/**
 * Estados posibles de un ítem
 */
export type Estado = "pendiente" | "entregado";

/**
 * Interface para un ítem del pedido
 */
export interface Item {
  id?: string;
  nombre: string;
  precio: number;
  nota?: string;
  estado: Estado;
}

/**
 * Interface principal del pedido
 */
export interface Pedido {
  id: string;
  mesa: string;
  mesero?: string;
  items: Item[];
  total?: number;
  fecha?: Date;
}

/**
 * Tipos de errores de Zod que podemos recibir
 */
export type ZodErrorCode = 
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
 * Error de validación
 */
export interface ValidationError {
  code: ZodErrorCode;
  message: string;
  path: string[];
}

/**
 * Respuesta tipada para las Server Actions
 */
export type ActionResponse = 
  | { 
      success: true; 
      pedido: Pedido;
    }
  | { 
      success: false; 
      message: string; 
      errors?: ValidationError[];
    };

/**
 * Datos de entrada para crear un pedido
 */
export interface PedidoInput {
  mesa: string;
  mesero?: string;
  items: Array<{
    nombre: string;
    precio: number;
    nota?: string;
    estado?: Estado;
  }>;
  total?: number;
}

/**
 * Parámetros para actualizar estado de ítem
 */
export interface ActualizarEstadoParams {
  pedidoId: string;
  itemId: string;
  estado: Estado;
}

/**
 * Props para componentes que usan las server actions
 */
export interface PedidoFormProps {
  crearNuevoPedido: (formData: FormData) => Promise<ActionResponse>;
}

export interface ActualizarEstadoProps {
  actualizarEstadoItem: (params: ActualizarEstadoParams) => Promise<ActionResponse>;
  pedidoId: string;
  itemId: string;
}