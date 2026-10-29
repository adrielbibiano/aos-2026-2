
import "dotenv/config";
import express from "express";
import Sequelize from "sequelize";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";
import AppError from "./utils/appError.js";
import helmet from "helmet";
import corsMiddleware from "./middlewares/cors.js";

const app = express();

app.set("trust proxy", true);

// Middlewares
// Middlewares de segurança
app.use(helmet());
app.use(corsMiddleware);

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logs
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Middleware de autenticação "fake"
// + injeção dos models no req.context
app.use(async (req, res, next) => {
  req.context = {
    models,
    me: await models.User.findByLogin("rwieruch"),
  };

  next();
});

// Rotas
app.get("/", (req, res) => {
  return res.send("Servidor express exectuando...");
});

app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);


// ======================================================
// MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS
// Deve ficar DEPOIS de todas as rotas
// ======================================================


app.use((err, req, res, next) => {
  // Se a resposta já começou, delega o erro ao Express.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let status = "error";
  let message = "Algo deu errado no servidor";

  // 1. Erro de validação do Sequelize
  if (err instanceof Sequelize.ValidationError) {
    statusCode = 400;
    status = "fail";

    message = err.errors
      .map((error) => error.message)
      .join(", ");
  }

  // 2. Violação de unicidade: registro duplicado
  if (err instanceof Sequelize.UniqueConstraintError) {
    statusCode = 409;
    status = "fail";

    message =
      err.errors?.map((error) => error.message).join(", ") ||
      "Registro duplicado";
  }

  // 3. Erro operacional previsto pela aplicação
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  const response = {
    status,
    message,
  };

  // Stack trace somente em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
});


// ======================================================
// INICIALIZAÇÃO DO SERVIDOR
// ======================================================

const port = process.env.PORT || 3000;

const eraseDatabaseOnSync =
  process.env.ERASE_DATABASE_ON_SYNC === "true";

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }

  app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`),
  );
});

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: "rwieruch",
      email: "rwieruch@email.com",
      messages: [
        {
          text: "Published the Road to learn React",
        },
      ],
    },
    {
      include: [models.Message],
    },
  );

  await models.User.create(
    {
      username: "ddavids",
      email: "ddavids@email.com",
      messages: [
        {
          text: "Happy to release ...",
        },
        {
          text: "Published a complete ...",
        },
      ],
    },
    {
      include: [models.Message],
    },
  );
};