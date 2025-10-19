"use client";

import React, { useState } from "react";
import ClientItemEditor from "./ClientItemEditor";

export default function CreatePedidoFormSimple({ 
  action 
}: { 
  action: (formData: FormData) => Promise<any> 
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await action(formData);
    } catch (error) {
      console.error("Error creating pedido:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="mt-4">
      <input
        type="text"
        name="mesa"
        required
        placeholder="nombre de mesa"
        className="border-amber-500 rounded-2xl border-2 p-1 mb-2 w-full"
      />
      <input
        type="text"
        name="mesero"
        placeholder="nombre de mesero"
        className="border-amber-500 rounded-2xl border-2 p-1 mb-2 w-full"
      />

      <ClientItemEditor />

      <button
        type="submit"
        disabled={loading}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}