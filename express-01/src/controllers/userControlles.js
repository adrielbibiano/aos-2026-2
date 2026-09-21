import * as userService from "../services/userService.js";

export const getAllUsers = async (req, res) => {
  const users = await userService.findAll(req.context.models.User);
  return res.json(users);
};

export const getUserById = async (req, res) => {
  return res.json(req.user);
};

export const createUser = async (req, res) => {
  const user = await userService.create(req.context.models.User, req.body);
  return res.status(201).json(user);
};

export const updateUser = async (req, res) => {
  const user = await userService.update(
    req.context.models.User,
    req.params.userId,
    req.body
  );

  return res.json(user);
};

export const deleteUser = async (req, res) => {
  await userService.remove(req.context.models.User, req.params.userId);

  return res.json({ message: "Usuário removido com sucesso." });
};