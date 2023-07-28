import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js"

const app = express()

app.use("/", usuarioRoutes)

const PORT = 3000

app.listen(PORT, ()=>{
    console.log(`Corriendo en el puerto ${ PORT }`)
})