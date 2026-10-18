# Matching Suggestions Logic: Step-by-Step Draft

## 1. Goal

Matching suggestions are a personalized recommendation list of profiles shown to a user based on compatibility and interest.

The goal is to suggest users who are most likely to match based on:

- age range and preferences
- location and distance
- shared interests or lifestyle
- education or profession
- religion, marital status, or values
- user behavior such as likes, passes, and visits

This is different from a standard feed because the main logic is not just “show recent content”; it is “rank and recommend the best possible matches.”

---

## 2. Core concept

A matching suggestion system works like a recommendation engine.

The basic flow is:

1. user opens suggestions screen
2. frontend requests candidate profiles from backend
3. backend applies filters + preference matching
4. backend returns ranking with a score
5. frontend renders the top profiles
6. frontend caches the result for a short time
7. user can like, skip, or view more suggestions

This produces a faster and more relevant experience than showing random profiles.

---

## 3. Matching data model

Each suggestion item usually has a structure like this:

```js
{
  id: "user_203",
  name: "Aisha",
  age: 27,
  city: "Delhi",
  distanceKm: 18,
  profileImage: "https://...",
  bio: "Love coffee, travel, and meaningful conversations.",
  interests: ["travel", "music", "books"],
  occupation: "Product Designer",
  education: "B.Tech",
  religion: "Hindu",
  compatibilityScore: 92,
  isLiked: false,
  isViewed: false,
  isBlocked: false,
  lastActive: "2026-10-12T10:30:00Z"
}
```

Backend response may look like:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "user_203", "compatibilityScore": 92 }
    ],
    "page": 1,
    "limit": 12,
    "hasMore": true,
    "nextCursor": "abc123"
  }
}
```

---

## 4. Step-by-step matching logic

### Step 1: Define matching criteria

First, decide exactly what makes a profile a good match.

Common criteria:

- age preference
- city or region preference
- religion preference
- relationship type
- common interests
- education similarity
- lifestyle similarity
- user activity and engagement

Example:

```js
const matchingFilters = {
  ageMin: user.preferences.minAge,
  ageMax: user.preferences.maxAge,
  city: user.location.city,
  gender: user.preferences.gender,
  relationshipType: user.preferences.lookingFor,
};
```

### Step 2: Build a score function

The backend or frontend should score each candidate profile.

A score formula may look like this:

```js
const score = {
  age: 15,
  location: 20,
  interests: 25,
  lifestyle: 15,
  education: 10,
  religion: 10,
  activity: 5,
};
```

Then final score:

```js
const compatibilityScore =
  ageScore + locationScore + interestScore + lifestyleScore + educationScore + religionScore + activityScore;
```

Example:

```js
function calculateCompatibility(user, candidate) {
  let score = 0;

  if (candidate.age >= user.preferences.minAge && candidate.age <= user.preferences.maxAge) {
    score += 15;
  }

  if (candidate.city === user.city) {
    score += 20;
  }

  const commonInterests = candidate.interests.filter((i) => user.interests.includes(i));
  score += commonInterests.length * 10;

  if (candidate.education === user.education) {
    score += 10;
  }

  return score;
}
```

This produces a ranked list where more compatible users appear first.

### Step 3: Filter out invalid candidates

Before scoring, exclude users who are:

- already liked or matched
- blocked
- hidden by user
- outside age preference
- not active recently
- not in allowed location range

```js
if (candidate.isBlocked || candidate.isHidden) return false;
if (candidate.isMatched) return false;
```

### Step 4: Fetch suggestions from API

The API request should include filters and page info.

Example endpoint:

```http
GET /matching/suggestions?page=1&limit=12&city=Delhi
```

Or with more filters:

```http
GET /matching/suggestions?ageMin=22&ageMax=30&lookingFor=serious&city=Delhi
```

### Step 5: Sort by compatibility score

Once candidates are returned, list them by the best score first.

```js
const ranked = [...items].sort((a, b) => b.compatibilityScore - a.compatibilityScore);
```

### Step 6: Render only top candidates first

The UI can show:

- top 10 profiles on first load
- next profiles on scroll or “Load more”
- only a few cards at once to keep the UI clean

### Step 7: Handle user actions

When the user likes, skips, or passes a suggestion, update its state.

```js
async function likeSuggestion(userId) {
  await apiPost('/matching/like', { userId });
  setSuggestions((prev) => prev.filter((item) => item.id !== userId));
}
```

When a user ignores a suggestion, it should be removed from the current pool and then replaced by the next best match.

### Step 8: Refresh and deduplicate

When the user returns to the suggestions page, the app should:

- reload fresh suggestions
- avoid duplicate profiles already seen
- remove any profile already liked or ignored

```js
const uniqueSuggestions = [...new Map(items.map((item) => [item.id, item])).values()];
```

---

## 5. Suggested API structure

### Endpoint example

```http
GET /matching/suggestions
```

### Query parameters

```json
{
  "page": 1,
  "limit": 12,
  "city": "Delhi",
  "minAge": 22,
  "maxAge": 30,
  "lookingFor": "serious",
  "gender": "female",
  "sort": "compatibility"
}
```

### Response example

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_203",
        "name": "Aisha",
        "compatibilityScore": 92
      }
    ],
    "page": 1,
    "limit": 12,
    "hasMore": true,
    "nextCursor": "xyz987"
  }
}
```

---

## 6. Where the logic belongs in your app

For a project like this, a clean structure could be:

- `src/api/api.js` → shared axios instance
- `src/api/matchingApi.js` → matching/suggestions endpoints
- `src/store/matchingStore.js` → suggestions state
- `src/components/SuggestionCard.jsx` → render profile suggestion cards
- `src/pages/Main.jsx` or another page → combine card list and actions

---

## 7. API call pattern in your project

Your current app already uses a proper axios instance in:

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

So the matching suggestions API can be called like this:

```js
import api from "./api";

export const fetchSuggestions = async ({ page = 1, limit = 12, filters = {} }) => {
  const response = await api.get("/matching/suggestions", {
    params: {
      page,
      limit,
      ...filters,
    },
  });

  return response.data;
};
```

---

## 8. Cache strategy for suggestions

Matching suggestions are highly personalized and can benefit from caching, but they should be handled more carefully than a general post feed.

### Recommended cache rules

- Cache first page for a shorter time, like 30–90 seconds
- Use a key based on user + filters + page
- Keep only a small amount of active memory cache
- Clear cache when user likes, skips, or blocks a profile

### Example cache key

```js
function getSuggestionCacheKey({ page, limit, filters }) {
  return `suggestions-${JSON.stringify({ page, limit, filters })}`;
}
```

### Example code

```js
const suggestionCache = new Map();

async function fetchSuggestionsWithCache({ page = 1, limit = 12, filters = {} }) {
  const key = getSuggestionCacheKey({ page, limit, filters });
  const now = Date.now();

  const cached = suggestionCache.get(key);

  if (cached && now - cached.timestamp < 45_000) {
    return cached.data;
  }

  const response = await api.get("/matching/suggestions", {
    params: { page, limit, ...filters },
  });

  suggestionCache.set(key, {
    data: response.data,
    timestamp: now,
  });

  return response.data;
}
```

### Why this is good

- faster loading when user revisits suggestions screen
- reduces repeated backend calls for the same filters
- helps with match ranking results that do not change too fast

### Important note

Suggestions should not be cached forever because the user’s actions change the list quickly.

For example:

- if a user likes profile A, profile A should disappear immediately
- if a user rejects a profile, it should not keep appearing from cache
- after a like/skip, the cache should be invalidated for that user

---

## 9. Stale-while-revalidate for suggestions

This pattern works really well for suggestions as well.

The idea:

- show cached suggestions immediately
- fetch fresh suggestions in background
- update list when new recommendations arrive

```js
async function loadSuggestions() {
  const cached = suggestionCache.get("suggestions-first-page");

  if (cached) {
    setSuggestions(cached.data.data.items || []);
  }

  try {
    const fresh = await fetchSuggestionsWithCache({ page: 1, limit: 12, filters: currentFilters });
    setSuggestions(fresh.data.items || []);
  } catch (error) {
    console.error("Suggestions refresh failed", error);
  }
}
```

This gives a faster user experience and keeps data fresh enough.

---

## 10. Matching logic example in production

A realistic algorithm can combine both filters and scoring.

```js
function getSuggestionScore(user, candidate) {
  let score = 0;

  // Age preference
  if (candidate.age >= user.preferences.minAge && candidate.age <= user.preferences.maxAge) {
    score += 20;
  }

  // Distance
  if (candidate.distanceKm <= user.preferences.maxDistance) {
    score += 20;
  }

  // Shared interests
  const common = candidate.interests.filter((i) => user.interests.includes(i));
  score += common.length * 15;

  // Lifestyle match
  if (candidate.lifestyle === user.lifestyle) {
    score += 10;
  }

  // Education match
  if (candidate.education === user.education) {
    score += 10;
  }

  // Religion match
  if (candidate.religion === user.religion) {
    score += 10;
  }

  return score;
}
```

Then sort by score:

```js
const suggestions = profiles
  .filter((candidate) => !candidate.isLiked && !candidate.isBlocked)
  .map((candidate) => ({
    ...candidate,
    compatibilityScore: getSuggestionScore(user, candidate),
  }))
  .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
```

---

## 11. Handling user actions and dynamic updates

Because the suggestions list changes based on user actions, the state must update immediately.

Examples:

- like → remove from suggestions list
- skip → remove and fetch next item
- report/block → hide permanently
- match success → move to match list

Example:

```js
async function handleLike(profileId) {
  await apiPost("/matching/like", { profileId });

  setSuggestions((prev) => prev.filter((item) => item.id !== profileId));
  invalidateSuggestionCache();
}
```

---

## 12. Recommended feed/suggestion behavior

Matching suggestions should ideally do this:

- load top 10–20 profiles first
- show score or match badge if desired
- allow refresh without losing current selection state
- load more results when user reaches the bottom or clicks next
- keep a short in-memory cache for fast re-entry
- invalidate cache on like/skip/block actions

---

## 13. Draft content you can use

Here is a short product-style draft:

> Matching suggestions are personalized profile recommendations generated based on the user’s preferences, lifestyle, location, and shared interests. The system filters out invalid candidates, assigns a compatibility score to each profile, and ranks them from highest to lowest relevance. The API returns paginated results, while the frontend caches the first page for a short period to keep the experience fast. User actions such as like, skip, or block immediately update the suggestion pool and invalidate the relevant cache entries so that recommendations stay accurate and fresh.

---

## 14. Best practice summary

For your app, the best setup is:

1. use a dedicated suggestions API
2. filter candidates before ranking
3. compute a compatibility score
4. sort by highest score first
5. cache short-lived results in memory
6. invalidate cache after user decisions
7. support refresh and load-more without duplicates

This keeps the logic simple, fast, and easy to scale.

---

## 15. Recommended next step

The next step should be to build:

- `matchingApi.js`
- `matchingStore.js`
- `SuggestionCard.jsx`
- a suggestions page or section in the home screen

Then connect that to the same shared axios instance and use a small cache strategy for the first page of results.
