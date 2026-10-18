# User Feed Logic: Step-by-Step Draft

## 1. Goal

The user feed should show a personalized list of posts, recommendations, or content items in a smooth, fast, and scalable way.

The feed should support:

- initial load
- refresh
- pagination or infinite scroll
- caching for better speed
- API retry and token handling
- filtering based on user interest, followings, geography, or content type

---

## 2. Core idea

The feed is basically a list of items drawn from the backend, sorted by relevance and freshness.

A standard model looks like this:

- user requests feed
- backend returns a paginated list with items and metadata
- frontend stores the items in local state or a global store
- frontend renders cards
- app prefetches the next page when the user scrolls near the bottom

This is the simplest and cleanest architecture for a social app like this one.

---

## 3. Feed data structure

Each feed item should have a predictable shape.

Example:

```js
{
  id: "post_123",
  userId: "user_45",
  username: "emma",
  profileImage: "https://...",
  content: "Morning walk with coffee...",
  media: ["https://...jpg"],
  likes: 128,
  comments: 24,
  shares: 9,
  createdAt: "2026-10-12T10:48:00Z",
  isLiked: false,
  isBookmarked: false,
  tags: ["travel", "nature"],
  type: "post"
}
```

Backend response usually looks like:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "post_123" }
    ],
    "page": 1,
    "limit": 10,
    "hasMore": true,
    "nextCursor": "abc123"
  }
}
```

---

## 4. Step-by-step feed creation flow

### Step 1: Define what the feed should contain

Decide the feed type first.

Examples:

- friends feed
- explore feed
- recommended feed
- interest-based feed
- city-based feed

For your app, the feed can be a mix of:

- user posts
- profile recommendations
- trending content
- matches or nearby users

### Step 2: Decide API shape

Create one clear endpoint like:

```http
GET /feed?page=1&limit=10&cursor=xyz
```

or

```http
GET /feed?tab=discover&page=1
```

The API should return:

- items
- current page or cursor
- hasMore flag
- total count if needed

### Step 3: Create a feed hook or service

Keep all feed logic in one place so your components stay clean.

Example structure:

```js
const feedState = {
  items: [],
  page: 1,
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
};
```

### Step 4: Load the first page

On mount, call the first feed API.

```js
async function loadFeed() {
  if (loading) return;

  setLoading(true);

  try {
    const res = await apiGet('/feed', { page: 1, limit: 10 });
    setItems(res.data.data.items || []);
    setHasMore(res.data.data.hasMore || false);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
}
```

### Step 5: Add pagination or infinite scroll

When the user reaches the bottom, call the next page.

```js
async function loadMoreFeed() {
  if (loading || !hasMore) return;

  setLoading(true);

  try {
    const nextPage = page + 1;
    const res = await apiGet('/feed', { page: nextPage, limit: 10 });

    setItems((prev) => [...prev, ...res.data.data.items]);
    setPage(nextPage);
    setHasMore(res.data.data.hasMore || false);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}
```

### Step 6: Add refresh logic

When the user pulls to refresh or taps refresh, fetch the first page again.

```js
async function refreshFeed() {
  setRefreshing(true);

  try {
    const res = await apiGet('/feed', { page: 1, limit: 10 });
    setItems(res.data.data.items || []);
    setPage(1);
  } finally {
    setRefreshing(false);
  }
}
```

### Step 7: Filter or sort feed items

Feed items may need sorting by:

- newest
- most liked
- nearest location
- matching profile preferences

```js
const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

### Step 8: Manage empty and error states

Always handle:

- no items
- network failure
- loading skeletons
- retries

Example:

```js
if (loading && items.length === 0) return <Loader />;
if (!loading && items.length === 0) return <EmptyFeedState />;
```

---

## 5. Where to put the logic

For your app, a good structure is:

- `src/api/api.js` for base API instance
- `src/api/feedApi.js` for feed endpoints
- `src/store/feedStore.js` for state management
- `src/components/PostCard.jsx` for rendering item cards
- `src/pages/Main.jsx` or a feed page for page composition

This keeps logic separated and easier to test.

---

## 6. API call pattern in your project

Your project already uses a shared axios instance in:

```js
// src/api/api.js
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

This is a good place to call your feed API because it automatically attaches auth headers.

For the feed, use:

```js
import api from "./api";

export const fetchFeed = async ({ page = 1, limit = 10 }) => {
  const response = await api.get("/feed", { params: { page, limit } });
  return response.data;
};
```

---

## 7. How to use cache

Caching helps avoid unnecessary API calls and makes the app feel smoother.

### Best practice for feed caching

Use a simple cache with:

- memory cache for active session
- optional localStorage or sessionStorage for persistence
- TTL (time-to-live) to refresh stale data

### Example cache strategy

```js
const feedCache = new Map();

function getCacheKey({ page, limit, tab }) {
  return `${tab || "default"}-${page}-${limit}`;
}

async function fetchFeedWithCache({ page = 1, limit = 10, tab = "discover" }) {
  const key = getCacheKey({ page, limit, tab });
  const now = Date.now();

  const cached = feedCache.get(key);

  if (cached && now - cached.timestamp < 60_000) {
    return cached.data;
  }

  const response = await api.get("/feed", {
    params: { page, limit, tab }
  });

  feedCache.set(key, {
    data: response.data,
    timestamp: now,
  });

  return response.data;
}
```

### Why this is useful

- first page load becomes much faster
- scrolling back to previous feed pages is instant
- reduces backend load
- avoids repeated duplicate network requests

### Cache rules

Use cache for:

- first page of feed
- repeated route visits
- static lists like trending or recommendation cards

Do not cache aggressively for:

- highly personal, real-time data
- unread notifications that must be fresh
- actions that depend on current user state

---

## 8. Smart caching pattern: stale-while-revalidate

This is a very good approach for feed screens.

Idea:

- show cached data instantly
- fetch fresh data in background
- update the UI when new data arrives

```js
async function loadFeedSmart() {
  const cached = feedCache.get("discover-1-10");

  if (cached) {
    setItems(cached.data.data.items);
  }

  try {
    const fresh = await fetchFeedWithCache({ page: 1, limit: 10, tab: "discover" });
    setItems(fresh.data.items);
  } catch (error) {
    console.error("Feed refresh failed", error);
  }
}
```

This gives a fast UX while keeping data current.

---

## 9. Recommended feed architecture for your project

For a Vite + React app with Zustand and axios, the best structure is:

1. API layer
   - central axios instance
   - feed request functions

2. Store layer
   - feed state
   - page number
   - loading flags
   - cache keys

3. UI layer
   - feed page requests data
   - renders cards
   - paginates on scroll

Example store pattern:

```js
export const useFeedStore = create((set, get) => ({
  items: [],
  page: 1,
  hasMore: true,
  loading: false,
  refreshing: false,

  fetchFeed: async () => {
    if (get().loading) return;
    set({ loading: true });

    try {
      const response = await fetchFeedWithCache({ page: get().page, limit: 10 });
      const nextItems = response.data.items || [];

      set({
        items: get().page === 1 ? nextItems : [...get().items, ...nextItems],
        hasMore: response.data.hasMore,
      });
    } finally {
      set({ loading: false });
    }
  },
}));
```

---

## 10. Real-world feed logic rules

A good feed should always follow these rules:

- load newest data first
- keep pagination consistent
- avoid duplicate items
- deduplicate by id
- handle stale cache safely
- treat infinite scroll as incremental loading, not full reload
- use skeleton loaders for better perceived speed

---

## 11. Draft content you can use in the app

Here is a simple draft paragraph for product documentation or internal notes:

> The user feed is a personalized stream of content generated from the user’s interests, connections, and activity. It loads the first page on app entry, then fetches additional pages as the user scrolls. Each request is built through the shared API layer with auth headers automatically attached. To improve performance, feed responses are cached in memory and refreshed in the background when stale, allowing the UI to show content immediately without repeated network calls. The feed also supports refresh, pagination, and empty/error handling so the user experience remains smooth, fast, and reliable.

---

## 12. Recommended next steps

1. Create a `feedApi.js` file.
2. Add `fetchFeed` and `refreshFeed` functions.
3. Create a `feedStore.js` with list, page, loading, hasMore state.
4. Cache first-page feed results for 30 to 60 seconds.
5. Use infinite scroll or load more button.
6. Add final UI states: loading, empty, error, and success.

---

## 13. Final recommendation

For your current frontend, the best approach is:

- use the existing shared axios instance from `src/api/api.js`
- keep all feed logic in one service/store
- use in-memory cache with TTL
- use background refresh for stale data
- add pagination and deduplication

This is simple enough to maintain and strong enough for production growth.
