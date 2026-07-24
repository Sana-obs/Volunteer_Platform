<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NaiveBayesService;


class DemoTrainNaiveBayes extends Command
{
    protected $signature = 'demo:train';
    protected $description = 'Train Naive Bayes Model from file';

    public function handle()
    {
        $nb = new NaiveBayesService();

$this->info("Starting training...");

$nb->trainFromFile(storage_path('app\training_data.txt'));

$this->info("Training completed!");

$nb->saveModel(storage_path('app\model.json'));

        $this->info("Model saved to model.json ✅");
    }
}
