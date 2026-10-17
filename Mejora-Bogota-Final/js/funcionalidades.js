"use strict";

import {
    claveReportes,
    mostrarMensaje,
    crearElemento,
    normalizar,
    prepararFormulario,
    validarFormulario,
    leerReportes,
    crearTarjeta
} from "./utilidades.js";

/* 5. GUARDAR EL FORMULARIO DE CREAR REPORTE */
const iniciarCreacion = () => {
    const formulario = document.getElementById("formulario-reporte");
    if (!formulario) return;
    prepararFormulario(formulario);
    const boton = document.getElementById("guardar-reporte");
    const confirmacion = document.getElementById("confirmacion-reporte");
    boton.disabled = false;

    /* La fecha máxima es el día de hoy en el equipo que abre la página. */
    const hoy = new Date();
    document.getElementById("fecha-observacion").max = hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault(); /* Evita que se recargue la página. */
        mostrarMensaje("mensaje-reporte", "");
        confirmacion.hidden = true;
        if (!validarFormulario(formulario)) return;

        try {
            const reportes = leerReportes();
            let numero = Date.now();
            while (reportes.some((reporte) => { return reporte.codigo === "MB-" + numero; })) {
                numero++;
            }
            const categoria = document.getElementById("categoria");
            const localidad = document.getElementById("localidad");
            const riesgo = document.getElementById("riesgo");
            const reporte = {
                codigo: "MB-" + numero,
                titulo: document.getElementById("titulo-reporte").value.trim(),
                descripcion: document.getElementById("descripcion").value.trim(),
                categoria: categoria.value,
                categoriaTexto: categoria.options[categoria.selectedIndex].text,
                localidad: localidad.options[localidad.selectedIndex].text,
                direccion: document.getElementById("direccion").value.trim(),
                barrio: document.getElementById("barrio").value.trim(),
                riesgo: riesgo.options[riesgo.selectedIndex].text,
                fechaObservacion: document.getElementById("fecha-observacion").value,
                fecha: new Date().toISOString()
            };
            reportes.push(reporte);
            localStorage.setItem(claveReportes, JSON.stringify(reportes));
            /* Mostramos la confirmación únicamente después de guardar. */
            formulario.reset();
            document.getElementById("codigo-creado").textContent = reporte.codigo;
            document.getElementById("ver-reporte").href = "seguimiento.html?codigo=" + reporte.codigo;
            confirmacion.hidden = false;
            confirmacion.focus();
        } catch (error) {
            mostrarMensaje("mensaje-reporte", "No se guardó el reporte. Revisa el almacenamiento del navegador y usa Live Server. Los datos anteriores no se han borrado.");
        }
    });
    formulario.addEventListener("reset", () => {
        confirmacion.hidden = true;
        mostrarMensaje("mensaje-reporte", "");
    });
};

/* 6. VISTA PREVIA DE LA FOTOGRAFÍA */
const iniciarFoto = () => {
    const campo = document.getElementById("foto");
    if (!campo) return;
    const imagen = document.getElementById("vista-foto");
    let enlaceTemporal = "";

    const limpiarFoto = () => {
        if (enlaceTemporal) URL.revokeObjectURL(enlaceTemporal);
        enlaceTemporal = "";
        imagen.hidden = true;
        imagen.removeAttribute("src");
        campo.setCustomValidity("");
        mostrarMensaje("mensaje-foto", "");
    };
    campo.addEventListener("change", () => {
        limpiarFoto();
        const archivo = campo.files[0];
        if (!archivo) return;
        const tipos = ["image/jpeg", "image/png", "image/webp"];
        if (!tipos.includes(archivo.type) || archivo.size > 5 * 1024 * 1024 || archivo.size === 0) {
            campo.setCustomValidity("Selecciona una imagen JPG, PNG o WebP de máximo 5 MB.");
            mostrarMensaje("mensaje-foto", campo.validationMessage);
            return;
        }
        enlaceTemporal = URL.createObjectURL(archivo);
        imagen.src = enlaceTemporal;
        imagen.hidden = false;
    });
    imagen.addEventListener("error", () => {
        if (!enlaceTemporal) return;
        campo.setCustomValidity("No se pudo leer la imagen. Selecciona otra.");
        imagen.hidden = true;
        mostrarMensaje("mensaje-foto", campo.validationMessage);
    });
    campo.form.addEventListener("reset", limpiarFoto);
    window.addEventListener("pagehide", limpiarFoto);
};

/* 7. EXPLORAR: AÑADIR LOS REPORTES Y FILTRAR LAS TARJETAS */
const iniciarExploracion = () => {
    const formulario = document.getElementById("formulario-filtros");
    if (!formulario) return;
    const busqueda = document.getElementById("buscar-reporte");
    const categoria = document.getElementById("filtrar-categoria");
    const secciones = document.querySelectorAll(".categoria-reportes");

    try {
        leerReportes().forEach((reporte) => {
            const seccion = document.getElementById(reporte.categoria);
            const tarjeta = crearTarjeta(reporte);
            const enlace = crearElemento("a", "Ver seguimiento", "btn-primary");
            enlace.href = "seguimiento.html?codigo=" + reporte.codigo;
            tarjeta.append(enlace);
            seccion.append(tarjeta);
            const aviso = seccion.querySelector(".sin-reportes");
            if (aviso) aviso.hidden = true;
        });
    } catch (error) {
        mostrarMensaje("error-explorar", "No se pudieron leer tus reportes locales. Usa Live Server y revisa el almacenamiento. Los ejemplos siguen disponibles.");
    }

    const filtrar = () => {
        const texto = normalizar(busqueda.value);
        let cantidad = 0;
        secciones.forEach((seccion) => {
            const corresponde = categoria.value === "" || categoria.value === seccion.id;
            let visibles = 0;
            seccion.querySelectorAll(".report-card").forEach((tarjeta) => {
                tarjeta.hidden = !corresponde || !normalizar(tarjeta.textContent).includes(texto);
                if (!tarjeta.hidden) visibles++;
            });
            cantidad += visibles;
            seccion.hidden = !corresponde || (texto !== "" && visibles === 0);
        });
        mostrarMensaje("resumen-filtros", cantidad + " reporte(s) encontrado(s).");
    };
    formulario.addEventListener("submit", (evento) => { evento.preventDefault(); filtrar(); });
    busqueda.addEventListener("input", filtrar);
    categoria.addEventListener("change", filtrar);
    formulario.addEventListener("reset", () => {
        /* El navegador restaura los campos después de disparar reset. */
        setTimeout(filtrar, 0);
    });
    document.querySelectorAll(".category-links a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
            busqueda.value = "";
            categoria.value = enlace.hash.slice(1);
            filtrar();
        });
    });
    filtrar();
};

/* 8. SEGUIMIENTO: BUSCAR UN CÓDIGO */
const iniciarSeguimiento = () => {
    const formulario = document.getElementById("formulario-seguimiento");
    if (!formulario) return;
    prepararFormulario(formulario);
    const campo = document.getElementById("codigo-consulta");
    formulario.querySelector('button[type="submit"]').disabled = false;
    let errorLectura = false;

    try {
        leerReportes().forEach((reporte) => {
            const seccion = crearElemento("section", "", "section-spacing reporte-detalle");
            seccion.id = "reporte-" + reporte.codigo.toLowerCase();
            seccion.append(crearElemento("h2", "Reporte " + reporte.codigo), crearTarjeta(reporte));
            document.getElementById("contenido-principal").append(seccion);
        });
    } catch (error) {
        errorLectura = true;
        mostrarMensaje("error-seguimiento", "No se pudieron leer los reportes guardados. Usa Live Server y revisa el almacenamiento. Puedes consultar los ejemplos.");
    }

    const buscar = () => {
        campo.value = campo.value.trim().toUpperCase();
        const detalles = document.querySelectorAll(".reporte-detalle");
        detalles.forEach((seccion) => { seccion.hidden = true; });
        mostrarMensaje("mensaje-seguimiento", "");
        if (!validarFormulario(formulario)) return;
        const resultado = document.getElementById("reporte-" + campo.value.toLowerCase());
        if (resultado) {
            resultado.hidden = false;
            resultado.tabIndex = -1;
            resultado.focus();
            mostrarMensaje("mensaje-seguimiento", "Reporte " + campo.value + " encontrado.");
        } else {
            mostrarMensaje("mensaje-seguimiento", errorLectura
                ? "No se pudo completar la consulta de los reportes locales."
                : "No encontramos ese código. Usa el navegador y la dirección del sitio donde guardaste el reporte.");
        }
    };
    formulario.addEventListener("submit", (evento) => { evento.preventDefault(); buscar(); });
    formulario.addEventListener("reset", () => {
        document.querySelectorAll(".reporte-detalle").forEach((seccion) => { seccion.hidden = false; });
        mostrarMensaje("mensaje-seguimiento", "");
    });
    const consultarEnlace = () => {
        if (location.hash.startsWith("#reporte-")) {
            campo.value = location.hash.replace("#reporte-", "");
            buscar();
        }
    };
    document.querySelectorAll(".category-links a").forEach((enlace) => {
        enlace.addEventListener("click", (evento) => {
            evento.preventDefault();
            campo.value = enlace.hash.replace("#reporte-", "");
            buscar();
        });
    });
    const codigoURL = new URLSearchParams(location.search).get("codigo");
    if (codigoURL) { campo.value = codigoURL; buscar(); }
    else consultarEnlace();
    window.addEventListener("hashchange", consultarEnlace);
};

/* 9. CONTACTO: COMPROBAR LOS CAMPOS SIN SIMULAR UN ENVÍO */
const iniciarContacto = () => {
    const formulario = document.getElementById("formulario-contacto");
    if (!formulario) return;
    prepararFormulario(formulario);
    formulario.querySelector('button[type="submit"]').disabled = false;
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        mostrarMensaje("mensaje-contacto-estado", "");
        if (!validarFormulario(formulario)) return;
        mostrarMensaje("mensaje-contacto-estado", "Los campos son válidos. El mensaje no se ha enviado ni guardado: el formulario todavía no tiene un servicio de envío.");
    });
    formulario.addEventListener("reset", () => { mostrarMensaje("mensaje-contacto-estado", ""); });
};

export {
    iniciarCreacion,
    iniciarFoto,
    iniciarExploracion,
    iniciarSeguimiento,
    iniciarContacto
};
