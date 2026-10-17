"use strict";

import { crearElemento } from "./utilidades.js";

/* ACCESIBILIDAD: controles de lectura independientes del formulario y del chatbot.
   Se comparte el mismo menú en todas las páginas mediante este módulo.
   Referencias W3C consultadas:
   https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
   https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
   https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ */
const iniciarAccesibilidad = () => {
    if (document.getElementById("menu-accesibilidad")) return;

    /* 1. Preferencias: esta clave guarda únicamente los ajustes de lectura. */
    const clavePreferencias = "mejora-bogota-accesibilidad-v1";
    const ajustesOriginales = { tamano: "100", fuente: "original", contraste: "original" };
    const valoresPermitidos = {
        tamano: ["100", "125", "150", "175", "200"],
        fuente: ["original", "verdana", "georgia"],
        contraste: ["original", "claro", "oscuro"]
    };
    let preferencias = { ...ajustesOriginales };
    try {
        const guardadas = JSON.parse(localStorage.getItem(clavePreferencias));
        if (guardadas && typeof guardadas === "object") {
            Object.keys(ajustesOriginales).forEach((opcion) => {
                if (valoresPermitidos[opcion].includes(guardadas[opcion])) {
                    preferencias[opcion] = guardadas[opcion];
                }
            });
        }
    } catch {
        /* Si no se puede leer el almacenamiento, se usan los ajustes originales. */
    }

    /* 2. Interfaz: controles nativos con etiquetas y un panel que se puede cerrar.
       Este HTML es fijo; no se inserta contenido procedente del visitante. */
    const contenedorAccesibilidad = crearElemento("aside", "", "accesibilidad");
    contenedorAccesibilidad.id = "menu-accesibilidad";
    contenedorAccesibilidad.setAttribute("aria-label", "Ajustes de accesibilidad");
    contenedorAccesibilidad.innerHTML = `
        <button id="accesibilidad-abrir" class="accesibilidad-boton" type="button"
                aria-label="Abrir menú de accesibilidad" aria-expanded="false"
                aria-controls="accesibilidad-panel" title="Accesibilidad">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round"
                 aria-hidden="true" focusable="false">
                <circle cx="16" cy="16" r="14"></circle>
                <circle cx="16" cy="9" r="2" fill="currentColor" stroke="none"></circle>
                <path d="m8 13 8 2 8-2M16 15v5m0 0-5 7m5-7 5 7"></path>
            </svg>
        </button>
        <section id="accesibilidad-panel" class="accesibilidad-panel"
                 aria-labelledby="accesibilidad-titulo" hidden>
            <div class="accesibilidad-encabezado">
                <h2 id="accesibilidad-titulo">Accesibilidad</h2>
                <button id="accesibilidad-cerrar" class="accesibilidad-cerrar" type="button"
                        aria-label="Cerrar menú de accesibilidad" title="Cerrar menú">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                        <path d="m6 6 12 12M18 6 6 18"></path>
                    </svg>
                </button>
            </div>
            <div class="accesibilidad-controles">
                <label for="accesibilidad-tamano">Tamaño del texto</label>
                <select id="accesibilidad-tamano">
                    <option value="100">100 % (original)</option>
                    <option value="125">125 %</option>
                    <option value="150">150 %</option>
                    <option value="175">175 %</option>
                    <option value="200">200 %</option>
                </select>
                <label for="accesibilidad-fuente">Tipo de letra</label>
                <select id="accesibilidad-fuente">
                    <option value="original">Arial (original)</option>
                    <option value="verdana">Verdana</option>
                    <option value="georgia">Georgia</option>
                </select>
                <label for="accesibilidad-contraste">Contraste de colores</label>
                <select id="accesibilidad-contraste">
                    <option value="original">Original</option>
                    <option value="claro">Claro</option>
                    <option value="oscuro">Oscuro</option>
                </select>
                <button id="accesibilidad-restaurar" class="accesibilidad-restaurar" type="button">Restaurar ajustes</button>
                <p id="accesibilidad-estado" class="accesibilidad-estado" role="status" aria-atomic="true"></p>
            </div>
        </section>
    `;
    document.body.append(contenedorAccesibilidad);

    const raizPagina = document.documentElement;
    const botonAbrir = document.getElementById("accesibilidad-abrir");
    const botonCerrar = document.getElementById("accesibilidad-cerrar");
    const panelAccesibilidad = document.getElementById("accesibilidad-panel");
    const mensajeEstado = document.getElementById("accesibilidad-estado");

    /* 3. Solo se activan estilos adicionales cuando se elige un ajuste distinto.
       Al restaurar, se retiran estos atributos y vuelve el CSS original. */
    const aplicarPreferencias = () => {
        raizPagina.toggleAttribute("data-texto-ampliado", preferencias.tamano !== "100");
        if (preferencias.tamano !== "100") {
            raizPagina.style.setProperty("--escala-texto", Number(preferencias.tamano) / 100);
        } else {
            raizPagina.style.removeProperty("--escala-texto");
        }
        ["fuente", "contraste"].forEach((opcion) => {
            if (preferencias[opcion] === "original") raizPagina.removeAttribute("data-" + opcion);
            else raizPagina.setAttribute("data-" + opcion, preferencias[opcion]);
        });
        Object.keys(ajustesOriginales).forEach((opcion) => {
            document.getElementById("accesibilidad-" + opcion).value = preferencias[opcion];
        });
    };

    const guardarPreferencias = (restaurar = false) => {
        try {
            if (restaurar) localStorage.removeItem(clavePreferencias);
            else localStorage.setItem(clavePreferencias, JSON.stringify(preferencias));
            mensajeEstado.textContent = restaurar ? "Ajustes originales restaurados." : "Ajustes guardados en este navegador.";
        } catch {
            mensajeEstado.textContent = "Ajustes aplicados en esta página. El navegador no permite guardarlos.";
        }
    };

    Object.keys(ajustesOriginales).forEach((opcion) => {
        document.getElementById("accesibilidad-" + opcion).addEventListener("change", (evento) => {
            preferencias[opcion] = evento.target.value;
            aplicarPreferencias();
            guardarPreferencias();
        });
    });
    document.getElementById("accesibilidad-restaurar").addEventListener("click", () => {
        preferencias = { ...ajustesOriginales };
        aplicarPreferencias();
        guardarPreferencias(true);
    });

    /* 4. Teclado: Escape cierra y devuelve el foco al botón de apertura.
       Al salir hacia otro control, el panel se cierra sin mover ese foco. */
    const cambiarVisibilidad = (abrir, devolverFoco = true) => {
        panelAccesibilidad.hidden = !abrir;
        botonAbrir.setAttribute("aria-expanded", String(abrir));
        botonAbrir.setAttribute("aria-label", (abrir ? "Cerrar" : "Abrir") + " menú de accesibilidad");
        if (abrir) botonCerrar.focus();
        else if (devolverFoco) botonAbrir.focus();
    };
    botonAbrir.addEventListener("click", () => cambiarVisibilidad(panelAccesibilidad.hidden));
    botonCerrar.addEventListener("click", () => cambiarVisibilidad(false));
    contenedorAccesibilidad.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !panelAccesibilidad.hidden) {
            evento.preventDefault();
            cambiarVisibilidad(false);
        }
    });
    document.addEventListener("focusin", (evento) => {
        if (!panelAccesibilidad.hidden && !contenedorAccesibilidad.contains(evento.target)) {
            cambiarVisibilidad(false, false);
        }
    });
    aplicarPreferencias();
};

export { iniciarAccesibilidad };
