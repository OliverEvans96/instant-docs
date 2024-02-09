---
title: Getting started
pageTitle: Instant - The Modern Firebase.
description: Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like Notion or Figma.
---

Instant is the Modern Firebase. With Instant you can easily build realtime and collaborative apps like Notion or Figma. **These are early days for Instant, there is much to build and we're excited for what's ahead**.

Have questions? {% blank-link href="https://discord.com/invite/VU53p7uQcE" label="Join us on discord!" /%}

---

## Quick start

To use Instant in a brand new project fire up your terminal and do the following:

```shell {% showCopy=true %}
npx create-next-app -e hello-world instant-demo
cd instant-demo
npm i @instantdb/react
npm run dev
```

Now open up `app/page.tsx` in your favorite editor and replace the entirity of the file with the following code.

```javascript {% showCopy=true %}
'use client'

import { useState } from 'react'
import { init, transact, tx, id, useQuery } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'

init({ appId: APP_ID })

function App() {
  const [visible, setVisible] = useState('all')

  // Read Data
  const { isLoading, error, data } = useQuery({ todos: {} })
  if (isLoading) {
    return <div>Fetching data...</div>
  }
  if (error) {
    return <div>Error fetching data: {error.message}</div>
  }

  const visibleTodos = data.todos
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .filter((todo) => {
      if (visible === 'all') return true
      return visible === 'remaining' ? !todo.done : todo.done
    })

  return (
    <div style={styles.container}>
      <div style={styles.header}>todos</div>
      <TodoForm todos={data.todos} />
      <TodoList todos={visibleTodos} />
      <ActionBar todos={data.todos} setVisible={setVisible} />
      <div style={styles.footer}>
        Open another tab to see todos update in realtime!
      </div>
    </div>
  )
}

// Write Data
// ---------
function addTodo(text) {
  transact(
    tx.todos[id()].update({
      text,
      done: false,
      createdAt: new Date(),
    })
  )
}

function deleteTodo(todo) {
  transact(tx.todos[todo.id].delete())
}

function toggleDone(todo) {
  transact(tx.todos[todo.id].update({ done: !todo.done }))
}

function deleteCompleted(todos) {
  const completed = todos.filter((todo) => todo.done)
  const txs = completed.map((todo) => tx.todos[todo.id].delete())
  transact(txs)
}

function toggleAll(todos) {
  const newVal = !todos.every((todo) => todo.done)
  transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })))
}

// Components
// ----------
function TodoForm({ todos }) {
  return (
    <div style={styles.form}>
      <div style={styles.toggleAll} onClick={() => toggleAll(todos)}>
        ⌄
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo(e.target[0].value)
          e.target[0].value = ''
        }}
      >
        <input
          style={styles.input}
          autoFocus
          placeholder="What needs to be done?"
          type="text"
        />
      </form>
    </div>
  )
}

function TodoList({ todos }) {
  return (
    <div style={styles.todoList}>
      {todos.map((todo) => (
        <div key={todo.id} style={styles.todo}>
          <input
            type="checkbox"
            key={todo.id}
            style={styles.checkbox}
            checked={todo.done}
            onChange={() => toggleDone(todo)}
          />
          <div style={styles.todoText}>
            {todo.done ? (
              <span style={{ textDecoration: 'line-through' }}>
                {todo.text}
              </span>
            ) : (
              <span>{todo.text}</span>
            )}
          </div>
          <span onClick={() => deleteTodo(todo)} style={styles.delete}>
            𝘟
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionBar({ setVisible, todos }) {
  return (
    <div style={styles.actionBar}>
      <div># Remain: {todos.filter((todo) => !todo.done).length}</div>
      <div>
        <span
          style={{ marginRight: '5px', cursor: 'pointer' }}
          onClick={() => setVisible('all')}
        >
          All
        </span>
        <span
          style={{ marginRight: '5px', cursor: 'pointer' }}
          onClick={() => setVisible('remaining')}
        >
          Remaining
        </span>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => setVisible('completed')}
        >
          Completed
        </span>
      </div>
      <div style={{ cursor: 'pointer' }} onClick={() => deleteCompleted(todos)}>
        Clear Completed
      </div>
    </div>
  )
}

// Styles
// ----------
const styles = {
  container: {
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
    fontFamily: 'code, monospace',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  header: {
    letterSpacing: '2px',
    fontSize: '50px',
    fontColor: 'lightgray',
    marginBottom: '10px',
  },
  form: {
    boxSizing: 'inherit',
    display: 'flex',
    aignItems: 'center',
    border: '1px solid lightgray',
    borderBottomWidth: '0px',
    width: '350px',
  },
  toggleAll: {
    fontSize: '30px',
    cursor: 'pointer',
    marginLeft: '11px',
    marginTop: '-6px',
    width: '15px',
    marginRight: '12px',
  },
  input: {
    backgroundColor: 'transparent',
    fontFamily: 'code, monospace',
    width: '287px',
    padding: '10px',
    fontStyle: 'italic',
  },
  todoList: {
    boxSizing: 'inherit',
    width: '350px',
  },
  checkbox: {
    fontSize: '30px',
    marginLeft: '5px',
    marginRight: '20px',
    cursor: 'pointer',
  },
  todo: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid lightgray',
    borderBottomWidth: '0px',
  },
  todoText: {
    flexGrow: '1',
    overflow: 'hidden',
  },
  delete: {
    width: '25px',
    cursor: 'pointer',
    color: 'lightgray',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '328px',
    padding: '10px',
    border: '1px solid lightgray',
    fontSize: '10px',
  },
  footer: {
    marginTop: '20px',
    fontSize: '10px',
  },
}

export default App
```

Go to `localhost:3000` and follow the final instruction to load the app!

Huzzah 🎉 You've got your first Instant web app running! Check out the [**Explore**](/docs/init) section to learn more about how to use Instant :)
