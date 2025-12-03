@component('mail::message')
# Verify Your Email Address

Hello {{ $user->name ?? 'User' }},

Thank you for registering with BRT (Blume Reserve Ticket) system!

Please click the button below to verify your email address and activate your account.

@component('mail::button', ['url' => $verification_url])
Verify Email Address
@endcomponent

This verification link will expire in 60 minutes for your security.

If you did not create an account with us, please ignore this email.

Thanks,<br>
{{ config('app.name') }} Team
@endcomponent
