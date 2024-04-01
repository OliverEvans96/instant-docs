---
title: Presence and topics
---

## Introduction

Modern apps require more than a relational data store. To build rich real-time experiences, developers need systems for managing session state and streams of events. Instant provides primitives for quickly building rich multiplayer experiences: rooms, presence and topics. You can use these features to build typing indicators for a chat app like Discord, multiple cursors for a drawing board like Figma, user activity updates for document editors like Notion, or any other shared virtual space.

You can think of presence as Instant-ified `setState`, and topics as Instant-ified event callbacks or `useEffect`.

#### Rooms

A room represents a shared context for realtime events. Users in the same room will receive updates from every other user in that room.

#### Presence

Presence is an object that each peer shares with every other peer. When a user updates their presence, it's instantly replicated to all users in that room. Presence persists throughout the remainder of a user's connection, and is automatically cleaned up when they leave the room

Instant's cursor and typing indicator helpers are both built atop the presence API.

#### Topics

Meanwhile, topics have "fire and forget" semantics, and are better suited for streams of data that don't need any sort of persistence. When a user publishes a topic, a callback is fired for every other user in the room listening for that topic.

The real-time emoji button panel on Instant's homepage is built using the topics API.

## Setup

Both presence and topics require no additional setup beyond calling `init()`, however you may provide typings as a generic parameter.

```typescript
const db = init<
  // DB schema
  {
    // ...
  },
  // Presence shape
  { name: string; avatarUrl: string; color: string },
  // Topic types
  {
    emote: { emoji: string }
  }
>({
  appId,
})
```

## Presence

Instant's `usePresence` is similar in feel to `useState`. it returns an object containing the current user's presence state, the presence state of every other user in the room, and a function (`publishPresence`) to update the current user's presence. `publishPresence` is similar to React's `setState`, and will merge the current and new presence objects.

```javascript
const { user, peers, publishPresence } = db.usePresence('example-room')

useEffect(() => {
  publishPresence({ name: 'joe' })
}, [])
```

`usePresence` accepts a second parameter to select specific slices of user's presence object. For example `db.usePresence('example-room', { keys: ['status'] })` will only return the `status` value for each peer, and will only trigger an update when a user's `status` value changes (ignoring any other changes to presence). This is useful for optimizing re-renders in React.

You may also specify and array of `peers` and a `user` flag to further constrain the output. If you wanted a "write-only" hook, it would look like this: `db.usePresence('example-room', { peers: [], user: false })`

## Topics

Instant provides 2 hooks for sending and handling events for a given topic. `usePublishTopic` returns a function you can call to publish an event, and `useTopicEffect` will be called each time a peer in the same room publishes an event for that topic.

```javascript
const publishEmote = db.usePublishTopic('example-room', 'emotes')

db.useTopicEffect('example-room', 'emote', (event, peer) => {
  // ...
})

return <button onClick={() => publishEmote({ emoji: '🔥' })}>🔥</button>
```

## Turnkey helpers (React web only)

We wanted to make adding real-time features to your apps as simple as possible, so we shipped our React library with 2 drop-in utilities: `Cursors` and `useTypingIndicator`.

### Cursors

Adding multiplayer cursors to your app is as simple as importing our `<Cursors>` component!

```javascript
<Cursors
  db={db}
  roomId="example-room"
  spaceId="space-1"
  className="cursors"
  currentUserColor="tomato"
>
  {/* Your app here */}
</Cursors>
```

Want to customize your cursors? No prob! Just provide a `renderCursor` function and return your own react element.

```javascript
<Cursors
  db={db}
  roomId="example-room"
  spaceId="space-1"
  className="cursors"
  currentUserColor="papayawhip"
  renderCursor={renderCoolCustomCursor}
/>
```

You can render multiple cursor spaces. For instance, imagine you're building a screen with multiple tabs. You probably don't want to show a peer's cursor unless they're on the same tab as the current user. You can provide each `<Cursors />` element with their own `spaceId`.

```javascript
<Tabs>
  {tabs.map((tab) => (
    <Tab>
      <Cursors
        db={db}
        roomId="example-room"
        spaceId={`tab-${tab.id}`}
        className="tab-cursor"
      >
        {/* ... */}
      </Cursors>
    </Tab>
  ))}
</Tabs>
```

You can even nest `<Cursors />`!

```javascript
<Cursors
  db={db}
  roomId="example-room"
  spaceId="space-outer"
  userCursorColor="magenta"
  className="cursors-nested-outer"
>
  <Cursors
    db={db}
    roomId="example-room"
    spaceId="space-inner"
    userCursorColor="blue"
    className="cursors-nested-inner"
  />
</Cursors>
```

### Typing indicators

`useTypingIndicator` is a small utility useful for building inputs for chat-style apps.

```javascript
const { active, inputProps } = db.useTypingIndicator(
  'example-room',
  'chat-input'
)

return (
  <div>
    <input {...inputProps} />
    {Object.keys(active).length ? <span>Peer is typing...</span> : null}
  </div>
)
```
