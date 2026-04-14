# Auth Flow - Generic Layered Easy Hinglish Playbook

Is doc ka first focus OTP nahi, generic auth architecture hai.
Goal ye hai ki aap kisi bhi auth model (OTP, magic link, 2FA code, SSO callback) ko same thinking se design kar pao without crash, freeze, duplicate API calls, ya confusing state bugs.

Current project me OTP flow implemented hai, isliye examples OTP-based honge, but architecture generic rahega.

Use this doc in 3 modes:

1. Foundation mode (Sections 0-4): Layer thinking develop karne ke liye.
2. Implementation mode (Sections 5-12): Step-by-step safe integration ke liye.
3. Debug + release mode (Sections 13-19): Edge cases, ship gate, test matrix ke liye.

---

## 0. Architecture Foundation (Read First)

## 0.1 One-line Mental Model

Validate input -> Dispatch action -> Thunk orchestration -> Service abstraction -> Network interceptor -> Storage persistence -> Reducer state update -> Navigator route decision.

Yahi reusable template hai. Feature badlega, flow skeleton same rahega.

## 0.2 Layered File Map (Current Project)

| Layer               | Current Files                                                                    | Core Job                                          |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| App bootstrap       | App.jsx, index.js, src/store/index.js                                            | store + providers mount                           |
| UI screens          | src/screens/auth/LoginWithPhoneScreen.js, src/screens/auth/VerifyMobileScreen.js | input, validation, dispatch, loading/error render |
| Redux orchestration | src/store/authSlice.js                                                           | async control, state transitions, guards          |
| Service abstraction | src/services/auth/authApi.js                                                     | endpoint calls + payload normalization            |
| Network client      | src/services/api.js                                                              | axios client, interceptors, refresh queue         |
| Storage             | src/services/auth/authStorage.js                                                 | save/get/remove session                           |
| Navigation guard    | src/navigation/RootNavigator.js, src/navigation/auth/AuthStack.js                | state-based route selection                       |

## 0.3 Layer Trigger Matrix (Kab Kaun Layer Active Hoti Hai)

| Layer               | Trigger                             | Input                            | Output                                     | Must Do                                                    | Must Not Do                              |
| ------------------- | ----------------------------------- | -------------------------------- | ------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------- |
| UI Screen           | user action (button tap, submit)    | form fields, route params        | dispatch action, local validation errors   | validation first, loading guard, render fallback           | raw API response ko global truth banana  |
| Thunk               | dispatch from UI                    | normalized payload               | pending/fulfilled/rejected action          | rejectWithValue, response guard, side-effect orchestration | direct UI navigation force karna         |
| Service             | thunk API call                      | business payload                 | response data (normalized shape preferred) | endpoint abstraction, payload normalization                | Redux mutate karna                       |
| Network interceptor | any request via api client          | request config + stored token    | signed request or mapped network error     | auth header, timeout handling, refresh retry flow          | feature-specific UI logic add karna      |
| Storage             | verify success, app restore, logout | token/user/refreshToken          | persisted or cleared session               | safe parse, fallback null contract                         | component state directly mutate karna    |
| Reducer             | thunk lifecycle action              | action payload                   | deterministic state                        | loading/error/token/user transitions                       | async call karna                         |
| Navigator           | auth state change / app mount       | isAuthChecked, token, user, role | AuthStack or role stack                    | state-driven routing, safe fallback                        | hidden local flags pe route depend karna |

## 0.4 Generic Auth Archetypes (Reusable Thinking)

1. Initiate: Auth challenge start hota hai (OTP send, magic link send, SSO start).
2. Verify: Challenge complete hota hai (OTP verify, link confirm, callback exchange).
3. Restore: App restart pe persisted session read hota hai.
4. Refresh: Access token expire hone pe 401-driven refresh + retry hota hai.
5. Revoke/Logout: Session clear karke auth stack pe wapas aate hain.

Current mapping in this project:

- Initiate = sendOtp
- Verify = verifyOtp
- Restore = checkStoredToken
- Refresh = api.js response interceptor refresh flow
- Revoke = logoutUser

## 0.5 End-to-End Runtime Flow (Current App Example)

1. Login screen par user input validate hota hai.
2. UI dispatch karti hai sendOtp thunk.
3. Thunk service layer authApi.sendOtp call karta hai.
4. Service api client use karti hai; request interceptor headers/tokens handle karta hai.
5. Response thunk ko milta hai; thunk fulfilled/rejected dispatch karta hai.
6. Verify screen par verifyOtp dispatch hota hai.
7. verifyOtp success par storage layer saveAuthSession run hota hai.
8. Reducer token/user update karta hai.
9. RootNavigator token + user + isAuthChecked read karke route switch karta hai.

---

## 1. Pre-Flight Intake Gate (Coding se Pehle Mandatory)

Coding start se pehle ye inputs lock karo.

1. API artifacts

- initiateAuth request + response sample
- verifyAuth request + response sample
- refresh endpoint contract
- logout/session revoke contract
- 4xx/5xx sample error payloads
- Postman screenshot + raw JSON samples

2. Auth expectations

- app unlock condition kya hai (recommended: token + valid user)
- logout ke baad route behavior kya hoga
- app start pe restore required hai ya hard login
- role fallback route kya hoga

3. UX expectations

- loading UX
- retry UX
- error copy tone
- offline behavior

4. Policy locks

- token storage standard (prod recommended: keychain/secure store)
- retry cap + backoff policy
- refresh rotation policy
- app foreground recheck policy
- minimum test matrix

Agar ye clear nahi hai to coding hold karo. Rework risk high hota hai.

---

## 2. Single Source Of Truth Decision

Golden rule:

- Ek data ka final owner ek hi jagah.
- Same auth truth ko Redux aur local state dono me owner mat banao.

### Redux Slice + Thunk Kab Mandatory Hai

Redux use karo agar:

1. Data multiple screens me use hota hai.
2. Data navigation decide karta hai.
3. Data app restart ke baad restore hota hai.
4. Global loading/error status dikhana hai.
5. Session/auth critical hai.

### Direct Service Call (Local State) Kab Theek Hai

Local call use karo agar:

1. Data sirf current screen ke liye hai.
2. Navigation us data pe depend nahi karti.
3. Data lose hone se major functional issue nahi hota.

### Quick Matrix

| Situation                  | Approach                     |
| -------------------------- | ---------------------------- |
| token, user, isAuthChecked | Redux slice + thunk          |
| app route decision         | Redux slice + thunk          |
| one-screen helper data     | local state + direct service |
| cross-screen summary data  | Redux/global cache           |

---

## 3. Layer-First Implementation Order (Minimal Risk)

1. Existing code audit

- authSlice, authApi, authStorage, api.js, RootNavigator verify karo.

2. API contract verification

- Postman pe 200/4xx/5xx behavior lock karo.

3. State contract define karo

- token, user, refreshToken, isAuthChecked
- loading/error pairs per action

4. Ownership map finalize karo

- UI kya karegi, thunk kya karega, service kya karega, reducer kya karega.

5. Service layer build/adjust

- authApi: endpoint call + payload normalization
- authStorage: save/get/remove session

6. Network policy ensure karo

- interceptors, timeout, refresh retry queue

7. Redux thunks wire karo

- restore, initiate, verify, logout

8. Reducers deterministic banao

- pending/fulfilled/rejected transitions clean rakho.

9. Root route guard wire karo

- isAuthChecked gate
- token + user validation
- role-based fallback

10. UI integration karo

- validation first
- loading disable
- local + redux error rendering

11. Failure path test karo

- no internet
- bad response shape
- invalid verification input
- logout then relogin

12. Ship checklist run karo

- section 15 ke yes/no gates pass hone chahiye.

---

## 4. UI Layer Rules (Safety + Reusability)

## 4.1 Validation First

- Invalid input pe API call mat bhejo.
- Waste requests aur noisy logs dono kam hote hain.

## 4.2 Loading Guard

- loading true -> CTA disabled.
- duplicate tap guard mandatory.

## 4.3 try/catch/finally Non-Negotiable

- try: API call
- catch: user-friendly error
- finally: loading reset

finally miss hua to infinite spinner/disabled CTA risk.

## 4.4 Back Press / Unmount Safety

Agar user back kare aur response baad me aaye to stale state update avoid karo.

```javascript
useEffect(() => {
  let isActive = true;

  const run = async () => {
    try {
      setLoading(true);
      const data = await serviceCall();
      if (!isActive) return;
      setUiData(data);
    } catch (e) {
      if (!isActive) return;
      setError('Please try again');
    } finally {
      if (!isActive) return;
      setLoading(false);
    }
  };

  run();

  return () => {
    isActive = false;
  };
}, []);
```

## 4.5 UI Architecture Guardrails

- SafeAreaView coverage mandatory where screen edges involved.
- KeyboardAvoidingView use karo where input-heavy form hai.
- inline styles avoid karo; StyleSheet + reusable tokens use karo.

## 4.6 Safe Defaults

- route params missing ho sakte hain.
- API fields missing ho sakti hain.

Defaults:

- mobile: ''
- userName: 'Guest'
- role: 'Unknown'
- token: null
- user: null

---

## 5. Redux Thunk State Machine (Generic First)

Har thunk same pattern follow kare:

1. idle
2. pending
3. fulfilled
4. rejected

Generic pattern:

```text
onAction
  -> if loading: return
  -> if invalid input: localError, return
  -> dispatch thunk
      pending: loading=true, error=null
      call service
      response guard
      fulfilled/rejected
  -> reducer updates state
  -> UI auto re-render
```

Current project mapping:

- initiate: sendOtp
- verify: verifyOtp
- restore: checkStoredToken
- revoke: logoutUser

---

## 6. Service + Network + Storage Layer Roles

## 6.1 Service Layer (authApi)

- endpoint abstraction
- payload normalization (example: role normalization)
- API response handoff to thunk

## 6.2 Network Layer (api.js interceptors)

Request interceptor:

- stored token attach karta hai
- JSON/FormData content-type handle karta hai

Response interceptor:

- network down ko mapped error deta hai
- 401 pe refresh flow run karta hai
- refresh in-progress ho to failedQueue me requests hold karta hai
- refresh success pe queued requests retry karta hai
- refresh fail pe queued requests reject karke clear karta hai
- repeated refresh fail threshold hit hone par force logout path trigger karta hai

## 6.3 Storage Layer (authStorage)

- saveAuthSession
- getStoredAuthSession
- removeAuthSession

Storage contract safe parse + null fallback hona chahiye.

## 6.4 Security Note

Current code AsyncStorage use karta hai. Production-grade security ke liye sensitive token storage secure store/keychain based hona chahiye.

---

## 7. Response Guard Pipeline + Shape Strategy

Response ko 4 gates se pass karo:

1. Transport gate

- response mila ya network fail?

2. Shape gate

- token string hai?
- user object hai?
- required fields present hain?

3. Business gate

- success/domain condition true hai?

4. Mapping gate

- UI model me normalize with defaults.

### Required vs Optional Fields

| Field        | Required? | Fallback        | UI impact                  |
| ------------ | --------- | --------------- | -------------------------- |
| token        | Yes       | null            | app unlock block           |
| user         | Yes       | null            | auth fail                  |
| user.role    | Yes       | 'Unknown'       | role fallback route        |
| refreshToken | Optional  | null            | refresh capability limited |
| message      | Optional  | generic message | user error text            |

Normalize example:

```javascript
const normalizeVerify = response => {
  const token = typeof response?.token === 'string' ? response.token : null;
  const userCandidate = response?.user ?? response?.data ?? null;

  const user =
    userCandidate && typeof userCandidate === 'object' ? userCandidate : null;

  return {
    token,
    user,
    refreshToken: response?.refreshToken ?? null,
    message: response?.message ?? 'Something went wrong',
  };
};
```

---

## 8. Navigator Gate Rules (State-Driven)

Route decision always state-based hona chahiye:

1. isAuthChecked false -> Splash
2. isAuthChecked true + (token missing OR user missing) -> AuthStack
3. token + user valid -> role-based app stack

Critical rules:

- app unlock token + user dono pe ho.
- logout ke baad isAuthChecked true hi rahe (freeze avoid).
- hidden local flags se route decide mat karo.

---

## 9. Retry Rules (Generic But Practical)

1. NETWORK_ERROR

- retry CTA do.

2. Initiate action (example: OTP send)

- max 1 auto retry (1s -> 2s backoff)
- uske baad manual retry.

3. Verify action (example: OTP verify)

- auto retry avoid karo
- manual retry only after input recheck.

4. Manual retry cap

- max 3 attempts session window
- phir cooldown/support message.

5. Non-retriable errors

- validation error
- rate limit
- malformed input

Inme retry button se pehle corrective action do.

---

## 10. Friendly Error Copy Map

| Error Type      | User Message (Example)                          | User Action |
| --------------- | ----------------------------------------------- | ----------- |
| NETWORK_ERROR   | Internet issue aa rahi hai. Please retry.       | Retry       |
| TIMEOUT         | Network slow hai. Thoda wait karke retry karo.  | Retry       |
| RATE_LIMIT      | Limit reach ho gayi. 2-5 min baad try karo.     | Wait        |
| INVALID_CODE    | Verification code galat hai. Dobara check karo. | Re-enter    |
| SERVER_ERROR    | Server busy hai. Thodi der me try karo.         | Retry later |
| SESSION_EXPIRED | Session expire ho gaya. Please login again.     | Re-login    |

---

## 11. Deep Dive Flows (Current Project Example)

## Flow A - Initiate Auth (Current: sendOtp)

1. screen input validate.
2. sendOtp dispatch.
3. sendOtp pending -> loading true.
4. authApi.sendOtp call.
5. success -> verify screen.
6. fail -> user-friendly error.

## Flow B - Verify Auth (Current: verifyOtp)

1. verification input validate.
2. verifyOtp pending.
3. authApi.verifyOtp call.
4. token + user guard.
5. saveAuthSession.
6. reducer update.
7. RootNavigator state se route switch.

## Flow C - App Start Session Restore (Current: checkStoredToken)

1. app mount.
2. checkStoredToken dispatch.
3. storage read.
4. fulfilled/rejected dono me isAuthChecked true.
5. navigator gate route decide karta hai.

## Flow D - Logout (Current: logoutUser)

1. logoutUser dispatch.
2. storage cleanup.
3. reducer reset token/user.
4. isAuthChecked true rahe.
5. navigator auth stack pe aaye.

Agar logout ke baad isAuthChecked false ho gaya to splash freeze risk create ho sakta hai.

## Flow E - Refresh Token (api.js interceptor)

1. protected call pe 401.
2. original.\_retry check.
3. refresh already running ho to request queue me wait.
4. refresh token missing ho to force logout.
5. refresh success:

- new access token save
- queued requests retry

6. refresh fail:

- request queue reject/clear (hanging avoid)
- refresh failure counter track karo
- 2 consecutive refresh failures pe force logout + session clear
- unauthorized callback path (if registered)
- auth fallback route

7. loop avoid:

- retried request fir 401 de to direct fail-safe logout.

---

## 12. Static UI Se Dynamic API - Minimal Change Recipe

1. UI model keys pehle freeze karo.
2. adapter/normalizer function likho (API -> UI model).
3. component prop contract same rakho.
4. 4 states mandatory rakho:

- loading
- success
- empty
- error

5. missing fields pe fallback do.

Outcome:

- UI layout stable
- integration diff small
- regressions kam

---

## 13. Problem -> Safe Handling Table

| Problem                    | Safe Handling                               |
| -------------------------- | ------------------------------------------- |
| user fast multiple taps    | loading disable + in-flight guard           |
| back press during API      | cleanup + stale response ignore             |
| API shape drift            | 4-gate response pipeline + normalizer       |
| network down               | dedicated network message + retry           |
| missing route params       | optional chaining + defaults                |
| token present user missing | auth reject, do not unlock                  |
| refresh in parallel        | request queue wait + single refresh attempt |
| logout after flow          | isAuthChecked true keep                     |

---

## 14. React Native Architect Notes

### Architecture

1. Business logic component me overload mat karo; service/helper me shift karo.
2. Global auth decisions navigator state-driven rakho.
3. Reusable error mapper use karo.

### Observability

1. Dev logs meaningful rakho; noisy logs avoid karo.
2. Track events:

- sendOtp_fail
- verifyOtp_fail
- refresh_fail

3. API latency track karo.

### Security + Stability

1. Token storage standard lock karo.

- preferred: keychain/secure store for sensitive tokens.

2. Storage failure fallback define karo.

- write/read fail pe safe re-login path mandatory.

3. Logout pe guaranteed cleanup karo.
4. Timeout policy explicit rakho.
5. App foreground pe stale session recheck strategy define karo.
6. Refresh token rotation supported ho to rotate-and-store karo.

---

## 15. Go/No-Go Ship Gate (Yes/No)

Release se pehle check karo:

1. Validation fail par API stop ho rahi hai?
2. Loading me CTA disable ho raha hai?
3. Duplicate request block ho rahi hai?
4. try/catch/finally complete hai?
5. Back/unmount safe handling hai?
6. Retry UX clear hai?
7. Required response fields verify ho rahe hain?
8. Fallback defaults defined hain?
9. App unlock token + user dono pe hai?
10. Logout pe isAuthChecked true hai?
11. Minimum auth test matrix pass hua hai?

Agar 2 se zyada No hai to release hold karo.

## 15.1 Minimum Auth Test Matrix

1. Unit tests

- normalizer null/missing fields handle kare.

2. Thunk tests

- pending -> fulfilled/rejected transitions verify.
- verify action token/user missing pe reject kare.
- logout fulfilled/rejected dono me isAuthChecked true rahe.

3. Integration tests

- back press during request pe stale setState na ho.
- no internet pe retry UX + button states correct ho.
- refresh fail path pe forced logout trigger ho.

4. Smoke tests

- app restart ke baad restore expected behavior de.
- invalid role/user fallback route safe ho.

---

## 16. Known Current Implementation Notes (Code Awareness)

1. verify reducer compatibility mode me hai: user mapping action.payload.user aur action.payload.data dono shapes support karta hai.

- API contract stable hote hi ek single canonical response shape lock karna recommended hai.

2. Unauthorized callback RootNavigator se register hai, so interceptor forced logout pe Redux auth state bhi clear hota hai.

- Optional UX improvement: forced logout event pe user-facing toast/snackbar copy standardize karo.

3. Current project session persistence AsyncStorage based hai.

- Sensitive-token hardening ke liye secure storage migration roadmap maintain karo.

---

## 17. 60-Second Memory Formula

Validate first -> fetch safely -> guard response -> normalize data -> update single source of truth -> render with fallbacks -> navigate from state.

---

## 18. Start-to-Ship Cheatsheet

1. Generic flow pe socho, endpoint pe nahi.
2. Auth truth Redux me rakho.
3. Loading true means CTA disabled.
4. Duplicate requests block karo.
5. Response 4-gate checks lagao.
6. token + user dono pe unlock karo.
7. logout pe isAuthChecked true rakho.
8. unmount/back pe stale update ignore karo.
9. retry sirf retriable errors pe do.
10. raw API ko direct UI mat do.
11. storage parse-safe + fallback null contract rakho.
12. secure token policy lock karo.
13. try/catch/finally skip mat karo.
14. refresh queue + force logout fallback define karo.
15. error paths + restore + refresh test matrix run karo.
16. release se pehle ship gate pass karo.

---

## 19. Kya Ye Template New Project Me Reuse Ho Sakta Hai?

Haan, bilkul.

Reusability rules:

1. Layer order same rakho.
2. Names change kar sakte ho (sendOtp/verifyOtp ki jagah initiate/verify).
3. Navigator gate rule same rakho: token + user + isAuthChecked.
4. Intake artifacts bina coding start mat karo.

Separate docs me maintain karo:

- environment and secrets
- monitoring dashboards
- org security policy details
- full test strategy document
