"use client";

import React, { useEffect, useRef, useState } from "react";
import ClientItemEditor from "./ClientItemEditor";
import { useFormStatus } from "react-dom";

export default function CreatePedidoFormSimple({ action }: { action: (formData: FormData) => Promise<any> }) {
  const { pending } = useFormStatus();
  const [localLoading, setLocalLoading] = useState(false);

  // Sincroniza el estado local con el estado global `pending`.
  // Cuando `pending` se vuelve true, activamos localLoading inmediatamente.
  // Cuando `pending` se vuelve false, esperamos un pequeño delay antes de
  // limpiar localLoading para evitar parpadeos cuando la petición es muy rápida.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // If there's a fallback timer running, clear it when pending changes
    if (fallbackRef.current && !pending) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = undefined;
    }
    if (pending) {
      setLocalLoading(true);
    } else {
      // Pequeño delay para evitar parpadeo
      timeout = setTimeout(() => setLocalLoading(false), 150);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [pending]);

  // fallbackRef stores a timer id that will force-clear localLoading in case
  // the submission hangs or pending never becomes true. We set it on submit.
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // onSubmit sets local loading immediately so Enter key and fast responses are handled
  function handleSubmit() {
    setLocalLoading(true);
    // fallback: clear loading after 5s in case submission hangs
    if (fallbackRef.current) clearTimeout(fallbackRef.current);
    fallbackRef.current = setTimeout(() => {
      setLocalLoading(false);
      fallbackRef.current = undefined;
    }, 5000);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        name="mesa"
        required
        placeholder="nombre de mesa"
        className="border-amber-500 rounded-2xl border-2 p-1 mb-2 w-full "
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
        disabled={pending || localLoading}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2 ${pending || localLoading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {pending || localLoading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}
