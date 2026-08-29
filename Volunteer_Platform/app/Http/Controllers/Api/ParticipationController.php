<?php
// app/Http/Controllers/ParticipationController.php

namespace App\Http\Controllers\Api;


use App\Enum\ParticipationStatus;
use App\Enum\OrganizationStatus;
use App\Helpers\ApiResponse;
use App\Http\Requests\DecideParticipationRequest;
use App\Http\Requests\LogParticipationHoursRequest;
use App\Http\Requests\ParticipateRequest;
use App\Http\Resources\ParticipationResource;
use App\Models\Opportunity;
use App\Models\Participation;
use App\Enum\NotificationType;
use App\Enum\OpportunityStatus;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ParticipationController extends Controller
{
    /**
     * POST /opportunities/{opportunity}/participate
     */
    public function store(ParticipateRequest $request, Opportunity $opportunity)
    {
        $volunteer = Auth::user();

        if ($opportunity->status !== OpportunityStatus::RegistrationOpen) {
            return ApiResponse::getResponse(null, 422, 'This opportunity is not open for registration.');
        }

        $hasActiveParticipation = Participation::where('opportunity_id', $opportunity->id)
            ->where('volunteer_id', $volunteer->id)
            ->whereIn('status', [ParticipationStatus::Pending, ParticipationStatus::Accepted])
            ->exists();

        if ($hasActiveParticipation) {
            return ApiResponse::getResponse(null, 422, 'You already have an active application for this opportunity.');
        }

        $participation = DB::transaction(function () use ($request, $opportunity, $volunteer) {
            return Participation::create([
                'opportunity_id'  => $opportunity->id,
                'volunteer_id'    => $volunteer->id,
                'status'          => ParticipationStatus::Pending,
                'committed_hours' => $request->committed_hours,
                'participated_at' => now(),
            ]);
        });
        NotificationService::notify(
            $opportunity->organization->user,
            NotificationType::ApplicantNew,
            'New applicant',
            "{$volunteer->first_name} {$volunteer->last_name} applied to \"{$opportunity->title}\".",
            "/applicants/{$opportunity->id}"
            );

        return ApiResponse::getResponse(
            new ParticipationResource($participation),
            201,
            'Application submitted successfully.'
        );
    }

    /**
     * PUT /participations/{participation}  { status: accepted|rejected, rejection_reason? }
     */
    public function decide(DecideParticipationRequest $request, Participation $participation)
    {
        $organization = Auth::user()->organization;

        if (!$organization || $participation->opportunity->organization_id !== $organization->id) {
            return ApiResponse::getResponse(null, 403, 'Unauthorized.');
        }

        if ($organization->status !==OrganizationStatus::Verified) {
            return ApiResponse::getResponse(null, 403, 'Your organization must be verified to review applicants.');
        }

        if ($participation->status !== ParticipationStatus::Pending) {
            return ApiResponse::getResponse(null, 422, 'This application has already been decided.');
        }

        $newStatus = ParticipationStatus::from($request->status);

        DB::transaction(function () use ($request, $participation, $newStatus) {
            $participation->update([
                'status'           => $newStatus,
                'rejection_reason' => $newStatus === ParticipationStatus::Rejected ? $request->rejection_reason : null,
            ]);
        });
        NotificationService::notify(
            $participation->volunteer,
            $newStatus === ParticipationStatus::Accepted ? NotificationType::StatusAccepted : NotificationType::StatusRejected,
            $newStatus === ParticipationStatus::Accepted ? 'Application accepted' : 'Application rejected',
            "Your application for \"{$participation->opportunity->title}\" was {$newStatus->value}.",
            '/my-volunteering'
        );
        return ApiResponse::getResponse(
            new ParticipationResource($participation->fresh()),
            200,
            'Application updated successfully.'
        );
    }

    /**
     * PUT /participations/{participation}  { status: withdrawn }
     */
    public function withdraw(Participation $participation)
    {
        if ($participation->volunteer_id !== Auth::id()) {
            return ApiResponse::getResponse(null, 403, 'Unauthorized.');
        }

        if (!$participation->can_withdraw) {
            return ApiResponse::getResponse(null, 422, 'Withdrawal is no longer allowed for this opportunity.');
        }

        DB::transaction(function () use ($participation) {
            $participation->update([
                'status'         => ParticipationStatus::Withdrawn,
                'withdrawn_date' => now(),
            ]);
        });
        NotificationService::notify(
            $participation->opportunity->organization->user,
            NotificationType::ApplicantWithdrawn,
            'Applicant withdrew',
            "A volunteer withdrew from \"{$participation->opportunity->title}\".",
            "/applicants/{$participation->opportunity_id}"
        );
        return ApiResponse::getResponse(
            new ParticipationResource($participation->fresh()),
            200,
            'Withdrawn successfully.'
        );
    }

    /**
     * PATCH /participations/{participation}/hours  { hours }
     */
    public function logHours(LogParticipationHoursRequest $request, Participation $participation)
    {
        $organization = Auth::user()->organization;

        if (!$organization || $participation->opportunity->organization_id !== $organization->id) {
            return ApiResponse::getResponse(null, 403, 'Unauthorized.');
        }
    if ($request->user()->organization->status !== OrganizationStatus::Verified) {
    return ApiResponse::getResponse(null, 403, 'Your organization must be verified to log hours.');
}
        if ($participation->status !== ParticipationStatus::Accepted) {
            return ApiResponse::getResponse(null, 422, 'Hours can only be logged for accepted volunteers.');
        }

        if (now()->lt($participation->opportunity->end_date)) {
            return ApiResponse::getResponse(null, 422, 'Hours can only be logged after the opportunity ends.');
        }

        $participation->update(['hours_logged' => $request->hours]);
        NotificationService::notify(
            $participation->volunteer,
            NotificationType::Hours,
            'Hours confirmed',
            "Your hours for \"{$participation->opportunity->title}\" have been confirmed.",
            '/my-volunteering'
        );
        return ApiResponse::getResponse(
            new ParticipationResource($participation->fresh()),
            200,
            'Hours logged successfully.'
        );
    }

    /**
     * GET /opportunities/{opportunity}/participants
     */
    public function index(Opportunity $opportunity)
{
    $organization = Auth::user()->organization;

    if (!$organization || $opportunity->organization_id !== $organization->id) {
        return ApiResponse::getResponse(null, 403, 'Unauthorized.');
    }

    $participants = $opportunity->participations()
        ->with(['volunteer.volunteer.governorate', 'volunteer.volunteer.skills'])
        ->latest('participated_at')
        ->get();

    return ApiResponse::getResponse(
        ParticipationResource::collection($participants),
        200,
        'Participants retrieved successfully.'
    );
}

    /**
     * GET /volunteers/me/participations
     */
    public function myParticipations()
    {
        $participations = Participation::where('volunteer_id', Auth::id())
            ->with('opportunity.organization')
            ->latest('participated_at')
            ->get();

        return ApiResponse::getResponse(
            ParticipationResource::collection($participations),
            200,
            'Participations retrieved successfully.'
        );
    }
}
