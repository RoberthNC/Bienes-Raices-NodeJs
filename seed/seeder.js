import { exit } from "node:process"
import categorias from "./categorias.js"
import precios from "./precios.js"
import usuarios from "./usuarios.js"
import { Categoria, Precio, Usuario } from "../models/index.js"
import db from "../config/db.js"

const importarDatos = async() => {
    try {
        await db.authenticate()
        await db.sync()

        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])
        console.log("Datos importados correctamente...")
        exit()
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const limpiarDatos = async() => {
    try {
        await Promise.all([
            Categoria.destroy({where:{}, truncate:true}),
            Precio.destroy({where:{}, truncate:true})
        ])
        console.log("Datos eliminados correctamente...")
        exit()
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i"){
    importarDatos()
}
if(process.argv[2] === "-l"){
    limpiarDatos()
}