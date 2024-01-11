import reactSandboxURI from '@/components/reactSandboxURI'

const counterExample = `
import { init, useQuery, tx, transact } from "@instantdb/react";

const APP_ID = 'REPLACE ME'

init({
  appId: APP_ID,
  websocketURI: "wss://api.instantdb.com/runtime/session",
  apiURI: "https://api.instantdb.com",
});

const singletonId = "0c1b1794-87de-4b3c-8f11-b7b66290ffb0";

function App() {
  const query = {
    counters: {
      $: {
        where: {
          id: singletonId,
        },
      },
    },
  };
  const { isLoading, error, data } = useQuery(query);
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

  return <Counter data={data} />;
}

function Counter({ data }) {
  const counter = data.counters[0];
  console.log("⚡ + " + JSON.stringify(counter));
  const count = counter?.count || 0;

  return (
    <button
      onClick={() =>
        transact([tx.counters[singletonId].update({ count: count + 1 })])
      }
    >
      {count}
    </button>
  );
}

export default App;
`.trim()

const goalsAndTodosExample = `
import { init, useQuery, tx, transact, id } from "@instantdb/react";

const APP_ID = 'REPLACE ME'

init({
  appId: APP_ID,
  websocketURI: "wss://api.instantdb.com/runtime/session",
  apiURI: "https://api.instantdb.com",
});

const workoutId = id();
const proteinId = id();
const sleepId = id();
const standupId = id();
const reviewPRsId = id();
const focusId = id();
const healthId = id();
const workId = id();

function App() {
  const query = { goals: { todos: {} } };
  const { isLoading, error, data } = useQuery(query);
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

  return <Main data={data} />;
}

function Button({ onClick, label }) {
  return (
    <div style={{ margin: "10px 0px" }}>
      <button onClick={onClick}>{label}</button>
    </div>
  );
}

function Main({ data }) {
  const goalIds = data.goals.map(g => g.id)
  const todoIds = data.goals.flatMap(g => g.todos.map(t => t.id))
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button
        onClick={() => {
          transact([
            tx.goals[healthId].update({ title: "Get fit!" }),
            tx.goals[workId].update({ title: "Get promoted!" })

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
              title: ["eat", sleepId, "hack", "repeat"][Math.floor(Math.random() * 4)]})
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
            tx.todos[workoutId].update({title: "Go on a run"}),
            tx.todos[proteinId].update({title: "Drink protein"}),
            tx.todos[sleepId].update({title: "Go to bed early"}),
            tx.todos[standupId].update({title: "Do standup"}),
            tx.todos[reviewPRsId].update({title: "Review PRs"}),
            tx.todos[focusId].update({title: "Code a bunch"}),
            tx.goals[healthId].update({title: "Get fit!"})
              .link({ todos: workoutId})
              .link({ todos: proteinId})
              .link({ todos: sleepId}),
            tx.goals[workId].update({title: "Get promoted!"})
              .link({ todos: standupId})
              .link({ todos: reviewPRsId})
              .link({ todos: focusId})
          ])
        }}
        label="Link goals and todos"
      />
      <Button
        onClick={() => {
          transact([
            tx.goals[healthId]
              .unlink({todos: workoutId})
              .unlink({todos: proteinId})
              .unlink({todos: sleepId}),
            tx.goals[workId]
              .unlink({ todos: standupId })
              .unlink({ todos: reviewPRsId })
              .unlink({ todos: focusId }),
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
