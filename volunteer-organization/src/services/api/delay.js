// تأخير اصطناعي موحّد لمحاكاة زمن استجابة الشبكة في وضع Mock فقط.

export function wait(duration = 300) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}