import { randomUUID } from 'node:crypto'
import {Database} from "./database.js";
import {buildRoutePath} from "./utils/build-route-path.js";

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/status'),
    handler: (req, res) => {
      return res.writeHead(200)
        .end(JSON.stringify(
          {
            "status": 200,
            "message": "It's running!"
          }
        ))
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null)
      return res
        .end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const {title, description} = req.body

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify(
            {
              "status": 400,
              "message": "Title is required! Please, try again."
            }
          ));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify(
            {
              "status": 400,
              "message": "Description is required! Please, try again."
            }
          ))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
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

      const [task] = database.select('tasks', { id })
      console.log(task)
      if (task === undefined) {
        return res
          .writeHead(404)
          .end(JSON.stringify(
            {
              "status": 404,
              "message": "Task Not Found."
            }
          ));
      }

      const {title, description} = req.body
      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify(
            {
              "status": 400,
              "message": "Title is required! Please, try again."
            }
          ));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify(
            {
              "status": 400,
              "message": "Description is required! Please, try again."
            }
          ))
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      })
      return res.writeHead(201).end(task)
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      // const [task] = database.select('tasks', id)

      database.update('tasks', id, {
        "completed_at": new Date(),
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
