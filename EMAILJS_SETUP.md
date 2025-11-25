# EmailJS Template Setup Guide

## Template Configuration

Your EmailJS templates are configured with the following variables:
- `{{passcode}}` - The OTP code
- `{{time}}` - The expiration time

## Important: Set the "To Email" Field

The most common cause of "The recipients address is empty" error is that the "To Email" field in EmailJS template settings is not configured.

### Step 1: Configure "To Email" in EmailJS Dashboard

1. Go to your EmailJS dashboard: https://dashboard.emailjs.com/
2. Navigate to **Email Templates**
3. Open your registration template (`template_4kemkwm`)
4. In the template settings, find the **"To Email"** field
5. Set it to use one of these variables:
   - `{{to_email}}` (recommended)
   - `{{user_email}}`
   - `{{email}}`

### Step 2: Configure Password Reset Template

1. Open your password reset template (`template_0kp2of2`)
2. Set the **"To Email"** field to the same variable as above

### Step 3: Verify Template Content

Your template content should look like this:

```
To authenticate, please use the following One Time Password (OTP):

{{passcode}}

This OTP will be valid for 5 minutes till {{time}}.

Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.

Jeevita will never contact you about this email or ask for any login codes or links. Beware of phishing scams.

Thanks for visiting Jeevita!
```

### Step 4: Test

After configuring the "To Email" field, test the registration and password reset flows. The code is already configured to send:
- `passcode`: The 6-digit OTP
- `time`: The expiration time (formatted)
- `to_email`, `user_email`, `email`: The recipient email address

**Note:** The "To Email" field in EmailJS template settings is separate from the template content. Make sure it's set to use a template variable!

