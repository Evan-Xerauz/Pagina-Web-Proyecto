"use strict";

/* 1. DATOS GENERALES */
const claveReportes = "mejora-bogota-reportes-clase-v1";
const categorias = ["baches", "semaforos", "alumbrado", "senalizacion",
    "basuras", "andenes", "alcantarillado", "otros"];

/* 2. FUNCIONES QUE USAMOS EN VARIAS PÁGINAS */
const mostrarMensaje = (id, texto) => {
    const mensaje = document.getElementById(id);
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.hidden = texto === "";
    }
};

const crearElemento = (etiqueta, texto, clase = "") => {
    const elemento = document.createElement(etiqueta);
    /* textContent muestra lo escrito como texto, no como código HTML. */
    elemento.textContent = texto;
    elemento.className = clase;
    return elemento;
};

const normalizar = (texto) => {
    /* Permite buscar "iluminacion" aunque esté escrito "iluminación". */
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const prepararFormulario = (formulario) => {
    formulario.noValidate = true;
    formulario.addEventListener("input", (evento) => {
        if (evento.target.setCustomValidity) evento.target.setCustomValidity("");
    });
};

const validarFormulario = (formulario) => {
    const campos = formulario.querySelectorAll('input[type="text"], input[type="email"], textarea');
    campos.forEach((campo) => {
        campo.value = campo.value.trim();
        campo.setCustomValidity("");
        if (campo.value && campo.minLength > 0 && campo.value.length < campo.minLength) {
            campo.setCustomValidity("Escribe al menos " + campo.minLength + " caracteres.");
        }
    });
    return formulario.reportValidity();
};

/* 3. LEER LOS REPORTES GUARDADOS */
const leerReportes = () => {
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
    const validos = reportes.every((reporte) => {
        return reporte && campos.every((campo) => {
            return typeof reporte[campo] === "string";
        }) && /^MB-\d{5,16}$/.test(reporte.codigo) && categorias.includes(reporte.categoria)
            && Number.isFinite(Date.parse(reporte.fecha));
    });
    if (!validos) throw new Error("Hay reportes con un formato que no se puede leer.");
    return reportes;
};

/* 4. CREAR UNA TARJETA PARA MOSTRAR UN REPORTE */
const crearTarjeta = (reporte) => {
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
    datos.forEach((dato) => {
        lista.append(crearElemento("dt", dato[0]), crearElemento("dd", dato[1]));
    });
    tarjeta.append(etiqueta, titulo, descripcion, lista);
    tarjeta.append(crearElemento("p", "Sin envío a entidades ni radicado oficial.", "form-help"));
    return tarjeta;
};

export {
    claveReportes,
    mostrarMensaje,
    crearElemento,
    normalizar,
    prepararFormulario,
    validarFormulario,
    leerReportes,
    crearTarjeta
};
