<!DOCTYPE html>
<html dir="rtl">
<head>
    <style>
        * {
            margin: 2rem 1rem;
        }
        .results {
            list-style: none;
            padding: 0;
            max-width: 420px;
        }
        .results li {
            display: flex;
            justify-content: space-between;
            padding: 0.6rem 1rem;
            margin: 0.3rem 0;
            border-radius: 6px;
            background: #f2f2f2;
        }
        .results li.suitable {
            background: #d4edda;
            font-weight: bold;
        }
        .results li.not_suitable {
            background: #f8d7da;
        }
        .score {
            color: #666;
            font-size: 0.85rem;
        }
        fieldset {
            max-width: 420px;
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-top: 0.6rem;
        }
        input[type="text"] {
            width: 100%;
            padding: 0.4rem;
        }
    </style>
    <title>Demo Naive Bayes - توافق متطوع/فرصة</title>
</head>
<body>
    <h1>تصنيف توافق متطوع-فرصة (Naive Bayes)</h1>

    <form method="POST" action="{{ route('demo.classify') }}">
        @csrf

        <fieldset>
            <legend>بيانات المتطوع</legend>

            <label>
                المدينة
                <input type="text" name="volunteer_city" value="{{ old('volunteer_city', $volunteerCity ?? '') }}" placeholder="مثال: Damascus">
            </label>

            <label>
                المهارات (مفصولة بفاصلة)
                <input type="text" name="volunteer_skills" value="{{ old('volunteer_skills', $volunteerSkills ?? '') }}" placeholder="مثال: Teaching, First Aid">
            </label>
        </fieldset>

        <fieldset>
            <legend>بيانات الفرصة</legend>

            <label>
                المدينة
                <input type="text" name="opportunity_city" value="{{ old('opportunity_city', $opportunityCity ?? '') }}" placeholder="مثال: Damascus">
            </label>

            <label>
                المهارات المطلوبة (مفصولة بفاصلة)
                <input type="text" name="opportunity_skills" value="{{ old('opportunity_skills', $opportunitySkills ?? '') }}" placeholder="مثال: Teaching, Logistics">
            </label>
        </fieldset>

        <button type="submit">تصنيف</button>
    </form>

    @if(isset($result))
        <h3>النتيجة:</h3>
        <ul class="results">
            @foreach($result['scores'] as $label => $score)
                <li class="{{ $label }}">
                    <span>{{ $label === 'suitable' ? 'مناسب ✅' : 'مش مناسب ❌' }}</span>
                    <span class="score">score: {{ number_format($score, 3) }}</span>
                </li>
            @endforeach
        </ul>
        <p><strong>القرار النهائي:</strong> {{ $result['label'] === 'suitable' ? 'مناسب ✅' : 'مش مناسب ❌' }}</p>
    @endif
</body>
</html>
