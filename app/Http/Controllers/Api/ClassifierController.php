<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NaiveBayesService;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;

class ClassifierController extends Controller
{
    public function classify(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $text = $request->input('text');

        $nb = new NaiveBayesService();
        $nb->loadModel(storage_path('app/model.json'));

        $result = $nb->predictTopN($text,2);

        return ApiResponse::getResponse([
            'text' => $text,
            'predicted_category' => $result,
        ]);
    }
}
