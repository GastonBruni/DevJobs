const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require("express-validator"); 

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    });
}

//agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

   // crear arreglo de habilidades (skills)
   vacante.skills = req.body.skills.split(',');

   // usuario autor de la vancate
   vacante.autor = req.user._id;

    //almacenarlo en la base de datos
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
} 

// muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });
    
    // si no hay resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async(req,res,next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if(!vacante) return next;

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

// sanitizar y validar el formulario de vacantes
exports.validarVacante = async (req, res, next) => {
    // Sanitizar
    const rules = [
        body("titulo").not().isEmpty().withMessage("Agrega un Titulo a la Vacante").escape(),
        body("empresa").not().isEmpty().withMessage("Agrega una Empresa").escape(),
        body("ubicacion").not().isEmpty().withMessage("Agrega una Ubicación").escape(),
        body("contrato").not().isEmpty().withMessage("Selecciona el Tipo de Contrato").escape(),
        body("skills").not().isEmpty().withMessage("Agrega al menos una habilidad").escape(),
      ];

      await Promise.all(rules.map((validation) => validation.run(req)));
      const errores = validationResult(req);
    // validar
    if(errores) {
        // Recargar la vista con los errores
        req.flash("error",errores.array().map((error) => error.msg));

            res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Llena el formulario y publica tu vacante',
                cerrarSesion: true,
                nombre : req.user.nombre,
                mensajes: req.flash()
            });
            return;
        }
        next();
    }
 