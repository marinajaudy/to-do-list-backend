import express, { Request, Response } from 'express'
import cors from 'cors'
import {db} from './database/knex'
import { idText } from 'typescript'
import { TUserDB } from './type'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm)

        if(searchTerm === undefined){
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        
        const {id, name, email, password} = req.body

        if(!id || !name || !email || !password){
            res.status(400)
            throw new Error("Id, name, email ou password não informado")
        }

        if(typeof id !== "string" &&
        typeof name !== "string" &&
        typeof email !== "string" &&
        typeof password !== "string"){
            res.status(400)
            throw new Error("Id, name, email e password são strings.")
        }

        if(id.length <= 3){
            res.status(400)
            throw new Error("Id tem que ter pelo menos 4 caratcteres.")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
            throw new Error("Parâmetro 'email' inválido")
        }

        const [userIdAlreadyExist]: TUserDB[] | undefined = await db("users").where({id: id})

        if(userIdAlreadyExist){
            res.status(400)
            throw new Error("Id já existe.")
        }

        const [userEmailAlreadyExist]: TUserDB[] | undefined = await db("users").where({email: email})

        if(userEmailAlreadyExist){
            res.status(400)
            throw new Error("Email já existe.")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)
        res.status(201).send({
            message: "User criado com sucesso",
            user: newUser
        })


    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
