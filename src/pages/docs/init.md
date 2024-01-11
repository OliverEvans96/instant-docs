---
title: Init
---

The first step to using Instant in your app is to to call `init` before rending your component tree.

```javascript
import { init } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'

init({
  appId: APP_ID,
  websocketURI: 'wss://api.instantdb.com/runtime/session',
  apiURI: 'https://api.instantdb.com',
})

function App() {
  return <Main />
}
```

You'll now be able to use `InstaQL` and `InstalML` throughout your app!
