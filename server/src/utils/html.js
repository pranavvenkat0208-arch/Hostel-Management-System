// Tagged template for email HTML. Interpolated values are escaped; nested
// html`` fragments are inserted as-is.
class SafeHtml {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function html(strings, ...values) {
  const out = strings.reduce((acc, str, i) => {
    if (i >= values.length) return acc + str;
    const value = values[i];
    return acc + str + (value instanceof SafeHtml ? value.value : escapeHtml(value));
  }, '');
  return new SafeHtml(out);
}

module.exports = { html, escapeHtml };
