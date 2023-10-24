import { randomUUID } from 'node:crypto'
import { Database } from "../database/database.js";
import { buildRoutePath } from "../utils/build-route-path.js";

const database = new Database()

export const taskController = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        name: search,
        email: search,
      } : null)
      return res
        .end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const {name, email} = req.body
      const task = {
        id: randomUUID(),
        name,
        email,
      }
      database.insert('tasks', task)
      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { name, email } = req.body
      database.update('tasks', id, {
        name,
        email,
      })
      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
  }
]
