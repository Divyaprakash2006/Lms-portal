module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Your custom middlewares can go here
      return middlewares;
    },
  },
};
