import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const searchQuery = { ...req.query }

      const sanitizedSearchQuery = Object.keys(searchQuery).reduce((acc, key) => {
        if (searchQuery[key] !== null && searchQuery[key] !== undefined) {
          acc[key] = searchQuery[key];
        }
        return acc;
      }, {});

      const tasks = database.select('tasks', Object.keys(sanitizedSearchQuery).length !== 0 ? {
        ...sanitizedSearchQuery
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(Date.now()).toISOString(),
        updated_at: new Date(Date.now()).toISOString(),
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
      const { title, description } = req.body

      const task = database.select('tasks', { id })[0]

      if (task) {
        const newTaskData = {
          ...(title !== null && title !== undefined && { title }),
          ...(description !== null && description !== undefined && { description }),
        };
        const updatedTask = { ...task, ...newTaskData }

        database.update('tasks', id, {
          ...updatedTask,
          updated_at: new Date(Date.now()).toISOString(),
        })
        return res.writeHead(204).end()

      }

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })[0]

      if (task) {
        task.completed_at = task.completed_at === null ? new Date(Date.now()).toISOString() : null
      }

      database.update('tasks', id, {
        ...task,
        updated_at: new Date(Date.now()).toISOString()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })[0]
      if (task) {
        database.delete('tasks', id)
      }

      return res.writeHead(204).end()
    }
  }
]
