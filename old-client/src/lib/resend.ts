import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || "re_JTdZNMik_7mE3phmoHwjU5x51oKT5uq3D");
