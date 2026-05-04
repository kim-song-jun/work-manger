# Release secrets — `release-desktop` workflow

Secrets required by `.github/workflows/release.yml`. Set under
**Settings → Secrets and variables → Actions** on the GitHub repository
(or at the org level for shared use).

Rotation cadence follows `docs/operations/operations-guide.md` §8.1
(secret rotation policy).

---

## macOS — Apple Developer ID + notarization

| Secret | Purpose | Where to get it |
|---|---|---|
| `APPLE_ID` | Apple ID email used to sign in to App Store Connect. | developer.apple.com → your account email. |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password (NOT your Apple ID password). | appleid.apple.com → Sign-In and Security → App-Specific Passwords → Generate. |
| `APPLE_TEAM_ID` | 10-character team identifier. | developer.apple.com → Membership → Team ID. |
| `MAC_CSC_LINK` | base64 of the `.p12` (Developer ID Application certificate). | `base64 -i DeveloperID.p12 \| pbcopy` on macOS. |
| `MAC_CSC_KEY_PASSWORD` | Password used when exporting the `.p12`. | You set it during export from Keychain Access. |

Rotation: app-specific password every 6 months; cert renewed per Apple's 1-year cadence.

---

## Windows — code signing

| Secret | Purpose | Where to get it |
|---|---|---|
| `WIN_CSC_LINK` | base64 of the `.pfx` / `.p12` cert (or cert reference for cloud signing). | `certutil -encode cert.pfx cert.b64 && type cert.b64` on Windows. |
| `WIN_CSC_KEY_PASSWORD` | Password for the `.pfx`. | Set when exporting the cert. |
| `WIN_PUBLISHER_NAME` | Display name on the cert (matches CN). Optional — defaults to "Molcube". | Same as the cert's Subject CN. |

For **cloud signing** (DigiCert KeyLocker / SSL.com eSigner / Azure Trusted Signing):
- Set `WM_WIN_SIGN_MODE=cloud` as a **repository variable** (not a secret) so
  `scripts/win-sign.cjs` takes over from electron-builder's built-in signtool path.
- `WIN_CSC_LINK` becomes the cert *thumbprint* / KeyLocker SMCTL config path
  (per provider docs). `WIN_CSC_KEY_PASSWORD` becomes the API password / PIN.
- `signtool.exe` must be on `PATH` (already true on `windows-latest` runners).

Rotation: EV cert procurement is a 1–2 week lead time; renew 30 days before expiry.

---

## AWS — S3 update publish + CloudFront

| Secret | Purpose | Where to get it |
|---|---|---|
| `WM_UPDATE_BUCKET` | Name of the S3 bucket (output `desktop_updates_bucket_name` from the prod terraform env). | `terraform -chdir=infra/terraform/envs/prod output -raw desktop_updates_bucket_name`. |
| `AWS_ACCESS_KEY_ID` | Access key for the publish IAM user / role. | IAM console (or use OIDC + `id-token: write` to swap to short-lived creds). |
| `AWS_SECRET_ACCESS_KEY` | Secret half of the above. | Same. |

The IAM principal needs `s3:PutObject`, `s3:PutObjectAcl`, `s3:GetObject`,
`s3:ListBucket`, `s3:DeleteObject`, `s3:AbortMultipartUpload` on the bucket
ARN — this is wired by `var.desktop_updates_publish_principal_arns` in
`infra/terraform/modules/desktop-updates`.

Rotation: AWS access keys every 90 days (or migrate to OIDC + role assumption — preferred).

---

## Repository variables (not secrets)

Set under **Settings → Secrets and variables → Actions → Variables**.

| Variable | Default | Use |
|---|---|---|
| `WM_WIN_SIGN_MODE` | `local` | `cloud` switches Windows signing to `scripts/win-sign.cjs`. |

---

## Local dev — none of the above

`npm run build:mac` / `build:win` / `build:linux` work without any secrets and
produce **unsigned** artifacts. Notarization, signing, and S3 publish all
no-op cleanly when their env vars are missing.
