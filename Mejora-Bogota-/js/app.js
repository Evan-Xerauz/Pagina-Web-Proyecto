/* MEJORA BOGOTÁ
   JavaScript para las páginas del proyecto.
   Los reportes se guardan solo en este navegador.
   Las fotografías son una vista previa y no se guardan.
*/

/* 1. DATOS GENERALES */
const claveReportes = "mejora-bogota-reportes-clase-v1";
const categorias = ["baches", "semaforos", "alumbrado", "senalizacion",
    "basuras", "andenes", "alcantarillado", "otros"];

/* 2. FUNCIONES QUE USAMOS EN VARIAS PÁGINAS */
function mostrarMensaje(id, texto) {
    const mensaje = document.getElementById(id);
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.hidden = texto === "";
    }
}

function crearElemento(etiqueta, texto, clase = "") {
    const elemento = document.createElement(etiqueta);
    /* textContent muestra lo escrito como texto, no como código HTML. */
    elemento.textContent = texto;
    elemento.className = clase;
    return elemento;
}

function normalizar(texto) {
    /* Permite buscar "iluminacion" aunque esté escrito "iluminación". */
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function prepararFormulario(formulario) {
    formulario.noValidate = true;
    formulario.addEventListener("input", function (evento) {
        if (evento.target.setCustomValidity) evento.target.setCustomValidity("");
    });
}

function validarFormulario(formulario) {
    const campos = formulario.querySelectorAll('input[type="text"], input[type="email"], textarea');
    campos.forEach(function (campo) {
        campo.value = campo.value.trim();
        campo.setCustomValidity("");
        if (campo.value && campo.minLength > 0 && campo.value.length < campo.minLength) {
            campo.setCustomValidity("Escribe al menos " + campo.minLength + " caracteres.");
        }
    });
    return formulario.reportValidity();
}

/* 3. LEER LOS REPORTES GUARDADOS */
function leerReportes() {
    /* Usamos Live Server para que todas las páginas compartan el almacenamiento. */
    if (location.protocol === "file:") {
        throw new Error("Abre index.html con Live Server para guardar y consultar reportes.");
    }
    const texto = localStorage.getItem(claveReportes);
    if (texto === null) return [];
    const reportes = JSON.parse(texto);
    if (!Array.isArray(reportes)) throw new Error("Los datos guardados no son una lista.");

    /* Si los datos no son válidos, avisamos sin borrarlos ni reemplazarlos. */
    const campos = ["codigo", "titulo", "descripcion", "categoria", "categoriaTexto",
        "localidad", "direccion", "barrio", "riesgo", "fecha", "fechaObservacion"];
    const validos = reportes.every(function (reporte) {
        return reporte && campos.every(function (campo) {
            return typeof reporte[campo] === "string";
        }) && /^MB-\d{5,16}$/.test(reporte.codigo) && categorias.includes(reporte.categoria)
            && Number.isFinite(Date.parse(reporte.fecha));
    });
    if (!validos) throw new Error("Hay reportes con un formato que no se puede leer.");
    return reportes;
}

/* 4. CREAR UNA TARJETA PARA MOSTRAR UN REPORTE */
function crearTarjeta(reporte) {
    const tarjeta = crearElemento("article", "", "report-card");
    const etiqueta = crearElemento("span", "Guardado localmente", "badge status-received");
    const titulo = crearElemento("h3", reporte.titulo);
    const descripcion = crearElemento("p", reporte.descripcion);
    const lista = crearElemento("dl", "", "report-data");
    const datos = [
        ["Código", reporte.codigo], ["Categoría", reporte.categoriaTexto],
        ["Localidad", reporte.localidad], ["Ubicación", reporte.direccion],
        ["Barrio o vereda", reporte.barrio || "Sin informar"],
        ["Riesgo observado", reporte.riesgo],
        ["Fecha de observación", reporte.fechaObservacion || "Sin informar"],
        ["Guardado", new Date(reporte.fecha).toLocaleString("es-CO")]
    ];
    datos.forEach(function (dato) {
        lista.append(crearElemento("dt", dato[0]), crearElemento("dd", dato[1]));
    });
    tarjeta.append(etiqueta, titulo, descripcion, lista);
    tarjeta.append(crearElemento("p", "Sin envío a entidades ni radicado oficial.", "form-help"));
    return tarjeta;
}

/* 5. GUARDAR EL FORMULARIO DE CREAR REPORTE */
function iniciarCreacion() {
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

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault(); /* Evita que se recargue la página. */
        mostrarMensaje("mensaje-reporte", "");
        confirmacion.hidden = true;
        if (!validarFormulario(formulario)) return;

        try {
            const reportes = leerReportes();
            let numero = Date.now();
            while (reportes.some(function (reporte) { return reporte.codigo === "MB-" + numero; })) {
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
    formulario.addEventListener("reset", function () {
        confirmacion.hidden = true;
        mostrarMensaje("mensaje-reporte", "");
    });
}

/* 6. VISTA PREVIA DE LA FOTOGRAFÍA */
function iniciarFoto() {
    const campo = document.getElementById("foto");
    if (!campo) return;
    const imagen = document.getElementById("vista-foto");
    let enlaceTemporal = "";

    function limpiarFoto() {
        if (enlaceTemporal) URL.revokeObjectURL(enlaceTemporal);
        enlaceTemporal = "";
        imagen.hidden = true;
        imagen.removeAttribute("src");
        campo.setCustomValidity("");
        mostrarMensaje("mensaje-foto", "");
    }
    campo.addEventListener("change", function () {
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
    imagen.addEventListener("error", function () {
        if (!enlaceTemporal) return;
        campo.setCustomValidity("No se pudo leer la imagen. Selecciona otra.");
        imagen.hidden = true;
        mostrarMensaje("mensaje-foto", campo.validationMessage);
    });
    campo.form.addEventListener("reset", limpiarFoto);
    window.addEventListener("pagehide", limpiarFoto);
}

/* 7. EXPLORAR: AÑADIR LOS REPORTES Y FILTRAR LAS TARJETAS */
function iniciarExploracion() {
    const formulario = document.getElementById("formulario-filtros");
    if (!formulario) return;
    const busqueda = document.getElementById("buscar-reporte");
    const categoria = document.getElementById("filtrar-categoria");
    const secciones = document.querySelectorAll(".categoria-reportes");

    try {
        leerReportes().forEach(function (reporte) {
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

    function filtrar() {
        const texto = normalizar(busqueda.value);
        let cantidad = 0;
        secciones.forEach(function (seccion) {
            const corresponde = categoria.value === "" || categoria.value === seccion.id;
            let visibles = 0;
            seccion.querySelectorAll(".report-card").forEach(function (tarjeta) {
                tarjeta.hidden = !corresponde || !normalizar(tarjeta.textContent).includes(texto);
                if (!tarjeta.hidden) visibles++;
            });
            cantidad += visibles;
            seccion.hidden = !corresponde || (texto !== "" && visibles === 0);
        });
        mostrarMensaje("resumen-filtros", cantidad + " reporte(s) encontrado(s).");
    }
    formulario.addEventListener("submit", function (evento) { evento.preventDefault(); filtrar(); });
    busqueda.addEventListener("input", filtrar);
    categoria.addEventListener("change", filtrar);
    formulario.addEventListener("reset", function () {
        /* El navegador restaura los campos después de disparar reset. */
        setTimeout(filtrar, 0);
    });
    document.querySelectorAll(".category-links a").forEach(function (enlace) {
        enlace.addEventListener("click", function () {
            busqueda.value = "";
            categoria.value = enlace.hash.slice(1);
            filtrar();
        });
    });
    filtrar();
}

/* 8. SEGUIMIENTO: BUSCAR UN CÓDIGO */
function iniciarSeguimiento() {
    const formulario = document.getElementById("formulario-seguimiento");
    if (!formulario) return;
    prepararFormulario(formulario);
    const campo = document.getElementById("codigo-consulta");
    formulario.querySelector('button[type="submit"]').disabled = false;
    let errorLectura = false;

    try {
        leerReportes().forEach(function (reporte) {
            const seccion = crearElemento("section", "", "section-spacing reporte-detalle");
            seccion.id = "reporte-" + reporte.codigo.toLowerCase();
            seccion.append(crearElemento("h2", "Reporte " + reporte.codigo), crearTarjeta(reporte));
            document.getElementById("contenido-principal").append(seccion);
        });
    } catch (error) {
        errorLectura = true;
        mostrarMensaje("error-seguimiento", "No se pudieron leer los reportes guardados. Usa Live Server y revisa el almacenamiento. Puedes consultar los ejemplos.");
    }

    function buscar() {
        campo.value = campo.value.trim().toUpperCase();
        const detalles = document.querySelectorAll(".reporte-detalle");
        detalles.forEach(function (seccion) { seccion.hidden = true; });
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
    }
    formulario.addEventListener("submit", function (evento) { evento.preventDefault(); buscar(); });
    formulario.addEventListener("reset", function () {
        document.querySelectorAll(".reporte-detalle").forEach(function (seccion) { seccion.hidden = false; });
        mostrarMensaje("mensaje-seguimiento", "");
    });
    function consultarEnlace() {
        if (location.hash.startsWith("#reporte-")) {
            campo.value = location.hash.replace("#reporte-", "");
            buscar();
        }
    }
    document.querySelectorAll(".category-links a").forEach(function (enlace) {
        enlace.addEventListener("click", function (evento) {
            evento.preventDefault();
            campo.value = enlace.hash.replace("#reporte-", "");
            buscar();
        });
    });
    const codigoURL = new URLSearchParams(location.search).get("codigo");
    if (codigoURL) { campo.value = codigoURL; buscar(); }
    else consultarEnlace();
    window.addEventListener("hashchange", consultarEnlace);
}

/* 9. CONTACTO: COMPROBAR LOS CAMPOS SIN SIMULAR UN ENVÍO */
function iniciarContacto() {
    const formulario = document.getElementById("formulario-contacto");
    if (!formulario) return;
    prepararFormulario(formulario);
    formulario.querySelector('button[type="submit"]').disabled = false;
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        mostrarMensaje("mensaje-contacto-estado", "");
        if (!validarFormulario(formulario)) return;
        mostrarMensaje("mensaje-contacto-estado", "Los campos son válidos. El mensaje no se ha enviado ni guardado: el formulario todavía no tiene un servicio de envío.");
    });
    formulario.addEventListener("reset", function () { mostrarMensaje("mensaje-contacto-estado", ""); });
}

/* 10. INICIO: cada función comprueba si está en la página correspondiente.
   El atributo defer del script hace que el HTML esté cargado primero. */
iniciarCreacion();
iniciarFoto();
iniciarExploracion();
iniciarSeguimiento();
iniciarContacto();
