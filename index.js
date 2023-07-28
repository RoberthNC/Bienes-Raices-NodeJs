import express from "express"

const app = express()

app.get("/", (req, res)=>{
    res.json({msg:"Hola"})
})

const PORT = 3000

app.listen(PORT, ()=>{
    console.log(`Corriendo en el puerto ${ PORT }`)
})