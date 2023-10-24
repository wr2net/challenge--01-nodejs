
export const statusController = [
  {
    method: 'GET',
    path: '/status',
    handler: (req, res) => {
      return res.writeHead(200)
        .end(JSON.stringify(
          {
            "status": 200,
            "version": "",
            "message": "It's running"
          }
        ))
    }
  }
]
