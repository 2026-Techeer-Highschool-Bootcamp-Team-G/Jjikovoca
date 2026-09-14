/* @ds-bundle: {"format":4,"namespace":"DesignSystem_1cf846","components":[{"name":"PlanCard","sourcePath":"components/billing/PlanCard.jsx"},{"name":"AppLogo","sourcePath":"components/core/AppLogo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"BottomSheet","sourcePath":"components/core/BottomSheet.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Dialog","sourcePath":"components/core/Dialog.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ListHeader","sourcePath":"components/core/ListHeader.jsx"},{"name":"ListRow","sourcePath":"components/core/ListRow.jsx"},{"name":"NavigationBar","sourcePath":"components/core/NavigationBar.jsx"},{"name":"Placeholder","sourcePath":"components/core/Placeholder.jsx"},{"name":"SearchBar","sourcePath":"components/core/SearchBar.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"TagChip","sourcePath":"components/core/TagChip.jsx"},{"name":"TagList","sourcePath":"components/core/TagList.jsx"},{"name":"TextField","sourcePath":"components/core/TextField.jsx"},{"name":"CaptureFlash","sourcePath":"components/feedback/CaptureFlash.jsx"},{"name":"OfflineNotice","sourcePath":"components/feedback/OfflineNotice.jsx"},{"name":"StudyLoading","sourcePath":"components/feedback/StudyLoading.jsx"},{"name":"SuccessGraphic","sourcePath":"components/feedback/SuccessGraphic.jsx"},{"name":"DdayCard","sourcePath":"components/home/DdayCard.jsx"},{"name":"GameStatusCard","sourcePath":"components/home/GameStatusCard.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"TagFilterTabs","sourcePath":"components/navigation/TagFilterTabs.jsx"},{"name":"DonutChart","sourcePath":"components/report/DonutChart.jsx"},{"name":"MiniBarChart","sourcePath":"components/report/MiniBarChart.jsx"},{"name":"StreakGrid","sourcePath":"components/report/StreakGrid.jsx"},{"name":"CardRow","sourcePath":"components/study/CardRow.jsx"},{"name":"CardThumb","sourcePath":"components/study/CardThumb.jsx"},{"name":"ClozeCard","sourcePath":"components/study/ClozeCard.jsx"},{"name":"FlashCard","sourcePath":"components/study/FlashCard.jsx"},{"name":"GradeButtons","sourcePath":"components/study/GradeButtons.jsx"},{"name":"RatingCounts","sourcePath":"components/study/RatingCounts.jsx"},{"name":"StudyOptionCard","sourcePath":"components/study/StudyOptionCard.jsx"},{"name":"WordCard","sourcePath":"components/study/WordCard.jsx"}],"sourceHashes":{"components/billing/PlanCard.jsx":"8f0c0b5563ea","components/core/AppLogo.jsx":"97618e26c83b","components/core/Badge.jsx":"607d7f66dbd4","components/core/BottomSheet.jsx":"953cdd330ebd","components/core/Button.jsx":"60d7157c3881","components/core/Chip.jsx":"40afdec5cefe","components/core/Dialog.jsx":"57d4f1e31e79","components/core/Icon.jsx":"2009776bae7f","components/core/ListHeader.jsx":"583d0ccf4aed","components/core/ListRow.jsx":"e501e7309529","components/core/NavigationBar.jsx":"938d332d2fe2","components/core/Placeholder.jsx":"b208aa428867","components/core/SearchBar.jsx":"d0ab3c6020ed","components/core/SegmentedControl.jsx":"e8242861f283","components/core/Tabs.jsx":"07a5aed7c4a2","components/core/TagChip.jsx":"85054248abf0","components/core/TagList.jsx":"ef65586fa6cb","components/core/TextField.jsx":"64f48f905fa4","components/feedback/CaptureFlash.jsx":"41842c2c9e13","components/feedback/OfflineNotice.jsx":"38b75cd6a698","components/feedback/StudyLoading.jsx":"0cbd99408c56","components/feedback/SuccessGraphic.jsx":"ba1dbf73fe26","components/home/DdayCard.jsx":"40dc301b5869","components/home/GameStatusCard.jsx":"90612a4b251c","components/navigation/AppHeader.jsx":"800b2da7c684","components/navigation/BottomNav.jsx":"1431b3c2f8d9","components/navigation/TagFilterTabs.jsx":"4b1ba3f392ca","components/report/DonutChart.jsx":"6b34bf927eb1","components/report/MiniBarChart.jsx":"17e1f4ddeea4","components/report/StreakGrid.jsx":"a45e8008cb99","components/study/CardRow.jsx":"44ad4ca5e1ed","components/study/CardThumb.jsx":"b9e6dfc183c0","components/study/ClozeCard.jsx":"e8111d2b82bb","components/study/FlashCard.jsx":"424844ceb0f0","components/study/GradeButtons.jsx":"d7a924e405e7","components/study/RatingCounts.jsx":"5df69cc73490","components/study/StudyOptionCard.jsx":"be2b23e2495f","components/study/WordCard.jsx":"38e6f7380bc0","ui_kits/jjikovoca-app/App.jsx":"9f6f92845b2e","ui_kits/jjikovoca-app/HomeScreen.jsx":"7d543bd33118","ui_kits/jjikovoca-app/LoginScreen.jsx":"8bfcb374d166","ui_kits/jjikovoca-app/MyScreen.jsx":"327e8918a8d6","ui_kits/jjikovoca-app/ReportScreen.jsx":"bc4fbfa59c72","ui_kits/jjikovoca-app/StudyScreen.jsx":"eb7a98adbc60","ui_kits/jjikovoca-app/VocabScreen.jsx":"79a2119162c0","ui_kits/jjikovoca-app/data.js":"c1b399515e29"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_1cf846 = window.DesignSystem_1cf846 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/billing/PlanCard.jsx
try { (() => {
/** 구독 플랜 카드 (FR-19) — Free / Plus 3,900원 / Pro 6,900원, 일일 AI 분석 한도 확장 */
function PlanCard({
  name,
  price,
  period = '월',
  quota,
  features = [],
  current = false,
  recommended = false,
  disabled = false,
  onSelect,
  ctaLabel
}) {
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 16,
      background: 'var(--color-bg-primary)',
      border: recommended ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-card-14)',
      fontFamily: 'var(--font-sans)'
    }
  }, recommended && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -9,
      left: 16,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-brand-primary)',
      color: 'var(--color-text-inverse)',
      fontSize: 10,
      fontWeight: 700
    }
  }, "\uCD94\uCC9C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, name), current && /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-bg-secondary)',
      color: 'var(--color-text-secondary)',
      fontSize: 10,
      fontWeight: 500
    }
  }, "\uC774\uC6A9 \uC911")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--color-text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, typeof price === 'number' ? '₩' + price.toLocaleString() : price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, "/ ", period)), quota && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-brand)'
    }
  }, /*#__PURE__*/React.createElement("mark", {
    style: {
      background: 'var(--gradient-highlighter)',
      color: 'var(--color-text-primary)',
      padding: '0 3px',
      borderRadius: 3
    }
  }, quota)), features.length > 0 && /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, features.map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: 'flex',
      gap: 6,
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-brand-primary)'
    },
    "aria-hidden": true
  }, "\u2713"), t))), onSelect && /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled || current,
    onClick: onSelect,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      height: 44,
      marginTop: 2,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: current ? 'var(--color-bg-secondary)' : 'var(--color-brand-primary)',
      color: current ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      cursor: disabled || current ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transform: pressed && !current && !disabled ? 'scale(0.98)' : undefined,
      transition: 'transform 120ms var(--ease-standard)'
    }
  }, ctaLabel || (current ? '이용 중' : name + ' 시작하기')));
}
Object.assign(__ds_scope, { PlanCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/billing/PlanCard.jsx", error: String((e && e.message) || e) }); }

// components/core/AppLogo.jsx
try { (() => {
/**
 * 앱 로고 마크 — 뷰파인더(찍다) + 형광펜(보카). 앱 아이콘(Figma node 340:1004) 재현.
 * 파란 그라데이션 라운드 스퀘어 + 흰 뷰파인더 브래킷 8개 + 노란 형광펜 marker(rotate -8).
 */
function AppLogo({
  size = 56
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 512 512",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "jjik-logo-bg",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#4593FC"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#2272EB"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "jjik-logo-mk",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#FFEA7A"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#FFD84D"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "jjik-logo-sheen",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#FFFFFF",
    stopOpacity: "0.18"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.5",
    stopColor: "#FFFFFF",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "512",
    height: "512",
    rx: "115",
    fill: "url(#jjik-logo-bg)"
  }), /*#__PURE__*/React.createElement("g", {
    fill: "#FFFFFF"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "108",
    y: "108",
    width: "92",
    height: "30",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "108",
    y: "108",
    width: "30",
    height: "92",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "312",
    y: "108",
    width: "92",
    height: "30",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "374",
    y: "108",
    width: "30",
    height: "92",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "108",
    y: "374",
    width: "92",
    height: "30",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "108",
    y: "312",
    width: "30",
    height: "92",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "312",
    y: "374",
    width: "92",
    height: "30",
    rx: "15"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "374",
    y: "312",
    width: "30",
    height: "92",
    rx: "15"
  })), /*#__PURE__*/React.createElement("rect", {
    x: "148",
    y: "251",
    width: "216",
    height: "60",
    rx: "30",
    fill: "url(#jjik-logo-mk)",
    transform: "rotate(-8 256 281)"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "512",
    height: "512",
    rx: "115",
    fill: "url(#jjik-logo-sheen)"
  }));
}
Object.assign(__ds_scope, { AppLogo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AppLogo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
// TDS Badge (7:42). Fill=강조 / Weak=보조. 용례: 박스 레벨(blue)·졸업(green)·몰라요(red)·복습예정(yellow)·과목(grey)
const FILL = {
  blue: {
    bg: 'var(--color-brand-primary)',
    fg: 'var(--color-text-inverse)'
  },
  green: {
    bg: 'var(--color-success-primary)',
    fg: 'var(--color-text-inverse)'
  },
  red: {
    bg: 'var(--color-danger-primary)',
    fg: 'var(--color-text-inverse)'
  },
  yellow: {
    bg: 'var(--color-accent)',
    fg: 'var(--color-on-accent)'
  },
  grey: {
    bg: 'var(--grey-500)',
    fg: 'var(--color-text-inverse)'
  }
};
const WEAK = {
  blue: {
    bg: 'var(--color-brand-weak)',
    fg: 'var(--color-text-brand)'
  },
  green: {
    bg: 'var(--color-success-weak)',
    fg: 'var(--color-success-primary)'
  },
  red: {
    bg: 'var(--color-danger-weak)',
    fg: 'var(--color-text-danger)'
  },
  yellow: {
    bg: 'var(--color-accent-weak)',
    fg: 'var(--color-on-accent)'
  },
  grey: {
    bg: 'var(--color-bg-secondary)',
    fg: 'var(--color-text-secondary)'
  }
};
function Badge({
  color = 'blue',
  variant = 'fill',
  size = 'sm',
  children
}) {
  const {
    bg,
    fg
  } = variant === 'fill' ? FILL[color] : WEAK[color];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      color: fg,
      fontFamily: 'var(--font-sans)',
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 500,
      lineHeight: 1,
      padding: size === 'sm' ? '3px 6px' : '4px 8px',
      borderRadius: 'var(--radius-xs)',
      whiteSpace: 'nowrap'
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/BottomSheet.jsx
try { (() => {
// 하단 바텀시트 (100:737) — dim 오버레이 + 상단 라운드(20) 시트 + 드래그 핸들
function BottomSheet({
  open,
  onClose,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'var(--color-overlay-dim)',
      display: 'flex',
      alignItems: 'flex-end',
      animation: 'omc-overlay-in 0.2s ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: 480,
      margin: '0 auto',
      background: 'var(--color-bg-elevated)',
      borderRadius: '20px 20px 0 0',
      padding: '10px var(--spacing-xl) 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: 'var(--font-sans)',
      animation: 'omc-sheet-up 0.25s ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: 'var(--grey-200)',
      alignSelf: 'center'
    },
    "aria-hidden": true
  }), children));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// TDS Button (6:50). Fill(primary) / Weak(weak) / Ghost(테두리) · Size M(md) / L52(lg) · block=full width
function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  style,
  children,
  ...rest
}) {
  const sizeStyle = size === 'lg' ? {
    height: 52,
    fontSize: 17,
    borderRadius: 'var(--radius-lg)',
    padding: '0 var(--spacing-2xl)'
  } : {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    fontSize: 15,
    borderRadius: 'var(--radius-md)'
  };
  const variantStyle = variant === 'primary' ? {
    background: 'var(--color-brand-primary)',
    color: 'var(--color-text-inverse)',
    border: '1px solid transparent'
  } : variant === 'weak' ? {
    background: 'var(--color-brand-weak)',
    color: 'var(--color-text-brand)',
    border: '1px solid transparent'
  } : {
    background: 'transparent',
    color: 'var(--color-brand-primary)',
    border: '1px solid var(--color-border-default)'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      cursor: rest.disabled ? 'default' : 'pointer',
      opacity: rest.disabled ? 0.4 : 1,
      width: block ? '100%' : undefined,
      ...sizeStyle,
      ...variantStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
// 필터 칩 — 선택 시 브랜드 파랑 fill, 기본은 흰 배경 + 회색 테두리
function Chip({
  active = false,
  onClick,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      padding: 'var(--spacing-xs) var(--spacing-md)',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--color-border-default)',
      background: active ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)',
      color: active ? 'var(--common-white)' : 'var(--color-text-secondary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14
    }
  }, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Dialog.jsx
try { (() => {
function Dialog({
  open,
  onClose,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--color-overlay-dialog)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-lg)',
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-2xl)',
      maxWidth: 420,
      width: '100%',
      fontFamily: 'var(--font-sans)'
    }
  }, children));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Toss 스타일 라인 아이콘 (24px 그리드, 2px 스트로크, currentColor) — web/src/shared/ui/icons.tsx 세트를 그대로 이식
const ICON_NAMES = ['menu', 'search', 'bell', 'clock', 'calendar', 'fire', 'check', 'refresh', 'trophy', 'chevron-right', 'chevron-left', 'close', 'speaker', 'home', 'book', 'vocab', 'chart', 'user', 'camera'];
const PATHS = {
  menu: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "21",
    y2: "18"
  })),
  search: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16.5",
    y1: "16.5",
    x2: "21",
    y2: "21"
  })),
  bell: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.7 21a2 2 0 0 1-3.4 0"
  })),
  clock: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  calendar: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4.5",
    width: "18",
    height: "16.5",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9.5h18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2.5v4M16 2.5v4"
  })),
  fire: /*#__PURE__*/React.createElement("path", {
    d: "M12 2c1 3 4 4.6 4 8.5A4 4 0 0 1 8 11c0-1.3.5-2.2 1.2-3C9.9 9.4 11 8 12 2z"
  }),
  check: /*#__PURE__*/React.createElement("polyline", {
    points: "5 12 10 17 19 7"
  }),
  refresh: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 1 1-3-6.7"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "21 3 21 9 15 9"
  })),
  trophy: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M8 21h8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 4h10v5a5 5 0 0 1-10 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 5H4v2a3 3 0 0 0 3 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 5h3v2a3 3 0 0 1-3 3"
  })),
  'chevron-right': /*#__PURE__*/React.createElement("polyline", {
    points: "9 6 15 12 9 18"
  }),
  'chevron-left': /*#__PURE__*/React.createElement("polyline", {
    points: "15 6 9 12 15 18"
  }),
  close: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })),
  speaker: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polygon", {
    points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.5 8.5a5 5 0 0 1 0 7"
  })),
  home: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M3 10.5 12 3l9 7.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9.5V21h14V9.5"
  })),
  book: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "3",
    width: "14",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "7",
    x2: "15",
    y2: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "11",
    x2: "13",
    y2: "11"
  })),
  vocab: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M12 6.5v13"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6.5C10.3 5.3 7.8 4.8 4 5.2v12.6c3.8-.4 6.3.1 8 1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6.5c1.7-1.2 4.2-1.7 8-1.3v12.6c-3.8-.4-6.3.1-8 1.3"
  })),
  chart: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "20",
    x2: "6",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "20",
    x2: "12",
    y2: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "20",
    x2: "18",
    y2: "10"
  })),
  user: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 21a8 8 0 0 1 16 0"
  })),
  camera: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  }))
};
function Icon({
  name,
  size = 24,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    style: style
  }, rest), PATHS[name] || null);
}
Object.assign(__ds_scope, { ICON_NAMES, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/ListHeader.jsx
try { (() => {
// TDS ListHeader (8:7). 좌: 섹션 제목(17 medium) / 우: 링크(13 brand)
function ListHeader({
  title,
  link,
  onLink
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: 48,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--spacing-xl)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      fontWeight: 500,
      color: 'var(--color-text-primary)'
    }
  }, title), link && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onLink,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--color-text-brand)',
      background: 'none',
      border: 'none',
      padding: 0
    }
  }, link));
}
Object.assign(__ds_scope, { ListHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ListHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/ListRow.jsx
try { (() => {
// TDS ListRow (8:11) — 좌 아이콘(40 원형) · 중 제목/부제 · 우 값 + 화살표. 설정·목록 공용, 높이 64
function ListRow({
  icon,
  title,
  subtitle,
  value,
  valueColor,
  onClick,
  showArrow = true,
  divider = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'flex',
      gap: 'var(--spacing-md)',
      alignItems: 'center',
      width: '100%',
      textAlign: 'left',
      height: 64,
      padding: '14px var(--spacing-xl)',
      background: 'var(--color-bg-primary)',
      border: 'none',
      borderBottom: divider ? '1px solid var(--color-border-default)' : 'none',
      fontFamily: 'var(--font-sans)',
      cursor: onClick ? 'pointer' : 'default'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: 20,
      background: 'var(--color-brand-weak)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-brand)'
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      color: 'var(--color-text-primary)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      flexShrink: 0
    }
  }, value && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: valueColor || 'var(--color-text-secondary)'
    }
  }, value), showArrow && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--grey-500)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 16
  }))));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/core/NavigationBar.jsx
try { (() => {
// TDS NavigationBar (9:3) — 좌 뒤로가기(44 터치영역) · 중앙 타이틀 · 우 액션 슬롯. 높이 56
function NavigationBar({
  title,
  right,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 56,
      padding: '0 8px',
      background: 'var(--color-bg-primary)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\uB4A4\uB85C",
    onClick: onBack,
    style: {
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      color: 'var(--color-text-primary)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: 17,
      fontWeight: 500,
      color: 'var(--color-text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 8
    }
  }, right));
}
Object.assign(__ds_scope, { NavigationBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/NavigationBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Placeholder.jsx
try { (() => {
// 아직 설계 전 화면의 임시 자리표시. 내비게이션이 끊기지 않게 유지.
function Placeholder({
  title,
  note
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px var(--spacing-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, title), note && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--color-text-secondary)'
    }
  }, note));
}
Object.assign(__ds_scope, { Placeholder });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Placeholder.jsx", error: String((e && e.message) || e) }); }

// components/core/SearchBar.jsx
try { (() => {
// 검색 진입 바 (41:236) — 탭 시 통합 검색으로. 표시 전용(입력은 검색 화면에서)
function SearchBar({
  placeholder = '검색',
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      height: 44,
      padding: '0 14px',
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-text-tertiary)',
      fontFamily: 'var(--font-sans)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, placeholder));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
/** 2~3지 세그먼트 컨트롤 — 테마 설정(라이트/다크/시스템 자동, FR-17), 발음 로케일 등 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  block = false,
  size = 'md'
}) {
  const h = size === 'sm' ? 32 : 40;
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: block ? 'flex' : 'inline-flex',
      padding: 3,
      gap: 3,
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)'
    }
  }, options.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(o.value),
      style: {
        flex: block ? 1 : undefined,
        height: h,
        minWidth: 64,
        padding: '0 14px',
        border: 'none',
        borderRadius: 'calc(var(--radius-md) - 3px)',
        background: active ? 'var(--color-bg-primary)' : 'transparent',
        boxShadow: active ? 'var(--shadow-card)' : 'none',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontFamily: 'inherit',
        fontSize: size === 'sm' ? 12 : 14,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'background 160ms var(--ease-standard), color 160ms var(--ease-standard)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
// TDS Tab (9:21). Selected: 텍스트 강조 + 2px 브랜드 인디케이터 / Default: tertiary.
// 인디케이터는 단일 바가 선택 탭 위치로 슬라이드한다.
function Tabs({
  tabs,
  value,
  onChange
}) {
  const selectedIndex = Math.max(0, tabs.findIndex(t => t.key === value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      height: 46,
      background: 'var(--color-bg-primary)',
      borderBottom: '1px solid var(--color-border-default)'
    }
  }, tabs.map(tab => {
    const selected = tab.key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.key,
      type: "button",
      onClick: () => onChange && onChange(tab.key),
      style: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        fontWeight: selected ? 500 : 400,
        color: selected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
        transition: 'color 0.2s ease'
      }
    }, tab.label));
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 2,
      width: 100 / tabs.length + '%',
      background: 'var(--color-brand-primary)',
      transform: 'translateX(' + selectedIndex * 100 + '%)',
      transition: 'transform 0.28s var(--ease-standard)'
    }
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/core/TagChip.jsx
try { (() => {
/** 다중 태그 칩 (FR-04) — 시험 태그는 강조(브랜드 위크 + 📅 + D-day), 일반 태그는 회색 사각 칩 */
function TagChip({
  label,
  kind = 'tag',
  dday,
  active = false,
  onClick,
  onRemove,
  size = 'md'
}) {
  const pad = size === 'sm' ? '2px 7px' : '3px 9px';
  const font = size === 'sm' ? 10 : 11;
  const exam = kind === 'exam';
  const more = kind === 'more';
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: 148,
    padding: pad,
    fontFamily: 'var(--font-sans)',
    fontSize: font,
    fontWeight: exam ? 700 : 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRadius: exam || more ? 'var(--radius-full)' : 5,
    border: '1px solid transparent',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background 160ms var(--ease-standard), color 160ms var(--ease-standard)'
  };
  const tone = more ? {
    background: 'transparent',
    color: 'var(--color-text-tertiary)',
    borderColor: 'var(--color-border-default)'
  } : exam ? {
    background: active ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)',
    color: active ? 'var(--color-text-inverse)' : 'var(--color-brand-primary)'
  } : {
    background: active ? 'var(--color-text-primary)' : 'var(--color-bg-secondary)',
    color: active ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)'
  };
  const text = exam ? '📅 ' + label + (dday != null ? ' D-' + dday : '') : label;
  const El = onClick ? 'button' : 'span';
  return /*#__PURE__*/React.createElement(El, {
    type: onClick ? 'button' : undefined,
    onClick: onClick,
    style: {
      ...base,
      ...tone
    }
  }, text, onRemove && /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": label + ' 태그 삭제',
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    style: {
      opacity: 0.55,
      cursor: 'pointer',
      fontSize: font + 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { TagChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TagChip.jsx", error: String((e && e.message) || e) }); }

// components/core/TagList.jsx
try { (() => {
/** 카드 태그 줄 — 시험 태그 우선 + 일반 태그 max 개까지 + 나머지는 '+N' 말줄임 (FR-04) */
function TagList({
  tags = [],
  max = 2,
  size = 'md',
  align = 'flex-start',
  onMore
}) {
  const exams = tags.filter(t => t.kind === 'exam');
  const rest = tags.filter(t => t.kind !== 'exam');
  const shown = rest.slice(0, max);
  const hidden = rest.length - shown.length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
      justifyContent: align,
      minWidth: 0
    }
  }, exams.map(t => /*#__PURE__*/React.createElement(__ds_scope.TagChip, {
    key: t.label,
    kind: "exam",
    label: t.label,
    dday: t.dday,
    size: size
  })), shown.map(t => /*#__PURE__*/React.createElement(__ds_scope.TagChip, {
    key: t.label,
    label: t.label,
    size: size
  })), hidden > 0 && /*#__PURE__*/React.createElement(__ds_scope.TagChip, {
    kind: "more",
    label: '+' + hidden,
    size: size,
    onClick: onMore
  }));
}
Object.assign(__ds_scope, { TagList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TagList.jsx", error: String((e && e.message) || e) }); }

// components/core/TextField.jsx
try { (() => {
// TDS TextField (59:54) — 라벨 + 입력 필드(bg-secondary, 테두리 없음, 52px) + 헬퍼
function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  type = 'text'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--color-text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    placeholder: placeholder,
    style: {
      height: 52,
      padding: '0 16px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      background: 'var(--color-bg-secondary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--color-text-primary)',
      outline: 'none',
      width: '100%'
    }
  }), helper && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      color: 'var(--color-text-tertiary)'
    }
  }, helper));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextField.jsx", error: String((e && e.message) || e) }); }

// components/feedback/CaptureFlash.jsx
try { (() => {
const SPARKS = [{
  dx: 0,
  dy: -46,
  size: 22,
  delay: 0
}, {
  dx: 40,
  dy: -18,
  size: 16,
  delay: 40
}, {
  dx: -40,
  dy: -18,
  size: 16,
  delay: 40
}, {
  dx: 26,
  dy: 34,
  size: 13,
  delay: 80
}, {
  dx: -26,
  dy: 34,
  size: 13,
  delay: 80
}];

// 캡처 순간 이펙트 — 화이트 플래시 → 스파클 버스트 400ms → +5 XP 칩 상승 600ms
function CaptureFlash({
  active,
  xpLabel = '⚡ +5 XP'
}) {
  if (!active) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      pointerEvents: 'none',
      fontFamily: 'var(--font-sans)'
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--common-white)',
      animation: 'jjik-flash 500ms ease-out forwards'
    }
  }), SPARKS.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      top: 'calc(50% + ' + s.dy + 'px)',
      left: 'calc(50% + ' + s.dx + 'px)',
      fontSize: s.size,
      color: 'var(--yellow-500)',
      animation: 'jjik-burst 400ms ease-out ' + s.delay + 'ms forwards'
    }
  }, "\u2726")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 130,
      transform: 'translate(-50%, 12px)',
      background: 'var(--gradient-marker)',
      color: 'var(--yellow-900)',
      fontSize: 15,
      fontWeight: 700,
      padding: '7px 16px',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-xp-chip)',
      animation: 'jjik-xp-rise 600ms ease-out forwards'
    }
  }, xpLabel));
}
Object.assign(__ds_scope, { CaptureFlash });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/CaptureFlash.jsx", error: String((e && e.message) || e) }); }

// components/feedback/OfflineNotice.jsx
try { (() => {
/** 네트워크 오류 방어 UI (NFR 5-1) — 흰 화면 대신 네이티브 다이얼로그 수준의 안내를 깐다 */
function OfflineNotice({
  title = '네트워크에 연결되지 않았어요',
  description = '연결을 확인하고 다시 시도해주세요',
  onRetry,
  variant = 'screen'
}) {
  if (variant === 'banner') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--color-danger-weak)',
        color: 'var(--color-text-danger)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "refresh",
      size: 16
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, title), onRetry && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onRetry,
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'underline',
        cursor: 'pointer'
      }
    }, "\uB2E4\uC2DC \uC2DC\uB3C4"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '40px 32px',
      textAlign: 'center',
      background: 'var(--color-bg-primary)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--color-bg-secondary)',
      color: 'var(--color-text-tertiary)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "refresh",
    size: 24
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    }
  }, description), onRetry && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRetry,
    style: {
      marginTop: 6,
      height: 44,
      padding: '0 20px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-brand-primary)',
      color: 'var(--color-text-inverse)',
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "\uB2E4\uC2DC \uC2DC\uB3C4"));
}
Object.assign(__ds_scope, { OfflineNotice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/OfflineNotice.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StudyLoading.jsx
try { (() => {
const STUDY_QUOTES = ['어제의 나보다 딱 한 걸음만 더 나아가자', '오늘 한 문제가 내일의 자신감이 된다', '꾸준함이 결국 실력을 만든다', '틀린 문제는 실력이 자라는 자리', '지금 이 복습이 시험날의 여유가 된다'];

/** 학습 큐 로딩 화면 — 스피너 + 명언. 플래시카드·빈칸·수학 학습 진입 로딩에 공용 */
function StudyLoading({
  quote
}) {
  const [picked] = React.useState(() => quote || STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      padding: '0 32px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: '3px solid var(--color-brand-weak)',
      borderTopColor: 'var(--color-brand-primary)',
      animation: 'jjik-spin 0.8s linear infinite'
    }
  }), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      fontStyle: 'italic',
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    }
  }, "\u201C", picked, "\u201D")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uD559\uC2B5\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC5B4\uC694\u2026"));
}
Object.assign(__ds_scope, { StudyLoading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StudyLoading.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SuccessGraphic.jsx
try { (() => {
// 성공/완료 그래픽 — 초록 원 체크가 스프링으로 팝 + 링 퍼짐 + 반짝임
function SuccessGraphic() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160,
      height: 160,
      borderRadius: '50%',
      background: 'radial-gradient(circle, var(--color-success-weak) 0%, rgba(255,255,255,0) 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 92,
      height: 92,
      borderRadius: '50%',
      border: '2px solid var(--color-success-primary)',
      animation: 'jjik-success-ring 0.7s ease-out 0.15s both'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 92,
      height: 92,
      borderRadius: '50%',
      background: 'var(--color-success-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-inverse)',
      fontSize: 44,
      fontWeight: 700,
      animation: 'jjik-pop-spring 0.6s var(--ease-spring) both'
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 28,
      right: 30,
      fontSize: 24,
      color: 'var(--yellow-500)',
      animation: 'jjik-twinkle 1.4s ease-in-out 0.5s infinite'
    }
  }, "\u2726"));
}
Object.assign(__ds_scope, { SuccessGraphic });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SuccessGraphic.jsx", error: String((e && e.message) || e) }); }

// components/home/DdayCard.jsx
try { (() => {
// D-day 경각심 색 — 초록(여유) → 연두 → 주황 → 빨강(임박)
function ddayColor(dday) {
  if (dday > 30) return {
    bg: 'var(--color-dday-safe-bg)',
    fg: 'var(--color-dday-safe-fg)'
  };
  if (dday > 20) return {
    bg: 'var(--color-dday-soon-bg)',
    fg: 'var(--color-dday-soon-fg)'
  };
  if (dday > 15) return {
    bg: 'var(--color-dday-near-bg)',
    fg: 'var(--color-dday-near-fg)'
  };
  return {
    bg: 'var(--color-dday-urgent-bg)',
    fg: 'var(--color-dday-urgent-fg)'
  };
}

// 시험 D-day 카드 (74:81). onClick 있으면 탭 가능(chevron), 없으면 정보 카드.
function DdayCard({
  title,
  dday,
  memoryRate,
  todayDue,
  subtitle,
  onClick
}) {
  let sub = subtitle;
  if (!sub) {
    const parts = [];
    if (memoryRate !== undefined) parts.push('시험범위 기억률 ' + memoryRate + '%');
    if (todayDue !== undefined) parts.push('오늘 복습 ' + todayDue + '개');
    sub = parts.length ? parts.join(' · ') : undefined;
  }
  const dc = ddayColor(dday);
  const cardStyle = {
    display: 'flex',
    gap: 'var(--spacing-md)',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left',
    background: 'var(--color-brand-weak)',
    border: 'none',
    borderRadius: 'var(--radius-card-14)',
    padding: '14px 16px',
    fontFamily: 'var(--font-sans)'
  };
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--color-brand-primary)'
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '0 8px',
      borderRadius: 'var(--radius-sm)',
      background: dc.bg,
      color: dc.fg,
      fontSize: 12,
      fontWeight: 700
    }
  }, "D-", dday)), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, sub)), onClick && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--grey-500)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 18
  })));
  if (onClick) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClick,
      style: {
        ...cardStyle,
        cursor: 'pointer'
      }
    }, inner);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, inner);
}
Object.assign(__ds_scope, { DdayCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/home/DdayCard.jsx", error: String((e && e.message) || e) }); }

// components/home/GameStatusCard.jsx
try { (() => {
// 게임 상태 카드 (30:240) — 레벨·XP바·연속일 + 일일 퀘스트 행
function GameStatusCard({
  level,
  heroTitle,
  exp,
  nextExp,
  streakDays,
  questLabel,
  onQuestClick
}) {
  const ratio = nextExp > 0 ? Math.min(1, exp / nextExp) : 0;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-brand-weak)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 14px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--color-text-primary)'
    }
  }, "Lv.", level, " ", heroTitle), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--color-text-primary)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      display: 'inline-flex',
      color: 'var(--color-warning-primary)',
      filter: streakDays >= 14 ? 'drop-shadow(0 0 5px rgba(255,120,40,0.65))' : undefined
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "fire",
    size: 16
  })), "\uC5F0\uC18D ", streakDays, "\uC77C")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      background: 'var(--color-bg-primary)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: ratio * 100 + '%',
      height: '100%',
      background: 'var(--gradient-xp)',
      borderRadius: 3
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-text-secondary)',
      whiteSpace: 'nowrap'
    }
  }, exp, " / ", nextExp, " XP")))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'rgba(255,255,255,0.7)',
      margin: '12px 0 10px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onQuestClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      width: '100%',
      background: 'none',
      border: 'none',
      padding: 0,
      color: 'var(--color-text-brand)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-brand)'
    }
  }, questLabel), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 14
  })));
}
Object.assign(__ds_scope, { GameStatusCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/home/GameStatusCard.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
// 홈 상단 헤더 — 브랜드 로고타입 + 알림(같은 선상)
function AppHeader({
  onBell
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      padding: '10px var(--spacing-xl) 4px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--color-text-brand)'
    }
  }, "\uCC0D\uC5B4\uBCF4\uCE74"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\uC54C\uB9BC",
    onClick: onBell,
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      color: 'var(--color-text-secondary)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bell",
    size: 22
  }))));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
const LEFT = [{
  key: 'home',
  label: '홈',
  icon: 'home'
}, {
  key: 'vocab',
  label: '단어장',
  icon: 'vocab'
}];
const RIGHT = [{
  key: 'report',
  label: '리포트',
  icon: 'chart'
}, {
  key: 'my',
  label: '마이',
  icon: 'user'
}];

// 하단 내비게이션 (21:22) — 4탭 + 중앙 앱 로고 FAB(촬영 진입, 돌출, 라벨 없음)
function BottomNav({
  active = 'home',
  onSelect,
  onCapture
}) {
  const item = it => /*#__PURE__*/React.createElement("button", {
    key: it.key,
    type: "button",
    onClick: () => onSelect && onSelect(it.key),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      flex: 1,
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: active === it.key ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 10,
      fontWeight: active === it.key ? 500 : 400
    }
  }, it.label));
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'flex-start',
      height: 82,
      padding: '8px 24px 24px',
      background: 'var(--color-bg-primary)',
      borderTop: '1px solid var(--color-border-default)'
    }
  }, LEFT.map(item), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    },
    "aria-hidden": true
  }), RIGHT.map(item), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\uCD2C\uC601",
    onClick: onCapture,
    style: {
      position: 'absolute',
      left: '50%',
      top: -16,
      transform: 'translateX(-50%)',
      width: 56,
      height: 56,
      padding: 0,
      border: 'none',
      background: 'none',
      borderRadius: 'var(--radius-logo-13)',
      display: 'flex',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-fab)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AppLogo, {
    size: 56
  })));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TagFilterTabs.jsx
try { (() => {
/** 단어장 상단 태그 필터 탭 (FR-04) — 수평 스크롤, 시험 태그가 맨 앞 */
function TagFilterTabs({
  items = [],
  active,
  onSelect,
  onManage
}) {
  const exams = items.filter(i => i.kind === 'exam');
  const rest = items.filter(i => i.kind !== 'exam');
  const ordered = [...exams, ...rest];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      overflowX: 'auto',
      padding: '4px 0',
      fontFamily: 'var(--font-sans)',
      scrollbarWidth: 'none'
    }
  }, ordered.map(i => /*#__PURE__*/React.createElement("span", {
    key: i.key || i.label,
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.TagChip, {
    kind: i.kind === 'exam' ? 'exam' : 'tag',
    label: i.count != null ? i.label + ' ' + i.count : i.label,
    dday: i.dday,
    active: (i.key || i.label) === active,
    onClick: () => onSelect && onSelect(i.key || i.label)
  }))), onManage && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onManage,
    style: {
      flexShrink: 0,
      height: 24,
      padding: '0 10px',
      background: 'transparent',
      border: '1px dashed var(--color-border-default)',
      borderRadius: 'var(--radius-full)',
      color: 'var(--color-text-tertiary)',
      fontFamily: 'inherit',
      fontSize: 11,
      cursor: 'pointer'
    }
  }, "\uD0DC\uADF8 \uAD00\uB9AC"));
}
Object.assign(__ds_scope, { TagFilterTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TagFilterTabs.jsx", error: String((e && e.message) || e) }); }

// components/report/DonutChart.jsx
try { (() => {
/** 도넛 차트 (FR-09) — 리포트의 정답률·학습 비중. 방사형(레이더) 차트는 v1.9 에서 제거됐다 */
function DonutChart({
  segments = [],
  size = 132,
  thickness = 16,
  centerValue,
  centerLabel
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  let acc = 0;
  const stops = segments.map(s => {
    const from = acc / total * 100;
    acc += s.value || 0;
    const to = acc / total * 100;
    return (s.color || 'var(--color-brand-primary)') + ' ' + from + '% ' + to + '%';
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: 'conic-gradient(' + stops.join(',') + ')'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: thickness,
      borderRadius: '50%',
      background: 'var(--color-bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2
    }
  }, centerValue != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: 'var(--color-text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, centerValue), centerLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-text-tertiary)'
    }
  }, centerLabel))), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0
    }
  }, segments.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: s.color || 'var(--color-brand-primary)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-text-primary)'
    }
  }, s.label), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, Math.round((s.value || 0) / total * 100), "%")))));
}
Object.assign(__ds_scope, { DonutChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/report/DonutChart.jsx", error: String((e && e.message) || e) }); }

// components/report/MiniBarChart.jsx
try { (() => {
/** 주간 학습 시간 분포 막대 (FR-09) — 라벨 7칸 이하의 작은 카드용 차트 */
function MiniBarChart({
  data = [],
  height = 96,
  unit = '분',
  highlightMax = true
}) {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      height,
      fontFamily: 'var(--font-sans)'
    }
  }, data.map(d => {
    const isMax = highlightMax && d.value === max;
    return /*#__PURE__*/React.createElement("div", {
      key: d.label,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        marginTop: 'auto',
        fontSize: 10,
        fontWeight: 700,
        color: isMax ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, d.value), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: Math.max(3, (d.value || 0) / max * (height - 36)),
        borderRadius: 4,
        background: isMax ? 'var(--color-brand-primary)' : 'var(--color-brand-weak)',
        transition: 'height 280ms var(--ease-standard)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--color-text-secondary)'
      }
    }, d.label));
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: 'flex-start',
      fontSize: 10,
      color: 'var(--color-text-tertiary)'
    }
  }, unit));
}
Object.assign(__ds_scope, { MiniBarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/report/MiniBarChart.jsx", error: String((e && e.message) || e) }); }

// components/report/StreakGrid.jsx
try { (() => {
const LEVEL = ['var(--color-grass-0)', 'var(--color-grass-1)', 'var(--color-grass-2)', 'var(--color-grass-3)', 'var(--color-grass-4)'];

/** 학습 잔디 (FR-14) — 연속 학습일을 일별로 칠하는 GitHub 스타일 그리드 */
function StreakGrid({
  days = [],
  weeks = 13,
  streakDays,
  cell = 12,
  gap = 3,
  showLegend = true
}) {
  const total = weeks * 7;
  const padded = days.length >= total ? days.slice(days.length - total) : [...Array(total - days.length).fill(0), ...days];
  const columns = [];
  for (let w = 0; w < weeks; w++) columns.push(padded.slice(w * 7, w * 7 + 7));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontFamily: 'var(--font-sans)'
    }
  }, streakDays != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, "\uD83D\uDD25 \uC5F0\uC18D ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--color-text-primary)'
    }
  }, streakDays, "\uC77C"), " \uD559\uC2B5 \uC911"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      overflowX: 'auto'
    }
  }, columns.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: ci,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap
    }
  }, col.map((lv, ri) => /*#__PURE__*/React.createElement("span", {
    key: ri,
    style: {
      width: cell,
      height: cell,
      borderRadius: 3,
      background: LEVEL[Math.max(0, Math.min(4, lv))]
    }
  }))))), showLegend && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 10,
      color: 'var(--color-text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uC801\uC74C"), LEVEL.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: c
    }
  })), /*#__PURE__*/React.createElement("span", null, "\uB9CE\uC74C")));
}
Object.assign(__ds_scope, { StreakGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/report/StreakGrid.jsx", error: String((e && e.message) || e) }); }

// components/study/CardThumb.jsx
try { (() => {
/** 오답노트·보관함 썸네일 — 유형(형광펜/박스) 구분 */
function CardThumb({
  card
}) {
  const isWord = card.type === 'WORD';
  const label = isWord ? card.word || '단어' : card.summary || '문제';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-md)',
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, isWord ? '🖍️' : '⬛'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, label), card.subject && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-text-secondary)',
      fontSize: 12
    }
  }, card.subject));
}
Object.assign(__ds_scope, { CardThumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/CardThumb.jsx", error: String((e && e.message) || e) }); }

// components/study/ClozeCard.jsx
try { (() => {
/** 예문 빈칸 채우기 (FR-06) — 입력 상태와 서버 판정 상태(정답·오답 뜻 공개)를 한 카드에서 다룬다 */
function ClozeCard({
  sentence = '',
  translation,
  value = '',
  onChange,
  onSubmit,
  judged = false,
  correct = false,
  word,
  meaning,
  hint
}) {
  const [before, after] = String(sentence).split('___');
  const blankColor = judged ? correct ? 'var(--color-result-correct)' : 'var(--color-result-wrong)' : 'var(--color-brand-primary)';
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: 18,
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 20,
      boxShadow: 'var(--shadow-flashcard)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uC608\uBB38"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.6,
      color: 'var(--color-text-primary)'
    }
  }, before, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      minWidth: 96,
      padding: '0 6px',
      borderBottom: '2px solid ' + blankColor,
      color: blankColor,
      fontWeight: 700,
      textAlign: 'center'
    }
  }, judged ? correct ? value : word : value || ' '), after), translation && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    }
  }, translation), !judged && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && onSubmit) onSubmit();
    },
    placeholder: "\uBE48\uCE78\uC5D0 \uB4E4\uC5B4\uAC08 \uB2E8\uC5B4",
    style: {
      height: 48,
      padding: '0 14px',
      background: 'var(--color-bg-secondary)',
      border: '1.5px solid transparent',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'inherit',
      fontSize: 16,
      color: 'var(--color-text-primary)',
      outline: 'none'
    }
  }), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uD78C\uD2B8 \xB7 ", hint)), judged && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 14,
      borderRadius: 'var(--radius-md)',
      background: correct ? 'var(--color-success-weak)' : 'var(--color-danger-weak)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: correct ? 'var(--color-result-correct)' : 'var(--color-result-wrong)'
    }
  }, correct ? '정답이에요' : '아쉬워요 — 정답은 ' + word), !correct && value && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, "\uB0B4\uAC00 \uC4F4 \uB2F5 \xB7 ", value), meaning && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, /*#__PURE__*/React.createElement("mark", {
    style: {
      background: 'var(--gradient-highlighter)',
      color: 'inherit',
      padding: '0 3px',
      borderRadius: 3
    }
  }, meaning))));
}
Object.assign(__ds_scope, { ClozeCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/ClozeCard.jsx", error: String((e && e.message) || e) }); }

// components/study/FlashCard.jsx
try { (() => {
const FACE = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 20,
  boxShadow: 'var(--shadow-flashcard)',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  overflow: 'hidden',
  fontFamily: 'var(--font-sans)'
};

/** 공용 플래시카드 — 탭하면 3D 플립. 앞: 단어 + AI 연상 이미지 / 뒤: 뜻(형광펜) + 예문 (FR-05) */
function FlashCard({
  card,
  height = 500,
  flipped,
  onFlip
}) {
  const [inner, setInner] = React.useState(false);
  const isFlipped = flipped !== undefined ? flipped : inner;
  const toggle = onFlip || (() => setInner(f => !f));
  return /*#__PURE__*/React.createElement("div", {
    onClick: toggle,
    style: {
      perspective: 1200,
      height,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.5s var(--ease-flip)',
      transform: isFlipped ? 'rotateY(180deg)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: FACE
  }, /*#__PURE__*/React.createElement(FaceContent, {
    card: card,
    showMeaning: false
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...FACE,
      border: '1.5px solid var(--color-brand-primary)',
      transform: 'rotateY(180deg)'
    }
  }, /*#__PURE__*/React.createElement(FaceContent, {
    card: card,
    showMeaning: true
  }))));
}
function FaceContent({
  card,
  showMeaning
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: 104,
      flexShrink: 0,
      borderRadius: 12,
      background: 'var(--gradient-concept)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, card.imageUrl ? /*#__PURE__*/React.createElement("img", {
    src: card.imageUrl,
    alt: "AI \uC5F0\uC0C1 \uC774\uBBF8\uC9C0",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 44,
      lineHeight: 1
    },
    "aria-hidden": true
  }, card.emoji || '📘')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, card.word), showMeaning && card.meaning && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      lineHeight: 1.5,
      color: 'var(--color-text-primary)'
    }
  }, /*#__PURE__*/React.createElement("mark", {
    style: {
      background: 'var(--gradient-highlighter)',
      color: 'inherit',
      padding: '0 3px',
      borderRadius: 3
    }
  }, card.meaning)), card.pronunciation && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-tertiary)'
    }
  }, card.pronunciation)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(VoicePill, {
    label: "\uD83C\uDDFA\uD83C\uDDF8 \uBBF8\uAD6D"
  }), /*#__PURE__*/React.createElement(VoicePill, {
    label: "\uD83C\uDDEC\uD83C\uDDE7 \uC601\uAD6D"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-text-brand)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "speaker",
    size: 20
  }))), card.tags && card.tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, card.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t.label,
    style: {
      fontSize: 10,
      fontWeight: t.kind === 'exam' ? 700 : 500,
      padding: t.kind === 'exam' ? '3px 8px' : '2px 7px',
      borderRadius: t.kind === 'exam' ? 999 : 5,
      background: t.kind === 'exam' ? 'var(--color-brand-weak)' : 'var(--color-bg-secondary)',
      color: t.kind === 'exam' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
      whiteSpace: 'nowrap'
    }
  }, t.kind === 'exam' ? '📅 ' + t.label + (t.dday != null ? ' D-' + t.dday : '') : t.label))), card.example ? showMeaning ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-bg-secondary)',
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uC608\uBB38"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 16,
      lineHeight: '20px',
      color: 'var(--color-text-primary)'
    }
  }, card.example), card.exampleTranslation && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    }
  }, card.exampleTranslation)) : null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-tertiary)'
    }
  }, showMeaning ? '예문은 아직 없어요' : '')), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 'auto',
      textAlign: 'center',
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, showMeaning ? '탭하면 단어로 돌아가요' : '카드를 탭하면 뜻이 보여요'));
}
function VoicePill({
  label,
  active = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
      color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
      border: active ? '1px solid transparent' : '1px solid var(--color-border-default)'
    }
  }, label);
}
Object.assign(__ds_scope, { FlashCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/FlashCard.jsx", error: String((e && e.message) || e) }); }

// components/study/GradeButtons.jsx
try { (() => {
const BUTTONS = [{
  grade: 'DONT_KNOW',
  label: '몰라요',
  bg: 'var(--color-danger-weak)',
  fg: 'var(--color-text-danger)'
}, {
  grade: 'CONFUSED',
  label: '헷갈려요',
  bg: 'var(--color-brand-weak)',
  fg: 'var(--color-text-brand)'
}, {
  grade: 'KNOW',
  label: '알아요',
  bg: 'var(--color-brand-primary)',
  fg: 'var(--color-text-inverse)'
}];

// 알/헷/몰 3버튼 (24:144) — 플래시카드·빈칸·수학 복습 공통
function GradeButtons({
  onGrade
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, BUTTONS.map(b => /*#__PURE__*/React.createElement("button", {
    key: b.grade,
    type: "button",
    onClick: () => onGrade && onGrade(b.grade),
    style: {
      flex: 1,
      height: 48,
      borderRadius: 'var(--radius-md)',
      border: 'none',
      background: b.bg,
      color: b.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer'
    }
  }, b.label)));
}
Object.assign(__ds_scope, { GradeButtons });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/GradeButtons.jsx", error: String((e && e.message) || e) }); }

// components/study/RatingCounts.jsx
try { (() => {
const ITEMS = [{
  key: 'know',
  label: '알',
  fg: 'var(--color-rating-know)',
  bg: 'var(--color-rating-know-weak)'
}, {
  key: 'confused',
  label: '헷',
  fg: 'var(--color-rating-confused)',
  bg: 'var(--color-rating-confused-weak)'
}, {
  key: 'dontKnow',
  label: '몰',
  fg: 'var(--color-rating-dont-know)',
  bg: 'var(--color-rating-dont-know-weak)'
}];

/** 단어별 알/헷/몰 누적 횟수 (FR-18) — 단어장 행과 단어 상세에 붙는다 */
function RatingCounts({
  know = 0,
  confused = 0,
  dontKnow = 0,
  size = 'md',
  showZero = true
}) {
  const counts = {
    know,
    confused,
    dontKnow
  };
  const font = size === 'sm' ? 10 : 11;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-sans)'
    }
  }, ITEMS.filter(i => showZero || counts[i.key] > 0).map(i => /*#__PURE__*/React.createElement("span", {
    key: i.key,
    title: i.label === '알' ? '알아요' : i.label === '헷' ? '헷갈려요' : '몰라요',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: size === 'sm' ? '2px 6px' : '3px 7px',
      borderRadius: 'var(--radius-full)',
      background: i.bg,
      color: i.fg,
      fontSize: font,
      fontWeight: 700,
      lineHeight: 1.3,
      whiteSpace: 'nowrap'
    }
  }, i.label, /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, counts[i.key]))));
}
Object.assign(__ds_scope, { RatingCounts });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/RatingCounts.jsx", error: String((e && e.message) || e) }); }

// components/study/CardRow.jsx
try { (() => {
// 단어장·검색 카드 행 — 다중 태그(시험 태그 우선 + 일반 태그 +N) + 알/헷/몰 누적 횟수 (FR-04·FR-18)
function CardRow({
  row,
  onClick,
  onSpeak,
  onExamTag,
  onMoreTags,
  selectable = false,
  selected = false,
  speaking = false,
  expandable = false
}) {
  const [pressed, setPressed] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const canExpand = expandable && Boolean(row.example);
  const tagItems = [...(row.exams || []).map(e => typeof e === 'string' ? {
    label: e,
    kind: 'exam'
  } : {
    label: e.label,
    kind: 'exam',
    dday: e.dday
  }), ...(row.tags || []).map(t => ({
    label: t.label,
    kind: t.kind === 'exam' ? 'exam' : 'tag',
    dday: t.dday
  }))];
  const handleClick = canExpand || onClick ? () => {
    if (canExpand) setExpanded(v => !v);
    if (onClick) onClick();
  } : undefined;
  return /*#__PURE__*/React.createElement("article", {
    onClick: handleClick,
    onPointerDown: handleClick ? () => setPressed(true) : undefined,
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      position: 'relative',
      background: speaking ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-md)',
      border: speaking || selected ? '1.5px solid var(--color-brand-primary)' : '1.5px solid transparent',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: 'var(--font-sans)',
      cursor: handleClick ? 'pointer' : 'default',
      transform: pressed ? 'scale(0.98)' : undefined,
      animation: speaking ? 'jjik-speak-pulse 1.2s ease-in-out infinite' : undefined,
      transition: 'background 160ms ease, border-color 160ms ease, transform 120ms ease'
    }
  }, selectable && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 22,
      height: 22,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      background: selected ? 'var(--color-brand-primary)' : 'var(--color-bg-primary)',
      color: selected ? 'var(--color-text-inverse)' : 'transparent',
      border: selected ? 'none' : '1.5px solid var(--grey-300)',
      boxShadow: 'var(--shadow-select-dot)'
    },
    "aria-hidden": true
  }, "\u2713"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--color-text-primary)',
      padding: speaking ? '0 3px' : undefined,
      borderRadius: speaking ? 4 : undefined,
      background: speaking ? 'linear-gradient(transparent 58%, var(--color-accent) 58%)' : undefined,
      transition: 'background 160ms ease'
    }
  }, row.title), row.pronunciation && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-text-tertiary)',
      whiteSpace: 'nowrap'
    }
  }, row.pronunciation), row.showSpeaker && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\uBC1C\uC74C \uB4E3\uAE30",
    onClick: e => {
      e.stopPropagation();
      if (onSpeak) onSpeak();
    },
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      color: 'var(--color-text-brand)',
      cursor: 'pointer',
      display: 'inline-flex',
      flexShrink: 0,
      animation: speaking ? 'jjik-speak-bob 0.6s ease-in-out infinite' : undefined
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "speaker",
    size: 18
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, row.subtitle), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.TagList, {
    tags: tagItems,
    max: row.tagMax != null ? row.tagMax : 2,
    size: "sm",
    onMore: onMoreTags
  }), row.typeBadge && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    color: row.typeBadge.color,
    variant: "weak",
    size: "sm"
  }, row.typeBadge.label), row.untagged && /*#__PURE__*/React.createElement(ExamChip, {
    untagged: true,
    onTag: onExamTag
  }), row.ratings && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.RatingCounts, {
    size: "sm",
    know: row.ratings.know,
    confused: row.ratings.confused,
    dontKnow: row.ratings.dontKnow
  }))), canExpand && (expanded ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-text-brand)'
    }
  }, "\uC608\uBB38"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      lineHeight: 1.55,
      color: 'var(--color-text-primary)'
    }
  }, row.example), row.exampleTranslation && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)'
    }
  }, row.exampleTranslation)) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uD0ED\uD558\uBA74 \uC608\uBB38 \uBCF4\uAE30 \u203A")));
}

// 시험 칩 — 태깅됨: brand-weak "📅 {시험}" / 미지정: 흐린 테두리 "+ 시험"
function ExamChip({
  untagged,
  onTag
}) {
  if (untagged) {
    const style = {
      fontSize: 10,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--color-border-default)',
      color: 'var(--grey-500)',
      whiteSpace: 'nowrap',
      background: 'transparent',
      cursor: onTag ? 'pointer' : 'default'
    };
    return onTag ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: e => {
        e.stopPropagation();
        onTag();
      },
      style: style
    }, "+ \uC2DC\uD5D8") : /*#__PURE__*/React.createElement("span", {
      style: style
    }, "+ \uC2DC\uD5D8");
  }
  return null;
}
Object.assign(__ds_scope, { CardRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/CardRow.jsx", error: String((e && e.message) || e) }); }

// components/study/StudyOptionCard.jsx
try { (() => {
/** 학습 진입 선택 카드 (FR-12) — 복습 방식 3종·퀴즈 유형 2종을 고르는 큰 탭 영역 */
function StudyOptionCard({
  emoji,
  icon,
  title,
  description,
  meta,
  selected = false,
  disabled = false,
  onClick
}) {
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      minHeight: 72,
      padding: '14px 16px',
      textAlign: 'left',
      background: selected ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
      border: selected ? '1.5px solid var(--color-brand-primary)' : '1.5px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transform: pressed && !disabled ? 'scale(0.98)' : undefined,
      transition: 'background 160ms var(--ease-standard), border-color 160ms var(--ease-standard), transform 120ms var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 12,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      background: selected ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
      color: 'var(--color-text-brand)'
    },
    "aria-hidden": true
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }) : emoji), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)'
    }
  }, description)), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      fontSize: 12,
      fontWeight: 700,
      color: selected ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)'
    }
  }, meta));
}
Object.assign(__ds_scope, { StudyOptionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/StudyOptionCard.jsx", error: String((e && e.message) || e) }); }

// components/study/WordCard.jsx
try { (() => {
// 홈 최근 카드 (185:1093) — 개념 이미지 + 단어 + 발음 + 미/영 발음 + 태그 + 탭 힌트 (+ 정답/오답 accent)
function WordCard({
  card,
  result,
  pronunciation,
  conceptEmoji,
  tags,
  onSpeak,
  onClick
}) {
  const accent = result === 'WRONG' ? 'var(--color-result-wrong)' : result === 'CORRECT' ? 'var(--color-result-correct)' : null;
  return /*#__PURE__*/React.createElement("article", {
    onClick: onClick,
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      ...(accent ? {
        borderLeftWidth: 4,
        borderLeftColor: accent
      } : {}),
      borderRadius: 20,
      boxShadow: 'var(--shadow-modal)',
      fontFamily: 'var(--font-sans)',
      cursor: onClick ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: 118,
      borderRadius: 12,
      background: 'var(--gradient-concept)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 8,
      left: 8,
      background: 'rgba(255,255,255,0.85)',
      color: 'var(--color-text-secondary)',
      fontSize: 10,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 999
    }
  }, "\u2728 AI \uC5F0\uC0C1 \uC774\uBBF8\uC9C0"), result && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 8,
      right: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    color: result === 'WRONG' ? 'red' : 'green'
  }, result === 'WRONG' ? '오답' : '정답')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 48,
      lineHeight: 1
    },
    "aria-hidden": true
  }, conceptEmoji || '⚖️')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, card && card.word || '단어'), pronunciation && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-tertiary)'
    }
  }, pronunciation)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(VoiceButton, {
    primary: true,
    label: "\uD83C\uDDFA\uD83C\uDDF8 \uBBF8\uAD6D",
    onClick: () => onSpeak && onSpeak('US')
  }), /*#__PURE__*/React.createElement(VoiceButton, {
    label: "\uD83C\uDDEC\uD83C\uDDE7 \uC601\uAD6D",
    onClick: () => onSpeak && onSpeak('UK')
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "\uBC1C\uC74C \uB4E3\uAE30",
    onClick: e => {
      e.stopPropagation();
      if (onSpeak) onSpeak();
    },
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      color: 'var(--color-text-brand)',
      cursor: 'pointer',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "speaker",
    size: 20
  }))), tags && tags.length > 0 && /*#__PURE__*/React.createElement(__ds_scope.TagList, {
    tags: tags,
    max: 2,
    align: "center"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uCE74\uB4DC\uB97C \uD0ED\uD558\uBA74 \uB73B\uC774 \uBCF4\uC5EC\uC694"));
}
function VoiceButton({
  label,
  primary = false,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => {
      e.stopPropagation();
      if (onClick) onClick();
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      background: primary ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
      color: primary ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
      border: primary ? '1px solid transparent' : '1px solid var(--color-border-default)'
    }
  }, label);
}
Object.assign(__ds_scope, { WordCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/study/WordCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/App.jsx
try { (() => {
// 앱 셸 — 폰 프레임 + 하단 탭 + 화면 전환 + 테마(FR-17). 촬영 FAB 은 캡처 보상 이펙트를 재생한다.
const {
  BottomNav: ShellNav,
  CaptureFlash: ShellFlash,
  NavigationBar: ShellNavBar,
  Badge: ShellBadge,
  OfflineNotice: ShellOffline,
  SegmentedControl: ShellSegmented
} = window.DesignSystem_1cf846;
function App() {
  const [screen, setScreen] = React.useState('login');
  const [tab, setTab] = React.useState('home');
  const [flash, setFlash] = React.useState(false);
  const [theme, setTheme] = React.useState('light');
  const [offline, setOffline] = React.useState(false);
  const resolved = theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : theme;
  const capture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  };
  let body = null;
  if (offline) body = /*#__PURE__*/React.createElement(ShellOffline, {
    description: "\uB2E8\uC5B4\uC7A5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694 \u2014 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694",
    onRetry: () => setOffline(false)
  });else if (screen === 'login') body = /*#__PURE__*/React.createElement(window.LoginScreen, {
    onLogin: () => setScreen('app')
  });else if (screen === 'study') body = /*#__PURE__*/React.createElement(window.StudyScreen, {
    onExit: () => setScreen('app')
  });else if (screen === 'notifications') body = /*#__PURE__*/React.createElement(NotificationsScreen, {
    onBack: () => setScreen('app')
  });else if (tab === 'home') body = /*#__PURE__*/React.createElement(window.HomeScreen, {
    onBell: () => setScreen('notifications')
  });else if (tab === 'vocab') body = /*#__PURE__*/React.createElement(window.VocabScreen, {
    onStudy: () => setScreen('study')
  });else if (tab === 'my') body = /*#__PURE__*/React.createElement(window.MyScreen, {
    onLogout: () => setScreen('login'),
    theme: theme,
    onTheme: setTheme
  });else body = /*#__PURE__*/React.createElement(window.ReportScreen, null);
  const showNav = screen === 'app' && !offline;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "phone",
    "data-theme": resolved,
    style: {
      background: 'var(--color-bg-secondary)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, body), showNav && /*#__PURE__*/React.createElement(ShellNav, {
    active: tab,
    onSelect: setTab,
    onCapture: capture
  }), /*#__PURE__*/React.createElement(ShellFlash, {
    active: flash
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(ShellSegmented, {
    size: "sm",
    value: theme,
    onChange: setTheme,
    options: [{
      value: 'light',
      label: '라이트'
    }, {
      value: 'dark',
      label: '다크'
    }, {
      value: 'system',
      label: '시스템'
    }]
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOffline(v => !v),
    style: {
      height: 32,
      padding: '0 12px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--color-border-default)',
      background: offline ? 'var(--color-danger-weak)' : 'var(--color-bg-primary)',
      color: offline ? 'var(--color-text-danger)' : 'var(--color-text-secondary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      cursor: 'pointer'
    }
  }, offline ? '온라인으로 복귀' : '오프라인 상태 보기')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      textAlign: 'center',
      maxWidth: 460
    }
  }, "\uB85C\uADF8\uC778 \u2192 \uD648 \u2192 \uB2E8\uC5B4\uC7A5(\uD0DC\uADF8\uBCC4 \uBD84\uB958 \xB7 \uC54C/\uD5F7/\uBAB0 \uB204\uC801) \u2192 \uD559\uC2B5(\uBC29\uC2DD 3\uC885 \u2192 \uC720\uD615 2\uC885 \u2192 \uD50C\uB798\uC2DC\uCE74\uB4DC\xB7\uBE48\uCE78) \u2192 \uB9AC\uD3EC\uD2B8 \u2192 \uB9C8\uC774(\uD65C\uC131 \uC2DC\uD5D8 \xB7 \uD14C\uB9C8 \xB7 \uAD6C\uB3C5)."));
}

// 08 알림 — 목록형(NotificationsPage.tsx)
function NotificationsScreen({
  onBack
}) {
  const items = [{
    title: '오늘 복습할 단어 14개가 준비됐어요',
    time: '오전 8:00',
    unread: true
  }, {
    title: '중간고사 D-7 — 몰라요 단어 6개가 남았어요',
    time: '어제',
    unread: true
  }, {
    title: '연속 16일 달성! +40XP',
    time: '2일 전',
    unread: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--color-bg-primary)'
    }
  }, /*#__PURE__*/React.createElement(ShellNavBar, {
    title: "\uC54C\uB9BC",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      padding: '14px var(--spacing-xl)',
      borderBottom: '1px solid var(--color-border-default)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--color-text-primary)'
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, it.time)), it.unread && /*#__PURE__*/React.createElement(ShellBadge, {
    color: "blue",
    variant: "weak"
  }, "\uC0C8 \uC54C\uB9BC")))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/HomeScreen.jsx
try { (() => {
// 03 홈 — 헤더 + D-day 카드 + 플래시카드 캐러셀 (HomePage.tsx / RecentCarousel.tsx 재현)
const {
  AppHeader: HomeHeader,
  DdayCard: HomeDday,
  FlashCard: HomeFlashCard
} = window.DesignSystem_1cf846;
function HomeScreen({
  onBell
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 100
    }
  }, /*#__PURE__*/React.createElement(HomeHeader, {
    onBell: onBell
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '6px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement(HomeDday, {
    title: "\uC911\uAC04\uACE0\uC0AC",
    dday: 12,
    memoryRate: 68,
    todayDue: 14,
    onClick: () => {}
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      padding: '4px 0 8px',
      scrollSnapType: 'x mandatory',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 8%'
    },
    "aria-hidden": true
  }), window.WORDS.map(w => /*#__PURE__*/React.createElement("div", {
    key: w.id,
    style: {
      flex: '0 0 84%',
      scrollSnapAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(HomeFlashCard, {
    card: window.toCard(w),
    height: 500
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 8%'
    },
    "aria-hidden": true
  }))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/LoginScreen.jsx
try { (() => {
// 01 로그인 — 상단 브랜드 히어로 + 입력 2개 + CTA 2개 (LoginPage.tsx 재현)
const {
  Button: LoginButton,
  TextField: LoginTextField,
  AppLogo: LoginLogo
} = window.DesignSystem_1cf846;
function LoginScreen({
  onLogin
}) {
  const [email, setEmail] = React.useState('minji@school.kr');
  const [password, setPassword] = React.useState('••••••••');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100%',
      background: 'var(--gradient-auth)',
      padding: '0 var(--spacing-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      paddingTop: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-logo-24)',
      boxShadow: 'var(--shadow-logo)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(LoginLogo, {
    size: 96
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uCC0D\uC5B4\uBCF4\uCE74"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--color-text-secondary)'
    }
  }, "\uB0B4 \uC2DC\uD5D8\uC9C0\uB85C \uB9CC\uB4E0 \uB098\uB9CC\uC758 \uB2E8\uC5B4\uC7A5")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(LoginTextField, {
    value: email,
    onChange: setEmail,
    placeholder: "\uC774\uBA54\uC77C",
    type: "email"
  }), /*#__PURE__*/React.createElement(LoginTextField, {
    value: password,
    onChange: setPassword,
    placeholder: "\uBE44\uBC00\uBC88\uD638",
    type: "password"
  }), /*#__PURE__*/React.createElement(LoginButton, {
    block: true,
    size: "lg",
    onClick: onLogin
  }, "\uB85C\uADF8\uC778"), /*#__PURE__*/React.createElement(LoginButton, {
    block: true,
    size: "lg",
    variant: "weak"
  }, "\uC774\uBA54\uC77C\uB85C \uD68C\uC6D0\uAC00\uC785")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '16px 0 0',
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uC18C\uC15C \uB85C\uADF8\uC778\uC740 \uB2E4\uC74C \uBC84\uC804\uC5D0\uC11C \uC81C\uACF5\uB3FC\uC694"));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/MyScreen.jsx
try { (() => {
// 14 마이 — 프로필 + 성장 + 활성 시험(FR-11) + 테마 설정(FR-17) + 구독 플랜(FR-19)
const {
  ListRow: MyListRow,
  GameStatusCard: MyGameStatus,
  SegmentedControl: MySegmented,
  PlanCard: MyPlanCard,
  BottomSheet: MySheet,
  TagChip: MyTagChip,
  Button: MyButton,
  StreakGrid: MyGrass
} = window.DesignSystem_1cf846;
function MyScreen({
  onLogout,
  theme,
  onTheme
}) {
  const me = window.ME;
  const [activeExam, setActiveExam] = React.useState(true);
  const [plans, setPlans] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: '12px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uB9C8\uC774\uD398\uC774\uC9C0")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '16px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--color-bg-primary)',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, me.nickname), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--color-text-brand)',
      background: 'var(--color-brand-weak)',
      borderRadius: 'var(--radius-full)',
      padding: '2px 8px'
    }
  }, "Lv.", me.level, " \uB2E8\uC5B4 \uD5CC\uD130")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-tertiary)'
    }
  }, me.email)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 12,
      color: 'var(--color-text-tertiary)',
      cursor: 'pointer'
    }
  }, "\uD3B8\uC9D1 \u203A")), /*#__PURE__*/React.createElement(MyGameStatus, {
    level: me.level,
    heroTitle: "\uB2E8\uC5B4 \uD5CC\uD130",
    exp: me.exp,
    nextExp: me.nextExp,
    streakDays: me.streakDays,
    questLabel: "\uC624\uB298\uC758 \uBCF5\uC2B5 \u2014 \uB2E8\uC5B4 10\uAC1C 3/10 \xB7 \uB2EC\uC131 \uC2DC +40XP"
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 16,
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-card-14)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uD559\uC2B5 \uC794\uB514"), /*#__PURE__*/React.createElement(MyGrass, {
    days: window.REPORT.grass,
    weeks: 9,
    cell: 11,
    showLegend: false
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 16,
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-card-14)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uD65C\uC131 \uC2DC\uD5D8"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(MyTagChip, {
    kind: "exam",
    label: window.ACTIVE_EXAM.label,
    dday: window.ACTIVE_EXAM.dday
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      lineHeight: 1.6,
      color: 'var(--color-text-secondary)'
    }
  }, "\uCF1C\uB450\uBA74 \uC2DC\uD5D8 D-day\uAE4C\uC9C0 \uC0C8\uB85C \uCD2C\uC601\uD55C \uB2E8\uC5B4\uC5D0 '", window.ACTIVE_EXAM.label, "' \uD0DC\uADF8\uAC00 \uC790\uB3D9\uC73C\uB85C \uBD99\uC5B4\uC694"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MySegmented, {
    size: "sm",
    value: activeExam ? 'on' : 'off',
    onChange: v => setActiveExam(v === 'on'),
    options: [{
      value: 'on',
      label: '자동 태깅 ON'
    }, {
      value: 'off',
      label: 'OFF'
    }]
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      marginLeft: 'auto',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--color-text-brand)',
      cursor: 'pointer'
    }
  }, "\uC2DC\uD5D8 \uB4F1\uB85D \u203A"))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 16,
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-card-14)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uD654\uBA74 \uD14C\uB9C8"), /*#__PURE__*/React.createElement(MySegmented, {
    block: true,
    value: theme,
    onChange: onTheme,
    options: [{
      value: 'light',
      label: '라이트'
    }, {
      value: 'dark',
      label: '다크'
    }, {
      value: 'system',
      label: '시스템 자동'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: 64,
      borderRadius: 'var(--radius-card-14)',
      background: 'var(--gradient-premium)',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--common-white)'
    }
  }, "\u2B50 Plus \uC774\uC6A9 \uC911"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.65)'
    }
  }, "\uC6D4 \u20A9", me.planAmount.toLocaleString(), " \xB7 \uB2E4\uC74C \uACB0\uC81C ", me.planRenewal, " \xB7 \uC0AC\uC9C4 \uBD84\uC11D ", me.quotaUsed, "/", me.quotaLimit, "\uD68C"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      alignSelf: 'flex-start',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  }, "\uAD6C\uB3C5 \uD574\uC9C0"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPlans(true),
    style: {
      position: 'absolute',
      top: 20,
      right: 16,
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--color-highlight)',
      cursor: 'pointer'
    }
  }, "\uD50C\uB79C \uBCC0\uACBD \u203A"))), /*#__PURE__*/React.createElement(SectionLabel, null, "\uD559\uC2B5"), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83D\uDCC5 \uC2DC\uD5D8 \uC77C\uC815",
    value: window.ACTIVE_EXAM.label + ' D-' + window.ACTIVE_EXAM.dday,
    valueColor: "var(--color-brand-primary)",
    divider: true,
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83C\uDFF7\uFE0F \uD0DC\uADF8 \uAD00\uB9AC",
    value: "7\uAC1C",
    divider: true,
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83D\uDD14 \uC54C\uB9BC",
    value: "\uC2DC\uD5D8 D-day \uB9AC\uB9C8\uC778\uB354",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "\uACC4\uC815"), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83D\uDD12 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
    divider: true,
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83D\uDCC4 \uC774\uC6A9\uC57D\uAD00",
    divider: true,
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(MyListRow, {
    title: "\uD83D\uDEAA \uB85C\uADF8\uC544\uC6C3",
    onClick: onLogout
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      margin: '24px 0',
      background: 'none',
      border: 'none',
      textAlign: 'center',
      fontSize: 12,
      color: 'var(--color-text-tertiary)',
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  }, "\uD68C\uC6D0 \uD0C8\uD1F4 (\uB370\uC774\uD130 \uC989\uC2DC \uD30C\uAE30)"), /*#__PURE__*/React.createElement(MySheet, {
    open: plans,
    onClose: () => setPlans(false)
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 0',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uAD6C\uB3C5 \uD50C\uB79C"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, "\uC77C\uC77C \uC0AC\uC9C4 \uBD84\uC11D \uD55C\uB3C4\uB97C \uB298\uB824\uC694"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '4px 0'
    }
  }, window.PLANS.map(p => /*#__PURE__*/React.createElement(MyPlanCard, {
    key: p.name,
    name: p.name,
    price: p.price === 0 ? '무료' : p.price,
    quota: p.quota,
    features: p.features,
    recommended: p.recommended,
    current: p.name === 'Plus',
    onSelect: () => setPlans(false)
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      lineHeight: 1.6,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uB9E4\uC6D4 \uC790\uB3D9 \uAC31\uC2E0 \xB7 \uD574\uC9C0\uB294 \uC2A4\uD1A0\uC5B4 \uAD6C\uB3C5 \uAD00\uB9AC\uC5D0\uC11C \uC5B8\uC81C\uB4E0 \uAC00\uB2A5\uD574\uC694 \xB7 \uACB0\uC81C\uB294 App Store / Google Play \uC778\uC571\uACB0\uC81C\uB85C\uB9CC \uC9C4\uD589\uB3FC\uC694"), /*#__PURE__*/React.createElement(MyButton, {
    block: true,
    size: "lg",
    variant: "ghost",
    onClick: () => setPlans(false)
  }, "\uB2EB\uAE30")));
}
function SectionLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '20px var(--spacing-xl) 8px',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--color-text-tertiary)'
    }
  }, children);
}
window.MyScreen = MyScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/MyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/ReportScreen.jsx
try { (() => {
// 리포트 — 새 단어/정답률 도넛 + 주간 학습 시간 + 학습 잔디 + 약한 단어 Top3 (FR-09·FR-14)
const {
  DonutChart: RepDonut,
  MiniBarChart: RepBars,
  StreakGrid: RepGrass,
  CardRow: RepRow,
  ListHeader: RepHeader
} = window.DesignSystem_1cf846;
function ReportScreen() {
  const r = window.REPORT;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: '12px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uD559\uC2B5 \uB9AC\uD3EC\uD2B8"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, r.month, " \xB7 \uC0C8\uB85C \uCD94\uAC00\uD55C \uB2E8\uC5B4 ", r.newWords, "\uAC1C \xB7 \uD559\uC2B5 ", r.studyMinutes, "\uBD84")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '16px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\uB2E8\uC5B4 \uC815\uB2F5\uB960"
  }, /*#__PURE__*/React.createElement(RepDonut, {
    centerValue: r.accuracy + '%',
    centerLabel: "\uC815\uB2F5\uB960",
    segments: r.ratingMix
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "\uC8FC\uAC04 \uD559\uC2B5 \uC2DC\uAC04 \uBD84\uD3EC"
  }, /*#__PURE__*/React.createElement(RepBars, {
    data: r.weekly
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "\uD559\uC2B5 \uC794\uB514"
  }, /*#__PURE__*/React.createElement(RepGrass, {
    days: r.grass,
    streakDays: 16
  }))), /*#__PURE__*/React.createElement(RepHeader, {
    title: "\uB098\uC758 \uC57D\uD55C \uB2E8\uC5B4 Top 3",
    link: "\uB2E8\uC5B4\uC7A5\uC5D0\uC11C \uBCF4\uAE30"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 var(--spacing-xl)'
    }
  }, r.weakTop3.map(window.toRow).map(row => /*#__PURE__*/React.createElement(RepRow, {
    key: row.id,
    row: row
  }))));
}
function Panel({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 16,
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-card-14)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, title), children);
}
Object.assign(window, {
  ReportScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/ReportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/StudyScreen.jsx
try { (() => {
// 학습 — 복습 방식 3종 → 퀴즈 유형 2종 → 플래시카드/빈칸 → 알헷몰 평가 → 완료 (FR-12·FR-10·FR-05·FR-06)
const {
  FlashCard: StudyFlashCard,
  ClozeCard: StudyCloze,
  GradeButtons: StudyGradeButtons,
  StudyOptionCard: StudyOption,
  NavigationBar: StudyNav,
  StudyLoading: StudyLoadingView,
  SuccessGraphic: StudySuccess,
  Button: StudyButton,
  CardRow: StudyCardRow,
  TagFilterTabs: StudyTagTabs
} = window.DesignSystem_1cf846;
const MODES = [{
  key: 'TAG',
  emoji: '🏷️',
  title: '태그로 복습',
  description: '시험 태그·사용자 태그에 담긴 단어만 모아 풀어요'
}, {
  key: 'PICK',
  emoji: '✅',
  title: '직접 골라 복습',
  description: '단어장에서 원하는 단어만 다중 선택해요'
}, {
  key: 'WRONG',
  emoji: '🔥',
  title: '오답률 높은 단어',
  description: '몰라요 > 알아요 인 단어를 몰라요 빈도순으로 출제해요'
}];
function StudyScreen({
  onExit
}) {
  const [step, setStep] = React.useState('mode');
  const [mode, setMode] = React.useState(null);
  const [type, setType] = React.useState(null);
  const [tag, setTag] = React.useState('EXAM_MID');
  const [picked, setPicked] = React.useState([1, 3]);
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [answer, setAnswer] = React.useState('');
  const [judged, setJudged] = React.useState(false);
  const queue = React.useMemo(() => {
    if (mode === 'TAG') return window.WORDS.filter(w => window.matchesTag(w, tag));
    if (mode === 'PICK') return window.WORDS.filter(w => picked.includes(w.id));
    if (mode === 'WRONG') return window.WORDS.filter(w => w.ratings.dontKnow > w.ratings.know).sort((a, b) => b.ratings.dontKnow - a.ratings.dontKnow);
    return window.WORDS;
  }, [mode, tag, picked]);
  const total = queue.length;
  const card = queue[index];
  const correct = card && answer.trim().toLowerCase() === card.word.toLowerCase();
  const next = () => {
    setFlipped(false);
    setAnswer('');
    setJudged(false);
    if (index + 1 >= total) setStep('done');else setIndex(index + 1);
  };
  React.useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(() => setStep('quiz'), 1100);
    return () => clearTimeout(t);
  }, [step]);
  const shell = (title, children, onBack) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: 'var(--color-bg-primary)'
    }
  }, /*#__PURE__*/React.createElement(StudyNav, {
    title: title,
    onBack: onBack || onExit
  }), children);
  if (step === 'mode') {
    return shell('복습 방식', /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '8px var(--spacing-xl) 32px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 4px',
        fontSize: 13,
        color: 'var(--color-text-secondary)'
      }
    }, "\uC5B4\uB5A4 \uB2E8\uC5B4\uB85C \uBCF5\uC2B5\uD560\uC9C0 \uBA3C\uC800 \uACE8\uB77C\uC694"), MODES.map(m => /*#__PURE__*/React.createElement(StudyOption, {
      key: m.key,
      emoji: m.emoji,
      title: m.title,
      description: m.description,
      meta: m.key === 'WRONG' ? window.WORDS.filter(w => w.ratings.dontKnow > w.ratings.know).length + '개' : undefined,
      selected: mode === m.key,
      onClick: () => setMode(m.key)
    })), mode === 'TAG' && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        padding: '12px 0 0',
        borderTop: '1px solid var(--color-border-default)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--color-text-secondary)'
      }
    }, "\uD0DC\uADF8 \uC120\uD0DD"), /*#__PURE__*/React.createElement(StudyTagTabs, {
      items: window.TAG_TABS.filter(t => t.key !== 'ALL'),
      active: tag,
      onSelect: setTag
    })), mode === 'PICK' && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 0 0',
        borderTop: '1px solid var(--color-border-default)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--color-text-secondary)'
      }
    }, "\uB2E8\uC5B4 \uC120\uD0DD ", picked.length, "\uAC1C"), window.WORDS.map(window.toRow).map(row => /*#__PURE__*/React.createElement(StudyCardRow, {
      key: row.id,
      row: row,
      selectable: true,
      selected: picked.includes(row.id),
      onClick: () => setPicked(p => p.includes(row.id) ? p.filter(x => x !== row.id) : [...p, row.id])
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(StudyButton, {
      block: true,
      size: "lg",
      disabled: !mode || mode === 'PICK' && picked.length === 0,
      onClick: () => mode && setStep('type')
    }, "\uB2E4\uC74C"))));
  }
  if (step === 'type') {
    return shell('퀴즈 유형', /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '8px var(--spacing-xl) 32px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 4px',
        fontSize: 13,
        color: 'var(--color-text-secondary)'
      }
    }, "\uB2E8\uC5B4 ", total, "\uAC1C\uB85C \uC5B4\uB5BB\uAC8C \uC778\uCD9C\uD560\uAE4C\uC694?"), /*#__PURE__*/React.createElement(StudyOption, {
      emoji: "\uD83C\uDCCF",
      title: "\uD50C\uB798\uC2DC\uCE74\uB4DC",
      description: "\uC55E\uBA74 \uB2E8\uC5B4\xB7\uC5F0\uC0C1 \uC774\uBBF8\uC9C0 \u2192 \uB4A4\uC9D1\uC5B4 \uB73B\uACFC \uC608\uBB38 \uD655\uC778",
      selected: type === 'FLASH',
      onClick: () => setType('FLASH')
    }), /*#__PURE__*/React.createElement(StudyOption, {
      emoji: "\u270F\uFE0F",
      title: "\uC608\uBB38 \uBE48\uCE78 \uCC44\uC6B0\uAE30",
      description: "\uC608\uBB38\uC758 \uBE48\uCE78\uC5D0 \uB2E8\uC5B4\uB97C \uC9C1\uC811 \uC368\uC11C \uC778\uCD9C\uD574\uC694",
      selected: type === 'CLOZE',
      onClick: () => setType('CLOZE')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(StudyButton, {
      block: true,
      size: "lg",
      disabled: !type,
      onClick: () => setStep('loading')
    }, "\uD559\uC2B5 \uC2DC\uC791"))), () => setStep('mode'));
  }
  if (step === 'loading') return shell(type === 'CLOZE' ? '빈칸 채우기' : '플래시카드', /*#__PURE__*/React.createElement(StudyLoadingView, null));
  if (step === 'done') {
    return shell('학습 완료', /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '0 32px 120px'
      }
    }, /*#__PURE__*/React.createElement(StudySuccess, null), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: '8px 0 0',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        animation: 'jjik-rise-in 0.4s ease-out both'
      }
    }, total, "\uAC1C \uBCF5\uC2B5 \uC644\uB8CC!"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        textAlign: 'center'
      }
    }, "\uC5F0\uC18D 16\uC77C \xB7 +40XP \uB97C \uBC1B\uC558\uC5B4\uC694"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(StudyButton, {
      block: true,
      size: "lg",
      onClick: onExit
    }, "\uB2E8\uC5B4\uC7A5\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"), /*#__PURE__*/React.createElement(StudyButton, {
      block: true,
      size: "lg",
      variant: "ghost",
      onClick: () => {
        setIndex(0);
        setStep('mode');
        setMode(null);
        setType(null);
      }
    }, "\uB2E4\uB978 \uBC29\uC2DD\uC73C\uB85C \uB354 \uD558\uAE30"))));
  }
  return shell(index + 1 + ' / ' + total, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--spacing-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 2,
      background: 'var(--color-bg-secondary)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: (index + 1) / total * 100 + '%',
      height: '100%',
      background: 'var(--color-brand-primary)',
      borderRadius: 2,
      transition: 'width 0.3s var(--ease-standard)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px var(--spacing-xl) 0'
    }
  }, type === 'CLOZE' ? /*#__PURE__*/React.createElement(StudyCloze, {
    sentence: card.example.replace(new RegExp(card.word, 'i'), '___'),
    translation: judged ? card.exampleTranslation : undefined,
    value: answer,
    onChange: setAnswer,
    onSubmit: () => setJudged(true),
    judged: judged,
    correct: correct,
    word: card.word,
    meaning: card.meaning,
    hint: '첫 글자 ' + card.word[0] + ' · ' + card.word.length + '글자'
  }) : /*#__PURE__*/React.createElement(StudyFlashCard, {
    card: window.toCard(card),
    height: 500,
    flipped: flipped,
    onFlip: () => setFlipped(v => !v)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px var(--spacing-xl) 24px'
    }
  }, type === 'CLOZE' && !judged ? /*#__PURE__*/React.createElement(StudyButton, {
    block: true,
    size: "lg",
    disabled: !answer.trim(),
    onClick: () => setJudged(true)
  }, "\uC815\uB2F5 \uD655\uC778") : /*#__PURE__*/React.createElement(StudyGradeButtons, {
    onGrade: next
  }))));
}
window.StudyScreen = StudyScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/StudyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/VocabScreen.jsx
try { (() => {
// 06 단어장 — 태그별 자동 분류 피드(FR-04) + 알/헷/몰 누적(FR-18) + 복습 진입(FR-10)
const {
  Button: VocabButton,
  SearchBar: VocabSearchBar,
  CardRow: VocabCardRow,
  BottomSheet: VocabSheet,
  TagFilterTabs: VocabTagTabs,
  TagChip: VocabTagChip
} = window.DesignSystem_1cf846;
function VocabScreen({
  onStudy
}) {
  const [tag, setTag] = React.useState('ALL');
  const [voice, setVoice] = React.useState('US');
  const [speaking, setSpeaking] = React.useState(null);
  const [sheet, setSheet] = React.useState(false);
  const [tagSheet, setTagSheet] = React.useState(null);
  const [sort, setSort] = React.useState('WRONG');
  const words = window.WORDS.filter(w => window.matchesTag(w, tag));
  const rows = [...words].sort((a, b) => sort === 'WRONG' ? window.wrongRate(b) - window.wrongRate(a) : a.id - b.id).map(window.toRow);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uB2E8\uC5B4\uC7A5")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement(VocabSearchBar, {
    placeholder: "\uB2E8\uC5B4 \xB7 \uB73B \xB7 \uD0DC\uADF8 \uAC80\uC0C9"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px var(--spacing-xl) 0'
    }
  }, /*#__PURE__*/React.createElement(VocabTagTabs, {
    items: window.TAG_TABS,
    active: tag,
    onSelect: setTag,
    onManage: () => setTagSheet('manage')
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      padding: '12px var(--spacing-xl) 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(VoiceToggle, {
    label: "\uD83C\uDDFA\uD83C\uDDF8 \uBBF8\uAD6D",
    active: voice === 'US',
    onClick: () => setVoice('US')
  }), /*#__PURE__*/React.createElement(VoiceToggle, {
    label: "\uD83C\uDDEC\uD83C\uDDE7 \uC601\uAD6D",
    active: voice === 'GB',
    onClick: () => setVoice('GB')
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSort(s => s === 'WRONG' ? 'RECENT' : 'WRONG'),
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--color-text-brand)',
      cursor: 'pointer'
    }
  }, sort === 'WRONG' ? '몰라요 빈도순 ▾' : '최근 추가순 ▾')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 var(--spacing-xl) 176px'
    }
  }, rows.map(row => /*#__PURE__*/React.createElement(VocabCardRow, {
    key: row.id,
    row: row,
    speaking: speaking === row.id,
    onSpeak: () => {
      setSpeaking(row.id);
      setTimeout(() => setSpeaking(null), 1400);
    },
    onMoreTags: () => setTagSheet(row),
    onExamTag: row.untagged ? () => setTagSheet(row) : undefined,
    expandable: true
  })), rows.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '40px 0',
      textAlign: 'center',
      fontSize: 13,
      color: 'var(--color-text-tertiary)'
    }
  }, "\uC774 \uD0DC\uADF8\uC5D0 \uB2F4\uAE34 \uB2E8\uC5B4\uAC00 \uC544\uC9C1 \uC5C6\uC5B4\uC694 \u2014 \uC2DC\uD5D8\uC9C0\uB97C \uCD2C\uC601\uD574\uBCF4\uC138\uC694")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 108,
      padding: '0 var(--spacing-xl)',
      boxSizing: 'border-box',
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement(VocabButton, {
    block: true,
    size: "lg",
    onClick: () => setSheet(true)
  }, "\uD559\uC2B5\uD558\uAE30")), /*#__PURE__*/React.createElement(VocabSheet, {
    open: sheet,
    onClose: () => setSheet(false)
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 0',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, "\uC5B4\uB5A4 \uB2E8\uC5B4\uB85C \uBCF5\uC2B5\uD560\uAE4C\uC694?"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, "\uBCF5\uC2B5 \uBC29\uC2DD\uC744 \uACE0\uB974\uBA74 \uD034\uC988 \uC720\uD615\uC744 \uC774\uC5B4\uC11C \uC120\uD0DD\uD574\uC694"), /*#__PURE__*/React.createElement(VocabButton, {
    block: true,
    size: "lg",
    onClick: () => {
      setSheet(false);
      onStudy();
    }
  }, "\uBCF5\uC2B5 \uBC29\uC2DD \uACE0\uB974\uAE30"), /*#__PURE__*/React.createElement(VocabButton, {
    block: true,
    size: "lg",
    variant: "ghost"
  }, "\uB2E8\uC5B4 \uC2DC\uD5D8\uC9C0 PDF \uB9CC\uB4E4\uAE30")), /*#__PURE__*/React.createElement(VocabSheet, {
    open: Boolean(tagSheet),
    onClose: () => setTagSheet(null)
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '4px 0 0',
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--color-text-primary)'
    }
  }, tagSheet && tagSheet.title ? tagSheet.title + ' 태그' : '태그 관리'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, "\uD0DC\uADF8\uB294 \uAC1C\uC218 \uC81C\uD55C \uC5C6\uC774 \uBD99\uC77C \uC218 \uC788\uC5B4\uC694"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      padding: '4px 0 8px'
    }
  }, (tagSheet && tagSheet.exams ? tagSheet.exams : [window.ACTIVE_EXAM]).map(e => /*#__PURE__*/React.createElement(VocabTagChip, {
    key: e.label,
    kind: "exam",
    label: e.label,
    dday: e.dday,
    onRemove: () => {}
  })), (tagSheet && tagSheet.tags ? tagSheet.tags.map(t => t.label) : ['#수능특강', '#형용사', '#동사', '#내신', '#중요', '#독해', '#듣기']).map(label => /*#__PURE__*/React.createElement(VocabTagChip, {
    key: label,
    label: label,
    onRemove: () => {}
  }))), /*#__PURE__*/React.createElement(VocabButton, {
    block: true,
    size: "lg",
    variant: "weak",
    onClick: () => setTagSheet(null)
  }, "+ \uD0DC\uADF8 \uCD94\uAC00")));
}
function VoiceToggle({
  label,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      background: active ? 'var(--color-brand-weak)' : 'var(--color-bg-primary)',
      color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
      border: active ? '1px solid transparent' : '1px solid var(--color-border-default)'
    }
  }, label);
}
Object.assign(window, {
  VocabScreen,
  VoiceToggle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/VocabScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/jjikovoca-app/data.js
try { (() => {
// UI 키트용 가짜 데이터 — 요구사항 v3.2 기준(다중 태그·알헷몰 누적·활성 시험·구독 플랜)
const ACTIVE_EXAM = {
  label: '중간고사',
  dday: 7,
  date: '9월 20일'
};
const WORDS = [{
  id: 1,
  word: 'inevitable',
  pronunciation: '[ɪnˈevɪtəbl]',
  meaning: '피할 수 없는',
  emoji: '⚖️',
  tags: ['#수능특강', '#중요', '#형용사'],
  exams: [ACTIVE_EXAM],
  ratings: {
    know: 4,
    confused: 2,
    dontKnow: 1
  },
  example: 'A change of plan seemed inevitable.',
  exampleTranslation: '계획 변경은 피할 수 없어 보였다.'
}, {
  id: 2,
  word: 'diligent',
  pronunciation: '[ˈdɪlɪdʒənt]',
  meaning: '성실한',
  emoji: '📚',
  tags: ['#내신', '#형용사'],
  exams: [],
  ratings: {
    know: 1,
    confused: 3,
    dontKnow: 5
  },
  example: 'She is a diligent student.',
  exampleTranslation: '그는 성실한 학생이다.'
}, {
  id: 3,
  word: 'fluctuate',
  pronunciation: '[ˈflʌktʃueɪt]',
  meaning: '변동하다',
  emoji: '📈',
  tags: ['#수능특강', '#동사', '#독해'],
  exams: [ACTIVE_EXAM],
  ratings: {
    know: 0,
    confused: 2,
    dontKnow: 6
  },
  example: 'Prices fluctuate with demand.',
  exampleTranslation: '가격은 수요에 따라 변동한다.'
}, {
  id: 4,
  word: 'remarkable',
  pronunciation: '[rɪˈmɑːrkəbl]',
  meaning: '놀라운',
  emoji: '✨',
  tags: ['#듣기', '#형용사'],
  exams: [],
  ratings: {
    know: 6,
    confused: 1,
    dontKnow: 0
  },
  example: 'He made remarkable progress.',
  exampleTranslation: '그는 놀라운 발전을 이뤘다.'
}, {
  id: 5,
  word: 'consequence',
  pronunciation: '[ˈkɑːnsɪkwens]',
  meaning: '결과',
  emoji: '🧩',
  tags: ['#수능특강', '#명사'],
  exams: [{
    label: '기말고사',
    dday: 46
  }],
  ratings: {
    know: 2,
    confused: 4,
    dontKnow: 3
  },
  example: 'Every choice has a consequence.',
  exampleTranslation: '모든 선택에는 결과가 있다.'
}];

// 단어장 상단 태그 필터 탭 — 시험 태그가 앞, 사용자 태그가 뒤 (FR-04)
const TAG_TABS = [{
  key: 'ALL',
  label: '전체',
  count: WORDS.length
}, {
  key: 'EXAM_MID',
  label: ACTIVE_EXAM.label,
  kind: 'exam',
  dday: ACTIVE_EXAM.dday,
  count: 2
}, {
  key: 'EXAM_FIN',
  label: '기말고사',
  kind: 'exam',
  dday: 46,
  count: 1
}, {
  key: '#수능특강',
  label: '#수능특강',
  count: 3
}, {
  key: '#형용사',
  label: '#형용사',
  count: 3
}, {
  key: '#동사',
  label: '#동사',
  count: 1
}, {
  key: '#내신',
  label: '#내신',
  count: 1
}];
const matchesTag = (w, key) => {
  if (key === 'ALL') return true;
  if (key === 'EXAM_MID') return w.exams.some(e => e.label === ACTIVE_EXAM.label);
  if (key === 'EXAM_FIN') return w.exams.some(e => e.label === '기말고사');
  return w.tags.includes(key);
};
const wrongRate = w => w.ratings.dontKnow - w.ratings.know;
const toRow = w => ({
  id: w.id,
  title: w.word,
  pronunciation: w.pronunciation,
  subtitle: w.meaning,
  tags: w.tags.map(label => ({
    label
  })),
  exams: w.exams,
  untagged: w.exams.length === 0,
  ratings: w.ratings,
  showSpeaker: true,
  example: w.example,
  exampleTranslation: w.exampleTranslation
});
const toCard = w => ({
  word: w.word,
  pronunciation: w.pronunciation,
  meaning: w.meaning,
  emoji: w.emoji,
  example: w.example,
  exampleTranslation: w.exampleTranslation,
  tags: [...w.exams.map(e => ({
    label: e.label,
    kind: 'exam',
    dday: e.dday
  })), ...w.tags.map(label => ({
    label
  }))]
});
const ME = {
  nickname: '민지',
  email: 'minji@school.kr',
  level: 7,
  exp: 320,
  nextExp: 500,
  streakDays: 16,
  plan: 'PLUS',
  planAmount: 3900,
  planRenewal: '10월 4일',
  quotaUsed: 12,
  quotaLimit: 20
};

// 학습 리포트 (FR-09) — 방사형 차트 없음, 도넛 + 주간 막대 + 약한 단어 Top3
const REPORT = {
  month: '9월',
  newWords: 38,
  accuracy: 78,
  studyMinutes: 214,
  ratingMix: [{
    label: '알아요',
    value: 62,
    color: 'var(--color-rating-know)'
  }, {
    label: '헷갈려요',
    value: 24,
    color: 'var(--color-rating-confused)'
  }, {
    label: '몰라요',
    value: 14,
    color: 'var(--color-rating-dont-know)'
  }],
  weekly: [{
    label: '월',
    value: 12
  }, {
    label: '화',
    value: 24
  }, {
    label: '수',
    value: 8
  }, {
    label: '목',
    value: 31
  }, {
    label: '금',
    value: 18
  }, {
    label: '토',
    value: 42
  }, {
    label: '일',
    value: 26
  }],
  grass: Array.from({
    length: 91
  }, (_, i) => i < 40 ? i % 7 === 0 ? 0 : i % 5 % 5 : [0, 1, 2, 3, 4, 3, 2][i % 7]),
  weakTop3: [WORDS[2], WORDS[1], WORDS[4]]
};
const PLANS = [{
  name: 'Free',
  price: 0,
  quota: '사진 분석 하루 3회',
  features: ['플래시카드·빈칸 퀴즈', '단어장 다중 태그']
}, {
  name: 'Plus',
  price: 3900,
  quota: '사진 분석 하루 20회',
  recommended: true,
  features: ['AI 연상 이미지 무제한', '시험지 PDF 내보내기']
}, {
  name: 'Pro',
  price: 6900,
  quota: '사진 분석 하루 40회',
  features: ['AI 오답 시험지', '학습 리포트 상세 지표']
}];
Object.assign(window, {
  WORDS,
  TAG_TABS,
  ACTIVE_EXAM,
  REPORT,
  PLANS,
  ME,
  toRow,
  toCard,
  matchesTag,
  wrongRate
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/jjikovoca-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.PlanCard = __ds_scope.PlanCard;

__ds_ns.AppLogo = __ds_scope.AppLogo;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ListHeader = __ds_scope.ListHeader;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.NavigationBar = __ds_scope.NavigationBar;

__ds_ns.Placeholder = __ds_scope.Placeholder;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TagChip = __ds_scope.TagChip;

__ds_ns.TagList = __ds_scope.TagList;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.CaptureFlash = __ds_scope.CaptureFlash;

__ds_ns.OfflineNotice = __ds_scope.OfflineNotice;

__ds_ns.StudyLoading = __ds_scope.StudyLoading;

__ds_ns.SuccessGraphic = __ds_scope.SuccessGraphic;

__ds_ns.DdayCard = __ds_scope.DdayCard;

__ds_ns.GameStatusCard = __ds_scope.GameStatusCard;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.TagFilterTabs = __ds_scope.TagFilterTabs;

__ds_ns.DonutChart = __ds_scope.DonutChart;

__ds_ns.MiniBarChart = __ds_scope.MiniBarChart;

__ds_ns.StreakGrid = __ds_scope.StreakGrid;

__ds_ns.CardRow = __ds_scope.CardRow;

__ds_ns.CardThumb = __ds_scope.CardThumb;

__ds_ns.ClozeCard = __ds_scope.ClozeCard;

__ds_ns.FlashCard = __ds_scope.FlashCard;

__ds_ns.GradeButtons = __ds_scope.GradeButtons;

__ds_ns.RatingCounts = __ds_scope.RatingCounts;

__ds_ns.StudyOptionCard = __ds_scope.StudyOptionCard;

__ds_ns.WordCard = __ds_scope.WordCard;

})();
