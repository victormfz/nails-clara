// Troque pelo seu número com código do país + DDD + número, apenas dígitos.
// Exemplo de formato: 5511999999999. O número abaixo é fictício.
export const WHATSAPP_NUMBER = '5521975383907';
export const WHATSAPP_MESSAGE = 'Oi, Clara! Vim pelo site e gostaria de saber mais sobre um agendamento!! <3';

export const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
