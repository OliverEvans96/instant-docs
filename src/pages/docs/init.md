---
title: Init
---

The first step to using Instant in your app is to to call `init` before rending your component tree.

```javascript
import { init } from '@instantdb/react'

const APP_ID = 'REPLACE ME'

init({
  appId: APP_ID,
  websocketURI: 'wss://api.instantdb.com/runtime/session',
})

function App() {
  return <Main />
}
```

You'll now be able to use `InstaQL` and `InstalML` throughout your app!
