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
        $text = $request->input('text');

        $nb = new NaiveBayesService();
        $nb->loadModel(storage_path('app/model.json'));

        $results = $nb->predictTopN($text, 3);

        return view('demo', compact('results', 'text'));
    }
}
