<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DemoController;
Route::get('/demo', [DemoController::class, 'showForm']);
Route::post('/demo', [DemoController::class, 'classify'])->name('demo.classify');
Route::get('/', function () {
    return view('welcome');
});
