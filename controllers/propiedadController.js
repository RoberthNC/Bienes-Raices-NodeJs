import { validationResult } from "express-validator"
import { Precio, Categoria, Propiedad } from "../models/index.js"

const admin = (req, res) => {
    res.render("propiedades/admin",{
        pagina:"Mis Propiedades",
        barra:true
    })
}

const crear = async(req, res) => {
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
    res.render("propiedades/crear",{
        pagina:"Crear Propiedad",
        barra:true,
        csrfToken:req.csrfToken(),
        categorias,
        precios,
        datos:req.body
    })
}

const guardar = async(req, res) => {
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        const [ categorias, precios ] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render("propiedades/crear",{
            pagina:"Crear Propiedad",
            barra: true,
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos:req.body
        })
    }

    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio:precioId, categoria:categoriaId } = req.body

    const { id:usuarioId } = req.usuario

    try {
        const propiedadAlmacenada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen:""
        })

        const { id } = propiedadAlmacenada

        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)
    }
}

export {
    admin,
    crear,
    guardar
}