<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Events\AuditEvent;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Register a new user
     */
    public function register(array $data): User
    {
        // Generate email verification token
        $verificationToken = Str::random(60);

        $userData = [
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'name' => $data['name'] ?? null,
            'is_active' => true,
            'email_verification_token' => $verificationToken,
        ];

        $user = $this->userRepository->create($userData);

        // Send verification email using the helper
        sendMailHelper([
            "data" => [
                "user" => $user,
                "verification_token" => $verificationToken,
                "verification_url" => url("/api/email/verify/{$user->id}/{$verificationToken}")
            ],
            "to" => $user->email,
            "from_email" => "noreply@brt-system.com",
            "from_name" => "BRT System",
            "template" => "emails/verification/email-verification",
            "subject" => "Verify Your Email Address - BRT System",
        ]);

        // Dispatch audit event
        event(new AuditEvent(
            user: $user,
            action: 'user.registered',
            resourceType: 'User',
            resourceId: $user->id,
            payload: ['email' => $user->email]
        ));

        return $user;
    }

    /**
     * Authenticate user and return JWT tokens
     */
    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password_hash)) {
            throw new AuthenticationException('Invalid credentials');
        }

        if (!$user->is_active) {
            throw new AuthenticationException('Account is inactive');
        }

        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = $this->generateRefreshToken($user);

        // Dispatch audit event
        event(new AuditEvent(
            user: $user,
            action: 'user.login',
            resourceType: 'User',
            resourceId: $user->id,
            payload: ['ip' => request()->ip()]
        ));

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => $user->load('roles.permissions')
        ];
    }

    /**
     * Refresh JWT token
     */
    public function refresh(string $refreshToken): array
    {
        // In a production environment, you'd validate the refresh token
        // against a database table and check if it's still valid

        try {
            $newToken = JWTAuth::refresh();
            $user = JWTAuth::user();

            return [
                'access_token' => $newToken,
                'refresh_token' => $refreshToken, // In production, generate new refresh token
                'token_type' => 'Bearer',
                'expires_in' => config('jwt.ttl') * 60,
                'user' => $user->load('roles.permissions')
            ];
        } catch (\Exception $e) {
            throw new AuthenticationException('Invalid refresh token');
        }
    }

    /**
     * Logout user and invalidate token
     */
    public function logout(): void
    {
        $user = JWTAuth::user();

        if ($user) {
            // Dispatch audit event
            event(new AuditEvent(
                user: $user,
                action: 'user.logout',
                resourceType: 'User',
                resourceId: $user->id,
                payload: ['ip' => request()->ip()]
            ));
        }

        JWTAuth::invalidate();
    }

    /**
     * Generate refresh token (simplified - in production use proper implementation)
     */
    protected function generateRefreshToken(User $user): string
    {
        // In production, store this token hashed in the database
        // with expiration time (e.g., 7 days)
        return base64_encode($user->id . '|' . time() . '|' . bin2hex(random_bytes(32)));
    }

    /**
     * Get authenticated user with roles and permissions
     */
    public function getAuthenticatedUser(): ?User
    {
        try {
            $user = JWTAuth::user();
            return $user ? $user->load('roles.permissions') : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Verify user email
     */
    public function verifyEmail(string $userId, string $token): bool
    {
        $user = $this->userRepository->findById($userId);

        if (!$user || $user->email_verification_token !== $token) {
            return false;
        }

        if ($user->email_verified_at) {
            return true; // Already verified
        }

        $user->email_verified_at = now();
        $user->email_verification_token = null;
        $user->save();

        // Dispatch audit event
        event(new AuditEvent(
            user: $user,
            action: 'user.email_verified',
            resourceType: 'User',
            resourceId: $user->id,
            payload: ['email' => $user->email]
        ));

        return true;
    }

    /**
     * Resend email verification
     */
    public function resendEmailVerification(User $user): bool
    {
        if ($user->email_verified_at) {
            return false; // Already verified
        }

        // Generate new verification token
        $verificationToken = Str::random(60);
        $user->email_verification_token = $verificationToken;
        $user->save();

        // Send verification email using the helper
        sendMailHelper([
            "data" => [
                "user" => $user,
                "verification_token" => $verificationToken,
                "verification_url" => url("/api/email/verify/{$user->id}/{$verificationToken}")
            ],
            "to" => $user->email,
            "from_email" => "noreply@brt-system.com",
            "from_name" => "BRT System",
            "template" => "emails/verification/email-verification",
            "subject" => "Verify Your Email Address - BRT System",
        ]);

        // Dispatch audit event
        event(new AuditEvent(
            user: $user,
            action: 'user.verification_resent',
            resourceType: 'User',
            resourceId: $user->id,
            payload: ['email' => $user->email]
        ));

        return true;
    }
}
