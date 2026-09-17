# Skyworth Label Generator

Printing artwork for the **Jio JMSB200Av2** set-top box. Open it, fill in the
data for the order, and download the label ready to print.

**[Open the generator →](https://be-free-sky.github.io/label_generator/)**

## What it makes

Five labels, for two plants and three EMS partners — **thirty generators**:

| | |
|---|---|
| **Labels** | Device · RSN · MRP · Master Carton · Pallet |
| **Plants** | AF1 (Air Fiber) · JF (Jio Fiber) |
| **Vendors** | VVDN · Syrma SGS · Skyquad |

## How it works

Pick the plant, the vendor and the label. Type the values for your order — the
serial, the PO, the weights — and the label is drawn beside you as you type, at
its real size and resolution.

**The layout is locked to the approved plan.** Nothing can be moved. Only the
data is editable, so a label cannot come out in the wrong shape.

Below the preview, a **validation summary** checks every rule the label must
satisfy. Green means checked and correct. Amber means the value is still an
example from the reference artwork and must be replaced before production. Red
means the label cannot be produced until it is fixed — Save stays disabled.

## Downloading

**PNG** and **JPG** are pictures. **PDF** is a real document: the text is
selectable, searchable and editable, set in the label's own JioType. Use the PDF
when the file goes to a printer or has to be checked.

All three are named the same way — `Vendor_Plant_Type_Label`.

## Language

The interface switches between **English** and **中文**. Chinese terms carry
their English term in brackets — 托盘 (Pallet), 外箱 (Carton) — so a field cannot
be matched to the wrong one when checking against an English label.

**The label artwork itself is always English.** It is a statutory Indian label
and its printed wording does not change with the interface.

## Running it

Nothing to install and no network needed — it is a set of static pages and runs
entirely offline. Open `index.html` from a copy on disk, or use the link above.

The version number in the header opens the **release notes**, which record what
changed in each release.

---

## 创维标签生成器

用于生成 **Jio JMSB200Av2** 机顶盒的印刷图稿。打开后填写订单数据，即可下载可直接
打印的标签。

**[打开生成器 →](https://be-free-sky.github.io/label_generator/)**

**标签类型**：设备 (Device)、序列号 (RSN)、最高零售价 (MRP)、外箱 (Master Carton)、
托盘 (Pallet)。**工厂**：AF1、JF。**供应商**：VVDN、Syrma SGS、Skyquad。共 30 个生成器。

依次选择工厂、供应商与标签类型，填写本订单的数据，右侧会按实际尺寸与分辨率实时绘制标签。
**版面已按核准方案锁定**，无法移动任何元素，仅数据可编辑。

预览下方的**校验摘要**逐条检查标签须满足的规则：绿色表示正确；橙色表示该值仍为参考图稿中的
示例值，量产前必须替换；红色表示存在错误，在修正前无法保存。

**PNG** 与 **JPG** 为图片；**PDF** 为真正的文档，文字可选中、可检索、可编辑，并使用标签
自带的 JioType 字体 — 送印或需核查时请使用 PDF。三种格式文件名一致。

界面可在 **English** 与**中文**之间切换，中文术语后附英文原词。**标签图稿本身始终为英文** —
这是印度法定标签，其印刷文字不随界面语言改变。

无需安装，也不需要网络连接。可从本地副本打开 `index.html`，或使用上方链接。
页眉中的版本号可打开**版本说明**。
