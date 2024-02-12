---
title: Writing data
---

Instant uses a **Firebase-inspired** interface for mutations. We call our mutation language **InstaML**

## Update

We use the `update` action to create entities.

```javascript
db.transact([tx.goals[id()].update({ title: 'eat' })])
```

This creates a new `goal` with the following properties:

- It's identified by a randomly generated id via the `id()` function.
- It has an attribute `title` with value `eat`.

Similar to NoSQL, you don't need to use the same schema for each entity in a namespace. After creating the previous goal you can run the following:

```javascript
db.transact([
  tx.goals[id()].update({
    priority: 'none',
    isSecret: true,
    value: 10,
    aList: [1, 2, 3],
    anObject: { foo: 'bar' },
  }),
])
```

You can store `strings`, `numbers,` `booleans`, `arrays`, and `objects` as values. You can also generate values via functions. Below is an example for picking a random goal title.

```javascript
db.transact([
  tx.goals[id()].update({
    title: ['eat', sleepId, 'hack', 'repeat'][Math.floor(Math.random() * 4)],
  }),
])
```

---

The `update` action is also used for updating entities. Suppose we had created the following goal

```javascript
const eatId = id()
db.transact([
  tx.goals[eatId].update({ priority: 'top', lastTimeEaten: 'Yesterday' }),
])
```

We eat some food and decide to update the goal. We can do that like so:

```javascript
db.transact([tx.goals[eatId].update({ lastTimeEaten: 'Today' })])
```

This will only update the value of the `lastTimeEaten` attribute for entity `eat`.

## Delete

The `delete` action is used for deleting entities.

```javascript
db.transact([tx.goals[eatId].delete()])
```

You can generate an array of `delete` txs to delete all entities in a namespace

```javascript


const { isLoading, error, data } = db.useQuery({goals: {}}
const { goals } = data;
...
db.transact(goals.map(g => tx.goals[g.id].delete()));
```

Calling `delete` on an entity also deletes its associations. So no need to worry about cleaning up previously created links.

## Link

`link` is used to create associations.

Suppose we create a `goal` and a `todo`.

```javascript
db.transact([
  tx.todos[workoutId].update({ title: 'Go on a run' }),
  tx.goals[healthId].update({ title: 'Get fit!' }),
])
```

We can associate `healthId` with `workoutId` like so:

```javascript
db.transact([tx.goals[healthId].link({ todos: workoutId })])
```

We could have done all this in one `transact` too via chaining transaction chunks.

```javascript
db.transact([
  tx.todos[workoutId].update({ title: 'Go on a run' }),
  tx.goals[healthId].update({ title: 'Get fit!' }).link({ todos: workoutId }),
])
```

You can specify multiple ids in one `link` as well:

```javascript
db.transact([
  tx.todos[workoutId].update({ title: 'Go on a run' }),
  tx.todos[proteinId].update({ title: 'Drink protein' }),
  tx.todos[sleepId].update({ title: 'Go to bed early' }),
  tx.goals[healthId]
    .update({ title: 'Get fit!' })
    .link({ todos: [workoutId, proteinId, sleepId] }),
])
```

Order matters when creating links.

```javascript
db.transact([tx.goals[healthId].link({ todos: workoutId })])
```

This creates:

- A forward link from entity `healthId` to entity `workoutId` via `goals` -> `todos`
- A reverse link from entity `workoutId` to entity `healthId` via `todos` -> `goals`

We can query associations in both directions via these links

```javascript
const { isLoading, error, data } = useQuery({
  goals: { todos: {} },
  todos: { goals: {} },
})

const { goals, todos } = data
```

## Unlink

Links can be removed via `unlink`

```javascript
db.transact([tx.goals[healthId].unlink({ todos: workoutId })])
```

This removes both:

- The forward link from entity `health` to entity `workout`
- The reverse link from entity `workout` to entity `health`

We can `unlink` multiple ids too:

```javascript
db.transact([
  tx.goals[healthId].unlink({ todos: [workoutId, proteinId, sleepId] }),
  tx.goals[workId].unlink({ todos: [standupId, reviewPRsId, focusId] }),
])
```

`unlink` can work in both directions. So this works:

```javascript
db.transact([tx.goals[healthId].unlink({ todos: workoutId })])
```

And so does this!

```javascript
db.transact([tx.todos[workoutId].unlink({ goals: healthId })])
```

## tx

`tx` is a [proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which creates transaction chunks to be commited via `transact`. It follows the format

```
tx.NAMESPACE_LABEL[GLOBAL_UNIQUE_IDENTIFER].ACTION(ACTION_SPECIFIC_DATA)
```

- `NAMESPACE_LABEL` refers to the namespace to commit (e.g. `goals`, `todos`)
- `GLOBAL_UNIQUE_IDENTIFER` is the id to look up in the namespace. This id must be a uuid and unique across **all namespaces**. You can use the `id()` function to generate a uuid for convenience.
- `ACTION` is one of `update`, `delete`, `link`, `unlink`
- `ACTION_SPECIFIC_DATA` depends on the action
  - `update` takes in an object of information to commit
  - `delete` is the only aciton that doesn't take in any data,
  - `link` and `unlink` takes an object of label-entity pairs to create/delete associations

## More features to come!

Similar to InstaQL, We're actively building more features for InstaML. {% blank-link href="https://discord.com/invite/VU53p7uQcE" label="We love getting requests" /%} for new features!
