import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


const startServer = async () => {
    await connectDB();

}

startServer();

export default app;
