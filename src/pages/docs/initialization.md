---
title: Init API
---

Before you can query or mutate, make sure `useInit` is called in your component tree.

```javascript
function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: "wss://instant-server-clj.herokuapp.com/api/runtime/sync",
    apiURI: "https://instant-server-clj.herokuapp.com/api",
  });
  // Render a loading state while initializing
  if (isLoading) {
    return <div>...</div>;
  }
  // Render an error state if initialization fails
  if (error) {
    return <div>Oi! {error?.message}</div>;
  }
  // Optionally render an authentication flow if client is not authed
  if (!auth) {
    ...
  }
  return <Main />;
}
```

You can now use `useQuery` throughout your component tree
```javascript
function Main() {
  const data = useQuery(...);
  return (
    ...
  );
}

export default App;
```
