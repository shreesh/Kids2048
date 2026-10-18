(function (root) {
  "use strict";

  function eye(x, y, r) {
    r = r || 6.2;
    return (
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/>' +
      '<circle cx="' + (x + 1.3) + '" cy="' + (y + 1) + '" r="' + (r * 0.48) + '" fill="#2a2118"/>' +
      '<circle cx="' + (x + 2.1) + '" cy="' + (y - 0.8) + '" r="' + (r * 0.18) + '" fill="#fff"/>'
    );
  }

  function svg(inner) {
    return '<svg viewBox="0 0 80 80" aria-hidden="true">' + inner + "</svg>";
  }

  var animals = {
    2: svg(
      '<ellipse cx="24" cy="28" rx="12" ry="12" fill="#e8c48a"/>' +
      '<ellipse cx="56" cy="28" rx="12" ry="12" fill="#e8c48a"/>' +
      '<ellipse cx="24" cy="28" rx="6" ry="6" fill="#f4b7c4"/>' +
      '<ellipse cx="56" cy="28" rx="6" ry="6" fill="#f4b7c4"/>' +
      '<ellipse cx="40" cy="48" rx="24" ry="20" fill="#e0b15e"/>' +
      eye(30, 44) + eye(50, 44) +
      '<ellipse cx="40" cy="54" rx="4.5" ry="3.2" fill="#c96b78"/>' +
      '<path d="M33 58 Q40 64 47 58" fill="none" stroke="#6b4524" stroke-width="2.2" stroke-linecap="round"/>'
    ),
    4: svg(
      '<ellipse cx="28" cy="26" rx="8" ry="18" fill="#f7f7f7"/>' +
      '<ellipse cx="52" cy="26" rx="8" ry="18" fill="#f7f7f7"/>' +
      '<ellipse cx="28" cy="26" rx="4" ry="12" fill="#f7b7c8"/>' +
      '<ellipse cx="52" cy="26" rx="4" ry="12" fill="#f7b7c8"/>' +
      '<ellipse cx="40" cy="52" rx="22" ry="18" fill="#fff"/>' +
      eye(31, 48) + eye(49, 48) +
      '<ellipse cx="40" cy="58" rx="4" ry="3" fill="#f48aaa"/>' +
      '<path d="M36 62 h3 v4 h-3 z M41 62 h3 v4 h-3 z" fill="#fff" stroke="#e7e7e7" stroke-width="0.6"/>'
    ),
    8: svg(
      '<ellipse cx="40" cy="50" rx="26" ry="18" fill="#5cbe45"/>' +
      '<circle cx="26" cy="32" r="12" fill="#5cbe45"/>' +
      '<circle cx="54" cy="32" r="12" fill="#5cbe45"/>' +
      '<circle cx="26" cy="32" r="7" fill="#fff"/>' +
      '<circle cx="54" cy="32" r="7" fill="#fff"/>' +
      '<circle cx="27.2" cy="33" r="3.2" fill="#2a2118"/>' +
      '<circle cx="55.2" cy="33" r="3.2" fill="#2a2118"/>' +
      '<circle cx="28.2" cy="31.8" r="1.1" fill="#fff"/>' +
      '<circle cx="56.2" cy="31.8" r="1.1" fill="#fff"/>' +
      '<path d="M28 54 Q40 66 52 54" fill="none" stroke="#1d6b28" stroke-width="2.4" stroke-linecap="round"/>' +
      '<ellipse cx="22" cy="50" rx="4" ry="2.4" fill="#ffb3c4"/>' +
      '<ellipse cx="58" cy="50" rx="4" ry="2.4" fill="#ffb3c4"/>'
    ),
    16: svg(
      '<ellipse cx="36" cy="48" rx="22" ry="18" fill="#ffd23a"/>' +
      '<ellipse cx="60" cy="50" rx="14" ry="8" fill="#f29a1a"/>' +
      '<path d="M52 50 L68 46 L68 54 Z" fill="#ffb03a"/>' +
      eye(28, 44) + eye(44, 44) +
      '<ellipse cx="22" cy="56" rx="8" ry="5" fill="#ffe27a"/>'
    ),
    32: svg(
      '<ellipse cx="20" cy="36" rx="9" ry="11" fill="#f7a0b6"/>' +
      '<ellipse cx="60" cy="36" rx="9" ry="11" fill="#f7a0b6"/>' +
      '<ellipse cx="20" cy="38" rx="5" ry="7" fill="#ffd0dc"/>' +
      '<ellipse cx="60" cy="38" rx="5" ry="7" fill="#ffd0dc"/>' +
      '<ellipse cx="40" cy="48" rx="24" ry="20" fill="#ffb3c6"/>' +
      eye(30, 44) + eye(50, 44) +
      '<ellipse cx="40" cy="58" rx="11" ry="8" fill="#f489a4"/>' +
      '<circle cx="36" cy="58" r="2" fill="#a84868"/>' +
      '<circle cx="44" cy="58" r="2" fill="#a84868"/>'
    ),
    64: svg(
      '<polygon points="16,40 28,10 38,36" fill="#f08a2a"/>' +
      '<polygon points="64,40 52,10 42,36" fill="#f08a2a"/>' +
      '<polygon points="20,34 28,16 34,34" fill="#ffd7b0"/>' +
      '<polygon points="60,34 52,16 46,34" fill="#ffd7b0"/>' +
      '<ellipse cx="40" cy="50" rx="24" ry="20" fill="#f08a2a"/>' +
      '<ellipse cx="40" cy="60" rx="14" ry="10" fill="#fff4e8"/>' +
      eye(30, 46) + eye(50, 46) +
      '<ellipse cx="40" cy="56" rx="4" ry="3" fill="#2a2118"/>'
    ),
    128: svg(
      '<circle cx="40" cy="44" r="28" fill="#e0922a"/>' +
      '<circle cx="18" cy="28" r="8" fill="#e0922a"/>' +
      '<circle cx="62" cy="28" r="8" fill="#e0922a"/>' +
      '<circle cx="16" cy="48" r="8" fill="#e0922a"/>' +
      '<circle cx="64" cy="48" r="8" fill="#e0922a"/>' +
      '<circle cx="40" cy="46" r="20" fill="#f6c431"/>' +
      eye(32, 44, 5.4) + eye(48, 44, 5.4) +
      '<ellipse cx="40" cy="54" rx="4.5" ry="3.2" fill="#c4782a"/>' +
      '<path d="M34 58 Q40 63 46 58" fill="none" stroke="#8a5a16" stroke-width="2" stroke-linecap="round"/>'
    ),
    256: svg(
      '<ellipse cx="22" cy="30" rx="8" ry="10" fill="#f08a3a"/>' +
      '<ellipse cx="58" cy="30" rx="8" ry="10" fill="#f08a3a"/>' +
      '<ellipse cx="22" cy="32" rx="4" ry="6" fill="#ffd7b0"/>' +
      '<ellipse cx="58" cy="32" rx="4" ry="6" fill="#ffd7b0"/>' +
      '<ellipse cx="40" cy="48" rx="24" ry="20" fill="#f08a3a"/>' +
      '<path d="M24 34 Q28 42 24 50" fill="none" stroke="#6b3208" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M40 28 Q44 40 40 52" fill="none" stroke="#6b3208" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M56 34 Q52 42 56 50" fill="none" stroke="#6b3208" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="40" cy="58" rx="12" ry="8" fill="#fff4e8"/>' +
      eye(30, 46, 5.2) + eye(50, 46, 5.2) +
      '<ellipse cx="40" cy="56" rx="3.4" ry="2.4" fill="#2a2118"/>'
    ),
    512: svg(
      '<circle cx="20" cy="24" r="10" fill="#243040"/>' +
      '<circle cx="60" cy="24" r="10" fill="#243040"/>' +
      '<ellipse cx="40" cy="48" rx="24" ry="22" fill="#fff"/>' +
      '<ellipse cx="28" cy="46" rx="10" ry="12" fill="#243040"/>' +
      '<ellipse cx="52" cy="46" rx="10" ry="12" fill="#243040"/>' +
      '<circle cx="28" cy="46" r="4.2" fill="#fff"/>' +
      '<circle cx="52" cy="46" r="4.2" fill="#fff"/>' +
      '<circle cx="29.2" cy="47" r="2.1" fill="#2a2118"/>' +
      '<circle cx="53.2" cy="47" r="2.1" fill="#2a2118"/>' +
      '<ellipse cx="40" cy="60" rx="5" ry="3.4" fill="#243040"/>'
    ),
    1024: svg(
      '<ellipse cx="14" cy="48" rx="14" ry="16" fill="#7eaddf"/>' +
      '<ellipse cx="66" cy="48" rx="14" ry="16" fill="#7eaddf"/>' +
      '<ellipse cx="14" cy="48" rx="8" ry="10" fill="#f7c2d0"/>' +
      '<ellipse cx="66" cy="48" rx="8" ry="10" fill="#f7c2d0"/>' +
      '<ellipse cx="40" cy="42" rx="22" ry="20" fill="#9ec2ee"/>' +
      eye(32, 40, 5) + eye(48, 40, 5) +
      '<path d="M40 48 C40 62 28 66 26 74" fill="none" stroke="#6e9ed4" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="26" cy="74" r="4" fill="#f7c2d0"/>'
    ),
    2048: svg(
      '<polygon points="24,28 30,8 36,28" fill="#7d4ec4"/>' +
      '<polygon points="44,28 50,8 56,28" fill="#7d4ec4"/>' +
      '<ellipse cx="16" cy="50" rx="14" ry="8" transform="rotate(-28 16 50)" fill="#c9a0f0"/>' +
      '<ellipse cx="64" cy="50" rx="14" ry="8" transform="rotate(28 64 50)" fill="#c9a0f0"/>' +
      '<ellipse cx="40" cy="48" rx="22" ry="20" fill="#b07ae6"/>' +
      '<ellipse cx="40" cy="58" rx="12" ry="8" fill="#e6d4fb"/>' +
      eye(31, 46, 5.4) + eye(49, 46, 5.4) +
      '<circle cx="36" cy="56" r="1.6" fill="#5b2d91"/>' +
      '<circle cx="44" cy="56" r="1.6" fill="#5b2d91"/>' +
      '<path d="M34 62 Q40 67 46 62" fill="none" stroke="#5b2d91" stroke-width="2" stroke-linecap="round"/>'
    ),
    4096: svg(
      '<polygon points="40,8 48,30 72,32 54,46 60,70 40,56 20,70 26,46 8,32 32,30" fill="#ffd15c" stroke="#e0961a" stroke-width="3" stroke-linejoin="round"/>'
    ),
  };

  root.BuddyAnimals = animals;
})(typeof globalThis !== "undefined" ? globalThis : this);
