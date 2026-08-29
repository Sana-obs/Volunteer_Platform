<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Http\Requests\VerifyOrganizationRequest;
use App\Http\Requests\UploadVerificationDocumentRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Models\User;
use App\Enum\NotificationType;
use App\Enum\OrganizationStatus;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrganizationController extends Controller
{


public function index(Request $request)
{
    $organizations = Organization::with(['user', 'governorate'])
        ->when($request->filled('status'), fn ($q) =>
            $q->where('status', $request->string('status'))
        )
        ->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->string('search');
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                    ->orWhereHas('governorate', fn ($g) =>
                        $g->where('name_en', 'like', "%{$search}%")
                    );
            });
        })
        ->latest()
        ->paginate(15);

    return ApiResponse::getResponse(
        OrganizationResource::collection($organizations),
        Response::HTTP_OK,
    );
}
    public function store(OrganizationRequest $request)
{
    if (Organization::where('user_id', $request->user()->id)->exists()) {
        return ApiResponse::getResponse(null, 409, 'profile already exists');
    }

    $organization = $this->createOrganizationProfile(
        $request->user(),
        $request->validated(),
        $request
    );

    if (! $request->user()->hasRole('organization')) {
        $request->user()->assignRole('organization');
    }

    return ApiResponse::getResponse(
        new OrganizationResource($organization),
        Response::HTTP_CREATED,
        'Organization created successfully'
    );
}

    /**
     * منطق الإنشاء الفعلي — قابل للاستدعاء من store() أو من UserController::register()
     */
    public function createOrganizationProfile(User $user, array $data, Request $request): Organization
    {
        $data['user_id'] = $user->id;
        $data['status'] = $data['status'] ?? 'pending';

        $organization = Organization::create($data);

        if ($request->hasFile('verification_document')) {
            $organization->addMediaFromRequest('verification_document')
                ->toMediaCollection('verification_documents');
        }

        if ($request->hasFile('photo')) {
            $organization->addMediaFromRequest('photo')->toMediaCollection('profile_image');
        }
        NotificationService::notifyAdmins(
        NotificationType::PendingOrganization,
        'New organization pending review',
        "\"{$organization->name}\" submitted a registration and is awaiting verification.",
        '/admin/organizations'
    );

        return $organization;
    }
    public function update(UpdateOrganizationRequest $request, Organization $organization)
{
    if ($organization->user_id !== $request->user()->id) {
        return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'You are not authorized to update this organization.');
    }

    $data = $request->validated();
    unset($data['photo'], $data['photo_remove']);

    $organization->update($data);

    if ($request->hasFile('photo')) {
        $organization->clearMediaCollection('profile_image');
        $organization->addMediaFromRequest('photo')->toMediaCollection('profile_image');
    } elseif ($request->boolean('photo_remove')) {
        $organization->clearMediaCollection('profile_image');
    }

    return ApiResponse::getResponse(
        new OrganizationResource($organization->fresh()),
        Response::HTTP_OK,
        'Organization updated successfully'
    );
}

    public function show(Organization $organization)
    {
        return ApiResponse::getResponse(
            new OrganizationResource($organization->load('user')),
            Response::HTTP_OK,
        );
    }

   // OrganizationController::update()


    public function destroy(Request $request,Organization $organization)
    {
        if ($organization->user_id !== $request->user()->id) {
        return ApiResponse::getResponse(null, Response::HTTP_FORBIDDEN, 'You are not authorized to delete this organization.');
    }
        $organization->delete();

        return ApiResponse::getResponse(
            null,
            Response::HTTP_OK,
            'Organization deleted successfully'
        );
    }

public function verify(
    VerifyOrganizationRequest $request,
    Organization $organization
) {
    $newStatus = OrganizationStatus::from($request->validated('status')); // ← التحويل هون بدل الـ Request

    // Suspended is only allowed from Verified
    if (
        $newStatus === OrganizationStatus::Suspended &&
        $organization->status !== OrganizationStatus::Verified
    ) {
        return ApiResponse::getResponse(
            null,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Only verified organizations can be suspended.'
        );
    }

    $organization->update([
        'status' => $newStatus,

        'rejection_reason' => in_array($newStatus, [
            OrganizationStatus::Rejected,
            OrganizationStatus::Suspended,
        ], true)
            ? $request->validated('reason')
            : null,

        'reviewed_at' => now(),
    ]);

    
    $messages = [
        OrganizationStatus::Verified->value =>
            'Organization verified successfully',

        OrganizationStatus::Rejected->value =>
            'Organization verification rejected',

        OrganizationStatus::Suspended->value =>
            'Organization suspended successfully',
    ];

    $notifTypes = [
        OrganizationStatus::Verified->value =>
            NotificationType::OrgVerified,

        OrganizationStatus::Rejected->value =>
            NotificationType::OrgRejected,

        OrganizationStatus::Suspended->value =>
            NotificationType::OrgRejected,
    ];

    NotificationService::notify(
        $organization->user,
        $notifTypes[$newStatus->value],   // ← index بـ ->value
        $messages[$newStatus->value],     // ← index بـ ->value
        $newStatus !== OrganizationStatus::Verified
            ? $request->validated('reason')
            : null,
        '/organization-profile'
    );

    return ApiResponse::getResponse(
        new OrganizationResource($organization->fresh()),
        Response::HTTP_OK,
        $messages[$newStatus->value]   // ← index بـ ->value
    );
}

public function reuploadVerificationDocument(
    UploadVerificationDocumentRequest $request,
    Organization $organization
) {
    if ($organization->user_id !== $request->user()->id) {
        return ApiResponse::getResponse(
            null,
            Response::HTTP_FORBIDDEN,
            'You are not authorized to update this organization\'s verification.'
        );
    }

    $organization->clearMediaCollection('verification_documents');

    $organization
        ->addMediaFromRequest('verification_document')
        ->toMediaCollection('verification_documents');

    $organization->update([
        'status' => OrganizationStatus::Pending,
        'rejection_reason' => null,
    ]);

    return ApiResponse::getResponse(
        new OrganizationResource($organization),
        Response::HTTP_OK,
        'Document uploaded successfully, pending admin review'
    );
}
}

