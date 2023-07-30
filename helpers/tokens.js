const generarId = () => Math.random().toString().substring(2) + Date.now().toString()

export {
    generarId
}