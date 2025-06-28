/**
 * Archivo de exportación de modelos
 * Centraliza la exportación de todos los modelos de la aplicación
 */

// Importar todos los modelos
const Usuario = require('./Usuario');
const UsuarioRol = require('./UsuarioRol');
const CicloAcademico = require('./CicloAcademico');
const EstadoSistema = require('./EstadoSistema');
const Semestre = require('./Semestre');
const Carrera = require('./Carrera');
const CodigoInstitucional = require('./CodigoInstitucional');
const Asignatura = require('./Asignatura');
const DocenteAsignatura = require('./DocenteAsignatura');
const Actividad = require('./Actividad');
const Portafolio = require('./Portafolio');
const Estructura = require('./Estructura');
const Notificacion = require('./Notificacion');
const ArchivoSubido = require('./ArchivoSubido');
const Observacion = require('./Observacion');
const RespuestaObservacion = require('./RespuestaObservacion');
const VerificadorDocente = require('./VerificadorDocente');
const ArchivoCargaMasiva = require('./ArchivoCargaMasiva');

// Importar asociaciones
require('./asociaciones');

// Exportar todos los modelos
module.exports = {
  Usuario,
  UsuarioRol,
  CicloAcademico,
  EstadoSistema,
  Semestre,
  Carrera,
  CodigoInstitucional,
  Asignatura,
  DocenteAsignatura,
  Actividad,
  Portafolio,
  Estructura,
  Notificacion,
  ArchivoSubido,
  Observacion,
  RespuestaObservacion,
  VerificadorDocente,
  ArchivoCargaMasiva
};
