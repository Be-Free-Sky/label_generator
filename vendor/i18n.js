/* i18n.js — English / 中文 for the whole interface.
 *
 * Classic script, so it works from file:// like everything else here. Load it
 * last. Exposes globalThis.I18N.
 *
 *
 * WHAT IS TRANSLATED, AND WHAT MUST NEVER BE
 * ------------------------------------------
 * The INTERFACE is translated: headings, field captions, buttons, hints, help
 * text, validation messages, the picker copy.
 *
 * The LABEL is not, and that is not an oversight:
 *
 *   the artwork     it is a statutory Indian label. "IS 13252(Part 1):2010/",
 *                   the BIS registration and "Made in India" are printed marks
 *                   with legal force — a Chinese reader still prints the
 *                   English label. It is drawn on a <canvas> and this never
 *                   touches a canvas.
 *   field VALUES    the EAN, the serial, the addresses, the commodity name.
 *                   They are the data going onto the label. Only the CAPTION
 *                   beside an input is translated, never what is typed into it.
 *
 * A string is translated only if it appears in DICT exactly. Anything absent is
 * left alone — so a brand, a part number, a dimension or a symbology name comes
 * through untouched rather than half-translated, and a string added later
 * simply stays English until somebody translates it.
 *
 *
 * SWITCHING BACK IS EXACT
 * -----------------------
 * The original English is kept per NODE in a WeakMap the first time that node
 * is touched, and restoring writes it back verbatim. Translating from the
 * Chinese by reverse lookup would be lossy the moment two English strings share
 * a translation.
 *
 *
 * THE PAGES REBUILD THEMSELVES
 * ----------------------------
 * The validation summary, the status panels and the pickers are re-rendered by
 * the generator as the operator types, which would silently drop back to
 * English. A MutationObserver re-applies to whatever is added. It is
 * disconnected while translating so it cannot observe its own writes.
 */
(function () {
'use strict';

var LANG_KEY = 'skyworth.lang';

/* ------------------------------------------------------------------ DICT */
/* English -> 简体中文. Terms of art (EAN, MAC ID, RSN, MSN, QR, Code128, DPI)
   are kept in the Latin form an operator on the line actually reads. */
var DICT = {
  /* ---- portal ---- */
  'Skyworth Label Generator': '创维标签生成器 (Skyworth Label Generator)',
  'Label Generator': '标签生成器 (Label Generator)',
  /* The portal H1 splits as "Skyworth" + a span, so the brand word is its own
     text node and stayed English while the span beside it read Chinese. The
     corporate mark in the bar keeps its Latin wordmark; this is prose. */
  'Skyworth': '创维',
  'Offline · print-ready · layout locked': '离线 · 可直接打印 · 版面锁定',
  'Runs fully offline. No network required.': '完全离线运行，无需网络连接。',
  'Compliance & regulatory artwork — layouts are locked to the approved plans; only data is editable.':
    '合规与法规图稿 — 版面已按核准方案锁定，仅数据可编辑。',
  'Select plant': '选择工厂',
  'Select vendor': '选择供应商',
  'Plants': '工厂 (Plants)',
  'EMS partners': 'EMS 合作伙伴 (EMS partners)',
  'Label types': '标签类型 (Label types)',
  'Generators': '生成器 (Generators)',
  '30 generators': '30 个生成器',
  'Open generator': '打开生成器 (Open generator)',
  'All builds': '全部版本 (All builds)',
  'Labels in this build': '本版本的标签 (Labels in this build)',
  'Air Fiber': 'Air Fiber',
  'Jio Fiber': 'Jio Fiber',
  'AF1 Air Fiber': 'AF1 Air Fiber',
  'JF Jio Fiber': 'JF Jio Fiber',
  'All rights reserved, Copyright ©': '版权所有 ©',

  /* ---- label type names ---- */
  /* DOMAIN TERMS CARRY THEIR ENGLISH TERM. Not decoration: the Chinese words
     here are correct but AMBIGUOUS in reverse -- 托盘 is the standard word for a
     shipping pallet and also the word for a tray, 外箱 for a master carton and
     also for any outer box. An operator matching this screen against an English
     label, a Jio nomenclature sheet or an EMS drawing needs the term those
     documents use, so it is printed alongside rather than left to be inferred. */
  'Device': '设备 (Device)',
  'Device Label': '设备标签 (Device Label)',
  /* RSN and MRP were kept in the Latin form as terms of art; translated on
     request. Every string COUPLED to them moves with them -- the page title,
     the summary line -- or the tab and the heading above it disagree. The
     LABEL still prints RSN: and MRP:, which is what the operator matches
     against, and the label canvas is never translated. */
  'RSN': '序列号 (RSN)',
  'RSN Label': '序列号标签 (RSN Label)',
  'MRP': '最高零售价 (MRP)',
  'MRP Label': '最高零售价标签 (MRP Label)',
  'Carton': '外箱 (Carton)',
  'Master Carton Label': '外箱标签 (Master Carton Label)',
  'Pallet': '托盘 (Pallet)',
  'Pallet Label': '托盘标签 (Pallet Label)',

  /* ---- section headings ---- */
  'Device identification': '设备标识 (Device identification)',
  'Device information': '设备信息 (Device information)',
  'Identification': '标识 (Identification)',
  'Product': '产品 (Product)',
  'Carton information': '外箱信息 (Carton information)',
  'Pallet information': '托盘信息 (Pallet information)',
  'Order & identification': '订单与标识 (Order & identification)',
  'Purchase order & identification': '采购订单与标识 (Purchase order & identification)',
  'Quantities & weights': '数量与重量 (Quantities & weights)',
  'Addresses': '地址 (Addresses)',
  'Contact': '联系方式 (Contact)',
  'Manufacture & marketing': '制造与经销 (Manufacture & marketing)',
  'Statutory text': '法定文字 (Statutory text)',
  'Statutory text & compliance marks': '法定文字与合规标志 (Statutory text & compliance marks)',
  'Compliance marks & fixed text': '合规标志与固定文字 (Compliance marks & fixed text)',
  'Serial number (RSN)': '序列号 (RSN)',
  'Serial numbers (RSN 1–10)': '序列号 (RSN 1–10)',
  'Validation summary': '校验摘要 (Validation summary)',
  'Live label preview': '标签实时预览 (Live label preview)',
  'QR & barcode preview': 'QR 与条码预览 (QR & barcode preview)',
  'QR preview': 'QR 预览 (QR preview)',
  'Code128 preview': 'Code128 预览 (Code128 preview)',
  'QR code payload': 'QR 码内容 (QR code payload)',
  'QR code': 'QR 码 (QR code)',

  /* ---- field captions ---- */
  'Commodity': '品名 (Commodity)',
  'Model': '型号 (Model)',
  'Model No.': '型号',
  'Color': '颜色 (Color)',
  'EAN': 'EAN',
  'MAC ID': 'MAC ID',
  'CHIP ID': 'CHIP ID',
  'MSN': 'MSN',
  'PO': 'PO',
  'PO No.': 'PO 编号',
  'PO Date': 'PO 日期 (PO Date)',
  'Invoice No.': '发票号',
  'QNTY': '数量 (QNTY)',
  'Carton no.': '外箱号 (Carton no.)',
  'Total cartons': '外箱总数 (Total cartons)',
  'Total No. of Cartons': '外箱总数 (Total No. of Cartons)',
  'Pallet no.': '托盘号 (Pallet no.)',
  'Pallet No.': '托盘号 (Pallet No.)',
  'Total pallets': '托盘总数 (Total pallets)',
  'Gross Weight': '毛重 (Gross Weight)',
  'Gross Wt.': '毛重',
  'Net Weight': '净重 (Net Weight)',
  'Net Wt.': '净重',
  'Consignor': '发货人 (Consignor)',
  'Ship to Address': '收货地址 (Ship to Address)',
  'Manufactured by': '制造商 (Manufactured by)',
  'Marketed by': '经销商 (Marketed by)',
  'Registered Office': '注册地址 (Registered Office)',
  'For': '委托方 (For)',
  'At': '地址 (At)',
  'MRP (Inclusive of all taxes)': 'MRP（含全部税费）',
  'Month & Year of Manufacture': '生产年月 (Month & Year of Manufacture)',
  'Inbox Contents (six items, one per line)': '包装清单（六项，每行一项）',
  'Customer care No': '客服电话 (Customer care No)',
  'E-mail ID': '电子邮箱 (E-mail ID)',
  'Customer complaint statement': '客户投诉声明 (Customer complaint statement)',
  'Firmware': '固件 (Firmware)',
  'FW': 'FW',
  'Rated voltage': '额定电压 (Rated voltage)',
  'Rated current': '额定电流 (Rated current)',
  'Plant code badge': '工厂代码标识 (Plant code badge)',
  'Safety standard line 1': '安全标准第 1 行 (Safety standard line 1)',
  'Safety standard line 2': '安全标准第 2 行 (Safety standard line 2)',
  'BIS registration no.': 'BIS 注册号',
  'BIS website': 'BIS 网址 (BIS website)',
  'Country of origin': '原产国 (Country of origin)',
  'Serial number': '序列号 (Serial number)',

  /* ---- hints ---- */
  '(exactly 13 digits)': '（正好 13 位数字）',
  '(exactly 16 characters)': '（正好 16 个字符）',
  '(exactly 16 hex characters)': '（正好 16 个十六进制字符）',
  '(exactly 18 characters)': '（正好 18 个字符）',
  '(12 hex characters)': '（12 个十六进制字符）',
  '(15 characters — replace every _)': '（15 个字符 — 请替换所有 _）',
  '(15 characters — replace the _ placeholders)': '（15 个字符 — 请替换 _ 占位符）',
  '(4 characters)': '（4 个字符）',
  '(4 lines, as authored)': '（4 行，按原文）',
  '(any length — the last 8 digits link to the MSN)': '（长度不限 — 后 8 位与 MSN 关联）',
  '(any length — the last 8 digits link to the Pallet No.)': '（长度不限 — 后 8 位与托盘号关联）',
  '(DD.MM.YYYY)': '（日.月.年）',
  '(MM/YYYY)': '（月/年）',
  '(derived · 14 characters)': '（自动生成 · 14 个字符）',
  '(free text — whole value editable)': '（自由文本 — 整个值可编辑）',
  '(= RSN count)': '（= RSN 数量）',
  '(₹ prefix added automatically)': '（自动添加 ₹ 前缀）',
  '(must include "(Toll Free)")': '（必须包含 "(Toll Free)"）',
  '(up to 2 lines — press Enter to break)': '（最多 2 行 — 按 Enter 换行）',
  '(six items, one per line)': '（六项，每行一项）',

  /* ---- RSN nomenclature ---- */
  '15th digit change': '第 15 位变化 (15th digit change)',
  '9th digit change': '第 9 位变化 (9th digit change)',
  'digit change': '位变化',
  'Select an RSN nomenclature option.': '请选择 RSN 编码规则。',
  'Select an RSN nomenclature option before entering the serial number.':
    '请先选择 RSN 编码规则，再输入序列号。',
  'Select an RSN nomenclature option before entering serial numbers.':
    '请先选择 RSN 编码规则，再输入序列号。',
  'Select an RSN nomenclature option to prefill the structure.':
    '选择 RSN 编码规则以预填结构。',
  'Select an RSN nomenclature option to prefill the structure. RSN entry stays disabled until an option is chosen — there is no default value.':
    '选择 RSN 编码规则以预填结构。未选择前 RSN 输入保持禁用 — 没有默认值。',

  /* ---- buttons and status ---- */
  'Save & generate label': '保存并生成标签 (Save & generate label)',
  'Download PNG': '下载 PNG (Download PNG)',
  'Download JPG': '下载 JPG (Download JPG)',
  'Download PDF': '下载 PDF (Download PDF)',
  'LABEL GENERATION SUCCESSFUL': '标签生成成功 (LABEL GENERATION SUCCESSFUL)',
  'LABEL GENERATION BLOCKED': '标签生成已阻止 (LABEL GENERATION BLOCKED)',
  'Resolve the highlighted fields to enable Save.': '请修正高亮字段后方可保存。',
  'PASSED (decoded)': '通过（已解码）',
  'No QR': '无 QR',
  'No barcode': '无条码',
  'before saving.': '后再保存。',
  'is a template — replace every': '为模板 — 请替换所有',
  'The whole string is editable. The default': '整个字符串均可编辑。默认值',

  /* ---- validation messages ---- */
  'QR decoded — matches label data': 'QR 已解码 — 与标签数据一致',
  'QR 26 × 26 mm decoded — matches label data': 'QR 26 × 26 mm 已解码 — 与标签数据一致',
  'QR 28 × 28 mm decoded — matches label data': 'QR 28 × 28 mm 已解码 — 与标签数据一致',
  'QR 30 × 30 mm decoded — matches label data': 'QR 30 × 30 mm 已解码 — 与标签数据一致',
  'Code128 — EAN': 'Code128 — EAN',
  'Code128 — MSN': 'Code128 — MSN',
  'Code128 — Pallet No.': 'Code128 — Pallet No.',
  'Commodity present': '品名已填写',
  'Commodity / Color present': '品名 / 颜色已填写',
  'Commodity / Model / Color present': '品名 / 型号 / 颜色已填写',
  'Model present': '型号已填写',
  'EAN — exactly 13 digits': 'EAN — 正好 13 位数字',
  'CHIP ID — exactly 16 characters': 'CHIP ID — 正好 16 个字符',
  'CHIP ID — example value (verify against database)': 'CHIP ID — 示例值（需与数据库核对）',
  'MAC ID — example value (replace for production)': 'MAC ID — 示例值（量产前请替换）',
  'MSN — 18 characters, PO-linked': 'MSN — 18 个字符，与 PO 关联',
  'Pallet No. — 14 characters, PO-linked': '托盘号 — 14 个字符，与 PO 关联',
  'PO — digits only; last 8 link to the Pallet No.': 'PO — 仅限数字；后 8 位与托盘号关联',
  'PO No. (last 8 link to the MSN) & PO Date valid': 'PO 编号（后 8 位与 MSN 关联）与 PO 日期有效',
  'Carton no. — 4 characters, within total when numeric': '外箱号 — 4 个字符，为数字时不超过总数',
  'Pallet no. — NNNN / TTTT': '托盘号 — NNNN / TTTT',
  'QNTY equals the RSN count': '数量等于 RSN 数量',
  'Quantities & weights present': '数量与重量已填写',
  'Weights — gross / net valid': '重量 — 毛重 / 净重有效',
  'Consignor — 4 lines, within width': '发货人 — 4 行，未超宽',
  'Ship to Address — 4 lines, within width': '收货地址 — 4 行，未超宽',
  'RSN matches selected nomenclature': 'RSN 符合所选编码规则',
  'RSN matches the selected nomenclature': 'RSN 符合所选编码规则',
  'RSN 1–10 match the selected nomenclature': 'RSN 1–10 符合所选编码规则',
  'FW — complete, no placeholders left': 'FW — 已完成，无剩余占位符',
  'FW is incomplete — replace every _ placeholder character.': 'FW 不完整 — 请替换所有 _ 占位符。',
  'Fixed artwork matches the approved plan': '固定图稿与核准方案一致',
  'Manufactured by / For / At — three declarations': '制造商 / 委托方 / 地址 — 三项声明',
  'Marketed by + Registered Office in full': '经销商 + 注册地址完整',
  'Month & Year — MM/YYYY only': '生产年月 — 仅限 月/年',
  'Customer care No retains (Toll Free)': '客服电话保留 "(Toll Free)"',
  'E-mail ID valid': '电子邮箱有效',
  'Inbox Contents — six items, "+" separators (fixed)': '包装清单 — 六项，以 "+" 分隔（固定）',
  'MRP — ₹ + (Inclusive of all taxes), value 9 pt': '最高零售价 — ₹ +（含全部税费），字号 9 pt',

  /* ---- notes ---- */
  'This value is an example. Every device is different, needs to be compared with database to ensure it is correct or not.':
    '此为示例值。每台设备各不相同，需与数据库核对以确认是否正确。',
  'This value is an example. It needs to be an actual value.':
    '此为示例值，需替换为实际值。',
  'Fixed artwork on the approved plan. Editable, but any change from the approved value is flagged in the validation summary.':
    '核准方案中的固定图稿。可编辑，但任何偏离核准值的改动都会在校验摘要中标示。',
  'These values are fixed artwork on the approved plan. They are editable, but any change from the approved value is flagged in the validation summary.':
    '这些值为核准方案中的固定图稿。可编辑，但任何偏离核准值的改动都会在校验摘要中标示。',
  'The dashed red outline and its ~1.6 mm rounded corners mark the die-cut / trim guide. The label itself is borderless — no outline is printed or exported.':
    '红色虚线及其约 1.6 mm 圆角标示模切/裁切参考线。标签本身无边框 — 该线不会被打印或导出。',
  'The dashed red outline marks the physical die-cut edge (radius ≈ 1.6 mm) — the label itself is borderless and nothing is printed at the edge.':
    '红色虚线标示实际模切边缘（圆角半径约 1.6 mm）— 标签本身无边框，边缘不打印任何内容。',
  'The dashed red outline marks the physical label edge — the label is borderless and this guide is never printed or exported.':
    '红色虚线标示标签实际边缘 — 标签无边框，此参考线不会被打印或导出。',
  'The red outline marks the physical die-cut edge of the white label stock — it is not printed.':
    '红线标示白色标签材料的实际模切边缘 — 不会被打印。',
  'M + last 8 digits of PO No. + DD (day of production) + month + year + shift (A morning / B noon / C night) + 4-digit master-carton serial. Characters 2–9 follow the PO No. automatically.':
    'M + PO 编号后 8 位 + DD（生产日）+ 月 + 年 + 班次（A 早班 / B 中班 / C 夜班）+ 4 位外箱流水号。第 2–9 位自动跟随 PO 编号。',
  'RP + last 8 digits of the PO + 4-character pallet serial. Characters 3–10 follow the PO automatically. If the numeric range is exhausted for a PO, the serial may run A001 – Z999.':
    'RP + PO 后 8 位 + 4 位托盘流水号。第 3–10 位自动跟随 PO。若某 PO 的数字范围用尽，流水号可使用 A001 – Z999。',
  /* ---- validation, blocking and error messages ----
     What the operator reads when the generator REFUSES, which is exactly when
     the wording has to be clear. The first pass missed the whole class: a
     browser sweep only sees the states it can reach, and a refusal message sits
     behind a condition a correct page never meets. Found by reading the page
     SOURCES instead. */
  "PDF library did not load (vendor/jspdf.umd.min.js missing or blocked).": "PDF 库未加载（vendor/jspdf.umd.min.js 缺失或被拦截）。",
  "PDF writer did not load (vendor/vectorpdf.js or vendor/layoutspec.js missing).": "PDF 生成模块未加载（缺少 vendor/vectorpdf.js 或 vendor/layoutspec.js）。",
  "Barcode cannot encode this value": "条码无法编码此值",
  "Validation is not clean — download is disabled.": "校验未通过 — 下载已禁用。",
  "Validation is not clean — fix the highlighted fields and Save again.": "校验未通过 — 请修正高亮字段后重新保存。",
  "Fonts and logos are still loading — try again in a moment.": "字体与标志仍在加载 — 请稍后再试。",
  "QR decode failed": "二维码解码失败",
  "Commodity is required.": "品名为必填项。",
  "Model is required.": "型号为必填项。",
  "Model No. is required.": "型号为必填项。",
  "Color is required.": "颜色为必填项。",
  "MAC ID is required.": "MAC ID 为必填项。",
  "Gross Weight is required.": "毛重为必填项。",
  "Manufactured by is required.": "制造商为必填项。",
  "Marketed by is required.": "经销商为必填项。",
  "Registered Office is required.": "注册地址为必填项。",
  "Customer care No is required.": "客服电话为必填项。",
  "For is required.": "委托方为必填项。",
  "At (address) is required.": "地址为必填项。",
  "EAN must contain exactly 13 digits.": "EAN 必须为 13 位数字。",
  "EAN accepts digits only.": "EAN 只能输入数字。",
  "EAN must contain exactly 13 digits — the 14th digit is not allowed.": "EAN 必须为 13 位数字 — 不允许输入第 14 位。",
  "CHIP ID must contain exactly 16 characters.": "CHIP ID 必须为 16 个字符。",
  "CHIP ID must be exactly 16 hexadecimal characters (0–9, A–F).": "CHIP ID 必须为 16 个十六进制字符（0–9、A–F）。",
  "CHIP ID cannot exceed 16 characters — the 17th character is not allowed.": "CHIP ID 不能超过 16 个字符 — 不允许输入第 17 个字符。",
  "RSN incomplete — replace the _ placeholder characters.": "序列号不完整 — 请替换 _ 占位字符。",
  "RSN cannot exceed 15 characters — the 16th character is not allowed.": "序列号不能超过 15 个字符 — 不允许输入第 16 个字符。",
  "Commodity fits at most 2 lines — there is no room above Model for a third.": "品名最多 2 行 — 型号上方没有第 3 行的空间。",
  "Commodity fits at most 2 lines — there is no room above the MRP row for a third.": "品名最多 2 行 — 最高零售价行上方没有第 3 行的空间。",
  "Commodity must be a single line — there is no room above Model No. for a second.": "品名必须为单行 — 型号上方没有第 2 行的空间。",
  "Commodity must be a single line — there is no room above Pallet No. for a second.": "品名必须为单行 — 托盘号上方没有第 2 行的空间。",
  "Inbox Contents must list exactly six items, one per line.": "包装清单必须列出六项，每行一项。",
  "MRP must be a formatted amount with 2 decimals, e.g. 6,400.00.": "最高零售价必须为带 2 位小数的金额格式，例如 6,400.00。",
  "Month & Year must be MM/YYYY only, e.g. 05/2026.": "生产年月必须为 月/年 格式，例如 05/2026。",
  "Month must be 01–12.": "月份必须为 01–12。",
  "Customer care No must retain \"(Toll Free)\".": "客服电话必须保留 \"(Toll Free)\"。",
  "Enter a valid e-mail ID.": "请输入有效的电子邮箱。",
  "Carton no. must be exactly 4 characters (letters or digits), e.g. 0001.": "外箱号必须为 4 个字符（字母或数字），例如 0001。",
  "Total cartons must be exactly 4 characters (letters or digits), e.g. 3950 or XXXX.": "外箱总数必须为 4 个字符（字母或数字），例如 3950 或 XXXX。",
  "Carton no. must be 0001 or higher.": "外箱号必须为 0001 或更大。",
  "Total cartons must be 0001 or higher.": "外箱总数必须为 0001 或更大。",
  "Pallet no. must be exactly 4 characters (letters or digits), e.g. 0001.": "托盘号必须为 4 个字符（字母或数字），例如 0001。",
  "Total pallets must be exactly 4 characters (letters or digits), e.g. 1106.": "托盘总数必须为 4 个字符（字母或数字），例如 1106。",
  "Pallet no. must be 0001 or higher.": "托盘号必须为 0001 或更大。",
  "PO No. must contain digits only (any length).": "PO 编号只能包含数字（长度不限）。",
  "PO No. accepts digits only.": "PO 编号只能输入数字。",
  "PO must contain digits only (any length).": "PO 只能包含数字（长度不限）。",
  "PO accepts digits only.": "PO 只能输入数字。",
  "PO Date must be a real date in DD.MM.YYYY format.": "PO 日期必须为 日.月.年 格式的真实日期。",
  "MSN must contain exactly 18 characters.": "MSN 必须为 18 个字符。",
  "MSN must be M + 8-digit PO + DD + month letter + year letter + shift (A/B/C) + 4-digit carton serial.": "MSN 必须为 M + 8 位 PO + DD + 月份字母 + 年份字母 + 班次（A/B/C）+ 4 位外箱流水号。",
  "MSN characters 10–11 are the day of production and must be 01–31.": "MSN 第 10–11 位为生产日，必须为 01–31。",
  "QNTY must be a whole number between 1 and 10.": "数量必须为 1 到 10 之间的整数。",
  "QNTY accepts digits only.": "数量只能输入数字。",
  "QNTY cannot exceed 10.": "数量不能超过 10。",
  "Gross Weight must be a number followed by Kg (e.g. 7.9Kg).": "毛重必须为数字后跟 Kg，例如 7.9Kg。",
  "Net Weight cannot be greater than Gross Weight.": "净重不能大于毛重。",
  "Pallet No. must contain exactly 14 characters.": "托盘号必须为 14 个字符。",
  "Pallet No. must be RP + 8-digit PO + 4-character serial (e.g. RP000000720001).": "托盘号必须为 RP + 8 位 PO + 4 位流水号，例如 RP000000720001。",
  "Pallet No. must be RP + 8-digit PO + 4-character serial (e.g. RP000000960001).": "托盘号必须为 RP + 8 位 PO + 4 位流水号，例如 RP000000960001。",
  "Barcode Code128 read back — machine-readable": "Code128 条码回读 — 可机读",
  "Barcode Code128 read back — NOT readable": "Code128 条码回读 — 不可机读",
  "Code128 read back OK": "Code128 回读正常",
  "Code128 — RSN": "Code128 — RSN",
  "RSN 1": "序列号 1 (RSN 1)",
  "RSN 2": "序列号 2 (RSN 2)",
  "RSN 3": "序列号 3 (RSN 3)",
  "RSN 4": "序列号 4 (RSN 4)",
  "RSN 5": "序列号 5 (RSN 5)",
  "RSN 6": "序列号 6 (RSN 6)",
  "RSN 7": "序列号 7 (RSN 7)",
  "RSN 8": "序列号 8 (RSN 8)",
  "RSN 9": "序列号 9 (RSN 9)",
  "RSN 10": "序列号 10 (RSN 10)",
  "RSN does not match the selected nomenclature (R + VV + SB + M + Y + C000000 + H, uppercase, 15 characters).": "序列号与所选编码规则不符（R + VV + SB + M + Y + C000000 + H，大写，15 个字符）。",
  "RSN does not match the selected nomenclature (R + VV + SB + M + Y + C + M + 000001, uppercase, 15 characters).": "序列号与所选编码规则不符（R + VV + SB + M + Y + C + M + 000001，大写，15 个字符）。",
  "RSN does not match the selected nomenclature (R + YR + SB + M + Y + C000000 + H, uppercase, 15 characters).": "序列号与所选编码规则不符（R + YR + SB + M + Y + C000000 + H，大写，15 个字符）。",
  "RSN does not match the selected nomenclature (R + YR + SB + M + Y + C + M + 000001, uppercase, 15 characters).": "序列号与所选编码规则不符（R + YR + SB + M + Y + C + M + 000001，大写，15 个字符）。",
  "RSN does not match the selected nomenclature (R + SQ + SB + M + Y + C000000 + H, uppercase, 15 characters).": "序列号与所选编码规则不符（R + SQ + SB + M + Y + C000000 + H，大写，15 个字符）。",
  "RSN does not match the selected nomenclature (R + SQ + SB + M + Y + C + M + 000001, uppercase, 15 characters).": "序列号与所选编码规则不符（R + SQ + SB + M + Y + C + M + 000001，大写，15 个字符）。",
};

/* ------------------------------------------------- COMPOSITE STRINGS */
/* Some lines on these pages are prose and DATA woven together:
 *
 *   45.6 mm × 29.6 mm · 600 DPI · Master layout locked — data only
 *   Label: VVDN AF1 · Size: 45.6 × 29.6 mm · Resolution: 600 DPI
 *   VVDN AF1 - Device Label
 *
 * They cannot go in DICT, because the data half differs on every one of the
 * thirty pages — thirty entries that say the same thing, and a thirty-first
 * page tomorrow that says it in English. So the prose is translated and the
 * DATA IS CARRIED THROUGH VERBATIM, never re-spelt: a dimension, a DPI, a
 * model number, a vendor and a barcode symbology read the same in both
 * languages, and an operator comparing the screen against a printed label is
 * comparing those characters.
 *
 * Tried strictly in this order, and the FIRST hit wins:
 *
 *   1. DICT      the whole string, exactly as before
 *   2. segments  a ' · ' list — each piece translated on its own, and the
 *                string is only claimed if at least one piece moved
 *   3. PATTERNS  a shape, with the data captured and put back
 *
 * Anything that matches none of the three is left in English, exactly as an
 * unknown string always was.
 */

/* A segment of a ' · ' list, or the whole of a short line. */
var SEG = {
  'borderless': '无边框',
  'Borderless': '无边框',
  'Master layout locked — data only': '版面锁定 — 仅数据可编辑',
  'layout locked, data only': '版面锁定，仅数据可编辑',
  'Validation: PASSED': '校验：通过',
  'Validation: FAILED': '校验：未通过',
  'QR:': '二维码：',
  'Barcode:': '条形码：',
  'Barcodes:': '条形码：',
  'Barcode: Code128 = RSN': '条形码：Code128 = RSN',
  'Visual layout: master template': '视觉版面：主模板',
  'BIS + RoHS + WEEE embedded as supplied': 'BIS + RoHS + WEEE 按供图原尺寸嵌入',
  '— exactly what the QR on the label encodes': '— 与标签上二维码所编码的内容完全一致'
};

/* The RSN nomenclature note is a run of codes with a gloss after each. The
   CODES are the serial's own characters and stay; only the gloss is read. */
var GLOSS = {
  '(RJIL identifier)': '（RJIL 标识）',
  '(EMS Name Identifier)': '（EMS 名称标识）',
  '(STB)': '（机顶盒）',
  '(Month of Manufacturing)': '（生产月份）',
  '(Year of Manufacturing)': '（生产年份）',
  '(ODM Name Skyworth Identifier)': '（ODM 名称创维标识）',
  '(DDR + EMMC)': '（DDR + EMMC）'
};

/* [shape, replacement]. A replacement may be a function, which is what lets a
   captured piece be looked up in DICT rather than merely copied. */
var PATTERNS = [
  /* page titles: "<vendor> <plant> - <type> Label" */
  [/^(.+) - Device Label$/, '$1 - 设备标签 (Device Label)'],
  [/^(.+) - RSN Label$/, '$1 - 序列号标签 (RSN Label)'],
  [/^(.+) - MRP Label$/, '$1 - 最高零售价标签 (MRP Label)'],
  [/^(.+) - Master Carton Label$/, '$1 - 外箱标签 (Master Carton Label)'],
  [/^(.+) - Pallet Label$/, '$1 - 托盘标签 (Pallet Label)'],

  /* "Label: X" / "Size: X" / "Resolution: X". The caption always reads; the
     value is data EXCEPT where it names a label type, which the page title
     translates too -- leaving "Master Carton" in an otherwise Chinese line is
     the half-translated look this whole layer exists to avoid. */
  [/^Label: (.+)$/, function (m, v) { return '标签：' + labelName(v); }],
  [/^Size: (.+)$/, '尺寸：$1'],
  [/^Resolution: (.+)$/, '分辨率：$1'],

  /* "45.6 × 29.6 mm at 600 DPI (1077 × 699 px)" */
  [/^(.+ mm) at (\d[\d.]* DPI) \((.+)\)$/, '$1，$2（$3）'],
  /* "Barcode Code128 = RSN (25.1 × 5 mm)" */
  [/^Barcode (Code\d+ = .+) \((.+)\)$/, '条形码 $1（$2）'],
  /* "— exactly what the 26 × 26 mm QR encodes" */
  [/^— exactly what the (.+) QR encodes$/, '— 与 $1 二维码所编码的内容完全一致'],
  [/^Mixed-size ratio (.+)$/, '混合字号比例 $1'],
  [/^(.+) as supplied$/, '$1 按供图原尺寸'],
  [/^\(up to (\d+) lines, as authored\)$/, '（最多 $1 行，按原文）'],
  [/^(.+) — up to (\d+) lines, within width$/, function (m, a, b) {
    return (DICT[a] || a) + ' — 最多 ' + b + ' 行，不超出宽度';
  }],
  [/^Choose a label — (.+)$/, '选择标签 — $1'],
  [/^Skyworth Label Generator, (.+)$/, '创维标签生成器，$1'],

  /* A message carrying a COUNT the page works out at run time cannot be a
     dictionary entry: '2/2' was in there and '12/12' and '7/12' were not, so a
     carton's own barcode status stayed in English. Matched as a SHAPE. */
  [/^Barcodes Code128 read back — (\d+\/\d+) machine-readable$/, 'Code128 条码回读 — $1 可机读'],
  [/^Code128 — (\d+\/\d+) read back OK$/, 'Code128 — $1 回读正常'],
  [/^Download failed \((PDF|PNG|JPG)\): (.+)$/, '下载失败（$1）：$2'],
  [/^Carton no\. cannot exceed the total carton count \((.+)\)\.$/, '外箱号不能超过外箱总数（$1）。'],
  [/^Pallet no\. cannot exceed the total pallet count \((.+)\)\.$/, '托盘号不能超过托盘总数（$1）。'],
  [/^MSN characters 2–9 must be the last 8 digits of the PO No\. \((.+)\)\.$/, 'MSN 第 2–9 位必须为 PO 编号后 8 位（$1）。'],
  [/^Pallet No\. characters 3–10 must be the last 8 digits of the PO \((.+)\)\.$/, '托盘号第 3–10 位必须为 PO 后 8 位（$1）。'],
  /* The RSN nomenclature note. Anchored at both ends ON PURPOSE: a replacement
     function is handed the MATCH, not the subject string, so a bare
     /\(RJIL identifier\)/ would hand back that one gloss and leave the other
     six in English. */
  [/^R \(RJIL identifier\).*$/, function (whole) {
    return whole.replace(/\([^()]*(?:\([^()]*\)[^()]*)*\)/g, function (g) {
      return GLOSS[g] || g;
    }).replace(/ （/g, '（');        // a full-width bracket needs no space before it
  }]
];

/* A label's own name, as it appears after "Label:". The vendor and plant are
   identity and stay; the TYPE reads, exactly as it does in the page title. */
function labelName(v) {
  if (DICT[v] !== undefined) return DICT[v];
  return v.replace(/Master Carton$/, '外箱')
          .replace(/Pallet$/, '托盘')
          .replace(/MRP \/ Statutory$/, '最高零售价 / 法定')
          .replace(/ RSN$/, ' 序列号');
}

/* The one place a visible English string becomes Chinese. Returns null when
   nothing claims it, which is what leaves it in English. */
function translate(t) {
  if (DICT[t] !== undefined) return DICT[t];
  if (SEG[t] !== undefined) return SEG[t];

  /* a ' · ' list. A leading separator is part of the layout, not the text --
     these lines are built in pieces around <b> elements -- so it is lifted
     off, and put back exactly as it was found. */
  if (t.indexOf(' · ') !== -1 || t.indexOf('· ') === 0) {
    var lead = '';
    var body = t;
    if (body.indexOf('· ') === 0) { lead = '· '; body = body.slice(2); }
    var parts = body.split(' · ');
    var moved = false;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      var hit = DICT[p];
      if (hit === undefined) hit = SEG[p];
      if (hit === undefined) hit = fromPatterns(p);
      if (hit !== null && hit !== undefined) { parts[i] = hit; moved = true; }
    }
    if (moved) return lead + parts.join(' · ');
  }

  return fromPatterns(t);
}

function fromPatterns(t) {
  for (var i = 0; i < PATTERNS.length; i++) {
    var re = PATTERNS[i][0];
    if (!re.test(t)) continue;
    return t.replace(re, PATTERNS[i][1]);
  }
  return null;
}


/* --------------------------------------------------------------- engine */

var SKIP_TAG = { SCRIPT: 1, STYLE: 1, CANVAS: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1, OPTION: 0 };
var ATTRS = ['placeholder', 'title', 'aria-label'];
var originals = new WeakMap();      // node -> the English it started with
var lang = 'en';
var observer = null;

function isLabelArt(el) {
  return !!(el && el.closest && el.closest('#label, #labelPreview, .label-wrap canvas'));
}

function nodeText(node, to) {
  var keep = originals.get(node);
  if (keep === undefined) {
    keep = node.nodeValue;
    originals.set(node, keep);
  }
  if (to === 'en') { if (node.nodeValue !== keep) node.nodeValue = keep; return; }
  var t = keep.trim();
  var hit = translate(t);
  if (!hit) return;
  // keep the node's own leading/trailing whitespace, which carries layout
  node.nodeValue = keep.replace(t, hit);
}

function walk(root, to) {
  if (!root) return;
  if (root.nodeType === 3) { nodeText(root, to); return; }
  if (root.nodeType !== 1) return;
  if (SKIP_TAG[root.tagName]) return;
  if (isLabelArt(root)) return;

  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      var p = n.parentElement;
      if (!p || SKIP_TAG[p.tagName] || isLabelArt(p)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var n;
  var list = [];
  while ((n = w.nextNode())) list.push(n);
  for (var i = 0; i < list.length; i++) nodeText(list[i], to);

  var els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label]') : [];
  var all = root.nodeType === 1 ? [root].concat(Array.prototype.slice.call(els)) : els;
  for (var j = 0; j < all.length; j++) {
    var el = all[j];
    if (isLabelArt(el)) continue;
    for (var k = 0; k < ATTRS.length; k++) {
      var a = ATTRS[k];
      if (!el.getAttribute || !el.hasAttribute(a)) continue;
      var key = el.__i18nKey || (el.__i18nKey = {});
      if (key[a] === undefined) key[a] = el.getAttribute(a);
      var src = key[a];
      var val = to === 'en' ? src : (translate(String(src).trim()) || src);
      if (el.getAttribute(a) !== val) el.setAttribute(a, val);
    }
  }
}

function apply(to) {
  if (observer) observer.disconnect();          // never observe our own writes
  walk(document.body, to);
  document.documentElement.lang = to === 'zh' ? 'zh-CN' : 'en';
  if (observer) observer.observe(document.body, { childList: true, subtree: true });
}

function set(to) {
  lang = (to === 'zh') ? 'zh' : 'en';
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  apply(lang);
  var btn = document.getElementById('langBtn');
  if (btn) {
    btn.textContent = lang === 'zh' ? 'English' : '中文';
    btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    btn.title = lang === 'zh' ? 'Switch to English' : 'Switch to Chinese';
  }
}

function toggle() { set(lang === 'zh' ? 'en' : 'zh'); }

function mount() {
  if (document.getElementById('langBtn')) return;
  var btn = document.createElement('button');
  btn.id = 'langBtn';
  btn.type = 'button';
  btn.className = 'h-tab lang-btn';
  btn.textContent = '中文';
  btn.title = 'Switch to Chinese';
  btn.addEventListener('click', toggle);

  // Beside the label tabs on a generator, beside the brand on the portal.
  var nav = document.querySelector('header .h-nav') || document.querySelector('.top-in') || document.body;
  nav.appendChild(btn);

  var css = document.createElement('style');
  css.textContent =
    '.lang-btn{cursor:pointer;font:inherit;font-weight:650;border:1px solid rgba(1,138,190,.42);' +
    'background:rgba(255,255,255,.72);color:#02457A;border-radius:999px;padding:.32rem .78rem;' +
    'margin-left:.5rem;line-height:1.2;white-space:nowrap;transition:background .15s,border-color .15s}' +
    '.lang-btn:hover{background:#fff;border-color:#018ABE}' +
    '.lang-btn:focus-visible{outline:2px solid #018ABE;outline-offset:2px}' +
    '.top-in .lang-btn{margin-left:auto}' +
    /* Chinese has no spaces to wrap at, so a long caption must be allowed to
       break inside a word or it pushes its column wider. */
    ':lang(zh-CN) .vf-note,:lang(zh-CN) .hint,:lang(zh-CN) label{word-break:break-word;overflow-wrap:anywhere}';
  document.head.appendChild(css);

  observer = new MutationObserver(function (muts) {
    if (lang === 'en') return;
    if (observer) observer.disconnect();
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) walk(added[j], lang);
      if (muts[i].type === 'characterData') nodeText(muts[i].target, lang);
    }
    observer.observe(document.body, { childList: true, subtree: true });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  var saved = 'en';
  try { saved = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  set(saved);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();

globalThis.I18N = { set: set, toggle: toggle, apply: apply, dict: DICT, get lang() { return lang; } };
})();
