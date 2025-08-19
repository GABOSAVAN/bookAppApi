import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

// ....

dotenv.config();

// Conexión a MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// Rutas de prueba
app.get("/", (req, res) => {
    res.send("📚 API Book Review funcionando");
});

app.use("/api", routes);

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

//Solo para el droplet
export default app;