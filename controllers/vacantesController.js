const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require("express-validator");

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
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
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');

    // si no hay resultados
    if (!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if (!vacante) return next;

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
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
    if (!errores) {
        // Recargar la vista con los errores
        req.flash("error", errores.array().map((error) => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
        return;
    }
    next();
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if (verificarAutor(vacante, req.user)) {
        // todo bien, si es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error');
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }
    return true;
}

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archvio es muy grande: Máximo 500kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

// Opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 500000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, (`${shortid.generate()}.${extension}`));
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            // el callback se ejecuta como true o false true: cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url: req.params.url });

    // sino existe la vacante
    if (!vacante) return next();

    // si existe, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // almacenar la vacante en la BD
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if (vacante.autor != req.user._id.toString()) {
        return next();
    }

    if (!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}