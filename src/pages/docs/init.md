---
title: Init
---

The first step to using Instant in your app is to to call `init` before rending your component tree.

```javascript
import { init } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'

const db = init({ appId: APP_ID })

function App() {
  return <Main />
}
```

If you're using TypeScript, `init` accepts a `Schema` generic, which will provide auto-completion and type-safety for `useQuery` results.

```typescript
import { init } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'

type MyAppSchema = {
  metrics: {
    name: string
    description: string
  }
  logs: {
    date: string
    value: number
    unit: string
  }
}

const db = init<MyAppSchema>({ appId: APP_ID })
```

You'll now be able to use `InstaQL` and `InstalML` throughout your app!
