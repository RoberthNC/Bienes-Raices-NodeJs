import { check, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import Usuario from "../models/Usuario.js"
import { generarId, generarJWT } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"

const formularioLogin = (req, res) => {
    res.render("auth/login",{
        pagina:"Iniciar Sesión",
        csrfToken:req.csrfToken()
    })
}

const autenticar = async(req, res) => {
    await check("email").isEmail().withMessage("El email es obligatorio").run(req)
    await check("password").notEmpty().withMessage("El password es obligatorio").run(req)

    const resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render("auth/login",{
            pagina:"Inicia Sesión",
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })
    }

    const usuario = await Usuario.findOne({where:{ email:req.body.email }})

    if(!usuario){
        return res.render("auth/login",{
            pagina:"Inicia Sesión",
            csrfToken:req.csrfToken(),
            errores:[{msg:"El usuario no existe"}]
        })
    }

    if(!usuario.confirmado){
        return res.render("auth/login",{
            pagina:"Inicia Sesión",
            csrfToken:req.csrfToken(),
            errores:[{msg:"Tu cuenta no ha sido confirmada"}]
        })
    }

    if(!usuario.verificarPassword(req.body.password)){
        return res.render("auth/login",{
            pagina:"Inicia Sesión",
            csrfToken:req.csrfToken(),
            errores:[{msg:"El password es incorrecto"}]
        })
    }

    const token = generarJWT({ id:usuario.id, nombre:usuario.nombre })

    return res.cookie("_token", token, {
        httpOnly: true,
    }).redirect("/mis-propiedades")
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
        pagina:"Recupera tu acceso a Bienes Raíces",
        csrfToken:req.csrfToken()
    })
}

const resetPassword = async(req, res) => {
    await check("email").isEmail().withMessage("Ese no parece un email").run(req)
    const resultado = validationResult(req)
    if(!resultado.isEmpty()){
        return res.render("auth/olvide-password",{
            pagina: "Recupera tu acceso a Bienes Raíces",
            csrfToken: req.csrfToken(),
            errores:resultado.array()
        })
    }

    const usuario = await Usuario.findOne({where:{ email:req.body.email }})

    if(!usuario){
        return res.render("auth/olvide-password",{
            pagina:"Recupera tu acceso a Bienes Raíces",
            csrfToken:req.csrfToken(),
            errores:[{msg:"El email no pertenece a ningún usuario"}]
        })
    }

    usuario.token = generarId()
    await usuario.save()

    emailOlvidePassword({
        email:usuario.email,
        nombre:usuario.nombre,
        token:usuario.token
    })

    res.render("templates/mensaje",{
        pagina:"Reestablece tu Password",
        mensaje:"Hemos enviado un email con las instrucciones"
    })

}

const comprobarToken = async(req, res) => {
    const { token } = req.params
    const usuario = await Usuario.findOne({where:{token}})

    if(!usuario){
        return res.render("auth/confirmar-cuenta",{
            pagina:"Reestablece tu password",
            mensaje:"Hubo un error al validar tu información",
            error:true
        })
    }

    res.render("auth/reset-password",{
        pagina:"Reestablece tu password",
        csrfToken:req.csrfToken()
    })
}

const nuevoPassword = async(req, res) => {
    await check("password").isLength({min:6}).withMessage("El password debe contener al menos 6 caracteres").run(req)
    const resultado = validationResult(req)

    if(!resultado.isEmpty()){
        return res.render("auth/reset-password",{
            pagina:"Reestablece tu password",
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })
    }

    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({where:{token}})

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null

    await usuario.save()

    res.render("auth/confirmar-cuenta",{
        pagina:"Password Reestablecido",
        mensaje:"El password se guardó correctamente"
    })
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}