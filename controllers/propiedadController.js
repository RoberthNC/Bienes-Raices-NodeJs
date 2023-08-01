import Precio from "../models/Precio.js"
import Categoria from "../models/Categoria.js"

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
        categorias,
        precios
    })
}

export {
    admin,
    crear
}