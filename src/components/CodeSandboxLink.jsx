import reactSandboxURI from '@/components/reactSandboxURI'

const counterExample = `
import { useEffect } from 'react'

import { useInit, useQuery, tx, transact } from '@instantdb/react'

const APP_ID = 'REPLACE ME'

function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: 'wss://api.instantdb.com/runtime/sync',
    apiURI: 'https://api.instantdb.com',
  })
  if (isLoading) {
    return (
      <div>
        If you are seeing this you likely need to replace <b>APP_ID</b> on line
        5<br />
        <br />
        You can get your APP_ID by{' '}
        <a href="https://instantdb.com/dash" target="_blank" rel="noreferrer">
          logging into your Instant dashboard
        </a>
        . After replacing the id you may need to reload the page.

      </div>
    )
  }
  if (error) {
    return <div>Oi! {error?.message}</div>
  }
  return <Counter />
}

function Counter() {
  const query = {
    counter: {
      $: {
        where: {
          id: 'singleton',
        },
        cardinality: 'one',
      },
    },
  }
  const { counter } = useQuery(query)
  const count = counter?.count || 0
  useEffect(() => {
    if (!count) {
      transact([tx.counter['singleton'].update({ count: 1 })])
    }
  }, [])
  return (
    <button
      onClick={() =>
        transact([tx.counter['singleton'].update({ count: count + 1 })])
      }
    >
      {count}
    </button>
  )
}

export default App
`.trim()

const goalsAndTodosExample = `
import { useInit, useQuery, tx, transact, id, auth } from "@instantdb/react";

const APP_ID = "REPLACE ME";

function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: 'wss://api.instantdb.com/runtime/sync',
    apiURI: 'https://api.instantdb.com',
  });
  if (isLoading) {
    return <div>
      If you're seeing this you likely need to replace <b>APP_ID</b> on line 3<br/><br/>
      {" "}You can get your APP_ID by <a href="https://instantdb.com/dash" target="_blank">logging into your Instant dashboard</a>. After replacing the id you may need to hit the codesandbox "reload" icon.
    </div>;
  }
  if (error) {
    return <div>Oi! {error?.message}</div>;
  }

  return <Main />;
}

function Button({ onClick, label }) {
  return (
    <div style={{ margin: "10px 0px" }}>
      <button onClick={onClick}>{label}</button>
    </div>
  );
}

function Main() {
  const query = { goals: { todos: {} } };
  const data = useQuery(query);
  const goalIds = data.goals.map(g => g.id)
  const todoIds = data.goals.flatMap(g => g.todos.map(t => t.id))
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button
        onClick={() => {
          transact([
            tx.goals["health"].update({ title: "Get fit!" }),
            tx.goals["work"].update({ title: "Get promoted!" })

          ]);
        }}
        label="Create goals"
      />
      <Button
        onClick={() => {
          transact([
            tx.goals[id()].update({
              priority: "none",
              isSecret: true,
              value: 10,
              aList: [1, 2, 3],
              anObject: {foo: "bar"},
              title: ["eat", "sleep", "hack", "repeat"][Math.floor(Math.random() * 4)]})
          ]);
        }}
        label="Create random goal"
      />
      <Button
        onClick={() => {
          transact([
            ...goalIds.map(id => tx.goals[id].delete()),
           ...todoIds.map(id => tx.todos[id].delete())
          ]);
        }}
        label="Delete data"
      />
      <Button
        onClick={() => {
          transact([
            tx.todos["workout"].update({ title: "Go on a run" }),
            tx.todos["protein"].update({ title: "Drink protein" }),
            tx.todos["sleep"].update({ title: "Go to bed early" }),
            tx.todos["standup"].update({ title: "Do standup" }),
            tx.todos["reviewPRs"].update({ title: "Review PRs" }),
            tx.todos["focus"].update({ title: "Code a bunch" }),
            tx.goals["health"]
              .link({ todos: "workout" })
              .link({ todos: "protein" })
              .link({ todos: "sleep" }),
            tx.goals["work"]
              .link({ todos: "standup" })
              .link({ todos: "reviewPRs" })
              .link({ todos: "focus" }),
          ]);
        }}
        label="Link goals and todos"
      />
      <Button
        onClick={() => {
          transact([
            tx.goals["health"]
              .unlink({todos: "workout"})
              .unlink({todos: "protein"})
              .unlink({todos: "sleep"}),
            tx.goals["work"]
              .unlink({ todos: "standup" })
              .unlink({ todos: "reviewPRs" })
              .unlink({ todos: "focus" }),
          ]);
        }}
        label="Unlink goals and todos"
      />
    </div>
  );
}

export default App;
`.trim()

const uris = {
  'counter-example': reactSandboxURI(counterExample),
  'goals-and-todos': reactSandboxURI(goalsAndTodosExample),
}

export function CodeSandboxLink({ type, label, ...props }) {
  const href = uris[type]
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {label}
    </a>
  )
}
