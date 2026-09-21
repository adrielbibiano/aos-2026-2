export const checkUserExists = async (req, res, next) => {
    const user = await req.context.models.User.findByPk(req.params.userId);
  
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado."
      });
    }
  
    req.user = user;
  
    next();
  };