# Happy Shisha — Contact Lambda Infrastructure

Handles the contact form submission via a Lambda Function URL + Nodemailer SMTP. Replaces the old `server.js` Express backend which couldn't run on AWS Amplify static hosting.

## What's deployed

| Resource | Details |
|---|---|
| Lambda Function | `happy-shisha-contact` — Node.js 20, eu-west-1 |
| Function URL | `https://xilyz6iavckduz6nusqos6f3fq0pylwg.lambda-url.eu-west-1.on.aws/` |
| SMTP | `jaylene@happyevents.co.za` via `www74.cpt1.host-h.net:465` |
| Allowed Origins | `happyshisha.co.za`, `happyevents.co.za` (www + non-www) |

## What it does

On form submit the Lambda:
1. Sends an admin notification to `jaylene@happyevents.co.za` with the booking details
2. Sends an auto-responder to the client using `email-templates/autoResponder.html` with the logo attached

## Structure

```
infra/
├── main.tf                        # Lambda, Function URL, IAM role
├── variables.tf                   # SMTP credentials, region, profile
├── outputs.tf                     # Prints the Function URL after apply
├── REPLICATE.md                   # Prompt to replicate this in another repo
└── lambda/
    ├── index.js                   # Lambda handler (Nodemailer)
    ├── package.json               # nodemailer dependency
    ├── logo.png                   # Attached to auto-responder email
    └── email-templates/
        └── autoResponder.html     # Client confirmation email template
```

## Requirements

- [OpenTofu](https://opentofu.org) installed
- AWS CLI with `alex` profile configured

## Deploy

```bash
cd infra
tofu init
tofu apply
```

## Update

Any change to `lambda/` or `main.tf` — just run `tofu apply` again. The `null_resource` re-runs `npm install` if `package.json` changes, rezips, and redeploys the function.

## Tear down

```bash
tofu destroy
```
