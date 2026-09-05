<?php
// app/Http/Controllers/Api/GovernorateController.php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\GovernorateRequest;
use App\Http\Requests\ToggleGovernorateStatusRequest;
use App\Http\Resources\GovernorateResource;
use App\Models\Governorate;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class GovernorateController extends Controller
{
    /**
     * GET /governorates — القائمة كاملة، الـ frontend بيفلتر النشطة بنفسه (getActiveGovernorates)
     */
    public function index()
    {
        return ApiResponse::getResponse(
            GovernorateResource::collection(Governorate::orderBy('name_en')->get()),
            Response::HTTP_OK,
        );
    }

    /**
     * POST /governorates — admin only
     */
    public function store(GovernorateRequest $request)
    {
        $governorate = Governorate::create($request->validated());

        return ApiResponse::getResponse(
            new GovernorateResource($governorate),
            Response::HTTP_CREATED,
            'Governorate created successfully'
        );
    }

    /**
     * PUT /governorates/{id} — admin only. name_en read-only بعد الإنشاء (السجلات القديمة بتأشر عليه بالقيمة)
     */
    public function update(GovernorateRequest $request, Governorate $governorate)
    {
        $governorate->update([
            'name_en' => $request->validated('name_en'),
        ]);

        return ApiResponse::getResponse(
            new GovernorateResource($governorate),
            Response::HTTP_OK,
            'Governorate updated successfully'
        );
    }

    /**
     * PATCH /governorates/{id}/status  { isActive }
     *
     * §7.3 — تعطيل المحافظة بيسكّر تسجيل كل الفرص المفتوحة فيها تلقائياً
     * (registration_closed_reason = city_deactivated). إعادة التفعيل ما بتفتحهم
     * تلقائياً — المنظمة لازم تفتحهم يدوياً عبر التوجل العادي.
     */
    public function toggleStatus(ToggleGovernorateStatusRequest $request, Governorate $governorate)
    {
        $isActive = $request->validated('isActive');

        DB::transaction(function () use ($governorate, $isActive) {
            $governorate->update(['is_active' => $isActive]);
            if (! $isActive) {
                \App\Models\Opportunity::where('governorate_id', $governorate->id)
                    ->where('registration_closed_manually', false)
                    ->whereNull('registration_closed_reason')
                    ->where('start_date', '>', now())
                    ->where('end_date', '>', now())
                    ->update([
                        'registration_closed_manually' => true,
                        'registration_closed_reason'   => 'city_deactivated',
                    ]);
            }
        });

        return ApiResponse::getResponse(
            new GovernorateResource($governorate->fresh()),
            Response::HTTP_OK,
            $isActive ? 'Governorate activated successfully' : 'Governorate deactivated successfully'
        );
    }
}
