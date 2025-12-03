<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\BrtCreated;
use App\Events\BrtDeleted;
use App\Events\BrtUpdated;
use App\Events\BrtNotification;
use App\Helpers\ApiHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateBrtRequest;
use App\Http\Requests\UpdateBrtRequest;
use App\Models\Brt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class BrtController extends Controller
{


    /**
     * Display a listing of the authenticated user's BRTs.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::user();
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status');
            $search = $request->get('search');

            // For management, show all BRTs, not just user's own
            $query = Brt::with('user');

            // Status filter
            if ($status && in_array($status, ['active', 'expired', 'redeemed'])) {
                $query->where('status', $status);
            }

            // Search filter
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('brt_code', 'like', '%' . $search . '%')
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', '%' . $search . '%')
                                    ->orWhere('email', 'like', '%' . $search . '%');
                      });
                });
            }

            $brts = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return ApiHelper::validResponse('BRTs retrieved successfully', [
                'brts' => $brts->items(),
                'pagination' => [
                    'current_page' => $brts->currentPage(),
                    'last_page' => $brts->lastPage(),
                    'per_page' => $brts->perPage(),
                    'total' => $brts->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve BRTs', 500, $request, $e);
        }
    }

    /**
     * Store a newly created BRT.
     */
    public function store(CreateBrtRequest $request): JsonResponse
    {
        try {
            $user = JWTAuth::user();

            $brtData = array_merge($request->validated(), [
                'user_id' => $user->id,
                'status' => 'active'
            ]);

            $brt = Brt::create($brtData);
            $brt->load('user');

            // Broadcast BRT created event
            event(new BrtCreated($brt));
            event(new BrtNotification($brt, 'created'));

            // Broadcast analytics stats update
            event(new \App\Events\StatsUpdated());

            return ApiHelper::createdResponse('BRT created successfully', [
                'brt' => $brt
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to create BRT', 500, $request, $e);
        }
    }

    /**
     * Display the specified BRT.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::user();

            $brt = Brt::with('user')->where('id', $id)->first();

            if (!$brt) {
                return ApiHelper::notFoundResponse('BRT not found');
            }

            // Check if user owns this BRT
            if ($brt->user_id !== $user->id) {
                return ApiHelper::forbiddenResponse('You do not have access to this BRT');
            }

            return ApiHelper::validResponse('BRT retrieved successfully', [
                'brt' => $brt
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve BRT', 500, $request, $e);
        }
    }

    /**
     * Update the specified BRT.
     */
    public function update(UpdateBrtRequest $request, string $id): JsonResponse
    {
        try {
            $user = JWTAuth::user();

            $brt = Brt::where('id', $id)->first();

            if (!$brt) {
                return ApiHelper::notFoundResponse('BRT not found');
            }

            // Check if user owns this BRT
            if ($brt->user_id !== $user->id) {
                return ApiHelper::forbiddenResponse('You do not have access to this BRT');
            }

            $originalData = $brt->toArray();
            $brt->update($request->validated());
            $brt->load('user');

            // Broadcast BRT updated event
            event(new BrtUpdated($brt, $originalData));
            event(new BrtNotification($brt, 'updated'));

            // Broadcast analytics stats update
            event(new \App\Events\StatsUpdated());

            return ApiHelper::validResponse('BRT updated successfully', [
                'brt' => $brt
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to update BRT', 500, $request, $e);
        }
    }

    /**
     * Remove the specified BRT.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::user();

            $brt = Brt::where('id', $id)->first();

            if (!$brt) {
                return ApiHelper::notFoundResponse('BRT not found');
            }

            // Check if user owns this BRT
            if ($brt->user_id !== $user->id) {
                return ApiHelper::forbiddenResponse('You do not have access to this BRT');
            }

            $brtData = $brt->toArray();

            // Broadcast notification before deletion
            event(new BrtNotification($brt, 'deleted'));

            $brt->delete();

            // Broadcast BRT deleted event
            event(new BrtDeleted($brt->id, $brt->brt_code, $brt->user_id, $brtData));

            // Broadcast analytics stats update
            event(new \App\Events\StatsUpdated());

            return ApiHelper::validResponse('BRT deleted successfully');

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to delete BRT', 500, $request, $e);
        }
    }

    /**
     * Redeem a BRT by reservation code.
     */
    public function redeem(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'reservation_code' => 'required|string'
            ]);

            $reservationCode = $request->get('reservation_code');

            // Find BRT by reservation code
            $brt = Brt::where('brt_code', $reservationCode)
                     ->where('status', 'active')
                     ->with('user')
                     ->first();

            if (!$brt) {
                return ApiHelper::notFoundResponse('BRT not found or already redeemed/expired');
            }

            // Check if BRT is still valid (not expired)
            if ($brt->expires_at && now() > $brt->expires_at) {
                $brt->update(['status' => 'expired']);
                return ApiHelper::problemResponse('BRT has expired', 400);
            }

            // Redeem the BRT
            $originalData = $brt->toArray();
            $brt->update([
                'status' => 'redeemed',
                'redeemed_at' => now()
            ]);

            $brt->load('user');

            // Broadcast BRT updated event
            event(new BrtUpdated($brt, $originalData));
            event(new BrtNotification($brt, 'redeemed'));

            // Broadcast analytics stats update
            event(new \App\Events\StatsUpdated());

            return ApiHelper::validResponse('BRT redeemed successfully', [
                'brt' => $brt
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to redeem BRT', 500, $request, $e);
        }
    }
}
