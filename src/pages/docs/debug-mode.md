---
title: Debug mode
---

{% callout type="warning" %}
`@instantdb/react` only!
{% /callout %}

Instant ships with powerful developer tooling! Every `useQuery` call returns a `debugRef` you can attach to your UI.

```javascript
function App() {
  const {
    isLoading,
    error,
    data,
    // 👇
    debugRef,
  } = useQuery({ colors: {} })

  return (
    <div ref={debugRef}>
      {isLoading ? 'Loading...' : error ? error.message : data.colors.join()}
    </div>
  )
}
```

To toggle debug mode, launch your development app and press `(cmd|ctrl) + shift + o`. This will bring up Instant's inspector pane and highlight all elements on the page with a `debugRef`. Hovering your cursor over an element will display useful information for the associated query in the inspector.
