import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js"

const app = express()

app.set("view engine", "pug")
app.set("views", "./views")

app.use(express.static("public"))

app.use("/auth", usuarioRoutes)

const PORT = 3000

app.listen(PORT, ()=>{
    console.log(`Corriendo en el puerto ${ PORT }`)
})