import { check, validationResult } from "express-validator"

import Usuario from "../models/Usuario.js"
import { generarId } from "../helpers/tokens.js"
import { emailRegistro } from "../helpers/emails.js"

const formularioLogin = (req, res) => {
    res.render("auth/login",{
        pagina:"Iniciar Sesión"
    })
}

const formularioRegistro = (req, res) => {
    res.render("auth/registro",{
        pagina:"Crear Cuenta",
        csrfToken:req.csrfToken()
    })
}

const registrar = async(req, res) => {
    await check('nombre').notEmpty().withMessage("El nombre es obligatorio").run(req)
    await check('email').isEmail().withMessage("Ingrese un email correcto").run(req)
    await check('password').isLength({min:6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Los passwords deben ser iguales").run(req)

    let resultado = validationResult(req)
    
    if(!resultado.isEmpty()){
        return res.render("auth/registro",{
            pagina:"Crear Cuenta",
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        })
    }

    const existeUsuario = await Usuario.findOne({where: { email: req.body.email }})

    if(existeUsuario){
        return res.render("auth/registro",{
            pagina:"Crear Cuenta",
            csrfToken:req.csrfToken(),
            errores:[{msg: "El usuario ya está registrado"}],
            usuario:{
                nombre:req.body.nombre,
                email:req.body.email
            }
        })
    }

    const { nombre, email, password } = req.body
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()
    })

    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })

    res.render("templates/mensaje",{
        pagina:"Cuenta Creada Correctamente",
        mensaje:"Hemos enviado un email de confirmación, presiona en el enlace"
    })
}

const confirmar = async(req, res, next) => {
    const { token } = req.params

    const usuario = await Usuario.findOne({where:{ token }})

    if(!usuario){
        return res.render("auth/confirmar-cuenta",{
            pagina:"Error al confirmar tu cuenta",
            mensaje:"Hubo un error al confirmar tu cuenta, intenta de nuevo",
            error:true
        })
    }
    
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    res.render("auth/confirmar-cuenta",{
        pagina:"Cuenta Confirmada",
        mensaje:"La cuenta se confirmó correctamente",
        error:false
    })
}

const formularioOlvidePassword = (req, res) => {
    res.render("auth/olvide-password",{
        pagina:"Recupera tu acceso a Bienes Raíces"
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}