import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import db from "./config/db.js"

const app = express()

try {
    await db.authenticate()
    console.log("Conexion exitosa a la BD")
} catch (error) {
    console.log(error)
}

app.set("view engine", "pug")
app.set("views", "./views")

app.use(express.static("public"))

app.use("/auth", usuarioRoutes)

const PORT = 3000

app.listen(PORT, ()=>{
    console.log(`Corriendo en el puerto ${ PORT }`)
})