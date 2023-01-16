---
title: useInit
---

The first step to using Instant in your app is to to call `useInit` at the top of your component tree.

```javascript
import { useInit } from '@instantdb/react';

const APP_ID = "REPLACE ME";

function App() {
  const [isLoading, error, auth] = useInit({
    appId: APP_ID,
    websocketURI: 'wss://api.instantdb.com/runtime/sync',
    apiURI: 'https://api.instantdb.com',
  })
  if (isLoading) {
    return <div>...</div>
    )
  }
  if (error) {
    return <div>Oi! {error?.message}</div>
  }
  // Uncomment below to enable auth
  // if (!auth) {
  //   return <Login />;
  // }
  return <Main />
}
```

You'll now be able to use `InstaQL` and `InstalML` throughout your app!
