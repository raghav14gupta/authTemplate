# Auth Debug Reference - Layer + File Map (Hinglish)

Purpose:

- Fast root-cause isolation.
- Sahi file kholna.
- Wrong layer me time waste avoid karna.

Use in this order:

1. Runtime order verify karo.
2. Layer map + handoff comparator dekho.
3. Q1-Q10 question flow run karo.
4. Triage matrix + compressed cases apply karo.

## 0. Quick Reusable Template (Error Normalize + UI Crash Guard)

Purpose:

- Agar future me kisi bhi feature me API + UI crash confusion aaye, yeh section first open karo.
- Same terms use karo: normalize error, interceptor flow, guard checks.
- Pehle quick template follow karo, phir deep diagnosis ke liye niche ke sections use karo.

### 0.1 Standard Error Normalize Shape

Network/service boundary pe error ka fixed shape rakho:

```javascript
{
  message: string,
  type: string,
  statusCode: number | null,
  backendError: object | string | null,
}
```

Field meaning:

- message: human readable error text.
- type: machine-level category (NETWORK_ERROR, API_ERROR, SESSION_EXPIRED, FEATURE_API_ERROR).
- statusCode: HTTP status agar response aya ho, warna null.
- backendError: raw backend payload agar available ho, warna null.

Rule:

- UI me raw axios error directly consume mat karo.
- Service/Network layer normalized object return kare, UI sirf same shape read kare.

### 0.2 Interceptor Mental Model (Simple)

Request path:

1. Token read karo.
2. Authorization header attach karo.
3. FormData vs JSON ke hisab se Content-Type set/delete karo.

Response path:

1. Success response: direct pass-through.
2. No response: NETWORK_ERROR with statusCode null.
3. 401 first time: refresh try karo (queue + retry flow).
4. 401 after retry ya refresh unavailable: SESSION_EXPIRED + force logout path.
5. Other API failures: API_ERROR + backendError preserve karo.

Important:

- Ek baar interceptor [src/services/api.js](src/services/api.js) me add ho gaya to is client ko use karne wali sab service calls auto covered hoti hain.
- Sirf tab firse setup karna padta hai jab alag axios instance bana diya jaye.

### 0.3 Service Template (Stable Contract)

```javascript
export const featureServiceCall = async payload => {
  try {
    const response = await api.post('/api/feature-endpoint', payload);
    const normalizedData = normalizeFeatureResponse(response?.data);

    return {
      success: true,
      data: normalizedData,
    };
  } catch (error) {
    const normalizedError = {
      message: error?.message || 'Something went wrong',
      type: error?.type || 'FEATURE_API_ERROR',
      statusCode: error?.statusCode || error?.response?.status || null,
      backendError: error?.backendError || error?.response?.data || null,
    };

    return {
      success: false,
      data: [],
      error: normalizedError,
    };
  }
};
```

### 0.4 UI Crash Protection Guard Checklist

Fetch guards:

1. Success gate first: res?.success true hai ya nahi.
2. Shape gate: expected array/object check karo (Array.isArray etc).
3. Invalid payload pe safe fallback set karo (jaise empty array).

Render guards:

1. Optional chaining se field read karo (item?.imageUrl).
2. Type guard lagao (string expected ho to typeof check karo).
3. Empty string guard lagao (!value.trim()).
4. Index clamp use karo (Math.max/Math.min) jahan scroll/index logic hai.
5. Fallback UI do (placeholder ya null return), crash nahi.

### 0.5 Quick Error Type -> First File Map

| Error Type                                           | First File Open          | Fast Check                                     |
| ---------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| NETWORK_ERROR                                        | src/services/api.js      | error.response missing? internet/offline path  |
| SESSION_EXPIRED                                      | src/services/api.js      | 401 retry exhausted ya refresh token missing   |
| SESSION_REFRESH_FAILED                               | src/services/api.js      | refresh endpoint fail, queue flush/reject path |
| API_ERROR                                            | src/services/api.js      | statusCode + backendError preserved ya masked  |
| FEATURE_API_ERROR (example: ADVERTISEMENT_API_ERROR) | service file for feature | response normalize/parse logic mismatch        |

### 0.6 Fast Reuse Flow (Next Time)

1. UI me symptom note karo (crash, blank, stale data, wrong navigation).
2. Request trace run karo (UI -> dispatch -> thunk -> service -> network -> reducer -> selector -> render).
3. Error shape check karo (message/type/statusCode/backendError present?).
4. Service normalize aur UI guards compare karo.
5. Owner layer lock karo, phir niche wale detailed sections use karo.

Cross-reference:

- Service vs Network isolate: see section 2.2.
- One request trace protocol: see section 2.3.
- Detailed question drill: see section 3 (Q1-Q10).

### 0.7 Master Prompt (Copy-Paste)

Use this single prompt when you want full API-to-UI safety audit in one run.

```text
Mere React Native feature ka end-to-end API-to-UI Safety Audit karo aur agar issue mile to fix bhi karo.

Scope:
- Request/response flow trace karo: UI -> dispatch -> thunk -> service -> network interceptor -> reducer -> selector -> UI render.
- API response shape verify karo aur UI expectation se compare karo.
- Service layer me response normalization check/add karo.
- Error shape normalize karo to fixed structure:
  { message, type, statusCode, backendError }
- Interceptor audit karo:
  no-network path, API error mapping, 401 retry flow (_retry, isRefreshing, failedQueue, forceLogout), backend error passthrough.
- UI crash protection guards audit/add karo:
  success gate, Array.isArray checks, null/undefined guard, type guard, trim guard, safe index clamp, fallback render.
- Service contract enforce karo:
  { success, data, error } predictable return.
- Findings ko severity order me do (high -> low) with file + line references.
- Required code fixes apply karo.
- Verification do:
  what tested, what passed, residual risk kya hai.

Output format:
1) Root cause
2) File-wise fixes
3) Final normalized error/API shapes
4) Guards added/missing
5) Verification checklist + result
```

### 0.8 Kab Use Kare

Use this prompt when:

1. Naya API feature integrate karna ho aur pehle se safety audit chahiye.
2. Backend response shape change hua ho aur UI mismatch aa raha ho.
3. Ek service multiple screens me use ho rahi ho.
4. Crash ya blank screen API ke baad aa rahi ho.
5. 401/session/refresh + UI fallback dono ko ek saath audit karna ho.

Skip this prompt when:

1. Issue pure UI-only ho (no API path involved).
2. Backend contract abhi unstable ho (response format final na ho).
3. Sirf interceptor/token problem isolate karni ho (use section 0.2 and 2.2 directly).

## 1. Runtime Order (Second Top - Lock This)

```text
UI
-> DISPATCH
-> THUNK
-> SERVICE
-> NETWORK (axios + interceptor)
-> RESPONSE
-> REDUCER (state update)
-> SELECTOR
-> UI RE-RENDER
```

Important nuance:

- RESPONSE ke baad direct reducer nahi lagta.
- Pehle thunk response guard/decision karta hai (fulfilled/rejected), fir reducer update hota hai.

## 2. Layer Naming + Filename Reference

| Step | Layer        | Main File(s)                                                                     | Key Symbols                                            | Healthy Signal                         |
| ---- | ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| 1    | UI           | src/screens/auth/LoginWithPhoneScreen.js, src/screens/auth/VerifyMobileScreen.js | handleLoginWithOtp, handleVerify                       | click/input event + local validation   |
| 2    | Dispatch     | src/screens/auth/LoginWithPhoneScreen.js, src/screens/auth/VerifyMobileScreen.js | dispatch(sendOtp), dispatch(verifyOtp)                 | action result return                   |
| 3    | Thunk        | src/store/authSlice.js                                                           | sendOtp, verifyOtp, checkStoredToken, logoutUser       | pending -> fulfilled/rejected          |
| 4    | Service      | src/services/auth/authApi.js                                                     | authApi.sendOtp, authApi.verifyOtp, buildAuthPayload   | payload normalize + endpoint call      |
| 5    | Network      | src/services/api.js                                                              | request/response interceptors, setUnauthorizedCallback | request + response trace visible       |
| 6    | Response     | src/store/authSlice.js, src/services/api.js                                      | response?.success, response?.token, rejectWithValue    | bad payload reject, valid payload pass |
| 7    | Reducer      | src/store/authSlice.js                                                           | extraReducers                                          | deterministic state update             |
| 8    | Selector     | src/navigation/RootNavigator.js, auth screens                                    | useSelector(state => state.auth)                       | correct shape, no undefined            |
| 9    | UI Re-render | src/navigation/RootNavigator.js, auth screens                                    | gate checks for token/user/isAuthChecked               | correct stack/screen render            |

## 2.1 Adjacent Layer Comparator (All Handoffs)

Goal:

- Left layer chal raha hai but next layer nahi chal raha to exact break-point pakdo.

| Handoff                  | Left Signal Present, Right Missing              | Primary Owner             | First File Open                          | Second File Open                       |
| ------------------------ | ----------------------------------------------- | ------------------------- | ---------------------------------------- | -------------------------------------- |
| UI -> Dispatch           | click log aa raha, dispatch log nahi            | UI                        | src/screens/auth/LoginWithPhoneScreen.js | src/screens/auth/VerifyMobileScreen.js |
| Dispatch -> Thunk        | dispatch done, thunk start missing              | Dispatch/Thunk wiring     | src/screens/auth/LoginWithPhoneScreen.js | src/store/authSlice.js                 |
| Thunk -> Service         | thunk start, service payload log missing        | Thunk                     | src/store/authSlice.js                   | src/services/auth/authApi.js           |
| Service -> Network       | service payload log aa raha, [NET][REQ] missing | Service client binding    | src/services/auth/authApi.js             | src/services/api.js                    |
| Network -> Response      | [NET][REQ] aa raha, [NET][RES] missing          | Network                   | src/services/api.js                      | src/store/authSlice.js                 |
| Response -> Reducer      | thunk guard decided, reducer log missing        | Thunk/Reducer action path | src/store/authSlice.js                   | src/store/index.js                     |
| Reducer -> Selector      | reducer state update, selector undefined/stale  | Selector path             | src/navigation/RootNavigator.js          | src/store/index.js                     |
| Selector -> UI Re-render | selector new data, UI old branch                | UI render gate            | src/navigation/RootNavigator.js          | auth screen file                       |

## 2.2 Service vs Network Fault Isolation (Senior Method)

| Evidence Signature                               | Interpretation                    | Primary Owner Layer    | First File Open              |
| ------------------------------------------------ | --------------------------------- | ---------------------- | ---------------------------- |
| [SERVICE] present, [NET][REQ] missing            | wrong axios client or chain break | Service                | src/services/auth/authApi.js |
| [NET][REQ] present, Authorization missing        | token attach/interceptor issue    | Network                | src/services/api.js          |
| [NET][REQ] present, [NET][RES] missing           | hang/timeout/unresolved promise   | Network                | src/services/api.js          |
| [NET][RES][ERR] present, thunk pending           | reject/return chain incomplete    | Network/Thunk boundary | src/services/api.js          |
| response shape valid, thunk reject               | business guard mismatch           | Thunk                  | src/store/authSlice.js       |
| API file looks fine, repeated 401 + force logout | refresh/interceptor flow fault    | Network interceptor    | src/services/api.js          |

Senior isolate rule:

1. SERVICE yes + NET request no => Service layer first.
2. NET request yes + NET response pattern wrong => Network layer first.
3. NET response valid + fulfilled/rejected wrong => Thunk guard first.

## 2.3 One Request Trace Protocol (Lead Debug)

```javascript
// UI
console.log('[TRACE][UI] sendOtp click', { mobile, role: selectedRole });

// Dispatch result
console.log('[TRACE][DISPATCH] sendOtp result', action.type, action.payload);

// Thunk
console.log('[TRACE][THUNK] sendOtp start', requestId);

// Service
console.log('[TRACE][SERVICE] sendOtp payload', finalPayload);

// Network request
console.log(
  '[TRACE][NET][REQ]',
  reqConfig.method?.toUpperCase(),
  reqConfig.url,
);

// Network response
console.log('[TRACE][NET][RES]', statusCode, original?.url);

// Reducer
console.log('[TRACE][REDUCER] verifyOtp.fulfilled', action.payload);

// Selector + render
console.log(
  '[TRACE][UI-RENDER] token/user/isAuthChecked',
  token,
  user,
  isAuthChecked,
);
```

Expected order:

1. UI click
2. Dispatch
3. Thunk
4. Service
5. Network request
6. Network response
7. Thunk guard
8. Reducer update
9. Selector snapshot
10. UI rerender

Minimum log bundle before blame:

1. UI handler log
2. dispatch result log
3. thunk start + guard log
4. service payload log
5. request/response interceptor logs
6. reducer logs
7. selector + render logs

## 3. Top-to-Bottom 10 Debug Questions (Console Trick)

### Q1. UI event fire hua?

Where:

- src/screens/auth/LoginWithPhoneScreen.js
- src/screens/auth/VerifyMobileScreen.js

```javascript
console.log('[UI] click', { mobile, selectedRole });
```

If missing, suspect:

- onPress bind issue
- button disabled stuck

### Q2. Dispatch actually hua?

Where:

- same UI file

```javascript
console.log('[DISPATCH] sendOtp start');
const action = await dispatch(sendOtp({ mobile, role: selectedRole }));
console.log('[DISPATCH] sendOtp done', action.type, action.payload);
```

If missing, suspect:

- early return in validation

### Q3. Thunk start hua?

Where:

- src/store/authSlice.js

```javascript
console.log('[THUNK] sendOtp start', requestId, payload);
```

If missing, suspect:

- wrong action import/call

### Q4. Service layer call ho rahi?

Where:

- src/services/auth/authApi.js

```javascript
const finalPayload = buildAuthPayload(payload);
console.log('[SERVICE] sendOtp payload', finalPayload);
```

If missing, suspect:

- thunk -> service handoff break

### Q5. Network request nikli?

Where:

- src/services/api.js request interceptor

```javascript
console.log('[NET][REQ]', reqConfig.method?.toUpperCase(), reqConfig.url);
```

If missing, suspect:

- axios chain bypass
- wrong client instance

### Q6. Network response/interceptor hit hua?

Where:

- src/services/api.js response interceptor

```javascript
console.log('[NET][RES][OK]', res.status, res.config?.url);
console.log('[NET][RES][ERR]', err.response?.status, err.config?.url);
```

If missing, suspect:

- hanging request
- timeout path
- queue flush issue

### Q7. Response guard sahi decision le raha?

Where:

- src/store/authSlice.js

```javascript
if (response?.success) return response;
return rejectWithValue(response?.message || 'Failed to send OTP');
```

If wrong, suspect:

- success false ke sath fulfilled

### Q8. Reducer state update hua?

Where:

- src/store/authSlice.js extraReducers

```javascript
console.log('[REDUCER] verifyOtp.fulfilled', action.payload);
```

If missing, suspect:

- wrong action handler path

### Q9. Selector sahi path read kar raha?

Where:

- src/navigation/RootNavigator.js or screen

```javascript
const authState = useSelector(state => state.auth);
console.log('[SELECTOR] authState', authState);
```

If undefined, suspect:

- wrong slice path
- provider/scope mismatch

### Q10. UI re-render condition sahi hai?

Where:

- src/navigation/RootNavigator.js or screen render branch

```javascript
useEffect(() => {
  console.log(
    '[UI-RENDER] token/user/isAuthChecked',
    token,
    user,
    isAuthChecked,
  );
}, [token, user, isAuthChecked]);
```

If stale, suspect:

- render gate mismatch
- stale local copy
- condition type mismatch

## 4. Owner-Layer Triage (Fast)

### 4.1 Quick Triage Matrix (Open This First)

| Symptom                                    | First File Open                          | Second File Open                 | Expected Evidence                                |
| ------------------------------------------ | ---------------------------------------- | -------------------------------- | ------------------------------------------------ |
| Click hua but API hit nahi                 | src/screens/auth/LoginWithPhoneScreen.js | src/store/authSlice.js           | handler log present, thunk start missing/present |
| Service log yes but network request log no | src/services/auth/authApi.js             | src/services/api.js              | wrong client binding or chain break              |
| API hit hui but stuck pending              | src/services/api.js                      | src/store/authSlice.js           | response interceptor return/reject complete      |
| fulfilled aaya but UI old                  | src/navigation/RootNavigator.js          | auth screen file                 | selector path + render condition mismatch        |
| Error state set but UI blank               | auth screen file                         | src/store/authSlice.js           | sendOtpError/verifyOtpError mapping correct      |
| 401 loop/session drop                      | src/services/api.js                      | src/services/auth/authStorage.js | refresh token availability + force logout path   |
| Login success but wrong role stack         | src/navigation/RootNavigator.js          | src/services/auth/authApi.js     | role normalization + switch alignment            |
| State reset immediately                    | src/store/authSlice.js                   | src/store/index.js               | conflicting action timeline                      |

### 4.2 Common Misdiagnosis Traps (Compact)

| False Assumption                               | Counter-Check First                                                            | Likely Owner Layer  |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| API down hai                                   | UI validation early return logs verify karo                                    | UI/Dispatch         |
| Redux update nahi ho raha                      | Reducer logs + selector path dono verify karo                                  | Reducer/Selector    |
| Service bug hai                                | Service log ke baad request interceptor log aa raha ho to network suspect karo | Network             |
| UI stale hai                                   | Overwrite action timeline (clearAuth/checkStoredToken/logoutUser) verify karo  | Reducer/State flow  |
| Refresh flow broken means backend always wrong | refresh token presence + \_retry + failedQueue flush locally verify karo       | Network interceptor |

### 4.3 Compressed Debug Cases (CASE 1-12)

| Case    | Signal                                          | Primary Owner                   | First Focus Files                                                 | One-line Fix                                           |
| ------- | ----------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| CASE 1  | state updated but UI old                        | Selector/UI re-render           | src/navigation/RootNavigator.js, auth screen file                 | UI ko direct Redux selector source pe bind karo        |
| CASE 2  | state log new but screen no rerender            | Selector/render branch          | src/navigation/RootNavigator.js, App.jsx                          | selector path + render gates align karo                |
| CASE 3  | fulfilled with success false but navigation hua | Thunk guard + UI condition      | src/store/authSlice.js, src/screens/auth/LoginWithPhoneScreen.js  | business success ke bina navigate mat karo             |
| CASE 4  | click hua but thunk start nahi                  | UI/dispatch                     | src/screens/auth/LoginWithPhoneScreen.js, src/store/authSlice.js  | event -> dispatch dead path repair karo                |
| CASE 5  | request gaya but response chain stuck           | Network interceptor chain       | src/services/api.js, src/store/authSlice.js                       | hanging branch hatao, queue flush guarantee karo       |
| CASE 6  | selector undefined after update                 | Selector path                   | src/navigation/RootNavigator.js, src/store/index.js               | selector path ko store schema se align karo            |
| CASE 7  | rejected + error set but UI blank               | UI error mapping                | auth screen file, src/store/authSlice.js                          | reducer error key aur UI mapping sync karo             |
| CASE 8  | state update ke baad effect fire nahi           | UI effect dependency            | affected screen file, src/navigation/RootNavigator.js             | deterministic dependency list set karo                 |
| CASE 9  | 401 flow fail with token present                | Network refresh pipeline        | src/services/api.js, src/services/auth/authStorage.js             | refresh contract + persistence + retry path align karo |
| CASE 10 | UI update then immediate reset                  | Redux action race               | src/store/authSlice.js, src/store/index.js                        | conflicting action source isolate karo                 |
| CASE 11 | duplicate API calls                             | UI trigger + retry policy       | auth screen file, src/services/api.js                             | duplicate trigger guards + retry caps tighten          |
| CASE 12 | correct response but old user render            | Selector/render source of truth | src/navigation/RootNavigator.js, src/services/auth/authStorage.js | canonical user shape lock + stale read path remove     |

## 5. Reference Files (Authoritative)

- auth.md
- App.jsx
- src/store/index.js
- src/store/authSlice.js
- src/services/auth/authApi.js
- src/services/api.js
- src/services/auth/authStorage.js
- src/navigation/RootNavigator.js
- src/navigation/auth/AuthStack.js
- src/screens/auth/LoginWithPhoneScreen.js
- src/screens/auth/VerifyMobileScreen.js
