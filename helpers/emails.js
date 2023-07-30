import nodemailer from "nodemailer"

const emailRegistro = async(datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    })

    const { email, nombre, token } = datos

    await transport.sendMail({
        from:"BienesRaices.com",
        to:email,
        subject:"Confirma tu cuenta en BienesRaices.com",
        text:"Confirma tu cuenta en BienesRaices.com",
        html:`
            <p>Hola ${nombre} comprueba tu cuenta en BienesRaices.com</p>

            <p>Tu cuenta ya está lista, solo debes confirmarla en el siguiente enlace:</p>
            <a href=${process.env.BACKEND_URL}:${process.env.PORT || 3000}/auth/confirmar/${token}>Confirmar Cuenta</a>
            <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `
    })
}

export {
    emailRegistro
}