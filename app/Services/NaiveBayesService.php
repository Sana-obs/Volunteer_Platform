<?php

namespace App\Services;
class NaiveBayesService{
    protected $classes = [];
    protected $wordCounts = [];
    protected $vocabulary = [];
    protected $totalDocs = 0;
    protected function normalizeArabic($text){
        $text = mb_strtolower($text, 'UTF-8');
        $text = preg_replace('/[\x{0617}-\x{061A}\x{064B}-\x{065F}]/u', '', $text);
        $text = str_replace(['أ', 'إ', 'آ'], 'ا', $text);
        $text = str_replace('ة', 'ه', $text);
        $text = str_replace(['ى','ئ'], 'ي', $text);
        $text = str_replace('ؤ', 'و', $text);
        $text = preg_replace('/[^\p{Arabic}A-Za-z\s]/u', '', $text);
        return $text;
    }
    protected function tokenize($text){
        $text = $this->normalizeArabic($text);
        $words= preg_split('/\s+/u', trim($text));
        return array_filter($words);
    }
    public function train($text, $class)
    {
        $words = $this->tokenize($text);

        $this->totalDocs++;

        if (!array_key_exists($class, $this->classes)) {
        $this->classes[$class] = 0;
        $this->wordCounts[$class] = [];
    }
        $this->classes[$class]++;

        foreach ($words as $word) {

            if (empty($word)) continue;

            $this->vocabulary[$word] = true;

            if (!isset($this->wordCounts[$class][$word])) {
                $this->wordCounts[$class][$word] = 0;
            }

            $this->wordCounts[$class][$word]++;
        }
    }
    public function predict($text)
{
    $words = $this->tokenize($text);

    if (empty($this->classes)) {
        throw new \Exception("Model not trained");
    }

    $vocabSize = count($this->vocabulary);
    $scores = [];

    foreach ($this->classes as $class => $docCount) {

        $scores[$class] = log($docCount / $this->totalDocs);

        $totalWords = array_sum($this->wordCounts[$class]);

        foreach ($words as $word) {

            if (empty($word)) continue;


            $wordCount = $this->wordCounts[$class][$word] ?? 0;

            $scores[$class] += log($wordCount + 1) - log($totalWords + $vocabSize);
        }
    }

    arsort($scores);
    return array_key_first($scores);
}
    public function trainFromFile($path)
{
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $index => $line) {

        // إزالة BOM من أول سطر فقط
        if ($index === 0) {
            $line = preg_replace("/^\xEF\xBB\xBF/", '', $line);
        }

        if (!str_contains($line, '|')) continue;

        [$class, $text] = explode('|', $line, 2);

        $class = trim($class);
        $text  = trim($text);

        if (empty($class) || empty($text)) continue;

        $this->train($text, $class);
    }
}





public function saveModel($path)
{

    $vocab     = array_keys($this->vocabulary);
    sort($vocab);
    $wordIndex = array_flip($vocab);
    $vocabSize = count($vocab);
    $matrixRows = [];
    foreach ($this->classes as $class => $_) {
        $row = array_fill(0, $vocabSize, 0);
        foreach (($this->wordCounts[$class] ?? []) as $word => $count) {
            if ($count > 0 && isset($wordIndex[$word])) {
                $row[$wordIndex[$word]] = 1;
            }
        }
        $matrixRows[$class] = $row;
    }


    $countVectors = [];
    foreach ($this->wordCounts as $class => $counts) {
        $vec = [];
        foreach ($counts as $word => $count) {
            if (isset($wordIndex[$word])) {
                $vec[(string)$wordIndex[$word]] = $count;
            }
        }
        ksort($vec, SORT_NUMERIC);
        $countVectors[$class] = $vec;
    }
    $matrixLines = [];
    foreach ($matrixRows as $class => $row) {
        $key          = json_encode($class, JSON_UNESCAPED_UNICODE);
        $vals         = implode(',', $row);
        $matrixLines[] = "        {$key}: [{$vals}]";
    }
    $matrixBlock = "{\n" . implode(",\n", $matrixLines) . "\n    }";
    $output = '{' . "\n"
        . '    "meta":          '   . json_encode([
            'total_docs'  => $this->totalDocs,
            'vocab_size'  => $vocabSize,
            'class_count' => count($this->classes),
        ], JSON_UNESCAPED_UNICODE) . ",\n"
        . '    "classes":       '   . json_encode($this->classes,   JSON_UNESCAPED_UNICODE) . ",\n"
        . '    "vocabulary":    '   . json_encode($vocab,          JSON_UNESCAPED_UNICODE) . ",\n"
        . '    "binary_matrix": '   . $matrixBlock                                         . ",\n"
        . '    "count_vectors": '   . json_encode($countVectors,
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
        . '}';

    file_put_contents($path, $output);
}
public function loadModel($path)
{
    if (!file_exists($path)) {
        throw new \Exception("Model file not found: {$path}");
    }

    $data = json_decode(file_get_contents($path), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \Exception("Invalid JSON: " . json_last_error_msg());
    }

    $vocab            = $data['vocabulary'];
    $this->totalDocs  = $data['meta']['total_docs'];
    $this->classes    = $data['classes'];
    $this->vocabulary = array_fill_keys($vocab, true);

    // إعادة بناء wordCounts من count_vectors
    $this->wordCounts = [];
    foreach ($data['count_vectors'] as $class => $vec) {
        $this->wordCounts[$class] = [];
        foreach ($vec as $idx => $count) {
            $word = $vocab[(int)$idx] ?? null;
            if ($word !== null) {
                $this->wordCounts[$class][$word] = (int)$count;
            }
        }
    }
}

}


