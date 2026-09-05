<?php

namespace App\Http\Controllers;

use App\Services\NaiveBayesService;
use Illuminate\Http\Request;

class DemoController extends Controller
{
    public function showForm()
    {
        return view('demo');
    }

    public function classify(Request $request)
    {
        $validated = $request->validate([
            'volunteer_city'      => 'required|string',
            'volunteer_skills'    => 'nullable|string',
            'opportunity_city'    => 'required|string',
            'opportunity_skills'  => 'nullable|string',
        ]);

        $volunteer = [
            'city'   => $validated['volunteer_city'],
            'skills' => $this->splitSkills($validated['volunteer_skills'] ?? ''),
        ];

        $opportunity = [
            'city'             => $validated['opportunity_city'],
            'required_skills'  => $this->splitSkills($validated['opportunity_skills'] ?? ''),
        ];

        $nb = new NaiveBayesService();
        $nb->loadModel(storage_path('app/models/volunteer_matching_model.json'));

        $result = $nb->predictMatch($volunteer, $opportunity);

        return view('demo', [
            'result'             => $result,
            'volunteerCity'      => $validated['volunteer_city'],
            'volunteerSkills'    => $validated['volunteer_skills'] ?? '',
            'opportunityCity'    => $validated['opportunity_city'],
            'opportunitySkills'  => $validated['opportunity_skills'] ?? '',
        ]);
    }

    /**
     * بتحول "Teaching, First Aid" لـ ['Teaching', 'First Aid']
     */
    protected function splitSkills(string $skillsText): array
    {
        return array_values(array_filter(array_map('trim', explode(',', $skillsText))));
    }
}
