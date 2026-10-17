"use strict";

import { crearElemento } from "./utilidades.js";

/* ASISTENTE BÁSICO: muestra respuestas programadas, no utiliza inteligencia artificial.
   Se crea desde JavaScript para compartirlo entre todas las páginas sin repetir HTML.
   No recibe datos personales ni guarda o envía reportes. */
const iniciarChatbot = () => {
    if (document.getElementById("chatbot-ciudadano")) return;

    /* 1. Respuestas: se pueden editar aquí sin cambiar el formulario del proyecto. */
    const respuestas = {
        pasos: "1. Abre Crear un reporte.\n2. Selecciona la categoría y escribe un título y una descripción del problema.\n3. Indica la localidad y la dirección o referencia.\n4. Si lo deseas, añade fecha, riesgo, barrio y una foto de prueba.\n5. Marca que usarás datos ficticios y pulsa Guardar reporte local.\n6. Conserva el código MB- que aparece para consultarlo en Seguimiento.",
        categorias: "Puedes reportar problemas de estas categorías:\n• Baches y vías: daños en las calles.\n• Semáforos: fallas en su funcionamiento.\n• Alumbrado: luminarias apagadas o dañadas.\n• Señalización: señales dañadas o ausentes.\n• Basuras: residuos y escombros.\n• Andenes: daños que dificultan el paso peatonal.\n• Alcantarillado: problemas en sumideros y drenajes.\n• Otros: otras incidencias del espacio público.",
        datos: "Obligatorio: categoría, título (mínimo 10 caracteres), descripción (mínimo 20), localidad y dirección o referencia (mínimo 8). También debes aceptar el uso de datos ficticios.\n\nOpcional: fecha de observación, riesgo, barrio o vereda y fotografía JPG, PNG o WebP de máximo 5 MB. La fotografía solo se muestra como vista previa; no se guarda.\n\nPara consultar un reporte, usa su código MB- en el mismo navegador y la misma dirección del sitio donde lo guardaste."
    };

    /* 2. Interfaz: el HTML es fijo; las respuestas se insertan después con textContent.
       W3C: aria-expanded informa si el panel está abierto y role="log" identifica
       los mensajes de la conversación para tecnologías de asistencia.
       https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
       https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA23 */
    const contenedorChatbot = crearElemento("aside", "", "chatbot");
    contenedorChatbot.id = "chatbot-ciudadano";
    contenedorChatbot.setAttribute("aria-label", "Ayuda para reportes ciudadanos");
    contenedorChatbot.innerHTML = `
        <button id="chatbot-abrir" class="chatbot-boton" type="button"
                aria-label="Abrir Asistente Mejora Bogotá" aria-expanded="false"
                aria-controls="chatbot-panel" title="Asistente Mejora Bogotá">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linejoin="round"
                 aria-hidden="true" focusable="false">
                <path d="M5 5h22v17H14l-7 5v-5H5z"></path>
                <circle cx="10" cy="13" r="1" fill="currentColor"></circle>
                <circle cx="16" cy="13" r="1" fill="currentColor"></circle>
                <circle cx="22" cy="13" r="1" fill="currentColor"></circle>
            </svg>
        </button>
        <section id="chatbot-panel" class="chatbot-panel" aria-labelledby="chatbot-titulo" hidden>
            <div class="chatbot-encabezado">
                <div>
                    <h2 id="chatbot-titulo">Asistente Mejora Bogotá</h2>
                    <p>Guía con respuestas programadas</p>
                </div>
                <button id="chatbot-cerrar" class="chatbot-cerrar" type="button"
                        aria-label="Cerrar asistente" title="Cerrar asistente">×</button>
            </div>
            <div class="chatbot-cuerpo">
                <div id="chatbot-mensajes" class="chatbot-mensajes" role="log"
                     aria-label="Conversación con el asistente" aria-live="polite"
                     aria-relevant="additions" tabindex="0"></div>
                <div class="chatbot-opciones" role="group" aria-label="Preguntas de ayuda">
                    <p>Selecciona una opción:</p>
                    <button class="chatbot-opcion" type="button" data-respuesta="pasos">Cómo hacer un reporte</button>
                    <button class="chatbot-opcion" type="button" data-respuesta="categorias">Qué problemas puedo reportar</button>
                    <button class="chatbot-opcion" type="button" data-respuesta="datos">Qué información necesito</button>
                </div>
                <nav class="chatbot-enlaces" aria-label="Acciones del asistente">
                    <a id="chatbot-crear" class="chatbot-enlace" href="#">Crear un reporte</a>
                    <a id="chatbot-seguimiento" class="chatbot-enlace" href="#">Consultar seguimiento</a>
                </nav>
                <p class="chatbot-aviso">Solo orientación. Este prototipo guarda reportes de prueba en tu navegador; no los envía a entidades.</p>
            </div>
        </section>
    `;
    document.body.append(contenedorChatbot);

    const botonAbrir = document.getElementById("chatbot-abrir");
    const botonCerrar = document.getElementById("chatbot-cerrar");
    const panelChatbot = document.getElementById("chatbot-panel");
    const historialMensajes = document.getElementById("chatbot-mensajes");
    const cuerpoChatbot = contenedorChatbot.querySelector(".chatbot-cuerpo");

    /* 3. Mensajes: solo muestran texto y se conservan mientras sigas en esta página. */
    const agregarMensaje = (texto, esUsuario = false) => {
        const mensaje = crearElemento("div", "", "chatbot-mensaje");
        if (esUsuario) mensaje.classList.add("chatbot-mensaje-usuario");
        mensaje.append(
            crearElemento("strong", esUsuario ? "Tú" : "Asistente"),
            crearElemento("p", texto)
        );
        historialMensajes.append(mensaje);
        return mensaje;
    };
    agregarMensaje("Hola, soy el asistente de Mejora Bogotá. Puedo orientarte para realizar un reporte ciudadano. ¿En qué deseas ayuda?");

    /* 4. Abrir y cerrar: se actualiza el estado accesible y se controla el foco.
       Escape cierra el panel. No se bloquea la navegación por el resto del sitio. */
    const cambiarVisibilidad = (abrir, devolverFoco = true) => {
        panelChatbot.hidden = !abrir;
        botonAbrir.setAttribute("aria-expanded", String(abrir));
        botonAbrir.setAttribute("aria-label", (abrir ? "Cerrar" : "Abrir") + " Asistente Mejora Bogotá");
        if (abrir) botonCerrar.focus();
        else if (devolverFoco) botonAbrir.focus();
    };
    botonAbrir.addEventListener("click", () => cambiarVisibilidad(panelChatbot.hidden));
    botonCerrar.addEventListener("click", () => cambiarVisibilidad(false));
    contenedorChatbot.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !panelChatbot.hidden) {
            evento.preventDefault();
            cambiarVisibilidad(false);
        }
    });
    document.addEventListener("focusin", (evento) => {
        /* Al volver al formulario con el teclado, el panel no tapa el campo activo. */
        if (!panelChatbot.hidden && !contenedorChatbot.contains(evento.target)) {
            cambiarVisibilidad(false, false);
        }
    });

    /* 5. Cada botón elige una respuesta del objeto definido al principio. */
    contenedorChatbot.querySelectorAll("[data-respuesta]").forEach((boton) => {
        boton.addEventListener("click", () => {
            agregarMensaje(boton.textContent, true);
            const respuesta = agregarMensaje(respuestas[boton.dataset.respuesta]);
            /* Permite leer desde el inicio de la respuesta más reciente. */
            historialMensajes.scrollTop = respuesta.offsetTop - 12;
            cuerpoChatbot.scrollTop = 0;
        });
    });

    /* 6. Las rutas se calculan desde este módulo, tanto en Inicio como en /pages.
       Si ya estás en el formulario elegido, se enfoca sin recargar ni borrar datos. */
    const enlazarPagina = (idEnlace, archivo, idCampo) => {
        const enlace = document.getElementById(idEnlace);
        enlace.href = new URL("../pages/" + archivo, import.meta.url).href;
        enlace.addEventListener("click", (evento) => {
            const campo = document.getElementById(idCampo);
            if (!campo || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
            evento.preventDefault();
            cambiarVisibilidad(false, false);
            campo.focus();
        });
    };
    enlazarPagina("chatbot-crear", "crear.html", "categoria");
    enlazarPagina("chatbot-seguimiento", "seguimiento.html", "codigo-consulta");
};

export { iniciarChatbot };
