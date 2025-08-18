import token from "../services/token.js";

export default {
  authVerify: async (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(404).send({
        message: "No token provided",
      });
    }
    const tokenOnly = req.headers.authorization.split(" ")[1];
    console.log("verificando token... ", tokenOnly);
    const response = await token.decode(tokenOnly);
    console.log("response: " + response);
    if (response) {
      // req.user = response._id;
      req.user = response._id.toString();
      next();
    } else {
      return res.status(403).send({
        message: "Invalid token",
      });
    }
  },

  setUser: async (req, res, next) => {
    if (req.headers.authorization) {
      const tokenOnly = req.headers.authorization.split(" ")[1];
      const response = await token.decode(tokenOnly);
      if (response) {
        req.user = response._id.toString();
        next();
      }
    } else {
      next()
    }
  },
};
