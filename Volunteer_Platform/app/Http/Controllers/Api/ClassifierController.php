<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Services\NaiveBayesService;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;

class ClassifierController extends Controller
{

    public function classify(Request $request)
    {
        $request->validate([
            'opportunity_id' => 'required|exists:opportunities,id',
        ]);

        $volunteer = $request->user()->volunteer;

        if (!$volunteer) {
            return ApiResponse::getResponse([
                'message' => 'User is not volunteer!',
            ], 422);
        }

        $opportunity = Opportunity::with('skills')->findOrFail($request->input('opportunity_id'));

        $volunteerData = [
            'city' => $volunteer->governorate?->name_en,
            'skills' => $volunteer->skills->pluck('name')->toArray(),
        ];

        $opportunityData = [
            'city'            => $opportunity->governorate?->name_en,
            'required_skills' => $opportunity->skills->pluck('name')->toArray(),
        ];

        $nb = new NaiveBayesService();
        $nb->loadModel(storage_path('app/models/volunteer_matching_model.json'));

        $result = $nb->predictMatch($volunteerData, $opportunityData);

        return ApiResponse::getResponse([
            'opportunity_id' => $opportunity->id,
            'is_suitable'    => $result['label'] === 'suitable',
            'label'          => $result['label'],
            'scores'         => $result['scores'],
        ]);
    }
}
