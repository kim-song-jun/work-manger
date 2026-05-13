import 'package:test/test.dart';
import 'package:wm_api/wm_api.dart';


/// tests for AuthApi
void main() {
  final instance = WmApi().getAuthApi();

  group(AuthApi, () {
    //Future auth2faChallengeCreate() async
    test('test auth2faChallengeCreate', () async {
      // TODO
    });

    //Future auth2faDisableCreate() async
    test('test auth2faDisableCreate', () async {
      // TODO
    });

    //Future auth2faEnableCreate() async
    test('test auth2faEnableCreate', () async {
      // TODO
    });

    //Future auth2faVerifyCreate() async
    test('test auth2faVerifyCreate', () async {
      // TODO
    });

    // Re-issue an email-verification link; ALWAYS returns 200 (no enumeration).  If the email matches an unverified user we enqueue an EMAIL row in the notification outbox. Verified or unknown emails silently no-op.
    //
    //Future authEmailResendCreate() async
    test('test authEmailResendCreate', () async {
      // TODO
    });

    // Validate an email-verification token and flip ``is_email_verified``.  Errors map to the standard envelope:   - 400 EMAIL_VERIFY_INVALID: bad/expired signature or unknown user   - 409 EMAIL_ALREADY_VERIFIED: idempotent re-use after success
    //
    //Future authEmailVerifyCreate() async
    test('test authEmailVerifyCreate', () async {
      // TODO
    });

    // Lockout-aware login. Emits audit on success/failure.  If TOTP enabled, returns a short-lived ``two_fa_token`` instead of an access pair — client must call /v1/auth/2fa/challenge to exchange.
    //
    //Future authLoginCreate() async
    test('test authLoginCreate', () async {
      // TODO
    });

    // Blacklist the supplied refresh token. Emits ``auth.logout``.
    //
    //Future authLogoutCreate() async
    test('test authLogoutCreate', () async {
      // TODO
    });

    // Complete OAuth and respond with login tokens (or a 2FA challenge).
    //
    //Future authOauthCallbackRetrieve(String provider) async
    test('test authOauthCallbackRetrieve', () async {
      // TODO
    });

    // Validate old password, apply new (with django validators), blacklist all refresh.
    //
    //Future authPasswordChangeCreate() async
    test('test authPasswordChangeCreate', () async {
      // TODO
    });

    // Trigger a password-reset email; ALWAYS returns 200 (no enumeration).
    //
    //Future authPasswordForgotCreate() async
    test('test authPasswordForgotCreate', () async {
      // TODO
    });

    // Consume a reset token + apply the new password.  On success: blacklists every refresh token, clears the lockout counter, and emits ``auth.password.reset_completed``.
    //
    //Future authPasswordResetCreate() async
    test('test authPasswordResetCreate', () async {
      // TODO
    });

    //Future authRefreshCreate() async
    test('test authRefreshCreate', () async {
      // TODO
    });

    //Future authSignupCreate() async
    test('test authSignupCreate', () async {
      // TODO
    });

  });
}
