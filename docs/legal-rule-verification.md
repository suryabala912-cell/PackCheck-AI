# Legal Metrology Rule Verification Checklist & Source Hierarchy: PackCheck AI
**Document Purpose:** Technical & Legal-Source Verification Matrix for Legal Metrology (Packaged Commodities) Rules, 2011 (including amendments up to 2026).

> [!IMPORTANT]
> **Verification & Human-in-the-Loop Policy**
> - All rules listed below represent **UNVERIFIED PROPOSED ASSUMPTIONS**. No rule will be treated as legally authoritative or activated in the system until verified directly against official Government of India Gazette Notifications and Department of Consumer Affairs publications.
> - **Human Verification is REQUIRED FOR ALL RULES in the MVP.** Automated OCR detection is an AI-assisted preliminary input only. Legal applicability and accuracy must always be verified by an authorized enforcement officer.

---

## 1. Verified Legal Metrology Rule Matrix (Amendments through 2026)

| Internal Rule Code | Official Legal Reference | Verified Statutory Wording Summary | Exemption / Applicability Condition | Official Government Source | Original Assumption Evaluation | Proposed Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `LM_RULE_01` | Rule 6(1)(a) | Mandatory complete name & address of Manufacturer / Packer / Importer. | Exempt if net weight/vol $\le 10\text{g}/10\text{ml}$ (Rule 26(a)). | Gazette of India / DCA, Rules 2011, Rule 6(1)(a) | **PARTIALLY CORRECT** (Exemption missed) | `NOT_VERIFIED` |
| `LM_RULE_02` | Rule 6(1)(b) | Mandatory generic or common name of commodity on Principal Display Panel. | Applies to all retail packages. | Gazette of India / DCA, Rules 2011, Rule 6(1)(b) | **CORRECT** | `NOT_VERIFIED` |
| `LM_RULE_03` | Rule 6(1)(c) | Net quantity in standard metric units (`g`, `kg`, `ml`, `l`, `N`). | Exempt if net weight/vol $\le 10\text{g}/10\text{ml}$ (Rule 26(a)). | Gazette of India / DCA, Schedule III & IV | **PARTIALLY CORRECT** (Exemption missed) | `NOT_VERIFIED` |
| `LM_RULE_04` | Rule 6(1)(d) | Month & year of manufacture / pre-packing / import (or FSSAI Best Before for food). | Flexible formats allowed (`MM/YYYY`, `MMM YYYY`, `Month & Year`). | Gazette of India / DCA, Rule 6(1)(d) | **INCORRECT** (Strict MM/YYYY assumed) | `NEEDS_HUMAN_REVIEW` |
| `LM_RULE_05` | Rule 6(1)(e) | Maximum Retail Price (MRP) "inclusive of all taxes". Dual MRP prohibited. | Institutional / Govt supply packs marked "Not for Retail Sale" exempt. | Gazette of India / GSR 779(E) (2021) | **PARTIALLY CORRECT** (Tax phrasing variants allowed) | `NOT_VERIFIED` |
| `LM_RULE_06` | Rule 6(1)(f) | Name, address, phone number, and e-mail of consumer care office. | Exempt if net weight/vol $\le 10\text{g}/10\text{ml}$ (Rule 26(a)). | Gazette of India / DCA, Rule 6(1)(f) | **PARTIALLY CORRECT** (Exemption missed) | `NOT_VERIFIED` |
| `LM_RULE_07` | Rule 6(1)(g) | Country of origin or manufacture / assembly for imported pre-packaged goods. | Mandatory for imported goods (`is_imported == true`). | Gazette Amendments 2017, 2020, 2022 | **CORRECT** | `NOT_VERIFIED` |
| `LM_RULE_08` | Rule 6(11) / USP | Unit Sale Price (USP) declared in `/g`, `/kg`, `/ml`, `/l`, `/N`. | Exempt if MRP is equal to Unit Sale Price (e.g. 1kg/1L pack). | Gazette Notification GSR 779(E) (2021) | **INCORRECT** (Mandatory $>1\text{g}/1\text{ml}$ assumed) | `NEEDS_HUMAN_REVIEW` |

---

## 2. Detailed Legal Verification Findings & Evidence Analysis

### A. `LM_RULE_01`: Manufacturer / Packer / Importer Address
- **Official Source**: Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(a).
- **Verified Wording**: Every package shall bear the name and complete address of the manufacturer, or where manufacturer is not packer, the name and address of manufacturer and packer. For imported packages, the name and address of importer must be mentioned.
- **Amendments Checked**: GSR 779(E) (2021), GSR 629(E) (2022), Rule 26(a) exemptions.
- **Original Assumption**: Assumed address is mandatory on every package without exception.
- **Evaluation**: **PARTIALLY CORRECT**. Address is mandatory for standard packages, but Rule 26(a) explicitly exempts packages containing net weight/measure $\le 10\text{g}$ or $10\text{ml}$.
- **Remaining Uncertainty**: Verification of registered office address vs factory premises address requires human legal officer review.
- **Status**: `NOT_VERIFIED`

### B. `LM_RULE_02`: Generic / Common Name of Commodity
- **Official Source**: Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(b).
- **Verified Wording**: Common or generic name of the commodity contained in the package must be declared on the Principal Display Panel.
- **Amendments Checked**: Gazette notifications on PDP labeling requirements.
- **Original Assumption**: Generic name declaration is mandatory.
- **Evaluation**: **CORRECT**. Wording directly supports mandatory generic name declaration distinct from brand/trademark name.
- **Remaining Uncertainty**: Differentiation between trade names and statutory generic names in multi-item combination packs requires human officer verification.
- **Status**: `NOT_VERIFIED`

### C. `LM_RULE_03`: Net Quantity & Standard Metric Units
- **Official Source**: Rule 6(1)(c), Rule 11, Rule 12, Schedule III & IV.
- **Verified Wording**: Net quantity declared in standard metric units (`g`, `kg`, `ml`, `l`, `N`). Metric symbols must follow standard casing. Font size governed by PDP area (Schedule IV).
- **Amendments Checked**: GSR 779(E) (2021) and subsequent notifications through 2026.
- **Original Assumption**: Net quantity mandatory for all packages with strict metric casing.
- **Evaluation**: **PARTIALLY CORRECT**. Mandatory for standard packages, but subject to Rule 26(a) exemption ($\le 10\text{g}/10\text{ml}$) and specific count/length rules under Schedule III.
- **Remaining Uncertainty**: PDP font height ratio measurement and permissible quantity variations require human officer review.
- **Status**: `NOT_VERIFIED`

### D. `LM_RULE_04`: Date of Manufacture / Pre-Packing / Import
- **Official Source**: Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(d).
- **Verified Wording**: Month and year of manufacture, pre-packing, or import must be declared. Food items governed by FSSAI follow FSSAI "Best Before" / "Use By" regulations.
- **Amendments Checked**: Gazette Notifications clarifying permissible date formats (`MM/YYYY`, `MMM YYYY`, `Month & Year`).
- **Original Assumption**: Assumed `MM/YYYY` is the single permissible legal date format.
- **Evaluation**: **INCORRECT**. Official Gazette text permits flexible date representations (`MM/YYYY`, `MMM YYYY`, `Month & Year`), and food packages follow FSSAI regulations.
- **Remaining Uncertainty**: Harmonization of packing date and FSSAI expiry dates requires human legal officer review.
- **Status**: `NEEDS_HUMAN_REVIEW`

### E. `LM_RULE_05`: Maximum Retail Price (MRP) & Tax Phrasing
- **Official Source**: Rule 6(1)(e) & Gazette Notification GSR 779(E) (2021).
- **Verified Wording**: Retail sale price declared as "Maximum Retail Price ₹ / Rs. ____ (inclusive of all taxes)". Dual MRP stickers or price alteration prohibited.
- **Amendments Checked**: GSR 779(E) (2021) and Dual MRP Prohibition notifications through 2026.
- **Original Assumption**: Assumed omission of exact string `"inclusive of all taxes"` is always a statutory violation.
- **Evaluation**: **PARTIALLY CORRECT**. MRP and tax inclusion phrasing mandatory, but statutory acceptable abbreviations (e.g. `Incl. of all taxes`) are recognized.
- **Remaining Uncertainty**: Applicability to institutional packs marked "Not for Retail Sale" requires officer confirmation.
- **Status**: `NOT_VERIFIED`

### F. `LM_RULE_06`: Consumer Care Details
- **Official Source**: Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(f).
- **Verified Wording**: Name, address, telephone number, and e-mail address of person/office to be contacted for consumer complaints.
- **Amendments Checked**: Rule 26(f) 3rd Amendment (2022) for open/bulk goods, and Rule 26(a) for small packages ($\le 10\text{g}/10\text{ml}$).
- **Original Assumption**: Assumed phone and email are simultaneously mandatory on all packages.
- **Evaluation**: **PARTIALLY CORRECT**. Both are specified in Rule 6(1)(f), but Rule 26 exemptions apply to small packages ($\le 10\text{g}/10\text{ml}$).
- **Remaining Uncertainty**: Single-point contact vs multi-channel contact compliance requires officer review.
- **Status**: `NOT_VERIFIED`

### G. `LM_RULE_07`: Country of Origin
- **Official Source**: Legal Metrology (Packaged Commodities) Amendment Rules, 2017 & 2020.
- **Verified Wording**: For imported products, name of country of origin or manufacture or assembly must be stated on package.
- **Amendments Checked**: GSR 629(E) (2022) & Gazette Notifications on origin labeling.
- **Original Assumption**: Country of Origin required only when `is_imported == true`.
- **Evaluation**: **CORRECT**. Official Gazette explicitly mandates Country of Origin for imported pre-packaged commodities.
- **Remaining Uncertainty**: Verification of assembly vs manufacture for complex supply chains requires officer inspection.
- **Status**: `NOT_VERIFIED`

### H. `LM_RULE_08`: Unit Sale Price (USP)
- **Official Source**: Gazette Notification GSR 779(E) (2021) (effective April 1, 2022).
- **Verified Wording**: Unit Sale Price (USP) declared in `/g`, `/kg`, `/ml`, `/l`, `/N`. Exemption: USP declaration is NOT required if the retail sale price (MRP) is equal to the unit sale price.
- **Amendments Checked**: GSR 779(E) (2021) and 2022 Amendment Rules.
- **Original Assumption**: Assumed USP is mandatory for ALL packages $> 1\text{g}/1\text{ml}$.
- **Evaluation**: **INCORRECT**. GSR 779(E) explicitly exempts packages where MRP equals USP (e.g. 1kg or 1L single units).
- **Remaining Uncertainty**: Exemption thresholds for bulk packages ($> 5\text{kg}/5\text{L}$) and multi-unit promotional packs require human legal officer review.
- **Status**: `NEEDS_HUMAN_REVIEW`

---

## 3. Official Source Hierarchy Standard

1. **Consolidated Official Rules**: *Legal Metrology (Packaged Commodities) Rules, 2011* (Ministry of Consumer Affairs, Food and Public Distribution, Govt. of India).
2. **Official Gazette Amendment Notifications**: *The Gazette of India* (Extraordinary) through 2026 including GSR 779(E) (2021) and GSR 629(E) (2022).
3. **Official Department Circulars**: Official notifications on Department of Consumer Affairs portal (`consumeraffairs.nic.in`).
4. **Exclusion of Unofficial Sources**: Commercial blogs, vendor summaries, and third-party legal portals **shall not** be treated as legal authority.
