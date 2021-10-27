const fs = require('fs')

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync('./api-proxy/selfsigned.key'),
      cert: fs.readFileSync('./api-proxy/selfsigned.crt')
    },
    public: 'https://localhost:8080/'
  }
}
