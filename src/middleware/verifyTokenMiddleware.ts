import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/JWTUtils";

//la clé secrète est nécessaire pour decrypter le token
const SECRET_KEY = process.env.JWT_SECRET

export function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        if (!SECRET_KEY) {
            throw new Error("JWT_SECRET non présente dans les variables d'environnement")
        }

        const cookie = req.headers.cookie;

        if (!cookie) {
            res.status(401).json({ message: "Access denied. Cookie missing" });
            return;
        }

        //le cookie contient une donnée sous la forme jwt=....
        const token = cookie.split('=')[1];



        //Vérifier si le token est présent
        if (!token) {
            res.status(401).json({ message: 'Access Denied. Token Missing.' })
            return;
        }


        //Vérifier le token
        const decoded = verifyToken(token);

        //on ajoute les données décodées dans la requête
        req.headers.payload = JSON.stringify(decoded);

        //passer au middleware suivant (ou au contrôleur)
        next();

        if (!decoded) {
            res.status(401).send({ message: 'Token invalide ou expiré' })
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }

}