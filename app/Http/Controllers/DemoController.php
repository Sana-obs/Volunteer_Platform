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

        $result = $nb->predict($text);

        return view('demo', compact('result', 'text'));
    }
}
