<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiHelper;
use App\Http\Controllers\Controller;
use App\Models\Brt;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get BRT analytics dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            // Total statistics
            $totalBrts = Brt::count();
            $activeBrts = Brt::active()->count();
            $expiredBrts = Brt::expired()->count();
            $redeemedBrts = Brt::redeemed()->count();
            $totalReservedAmount = Brt::sum('reserved_amount');
            $totalUsers = User::count();

            // Today's statistics
            $today = Carbon::today();
            $todayBrts = Brt::whereDate('created_at', $today)->count();
            $todayReservedAmount = Brt::whereDate('created_at', $today)->sum('reserved_amount');

            // Weekly statistics (last 7 days)
            $weekStart = Carbon::now()->subDays(6)->startOfDay();
            $weeklyBrts = Brt::where('created_at', '>=', $weekStart)->count();
            $weeklyReservedAmount = Brt::where('created_at', '>=', $weekStart)->sum('reserved_amount');

            // Monthly statistics (current month)
            $monthStart = Carbon::now()->startOfMonth();
            $monthlyBrts = Brt::where('created_at', '>=', $monthStart)->count();
            $monthlyReservedAmount = Brt::where('created_at', '>=', $monthStart)->sum('reserved_amount');

            // Daily BRT creation for the last 30 days
            $dailyStats = Brt::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(reserved_amount) as total_amount')
                )
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date', 'desc')
                ->get();

            // Status distribution
            $statusDistribution = Brt::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->mapWithKeys(fn($item) => [$item->status => $item->count]);

            // Top users by BRT count
            $topUsers = User::select('users.*', DB::raw('COUNT(tickets.id) as brt_count'))
                ->leftJoin('tickets', 'users.id', '=', 'tickets.user_id')
                ->groupBy('users.id', 'users.name', 'users.email', 'users.created_at', 'users.updated_at', 'users.is_active', 'users.roles', 'users.email_verified_at', 'users.email_verification_token')
                ->orderBy('brt_count', 'desc')
                ->limit(10)
                ->get();

            return ApiHelper::validResponse('Analytics data retrieved successfully', [
                'overview' => [
                    'total_brts' => $totalBrts,
                    'active_brts' => $activeBrts,
                    'expired_brts' => $expiredBrts,
                    'redeemed_brts' => $redeemedBrts,
                    'total_reserved_amount' => number_format($totalReservedAmount, 2),
                    'total_users' => $totalUsers,
                ],
                'time_periods' => [
                    'today' => [
                        'brts_created' => $todayBrts,
                        'reserved_amount' => number_format($todayReservedAmount, 2),
                    ],
                    'this_week' => [
                        'brts_created' => $weeklyBrts,
                        'reserved_amount' => number_format($weeklyReservedAmount, 2),
                    ],
                    'this_month' => [
                        'brts_created' => $monthlyBrts,
                        'reserved_amount' => number_format($monthlyReservedAmount, 2),
                    ],
                ],
                'charts' => [
                    'daily_creation' => $dailyStats,
                    'status_distribution' => $statusDistribution,
                ],
                'top_users' => $topUsers,
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve analytics data', 500, $request, $e);
        }
    }

    /**
     * Get real-time BRT statistics
     */
    public function realTimeStats(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_brts' => Brt::count(),
                'active_brts' => Brt::active()->count(),
                'expired_brts' => Brt::expired()->count(),
                'redeemed_brts' => Brt::redeemed()->count(),
                'total_reserved_amount' => Brt::sum('reserved_amount'),
                'last_24h_brts' => Brt::where('created_at', '>=', Carbon::now()->subDay())->count(),
                'last_updated' => now()->toISOString(),
            ];

            return ApiHelper::validResponse('Real-time stats retrieved successfully', $stats);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve real-time stats', 500, $request, $e);
        }
    }

    /**
     * Get BRT trends over time
     */
    public function trends(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'daily'); // daily, weekly, monthly
            $days = $request->get('days', 30);

            $query = Brt::select(
                DB::raw($this->getDateFormat($period) . ' as period'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(reserved_amount) as total_amount'),
                'status'
            )
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->groupBy(DB::raw($this->getDateFormat($period)), 'status')
            ->orderBy('period', 'desc');

            $trends = $query->get();

            return ApiHelper::validResponse('Trends data retrieved successfully', [
                'period' => $period,
                'days' => $days,
                'trends' => $trends,
                'generated_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve trends data', 500, $request, $e);
        }
    }

    /**
     * Get date format for different periods
     */
    private function getDateFormat(string $period): string
    {
        return match($period) {
            'weekly' => "DATE_FORMAT(created_at, '%Y-%u')",
            'monthly' => "DATE_FORMAT(created_at, '%Y-%m')",
            default => "DATE(created_at)",
        };
    }
}
