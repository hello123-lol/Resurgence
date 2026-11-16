# Resurgence 2.0

A Node.js/Express + PostgreSQL circular marketplace starter for Render.

## Included
- Email/password registration and login with bcrypt password hashing and server-side sessions.
- Multiple administrators: the first is bootstrapped from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; an existing admin can add more admins in the admin dashboard.
- A/B/C condition listings. A/B listings require admin approval; C listings are excluded from resale and marked for donation/recycling.
- Quantity slider with seller-configured bulk price tiers.
- Group carts with share codes, member quantities and target tracking.
- Stock alerts with in-app notifications when a matching listing is approved.
- Buyer/seller messaging, lowball guardrails, agreed deal creation and one-tap order/invoice locking.
- Voice dictation using browser SpeechRecognition; optional OpenAI parsing can split spoken inventory into structured drafts.
- Seller and admin dashboards.

## Deploy to Render
1. Create a new GitHub repository and upload the contents of this folder (not the enclosing folder).
2. In Render choose **New → Blueprint**, connect the repository and apply `render.yaml`.
3. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD` when prompted. Use a strong password of at least 10 characters.
4. Optionally add `OPENAI_API_KEY` for AI-powered voice listing parsing and set `OPENAI_MODEL` if desired.
5. Deploy. Render provisions PostgreSQL and the web service.

## Add more admins
Log in as an admin, open the avatar/dashboard, and use **Admin management → Add admin**. Each admin gets a separate email and password. Only existing admins can create or disable admin accounts.

## Notes / limitations to review before real commerce
- Group carts currently collect commitments and share codes; they do not process payments or automatically combine separate orders into a single shipment. The seller must confirm the group purchase and delivery arrangement.
- Bulk tiers are seller-provided total-price breakpoints; the price preview applies the tier total plus base price for any quantity above that tier.
- Stock-drop notices are in-app notifications visible in the user's dashboard, not email/SMS/push notifications. A matching alert is notified when a listing is approved.
- Voice recognition depends on browser/device support and permissions. OpenAI parsing is optional; without an API key, a basic draft is created.
- The lowball shield is a heuristic safety check, not a guarantee of fraud detection. It blocks unusually low buyer offers in chat; it does not determine whether a user is a scammer.
- Invoice generation creates an order record; it is not a tax invoice and no payment gateway is connected.
- Add payment processing, shipping integrations, email delivery, moderation workflows, rate limiting, backups, privacy policy and legal/tax review before production use.
