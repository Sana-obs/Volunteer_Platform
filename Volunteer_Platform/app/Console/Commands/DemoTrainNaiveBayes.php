<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NaiveBayesService;

class DemoTrainNaiveBayes extends Command
{
    protected $signature = 'demo:train';
    protected $description = 'Train Naive Bayes volunteer-opportunity matching model from file';

    public function handle()
    {
        $nb = new NaiveBayesService();

        $this->info('Starting training...');

        $nb->trainMatchFromFile(storage_path('app/volunteer_opportunity_dataset.txt'));

        $this->info('Training completed!');

        $modelDir = storage_path('app/models');

        if (!is_dir($modelDir)) {
            mkdir($modelDir, 0755, true);
        }

        $nb->saveModel($modelDir . '/volunteer_matching_model.json');

        $this->info('Model saved to storage/app/models/volunteer_matching_model.json ✅');
    }
}
