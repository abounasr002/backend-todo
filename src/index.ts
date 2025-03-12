import express from "express";
import dotenv from "dotenv"
import TodoRoutes from "./routes/TodoRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from './config/swagger';
import { testConnection } from "./config/database";
import { syncDatabase } from "./models/syncModels";
import cors from 'cors';
import cookieParser from "cookie-parser";

//Création serveur express
const app = express()

//chargement des variables d'environnement
dotenv.config()

//Définition du port du serveur
const PORT = process.env.PORT

// Activer CORS uniquement pour une seule origine
//curl ifconfig.me pour connaître l'ip publique de votre pc
const corsOptions = {
    origin: process.env.CLIENT_URL, // Placer le domaine du client pour l'autoriser
    methods: 'GET,POST,DELETE,PUT', // Restreindre les méthodes autorisées
    allowedHeaders: ["Content-Type", "Authorization"], // Définir les en-têtes acceptés
    credentials: true, // Autoriser les cookies et les headers sécurisés (dont celui qui contient le jwt)
};

app.use(cors(corsOptions));



//COnfig du serveur par défaut
app.use(express.json());


// Connecter à Sequelize
testConnection().then(() => syncDatabase());


//TODO ajouter routes ici
app.use('/todos', TodoRoutes)
app.use('/auth', AuthRoutes)

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


//app.listen indique au serveur d'écouter les requêtes HTTP arrivant sur le
//port indiqué
app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.API_URL}:${PORT}`);
});

