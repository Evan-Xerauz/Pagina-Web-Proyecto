/* MEJORA BOGOTÁ
   JavaScript para las páginas del proyecto.
   Los reportes se guardan solo en este navegador.
   Las fotografías son una vista previa y no se guardan.
*/

"use strict";

import {
    iniciarCreacion,
    iniciarFoto,
    iniciarExploracion,
    iniciarSeguimiento,
    iniciarContacto
} from "./funcionalidades.js";

/* Asistente básico compartido por todas las páginas. */
import { iniciarChatbot } from "./chatbot.js";

/* 10. INICIO: cada función comprueba si está en la página correspondiente.
   El módulo se ejecuta cuando el HTML está cargado. */
iniciarCreacion();
iniciarFoto();
iniciarExploracion();
iniciarSeguimiento();
iniciarContacto();

/* Se añade el chatbot sin cambiar las funciones anteriores. */
iniciarChatbot();
