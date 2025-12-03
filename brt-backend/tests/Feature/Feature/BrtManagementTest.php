<?php

namespace Tests\Feature\Feature;

use App\Models\Brt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class BrtManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_authenticated_user_can_create_brt(): void
    {
        $brtData = [
            'reserved_amount' => 50.00
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->postJson('/api/brts', $brtData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'brt' => [
                            'id',
                            'user_id',
                            'brt_code',
                            'reserved_amount',
                            'status',
                            'created_at',
                            'updated_at',
                            'user'
                        ]
                    ],
                    'success',
                    'code'
                ]);

        $this->assertDatabaseHas('tickets', [
            'user_id' => $this->user->id,
            'reserved_amount' => '50.00',
            'status' => 'active'
        ]);
    }

    public function test_brt_code_is_automatically_generated(): void
    {
        $brtData = ['reserved_amount' => 25.50];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->postJson('/api/brts', $brtData);

        $response->assertStatus(201);

        $brtCode = $response->json('data.brt.brt_code');
        $this->assertStringStartsWith('BRT-', $brtCode);
        $this->assertEquals(12, strlen($brtCode)); // BRT- + 8 characters
    }

    public function test_unauthenticated_user_cannot_create_brt(): void
    {
        $brtData = ['reserved_amount' => 50.00];

        $response = $this->postJson('/api/brts', $brtData);

        $response->assertStatus(401);
    }

    public function test_brt_creation_requires_valid_data(): void
    {
        // Test missing reserved_amount
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->postJson('/api/brts', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['reserved_amount']);

        // Test invalid reserved_amount
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->postJson('/api/brts', ['reserved_amount' => 'invalid']);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['reserved_amount']);

        // Test negative reserved_amount
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->postJson('/api/brts', ['reserved_amount' => -10]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['reserved_amount']);
    }

    public function test_user_can_retrieve_their_brts(): void
    {
        $brt1 = Brt::factory()->create(['user_id' => $this->user->id, 'reserved_amount' => 50.00]);
        $brt2 = Brt::factory()->create(['user_id' => $this->user->id, 'reserved_amount' => 100.00]);

        // Create BRT for another user (should not be returned)
        $otherUser = User::factory()->create();
        Brt::factory()->create(['user_id' => $otherUser->id, 'reserved_amount' => 75.00]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/brts');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'brts' => [
                            '*' => [
                                'id',
                                'user_id',
                                'brt_code',
                                'reserved_amount',
                                'status',
                                'created_at',
                                'updated_at',
                                'user'
                            ]
                        ],
                        'pagination'
                    ],
                    'success'
                ]);

        $brts = $response->json('data.brts');
        $this->assertCount(2, $brts);
    }

    public function test_user_can_filter_brts_by_status(): void
    {
        Brt::factory()->create(['user_id' => $this->user->id, 'status' => 'active']);
        Brt::factory()->create(['user_id' => $this->user->id, 'status' => 'expired']);
        Brt::factory()->create(['user_id' => $this->user->id, 'status' => 'redeemed']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/brts?status=active');

        $response->assertStatus(200);
        $brts = $response->json('data.brts');
        $this->assertCount(1, $brts);
        $this->assertEquals('active', $brts[0]['status']);
    }

    public function test_user_can_retrieve_specific_brt(): void
    {
        $brt = Brt::factory()->create(['user_id' => $this->user->id, 'reserved_amount' => 125.50]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson("/api/brts/{$brt->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'BRT retrieved successfully',
                    'data' => [
                        'brt' => [
                            'id' => $brt->id,
                            'user_id' => $this->user->id,
                            'reserved_amount' => '125.50'
                        ]
                    ]
                ]);
    }

    public function test_user_cannot_retrieve_other_users_brt(): void
    {
        $otherUser = User::factory()->create();
        $brt = Brt::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson("/api/brts/{$brt->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_update_their_brt(): void
    {
        $brt = Brt::factory()->create(['user_id' => $this->user->id, 'reserved_amount' => 50.00]);

        $updateData = [
            'reserved_amount' => 75.25,
            'status' => 'expired'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->putJson("/api/brts/{$brt->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'BRT updated successfully',
                    'data' => [
                        'brt' => [
                            'id' => $brt->id,
                            'reserved_amount' => '75.25',
                            'status' => 'expired'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('tickets', [
            'id' => $brt->id,
            'reserved_amount' => '75.25',
            'status' => 'expired'
        ]);
    }

    public function test_user_cannot_update_other_users_brt(): void
    {
        $otherUser = User::factory()->create();
        $brt = Brt::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->putJson("/api/brts/{$brt->id}", ['reserved_amount' => 100.00]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_their_brt(): void
    {
        $brt = Brt::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->deleteJson("/api/brts/{$brt->id}");

        $response->assertStatus(200)
                ->assertJson(['message' => 'BRT deleted successfully']);

        $this->assertDatabaseMissing('tickets', ['id' => $brt->id]);
    }

    public function test_user_cannot_delete_other_users_brt(): void
    {
        $otherUser = User::factory()->create();
        $brt = Brt::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->deleteJson("/api/brts/{$brt->id}");

        $response->assertStatus(403);
    }

    public function test_brt_not_found_returns_404(): void
    {
        $nonExistentId = '019ae4bb-30f4-7332-9d08-c5de9046d4ff';

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson("/api/brts/{$nonExistentId}");

        $response->assertStatus(404);
    }

    public function test_brt_update_validation(): void
    {
        $brt = Brt::factory()->create(['user_id' => $this->user->id]);

        // Test invalid status
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->putJson("/api/brts/{$brt->id}", ['status' => 'invalid_status']);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['status']);

        // Test invalid reserved_amount
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->putJson("/api/brts/{$brt->id}", ['reserved_amount' => -50]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['reserved_amount']);
    }
}
