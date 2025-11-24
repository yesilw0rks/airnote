import React from 'react';

/**
 * Parses custom AirNote syntax:
 * ## Header
 * **Bold**
 * *Italics*
 * -Strikethrough-
 * _Underline_
 */
export const parseAirNoteContent = (text: string): string => {
  if (!text) return '';

  let html = text
    // Escape HTML to prevent XSS (basic)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers (## Header)
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mb-4 mt-6 border-b border-air-border pb-2">$1</h2>')
    // Bold (**bold**)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-air-accent font-bold">$1</strong>')
    // Italics (*italics*)
    .replace(/\*(.*?)\*/g, '<em class="italic text-air-muted">$1</em>')
    // Strikethrough (-strikethrough-)
    .replace(/-(.*?)-/g, '<span class="line-through opacity-60">$1</span>')
    // Underline (_underline_)
    .replace(/_(.*?)_/g, '<span class="underline underline-offset-4 decoration-air-accent">$1</span>')
    // Lists (Simple dash support)
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc marker:text-air-accent">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
};
