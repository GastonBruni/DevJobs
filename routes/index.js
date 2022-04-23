const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)

    // crear vacantes
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.agregarVacante);
    
    // Mostrar Vacante (singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    
    // Editar Vacante
    router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.editarVacante);

    // Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Panel de administracion
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

    return router;
}