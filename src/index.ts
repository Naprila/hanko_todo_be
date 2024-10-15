
import express, { Express, Request, Response } from "express"
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v4 as uuidv4 } from 'uuid';
import cors from "cors"
import authMiddleware from "./middlewares/auth";

const app : Express = express()

const isDev = app.settings.env === "development";
const validURL = isDev
  ? "http://localhost:3000"
  : "https://hanko-todo-fe.vercel.app/";

const corsOptions = {
    origin: validURL, // Specify the origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions))
const PORT = process.env.PORT || 3001 
dotenv.config()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));



interface TodoProp {
    id: string,
    text: string,
}

let TODOS: TodoProp[] = [{
    id: "1",
    text: "GYM",
}];


app.get("/todos", (req: Request, res: Response) => {
    res.status(200).json({ todo: TODOS})
})


app.post('/todos/create', authMiddleware, (req: Request, res: Response) => {
    const { text } = req.body;

    TODOS.push({
        id: uuidv4(),
        text,
    })
    res.status(200).json({ todo: TODOS})
    return
})

app.post('/todos/delete', authMiddleware, (req: Request, res: Response) => {
    const { todoId } = req.body

    const validTodo = TODOS.find((todo) => todo.id === todoId)
    if (!validTodo) {
        res.status(400).send("Invalid todoId")
        return
    }

    TODOS = TODOS.filter((todo) => todo.id !== todoId)
    res.status(200).json({todo: TODOS})
    return
})

app.listen(PORT, ( () => {
    console.log(`Server is up at http://localhost:${PORT}`)
}))