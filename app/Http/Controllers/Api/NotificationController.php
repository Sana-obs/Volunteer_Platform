<?php
// app/Http/Controllers/Api/NotificationController.php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    /**
     * GET /notifications?unread=1
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->when($request->boolean('unread'), fn ($q) => $q->where('seen', false))
            ->latest()
            ->limit(50)
            ->get();

        return ApiResponse::getResponse(
            NotificationResource::collection($notifications),
            Response::HTTP_OK,
        );
    }

    /**
     * PATCH /notifications/{notification}/read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'Unauthorized.');
        }

        $notification->update(['seen' => true]);

        return ApiResponse::getResponse(
            new NotificationResource($notification),
            Response::HTTP_OK,
            'Notification marked as read'
        );
    }

    /**
     * PATCH /notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('seen', false)
            ->update(['seen' => true]);

        return ApiResponse::getResponse(null, Response::HTTP_OK, 'All notifications marked as read');
    }
}
