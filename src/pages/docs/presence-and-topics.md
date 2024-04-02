---
title: Presence, Cursors, and Activity
---

Sometimes you want to show real-time updates to users without persisting the
data to your database. Common scenarios include:

- Shared cursors in a collaborative whiteboard like Figma
- Who's online in a document editor like Google Docs
- Typing indicators in chat apps like Discord
- Live reactions in a video streaming app like Twitch

Instant provides three primitives for quickly building these ephemeral experiences: rooms, presence, and topics.

#### Rooms

A room represents a temporary context for realtime events. Users in the same room will receive updates from every other user in that room.

#### Presence

Presence is an object that each peer shares with every other peer. When a user updates their presence, it's instantly replicated to all users in that room. Presence persists throughout the remainder of a user's connection, and is automatically cleaned up when a user leaves the room

You can use presence to build features like "who's online." Instant's cursor and typing indicator are both built on top of the presence API.

#### Topics

Topics have "fire and forget" semantics, and are better suited for data that don't need any sort of persistence. When a user publishes a topic, a callback is fired for every other user in the room listening for that topic.

You can use topics to build features like "live reactions." The real-time emoji button panel on Instant's homepage is built using the topics API.

#### Transact vs. Epehemeral

You may be thinking when would I use `transact` vs `presence` vs `topics`? Here's a simple breakdown:

- Use `transact` when you need to persist data to the db. For example, when a user sends a message in a chat app.
- Use `presence` when you need to persist data in a room but not to the db. For example, showing
  who's currently viewing a document.
- Use `topics` when you need to broadcast data to a room, but don't need to persist it. For example, sending a live reaction to a video stream.

## Setup

Both presence and topics require no additional setup beyond calling `init()`,

```typescript
// db will export all the presence hooks you need!
const db = init<Schema>({ appId: APP_ID })
```

## Typing

You can provide typings for presence and topics as generic parameters.

```typescript
// Generic type for room schemas.
type RoomSchemaShape = {
  [roomType: string]: {
    presence?: { [k: string]: any };
    topics?: {
      [topic: string]: {
        [k: string]: any;
      };
    };
  };
};

// A concrete example
type RoomSchema {
  video: {
    presence: { handle: string; avatarUrl: string; color: string };
    topics: {
      reaction: { emoji: string };
    };
  };
}

// db with typings for presence and topics!
const db = init<Schema, RoomSchema>({ appId })
```

## Presence

Instant's `usePresence` is similar in feel to `useState`. it returns an object containing the current user's presence state, the presence state of every other user in the room, and a function (`publishPresence`) to update the current user's presence. `publishPresence` is similar to React's `setState`, and will merge the current and new presence objects.

```javascript
const { user, peers, publishPresence } = db.usePresence('chat', 'chatRoomId')

useEffect(() => {
  publishPresence({ name: 'joe' })
}, [])
```

`usePresence` accepts a second parameter to select specific slices of user's presence object.

```typescript
// will only return the `status` value for each peer
// will only trigger an update when a user's `status` value changes (ignoring any other changes to presence).
// This is useful for optimizing re-renders in React.
const { user, peers, publishPresence } = db.usePresence('chat', 'chatRoomId', {
  keys: ['status'],
})
```

You may also specify an array of `peers` and a `user` flag to further constrain the output. If you wanted a "write-only" hook, it would look like this:

```typescript
// Will not trigger re-renders on presence changes
const { publishPresence } = db.usePresence('chat', 'chatRoomId', {
  peers: [],
  user: false,
})
```

## Topics

Instant provides 2 hooks for sending and handling events for a given topic. `usePublishTopic` returns a function you can call to publish an event, and `useTopicEffect` will be called each time a peer in the same room publishes a topic event.

```typescript
const publishEmote = db.usePublishTopic('video', 'videoId', 'emotes')

db.useTopicEffect('video', 'videoId', 'emote', (event, peer) => {
  // Render broadcasted emotes!
  renderEmote(event.emoji)
})

return <button onClick={() => publishEmote({ emoji: '🔥' })}>🔥</button>
```

## Cursors and Typing Indicators (React only)

We wanted to make adding real-time features to your apps as simple as possible, so we shipped our React library with 2 drop-in utilities: `Cursors` and `useTypingIndicator`.

### Cursors

Adding multiplayer cursors to your app is as simple as importing our `<Cursors>` component!

```typescript
<Cursors
  db={db}
  room="document"
  roomId="the-best-document-ever"
  spaceId="space-1"
  className="cursors"
  currentUserColor="tomato"
>
  {/* Your app here */}
</Cursors>
```

You can provide a `renderCursor` function to return your own custom cursor component.

```typescript
<Cursors
  db={db}
  roomType="document"
  roomId="the-best-document-ever"
  spaceId="tab-main"
  className="cursors"
  currentUserColor="papayawhip"
  renderCursor={renderCoolCustomCursor}
/>
```

You can render multiple cursor spaces. For instance, imagine you're building a screen with multiple tabs. You want to only show cursors on the same tab as the current user. You can provide each `<Cursors />` element with their own `spaceId`.

```typescript
<Tabs>
  {tabs.map((tab) => (
    <Tab>
      <Cursors
        db={db}
        room="document"
        roomId="the-best-document-ever"
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

```typescript
<Cursors
  db={db}
  room="document"
  roomId="the-best-document-ever"
  spaceId="space-outer"
  userCursorColor="magenta"
  className="cursors-nested-outer"
>
  <Cursors
    db={db}
    room="document"
    roomId="the-best-document-ever"
    spaceId="space-inner"
    userCursorColor="blue"
    className="cursors-nested-inner"
  />
</Cursors>
```

### Typing indicators

`useTypingIndicator` is a small utility useful for building inputs for chat-style apps. You can use this hook to show
things like "Peer is typing..." in your chat app.

```javascript
// `active` is an object containing the presence state of every other user in the room.
const { active, inputProps } = db.useTypingIndicator(
  'chat',
  'chatRoomId',
  'chat-input', // this is the label of the input field. Use this to differentiate between multiple inputs in the same room.
  { handle, isTyping } // this is the slice of the presence object we want to track
)

const whosTypingText = (active) => {
  const handles = active.map((a) => a.handle)
  if (handles.length === 1) return `${handles[0]} is typing...`
  if (handles.length === 2)
    return `${handles[0]} and ${handles[1]} are
    typing...`
  if (handles.length >= 3) return 'several people are typing...'
}

const activeHandles = active.map((a) => a.handle)
return (
  <div>
    {Object.keys(active).length ? <span>{whosTypingText(active)}</span> : null}
    <input {...inputProps} />
  </div>
)
```
