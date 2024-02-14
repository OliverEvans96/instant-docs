---
title: Debug mode (React Only)
---

When using react, every `useQuery` call returns a `debugRef` you can attach to your UI.

```javascript {% showCopy=true %}
import { init, tx, id } from '@instantdb/react'

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = 'REPLACE ME'
const db = init({ appId: APP_ID })

function App() {
  const {
    isLoading,
    error,
    data,
    // 👇
    debugRef,
  } = db.useQuery({ messages: {} })
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div
      style={{ padding: '8px', backgroundColor: '#1e293b', height: '100vh' }}
    >
      <div style={{ marginBottom: '8px', color: 'white' }} ref={debugRef}>
        Num Sent Yos: {data.messages.length}
      </div>
      <button
        style={{ padding: '8px', border: '1px solid white', color: 'white' }}
        onClick={() => db.transact(tx.messages[id()].update({ text: 'Yo' }))}
      >
        Send Yo
      </button>
    </div>
  )
}
```

Launch your app and press `(cmd|ctrl) + shift + o` to toggle debug mode!

This will bring up Instant's inspector pane and highlight all elements on the page with a `debugRef`. Hovering your cursor over an element will display useful information for the associated query in the inspector.

{% figure src="/img/debug_screenshot.png" /%}
