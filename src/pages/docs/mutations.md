---
title: InstaML
---

Instant uses a Firebase-inspired interface for mutations. We call our mutation language _InstaML_

## Why InstaML

Whereas GraphQL has a nice read story, we find their mutations to be wonky. GraphQL mutations also require developers to manually write their own optimistic updates and rollback logic. We love Firebase's simple API and how it provides optimistic updates and rollbacks for free. We wanted to bring the same experience with support for relations.

You can try out the examples below with {% sandbox-link type="goals-and-todos" label="this sandbox" /%}.

## Transact

All mutations are wrapped in a `transact`. `transact` takes only one parameter, an array of `txs` For example running the following

```javascript
transact([
  tx.todos["workout"].update({title: "Go on a run"}),
  tx.todos["protein"].update({title: "Drink protein"}),
  tx.todos["sleep"].update({title: "Go to bed early"}),
  tx.todos["standup"].update({title: "Do standup"}),
  tx.todos["reviewPRs"].update({title: "Review PRs"}),
  tx.todos["focus"].update({title: "Code a bunch"}),
  tx.goals["health"].update({title: "Get fit!"})
    .link({ todo: "workout"})
    .link({ todo: "protein"})
    .link({ todo: "sleep"})
  tx.goals["work"].update({title: "Get promoted!"})
    .link({ todo: "standup"})
    .link({ todo: "reviewPRs"})
    .link({ todo: "focus"})
])
```

Will generate:

-   todos, identified as `workout`, `protein`, `sleep`, `standup`, `reviewPRs`, and `focus`
-   goals, identified as `health` and `work`
-   todos `workout`, `protein`, and `sleep` are associated with goal `health`
-   todos `standup`, `reviewPRs`, and `focus` are associated with goal `work`
