export function temporaryPasswordEmail(name: string, password: string) {
  return {
    subject: 'Your Lumina temporary password',
    text: `Hi ${name}, your temporary Lumina password is ${password}. It expires in 24 hours.`,
    html: `<p>Hi ${name},</p><p>Your temporary Lumina password is:</p><p><strong>${password}</strong></p><p>It expires in 24 hours.</p>`,
  };
}

export function resetPasswordEmail(name: string, link: string) {
  return {
    subject: 'Reset your Lumina password',
    text: `Hi ${name}, reset your Lumina password: ${link}. This link expires in 30 minutes.`,
    html: `<p>Hi ${name},</p><p>Reset your Lumina password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`,
  };
}

export function invoiceEmail(orderNumber: string, html: string) {
  return { subject: `Lumina invoice ${orderNumber}`, html, text: `Invoice ${orderNumber}` };
}
