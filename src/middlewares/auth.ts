import { NextFunction, Request, Response } from "express";
import * as jose from "jose"
import dotenv from 'dotenv'


dotenv.config()

const JWKS = jose.createRemoteJWKSet(
    new URL(`${process.env.HANKO_API_URL}/.well-known/jwks.json`)
  );

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies.hanko
    console.log('Cookie: ', token, typeof(token))

    // Extracting the token
    if (req.cookies && req.cookies.hanko ) {
      token = req.cookies.hanko;
    } else if ( req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer" ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token === null || (token && token.length === 0) ) {
      res.status(401).send("Unauthorized");
      return;
    }

    // Verifying the token
    let authError = false;
    await jose.jwtVerify(token, JWKS).catch((err) => {
      authError = true;
      console.log(err);
    });

    if (authError) {
      res.status(401).send("Authentication Token not valid");
      return;
    }
    next()
  } catch (error) {
    console.log("Error:", error)
  }
  
}