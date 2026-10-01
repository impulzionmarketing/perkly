export function whatsappLink(phoneE164: string, text: string) {
  return `https://wa.me/${phoneE164.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

export function smsLink(phoneE164: string, text: string) {
  return `sms:${phoneE164}?&body=${encodeURIComponent(text)}`;
}
