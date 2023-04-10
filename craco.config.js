module.exports = {
  webpack: {
      configure: {
          target: 'electron-renderer'
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }
  }
}
