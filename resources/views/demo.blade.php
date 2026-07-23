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
            max-width: 400px;
        }
        .results li {
            display: flex;
            justify-content: space-between;
            padding: 0.6rem 1rem;
            margin: 0.3rem 0;
            border-radius: 6px;
            background: #f2f2f2;
        }
        .results li:first-child {
            background: #d4edda;
            font-weight: bold;
        }
        .score {
            color: #666;
            font-size: 0.85rem;
        }
    </style>
    <title>Demo Naive Bayes</title>
</head>
<body>
    <h1>تصنيف الفرص باستخدام خوارزمية Naive Bayes</h1>

    <form method="POST" action="{{ route('demo.classify') }}">
        @csrf
        <textarea name="text" rows="4" cols="50" placeholder="اكتب نص لتصنيفه">{{ $text ?? '' }}</textarea><br>
        <button type="submit">تصنيف</button>
    </form>

    @if(isset($results) && count($results) > 0)
        <h2>النص: {{ $text }}</h2>
        <h3>أفضل التصنيفات المقترحة:</h3>
        <ul class="results">
            @foreach($results as $index => $item)
                <li>
                    <span>{{ $index + 1 }}. {{ $item['category'] }}</span>
                    <span class="score">score: {{ number_format($item['score'], 3) }}</span>
                </li>
            @endforeach
        </ul>
    @endif
</body>
</html>
