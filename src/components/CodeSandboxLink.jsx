import reactSandboxURI from '@/components/reactSandboxURI'

const goalsAndTodosExample = `
import { useInit, useQuery, tx, transact, id, auth } from "@instantdb/react";

const APP_ID = "REPLACE ME";

function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: "wss://instant-server-clj.herokuapp.com/api/runtime/sync",
    apiURI: "https://instant-server-clj.herokuapp.com/api",
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
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {!data.goals.length && <div>Hit the button below to generate some data!</div>}
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
              .update({ title: "Get fit!" })
              .link({ todos: "workout" })
              .link({ todos: "protein" })
              .link({ todos: "sleep" }),
            tx.goals["work"]
              .update({ title: "Get promoted!" })
              .link({ todos: "standup" })
              .link({ todos: "reviewPRs" })
              .link({ todos: "focus" }),
          ]);
        }}
        label="Create Data"
      />
      <Button
        onClick={() => {
          transact([
            tx.todos["workout"].delete(),
            tx.todos["protein"].delete(),
            tx.todos["sleep"].delete(),
            tx.todos["standup"].delete(),
            tx.todos["reviewPRs"].delete(),
            tx.todos["focus"].delete(),
            tx.goals["health"].delete(),
            tx.goals["work"].delete(),
          ]);
        }}
        label="Delete Data"
      />
    </div>
  );
}

export default App;
`.trim()

const uris = {
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
