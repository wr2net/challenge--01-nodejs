import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import multer from "multer"
import csvParser from "csv-parser";

const database = new Database()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({
  fileFilter,
});

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

      const id = randomUUID();
      const task = {
        id: id,
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task)
      const [Task] = database.select('tasks', { id })
      return res.writeHead(201).end(JSON.stringify(Task))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const [task] = database.select('tasks', { id })

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

      const dateToUpdate = new Date()
      task.title = title
      task.description = description
      task.updated_at = dateToUpdate

      if (task.updated_at !== dateToUpdate) {
        return res.writeHead(304).end(JSON.stringify(
          {
            "status": 304,
            "message": "Task Not Updated! Please, try again."
          }
        ))
      } else {
        return res.writeHead(201).end(JSON.stringify(task))
      }
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const [task] = database.select('tasks', { id })

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

      task.completed_at = new Date()
      return res.writeHead(200).end(JSON.stringify(task))
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })
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

      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/import', upload.single('file')),
    handler: async (req, res) => {
      const { file } = req
      console.log(file)

      // const parsedData = await csvParser.parse(req.file.buffer)
      // console.log(parsedData)
      // await database.insertMany('tasks', parsedData)

      return res.writeHead(200).end(
        JSON.stringify(
          {
            "status": 200,
            "message": "Import completed successfully."
          }
        ))
    }
  }
]
