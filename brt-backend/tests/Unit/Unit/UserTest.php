<?php

namespace Tests\Unit\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password_hash' => Hash::make('password123'),
            'is_active' => true,
        ];

        $user = User::create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
        $this->assertTrue($user->is_active);
        $this->assertNotNull($user->id);
    }

    public function test_user_uses_uuid_as_primary_key(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->id);
        $this->assertIsString($user->id);
        // UUID format check
        $this->assertMatchesRegularExpression('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $user->id);
    }

    public function test_user_email_must_be_unique(): void
    {
        $email = 'unique@example.com';

        User::factory()->create(['email' => $email]);

        $this->expectException(\Illuminate\Database\QueryException::class);
        User::factory()->create(['email' => $email]);
    }

    public function test_user_can_have_roles(): void
    {
        $user = User::factory()->create(['roles' => ['admin', 'user']]);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('user'));
        $this->assertFalse($user->hasRole('moderator'));
    }

    public function test_user_can_assign_and_remove_roles(): void
    {
        $user = User::factory()->create(['roles' => []]);

        $user->assignRole('admin');
        $this->assertTrue($user->hasRole('admin'));

        $user->removeRole('admin');
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_user_can_get_permissions_based_on_roles(): void
    {
        $adminUser = User::factory()->create(['roles' => ['admin']]);
        $userPermissions = $adminUser->getPermissions();

        $this->assertContains('manage_users', $userPermissions);
        $this->assertContains('approve_requests', $userPermissions);
        $this->assertContains('view_audit_logs', $userPermissions);
    }

    public function test_user_full_name_attribute(): void
    {
        $userWithName = User::factory()->create(['name' => 'John Doe']);
        $userWithoutName = User::factory()->create(['name' => null, 'email' => 'john@example.com']);

        $this->assertEquals('John Doe', $userWithName->full_name);
        $this->assertEquals('john@example.com', $userWithoutName->full_name);
    }

    public function test_user_initials_attribute(): void
    {
        $userWithTwoNames = User::factory()->create(['name' => 'John Doe']);
        $userWithOneName = User::factory()->create(['name' => 'John']);
        $userWithoutName = User::factory()->create(['name' => null, 'email' => 'john@example.com']);

        $this->assertEquals('JD', $userWithTwoNames->initials);
        $this->assertEquals('JO', $userWithOneName->initials);
        $this->assertEquals('JO', $userWithoutName->initials);
    }

    public function test_user_password_authentication(): void
    {
        $password = 'password123';
        $user = User::factory()->create(['password_hash' => Hash::make($password)]);

        $this->assertEquals($user->password_hash, $user->getAuthPassword());
        $this->assertTrue(Hash::check($password, $user->getAuthPassword()));
    }

    public function test_user_jwt_methods(): void
    {
        $user = User::factory()->create();

        $this->assertEquals($user->getKey(), $user->getJWTIdentifier());
        $this->assertIsArray($user->getJWTCustomClaims());
    }

    public function test_user_scope_with_role(): void
    {
        User::factory()->create(['roles' => ['admin']]);
        User::factory()->create(['roles' => ['user']]);
        User::factory()->create(['roles' => ['admin', 'user']]);

        $adminUsers = User::withRole('admin')->get();

        $this->assertEquals(2, $adminUsers->count());
    }

    public function test_user_email_verification_fields(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'email_verification_token' => 'test-token'
        ]);

        $this->assertNotNull($user->email_verified_at);
        $this->assertEquals('test-token', $user->email_verification_token);
        $this->assertInstanceOf(\Carbon\Carbon::class, $user->email_verified_at);
    }
}
