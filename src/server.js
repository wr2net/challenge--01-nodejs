import http from 'node:http'
import { status } from 'controllers/routes';

const server = http.createServer(async (req, res) => {
  const { method, url } = req
  await json(req, res)

  const route = status.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routerParams = req.url.match(route.path)
    const { query, ...params } = routerParams.groups

    req.params = params
    req.query = query ? extractQueryParams(query) : {}

    return route.handler(req, res)
  }

  return res.writeHead(404).end()
})

server.listen(3333)
