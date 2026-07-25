<!DOCTYPE html>
<html dir="rtl">
<head>
    <style>
        *{
            margin: 2rem 1rem;
        }
    </style>
    <title>Demo Naive Bayes</title>
</head>
<body>
    <h1>تصنيف الفرص باستخدام خوارزمية Naive Bayes</h1>

    <form method="POST" action="{{ route('demo.classify') }}">
        @csrf
        <textarea name="text" rows="4" cols="50" placeholder="اكتب نص لتصنيفه"></textarea><br>
        <button type="submit">تصنيف</button>
    </form>

    @if(isset($result))
        <h2>النص: {{ $text }}</h2>
        <h2>التصنيف: {{ $result }}</h2>
    @endif
</body>
</html>
