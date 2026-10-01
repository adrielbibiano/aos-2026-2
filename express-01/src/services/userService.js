export const findAll = async (User) => {
    return await User.findAll();
  };
  
  export const findById = async (User, id) => {
    return await User.findByPk(id);
  };
  
  export const create = async (User, data) => {
    return await User.create(data);
  };
  
  export const update = async (User, id, data) => {
    const user = await User.findByPk(id);
  
    if (!user) return null;
  
    await user.update(data);
  
    return user;
  };
  
  export const remove = async (User, id) => {
    const user = await User.findByPk(id);
  
    if (!user) return null;
  
    await user.destroy();
  
    return true;
  };