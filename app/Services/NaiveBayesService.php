<?php

namespace App\Services;

/**
 * NaiveBayesService
 *
 * موديل Naive Bayes لتصنيف توافق متطوع-فرصة (suitable / not_suitable)
 * بناءً على features مستخرجة من مقارنة بروفايل المتطوع مع الفرصة:
 *   - توافق المدينة
 *   - توافق المهارات (مطلوبة بالفرصة vs موجودة عند المتطوع)
 *
 * الآلية: log-probability + Laplace smoothing (Multinomial Naive Bayes)
 */
class NaiveBayesService
{
    protected $classes = [];
    protected $wordCounts = [];
    protected $vocabulary = [];
    protected $totalDocs = 0;

    /**
     * تطبيع اسم مدينة أو مهارة عشان تصير موحدة كـ token
     * (lowercase + مسافات تصير underscore)
     */
    protected function normalizeSlug($value)
    {
        $value = mb_strtolower(trim((string) $value), 'UTF-8');
        $value = preg_replace('/\s+/u', '_', $value);
        $value = preg_replace('/[^a-z0-9_\x{0600}-\x{06FF}]/u', '', $value);
        return $value;
    }

    /**
     * بتحول بروفايل المتطوع + الفرصة لمجموعة features (tokens)
     * يلي هيي المدخل الفعلي لخوارزمية Naive Bayes.
     *
     * $volunteer = [
     *     'city'   => 'Damascus',
     *     'skills' => ['Teaching', 'First Aid'],
     * ];
     *
     * $opportunity = [
     *     'city'             => 'Damascus',
     *     'required_skills'  => ['Teaching', 'Logistics'],
     * ];
     */
    public function extractFeatures(array $volunteer, array $opportunity): array
    {
        $tokens = [];

        // 1) توافق المدينة
        $volunteerCity   = $this->normalizeSlug($volunteer['city'] ?? '');
        $opportunityCity = $this->normalizeSlug($opportunity['city'] ?? '');

        if ($volunteerCity !== '' && $opportunityCity !== '') {
            $tokens[] = ($volunteerCity === $opportunityCity) ? 'city_match' : 'city_mismatch';
        }

        // 2) توافق المهارات (مهارة مهارة)
        $volunteerSkills = array_values(array_filter(array_map(
            [$this, 'normalizeSlug'],
            $volunteer['skills'] ?? []
        )));

        $requiredSkills = array_values(array_filter(array_map(
            [$this, 'normalizeSlug'],
            $opportunity['required_skills'] ?? []
        )));

        $matchedCount = 0;

        foreach ($requiredSkills as $skill) {
            if (in_array($skill, $volunteerSkills, true)) {
                $tokens[] = "skill_match_{$skill}";
                $matchedCount++;
            } else {
                $tokens[] = "skill_missing_{$skill}";
            }
        }

        // 3) فيتشر عام لنسبة التداخل - بيساعد الموديل يعمم حتى لو
        //    مهارة معينة ما انعادت كتير بالـ dataset
        $totalRequired = count($requiredSkills);

        if ($totalRequired === 0) {
            $tokens[] = 'no_skills_required';
        } else {
            $ratio = $matchedCount / $totalRequired;

            if ($ratio == 1) {
                $tokens[] = 'skill_overlap_full';
            } elseif ($ratio >= 0.5) {
                $tokens[] = 'skill_overlap_high';
            } elseif ($ratio > 0) {
                $tokens[] = 'skill_overlap_low';
            } else {
                $tokens[] = 'skill_overlap_none';
            }
        }

        return $tokens;
    }

    /**
     * تدريب الموديل على مثال واحد: زوج (متطوع، فرصة) + label يدوي
     * $label لازم تكون 'suitable' أو 'not_suitable' (أو أي تسميتين تختاريهن)
     */
    public function trainMatch(array $volunteer, array $opportunity, string $label)
    {
        $tokens = $this->extractFeatures($volunteer, $opportunity);
        $this->addTokensToModel($tokens, $label);
    }

    /**
     * التنبؤ: هل الفرصة مناسبة للمتطوع ولا لأ
     *
     * بترجع:
     * [
     *   'label'  => 'suitable' | 'not_suitable',
     *   'scores' => ['suitable' => -4.2, 'not_suitable' => -9.7], // log-probabilities
     * ]
     */
    public function predictMatch(array $volunteer, array $opportunity): array
    {
        $tokens = $this->extractFeatures($volunteer, $opportunity);
        $scores = $this->scoreTokens($tokens);

        return [
            'label'  => array_key_first($scores),
            'scores' => $scores,
        ];
    }

    /**
     * تدريب الموديل من ملف نصي جهزتيه يدوياً.
     * صيغة كل سطر:
     * label|volunteer_city|volunteer_skills|opportunity_city|opportunity_required_skills
     *
     * المهارات مفصولة بفاصلة (,). الأسطر يلي تبلش بـ # بتتجاهل (تعليقات).
     *
     * مثال:
     * suitable|Damascus|Teaching,First Aid|Damascus|Teaching,First Aid
     * not_suitable|Aleppo|Cooking|Homs|Teaching,First Aid
     */
    public function trainMatchFromFile($path)
    {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $index => $line) {

            if ($index === 0) {
                $line = preg_replace("/^\xEF\xBB\xBF/", '', $line);
            }

            $trimmed = trim($line);

            if ($trimmed === '' || str_starts_with($trimmed, '#')) continue;
            if (!str_contains($trimmed, '|')) continue;

            $parts = explode('|', $trimmed);

            if (count($parts) !== 5) continue;

            [$label, $vCity, $vSkills, $oCity, $oSkills] = array_map('trim', $parts);

            if (empty($label)) continue;

            $volunteer = [
                'city'   => $vCity,
                'skills' => array_values(array_filter(array_map('trim', explode(',', $vSkills)))),
            ];

            $opportunity = [
                'city'            => $oCity,
                'required_skills' => array_values(array_filter(array_map('trim', explode(',', $oSkills)))),
            ];

            $this->trainMatch($volunteer, $opportunity, $label);
        }
    }

    // =========================================================
    // الجوهر (Core)
    // =========================================================

    /**
     * بتضيف مجموعة tokens (features) لموديل صنف معين
     */
    protected function addTokensToModel(array $tokens, $class)
    {
        $this->totalDocs++;

        if (!array_key_exists($class, $this->classes)) {
            $this->classes[$class] = 0;
            $this->wordCounts[$class] = [];
        }
        $this->classes[$class]++;

        foreach ($tokens as $token) {
            if (empty($token)) continue;

            $this->vocabulary[$token] = true;

            if (!isset($this->wordCounts[$class][$token])) {
                $this->wordCounts[$class][$token] = 0;
            }

            $this->wordCounts[$class][$token]++;
        }
    }

    /**
     * بترجع كل الفئات مرتبة تنازلياً حسب الـ score (log-probability)
     * على أساس مجموعة tokens (features)
     */
    protected function scoreTokens(array $tokens)
    {
        if (empty($this->classes)) {
            throw new \Exception("Model not trained");
        }

        $vocabSize = count($this->vocabulary);
        $scores = [];

        foreach ($this->classes as $class => $docCount) {

            $scores[$class] = log($docCount / $this->totalDocs);

            $totalTokens = array_sum($this->wordCounts[$class]);

            foreach ($tokens as $token) {
                if (empty($token)) continue;

                $tokenCount = $this->wordCounts[$class][$token] ?? 0;

                $scores[$class] += log($tokenCount + 1) - log($totalTokens + $vocabSize);
            }
        }

        arsort($scores);
        return $scores;
    }

    // =========================================================
    // حفظ / تحميل الموديل
    // =========================================================

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
        if (! file_exists($path)) {
        throw new \RuntimeException(
            "Naive Bayes model not found at {$path}. Run `php artisan demo:train` first."
        );
    }

        $data = json_decode(file_get_contents($path), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON: " . json_last_error_msg());
        }

        $vocab            = $data['vocabulary'];
        $this->totalDocs  = $data['meta']['total_docs'];
        $this->classes    = $data['classes'];
        $this->vocabulary = array_fill_keys($vocab, true);

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
