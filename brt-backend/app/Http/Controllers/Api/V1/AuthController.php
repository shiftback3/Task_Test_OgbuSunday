<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->register($request->validated());
            $token = JWTAuth::fromUser($user);

            return ApiHelper::createdResponse('User registered successfully', [
                'user' => $user,
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Registration failed', 500, $request, $e);
        }
    }

    /**
     * Authenticate user and return JWT tokens
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $authData = $this->authService->login($credentials['email'], $credentials['password']);

            return ApiHelper::validResponse('Login successful', [
                'token' => $authData['access_token'],
                'user' => $authData['user'],
                'expires_in' => $authData['expires_in']
            ]);

        } catch (AuthenticationException $e) {
            return ApiHelper::unauthorizedResponse($e->getMessage());
        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Login failed', 500, $request, $e);
        }
    }

    /**
     * Refresh JWT token
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            // JWT refresh using Authorization header
            $newToken = JWTAuth::refresh();
            $user = JWTAuth::user();

            return ApiHelper::validResponse('Token refreshed successfully', [
                'token' => $newToken,
                'user' => $user,
                'expires_in' => config('jwt.ttl') * 60
            ]);

        } catch (AuthenticationException $e) {
            return ApiHelper::unauthorizedResponse($e->getMessage());
        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Token refresh failed', 500, $request, $e);
        }
    }

    /**
     * Logout user and invalidate token
     */
    public function logout(): JsonResponse
    {
        try {
            $this->authService->logout();

            return ApiHelper::validResponse('Successfully logged out');

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Logout failed', 500, null, $e);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(): JsonResponse
    {
        try {
            $user = $this->authService->getAuthenticatedUser();

            if (!$user) {
                return ApiHelper::notFoundResponse('User not found');
            }

            return ApiHelper::validResponse('Profile retrieved successfully', ['user' => $user]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve profile', 500, null, $e);
        }
    }

    /**
     * Get authenticated user (alias for profile)
     */
    public function me(): JsonResponse
    {
        return $this->profile();
    }

    /**
     * Verify email address
     */
    public function verifyEmail(string $id, string $token): JsonResponse
    {
        try {
            $verified = $this->authService->verifyEmail($id, $token);

            if (!$verified) {
                return ApiHelper::problemResponse('Invalid verification link or user not found', 400);
            }

            return ApiHelper::validResponse('Email verified successfully');

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Email verification failed', 500, null, $e);
        }
    }

    /**
     * Resend email verification
     */
    public function resendEmailVerification(): JsonResponse
    {
        try {
            $user = JWTAuth::user();

            if (!$user) {
                return ApiHelper::unauthorizedResponse('User not authenticated');
            }

            if ($user->email_verified_at) {
                return ApiHelper::problemResponse('Email is already verified', 400);
            }

            $sent = $this->authService->resendEmailVerification($user);

            if (!$sent) {
                return ApiHelper::problemResponse('Unable to resend verification email', 400);
            }

            return ApiHelper::validResponse('Verification email sent successfully');

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to resend verification email', 500, null, $e);
        }
    }
}
