# Archive Activation TODO

Code is shipped and deployed. These manual steps remain before the archive is live:

## 1. Create Supabase Project
- Go to supabase.com, create project "coc-concertz-archive"
- Run the SQL from `docs/superpowers/plans/2026-04-11-arweave-archive.md` (Task 15, Step 2)
- Tables: `archive_uploads`, `archive_fund`, `token_gates`

## 2. Add Supabase Env Vars (Vercel + .env.local)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Create Arweave Fund Wallet
- Create an Arweave wallet (via ArConnect or ArDrive CLI)
- Export the JWK (JSON Web Key)
- Add to env: `ARWEAVE_FUND_WALLET_JWK={"kty":"RSA","n":"..."}`
- Top up with AR tokens or use ArDrive Turbo's Stripe payment

## 4. Add ZABAL Token Gate Config
- `ZABAL_TOKEN_ADDRESS=0x...` (actual ZABAL contract on Base)
- `ZABAL_MIN_BALANCE=100000000` (100M)
- Update the `token_gates` Supabase table INSERT with actual contract address

## 5. Test Flow
- Connect wallet at /archive/upload
- Verify ZABAL balance check works
- Upload a test file
- Confirm it appears at /archive

## Future Phases
- v1.1: Knowledge graph from archive tags
- v1.2: Transcript import (old show transcripts)
- v1.3: BazAR marketplace for atomic assets
- v1.4: ZABAL rewards for archiving
- v1.5: Newsletter builder media picker from archive
