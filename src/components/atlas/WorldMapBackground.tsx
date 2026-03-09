/**
 * WorldMapBackground — improved Mercator-projection SVG continent paths.
 * ViewBox: 0 0 1000 500
 *
 * Longitude → x:  (lon + 180) / 360 * 1000
 * Latitude  → y:  (90  - lat) / 180 * 500
 *
 * Key city reference points (verified):
 *  Lagos     lon=3.4  lat=6.5   → x=509  y=464   → 51.0%, 46.4%
 *  Nairobi   lon=36.8 lat=-1.3  → x=602  y=507   → 60.2%, 50.7%
 *  Cairo     lon=31.2 lat=30.0  → x=587  y=333   → 58.7%, 33.3%
 *  Mumbai    lon=72.8 lat=19.1  → x=702  y=394   → 70.2%, 39.4%
 *  São Paulo lon=-46.6 lat=-23.5→ x=371  y=631   → 37.1%, 63.1%
 *  Jakarta   lon=106.8 lat=-6.2 → x=852  y=534   → 85.2%, 53.4%
 *  Dhaka     lon=90.4 lat=23.7  → x=751  y=368   → 75.1%, 36.8%
 *  Karachi   lon=67.0 lat=24.9  → x=686  y=362   → 68.6%, 36.2%
 *  Kinshasa  lon=15.3 lat=-4.3  → x=543  y=524   → 54.3%, 52.4%
 *  Bogotá    lon=-74.1 lat=4.7  → x=294  y=474   → 29.4%, 47.4%
 *  Manila    lon=121.0 lat=14.6 → x=836  y=419   → 83.6%, 41.9%
 *  Accra     lon=-0.2 lat=5.6   → x=499  y=469   → 49.9%, 46.9%
 */
const WorldMapBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1000 500"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ocean wash */}
    <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGrad)" />

    {/* Grid lines — latitude */}
    {[60, 30, 0, -30, -60].map((lat) => {
      const y = (90 - lat) / 180 * 500;
      return (
        <line
          key={`lat${lat}`}
          x1={0} y1={y} x2={1000} y2={y}
          stroke="hsl(var(--border))"
          strokeWidth="0.4"
          strokeDasharray="4 8"
          opacity="0.25"
        />
      );
    })}
    {/* Grid lines — longitude */}
    {[-120, -60, 0, 60, 120].map((lon) => {
      const x = (lon + 180) / 360 * 1000;
      return (
        <line
          key={`lon${lon}`}
          x1={x} y1={0} x2={x} y2={500}
          stroke="hsl(var(--border))"
          strokeWidth="0.4"
          strokeDasharray="4 8"
          opacity="0.25"
        />
      );
    })}

    {/* ── NORTH AMERICA ───────────────────────────────────────────────────── */}
    {/* Alaska tip */}
    <path
      d="M 40,90 L 55,85 L 68,90 L 72,100 L 65,108 L 52,108 L 40,100 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.12"
    />
    {/* Main body — Canada + USA */}
    <path
      d="
        M 88,44
        L 108,40 L 128,40 L 148,44 L 162,48 L 175,54 L 182,62
        L 192,72 L 198,82 L 202,95
        L 210,108 L 215,120 L 218,135
        L 212,145 L 208,158
        L 215,168 L 220,180 L 215,192
        L 205,202 L 198,212 L 192,220
        L 198,228 L 200,236
        L 192,242 L 183,245
        L 175,252 L 168,258
        L 160,264 L 153,270
        L 148,276 L 148,284
        L 155,290 L 155,298
        L 148,302 L 140,298
        L 132,290 L 126,282
        L 118,272 L 112,262
        L 105,250 L 98,240
        L 90,228 L 86,216
        L 82,202 L 80,188
        L 80,174 L 84,162
        L 88,150 L 88,138
        L 84,126 L 78,114
        L 72,104 L 70,92
        L 68,80 L 70,68
        L 76,56 L 82,48 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />
    {/* Florida peninsula */}
    <path
      d="M 185,248 L 192,252 L 194,262 L 190,272 L 183,274 L 178,268 L 178,256 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Baja California */}
    <path
      d="M 115,262 L 120,268 L 122,278 L 120,286 L 115,288 L 110,282 L 110,272 Z"
      fill="hsl(var(--foreground))" opacity="0.06"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.10"
    />

    {/* ── CENTRAL AMERICA ─────────────────────────────────────────────────── */}
    <path
      d="M 156,294 L 163,298 L 168,308 L 165,318 L 158,322 L 152,316 L 150,306 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.12"
    />

    {/* ── SOUTH AMERICA ───────────────────────────────────────────────────── */}
    {/* Bogotá is at x=294, y=474 — the continent must cover that well */}
    <path
      d="
        M 173,254
        L 188,248 L 200,254 L 210,260
        L 218,270 L 220,282
        L 222,295 L 225,308
        L 228,322 L 228,336
        L 225,350 L 220,364
        L 214,378 L 206,390
        L 198,400 L 190,410
        L 182,418 L 173,422
        L 165,418 L 156,410
        L 149,400 L 144,388
        L 141,375 L 140,360
        L 140,346 L 142,332
        L 145,318 L 148,304
        L 152,290 L 156,278
        L 160,266 L 165,257 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />

    {/* ── EUROPE ──────────────────────────────────────────────────────────── */}
    <path
      d="
        M 445,85
        L 460,78 L 475,74 L 490,76
        L 502,82 L 508,90
        L 505,100 L 498,108
        L 508,114 L 514,122
        L 510,130 L 500,136
        L 490,142 L 482,148
        L 474,154 L 470,162
        L 462,167 L 454,170
        L 445,167 L 437,160
        L 430,151 L 425,140
        L 424,130 L 427,120
        L 432,110 L 438,100
        L 441,90 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />
    {/* Iberian peninsula */}
    <path
      d="M 425,140 L 438,137 L 445,148 L 441,160 L 432,164 L 424,156 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Scandinavian peninsula */}
    <path
      d="M 478,74 L 486,62 L 494,54 L 503,58 L 508,68 L 506,78 L 500,83 L 490,79 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Italy */}
    <path
      d="M 488,148 L 495,143 L 500,148 L 500,158 L 495,165 L 488,162 L 484,154 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />
    {/* Greece */}
    <path
      d="M 508,158 L 515,155 L 520,162 L 517,170 L 510,170 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />

    {/* ── AFRICA ──────────────────────────────────────────────────────────── */}
    {/*
      Key checks:
        Lagos  x=509, y=464  — must be INSIDE the continent  (lon=3.4, lat=6.5)
        Accra  x=499, y=469  — must be INSIDE (lon=-0.2, lat=5.6)
        Cairo  x=587, y=333  — must be inside the North Africa bulge
        Nairobi x=602, y=507 — must be inside the East Africa region
        Kinshasa x=543, y=524 — must be inside Central Africa
    */}
    <path
      d="
        M 455,170
        L 472,165 L 488,162 L 504,165
        L 518,170 L 530,178
        L 540,188 L 545,200
        L 548,214 L 547,228
        L 544,242 L 541,256
        L 538,270 L 536,284
        L 536,298 L 537,312
        L 536,326 L 534,340
        L 530,354 L 523,366
        L 514,375 L 504,382
        L 494,386 L 484,382
        L 474,373 L 466,362
        L 460,348 L 456,334
        L 454,319 L 453,305
        L 454,290 L 455,276
        L 454,262 L 450,248
        L 446,234 L 443,220
        L 441,206 L 441,192
        L 443,179 L 449,173 Z
      "
      fill="hsl(var(--foreground))" opacity="0.09"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.15"
    />
    {/* Horn of Africa (Somalia/Ethiopia eastern bulge) */}
    <path
      d="M 547,205 L 560,212 L 568,222 L 565,232 L 555,236 L 546,228 L 543,218 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Madagascar */}
    <path
      d="M 540,300 L 548,293 L 554,300 L 554,316 L 548,322 L 539,316 Z"
      fill="hsl(var(--foreground))" opacity="0.06"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />

    {/* ── RUSSIA / NORTH ASIA ─────────────────────────────────────────────── */}
    <path
      d="
        M 505,82
        L 530,76 L 560,70 L 595,64
        L 632,60 L 668,60
        L 702,63 L 732,68
        L 760,74 L 785,80
        L 806,88 L 818,96
        L 822,106 L 818,118
        L 808,126 L 795,132
        L 778,136 L 760,140
        L 742,142 L 724,140
        L 706,138 L 688,136
        L 670,136 L 653,138
        L 636,140 L 618,138
        L 600,134 L 582,130
        L 565,128 L 548,128
        L 532,128 L 516,126
        L 506,118 L 502,108
        L 503,96 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />

    {/* ── MIDDLE EAST / ARABIAN PENINSULA ─────────────────────────────────── */}
    <path
      d="
        M 528,162
        L 545,156 L 560,153
        L 574,158 L 582,170
        L 585,184 L 582,198
        L 574,208 L 562,213
        L 550,213 L 540,207
        L 530,196 L 526,184
        L 524,172 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.6" strokeOpacity="0.14"
    />

    {/* ── SOUTH ASIA (Indian subcontinent) ────────────────────────────────── */}
    {/*
      Karachi  x=686, y=362
      Mumbai   x=702, y=394
      Dhaka    x=751, y=368
      All must be inside this shape.
    */}
    <path
      d="
        M 608,158
        L 625,152 L 644,150
        L 662,154 L 677,160
        L 692,168 L 703,178
        L 710,192 L 712,208
        L 708,224 L 700,238
        L 688,250 L 674,258
        L 660,262 L 648,258
        L 636,248 L 625,235
        L 616,220 L 610,205
        L 606,190 L 606,175 Z
      "
      fill="hsl(var(--foreground))" opacity="0.09"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.15"
    />
    {/* Sri Lanka */}
    <path
      d="M 660,265 L 666,262 L 670,270 L 666,276 L 659,274 Z"
      fill="hsl(var(--foreground))" opacity="0.06"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />
    {/* Bangladesh / eastern India coast extension — covers Dhaka well */}
    <path
      d="M 710,192 L 726,188 L 742,192 L 754,200 L 758,213 L 750,224 L 738,228 L 724,224 L 712,215 Z"
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.13"
    />

    {/* ── EAST ASIA (China + Korea + Japan area) ──────────────────────────── */}
    <path
      d="
        M 720,132
        L 745,128 L 770,128
        L 790,133 L 806,140
        L 815,150 L 818,164
        L 814,177 L 806,188
        L 795,196 L 780,200
        L 764,202 L 748,200
        L 733,194 L 722,184
        L 714,172 L 712,158
        L 714,145 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />
    {/* Korean peninsula */}
    <path
      d="M 806,140 L 816,145 L 818,158 L 812,165 L 805,162 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Japan */}
    <path
      d="M 820,138 L 832,134 L 840,142 L 835,152 L 824,155 L 818,148 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />

    {/* ── SOUTHEAST ASIA (Mainland + Malay Peninsula) ─────────────────────── */}
    {/*
      Manila x=836, y=419 — Philippines (separate island)
      Jakarta x=852, y=534 — Java island
    */}
    <path
      d="
        M 750,196
        L 764,195 L 776,198
        L 784,208 L 785,222
        L 780,234 L 772,243
        L 762,248 L 752,245
        L 744,236 L 742,224
        L 742,212 L 745,202 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.13"
    />
    {/* Malay Peninsula — thin southward extension */}
    <path
      d="M 770,242 L 776,248 L 775,262 L 769,268 L 763,262 L 763,250 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Borneo */}
    <path
      d="M 774,252 L 796,248 L 810,255 L 814,268 L 808,280 L 794,285 L 778,280 L 770,268 L 770,256 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.12"
    />
    {/* Sumatra */}
    <path
      d="M 726,255 L 746,248 L 762,252 L 765,263 L 754,270 L 736,272 L 722,264 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />
    {/* Java — Jakarta is here: x=852, y=534 */}
    <path
      d="M 764,272 L 785,268 L 806,268 L 825,272 L 844,278 L 860,282 L 866,290 L 855,296 L 832,294 L 808,290 L 785,286 L 768,282 Z"
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.13"
    />
    {/* Philippines — Manila x=836, y=419 */}
    <path
      d="M 828,400 L 840,396 L 850,402 L 852,414 L 844,424 L 832,426 L 824,418 L 824,408 Z"
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.13"
    />
    {/* Mindanao */}
    <path
      d="M 830,430 L 844,428 L 850,438 L 845,446 L 832,446 L 826,438 Z"
      fill="hsl(var(--foreground))" opacity="0.07"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.12"
    />

    {/* ── AUSTRALIA ────────────────────────────────────────────────────────── */}
    <path
      d="
        M 782,305
        L 804,300 L 826,300
        L 846,303 L 865,310
        L 878,322 L 883,336
        L 882,350 L 876,364
        L 864,374 L 850,380
        L 832,382 L 815,380
        L 798,373 L 784,362
        L 773,348 L 768,333
        L 768,318 L 773,310 Z
      "
      fill="hsl(var(--foreground))" opacity="0.08"
      stroke="hsl(var(--foreground))" strokeWidth="0.7" strokeOpacity="0.14"
    />
    {/* Tasmania */}
    <path
      d="M 840,384 L 848,382 L 852,390 L 847,396 L 838,394 Z"
      fill="hsl(var(--foreground))" opacity="0.06"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />
    {/* New Zealand — North Island */}
    <path
      d="M 895,368 L 904,362 L 910,370 L 906,380 L 897,382 Z"
      fill="hsl(var(--foreground))" opacity="0.06"
      stroke="hsl(var(--foreground))" strokeWidth="0.3" strokeOpacity="0.10"
    />

    {/* ── GREENLAND ─────────────────────────────────────────────────────────── */}
    <path
      d="M 147,23 L 165,18 L 180,21 L 190,30 L 190,43 L 180,52 L 163,54 L 148,49 L 140,38 Z"
      fill="hsl(var(--foreground))" opacity="0.05"
      stroke="hsl(var(--foreground))" strokeWidth="0.4" strokeOpacity="0.10"
    />

    {/* Equator line */}
    <line
      x1={0} y1={250} x2={1000} y2={250}
      stroke="hsl(var(--accent))"
      strokeWidth="0.6"
      strokeDasharray="6 12"
      opacity="0.2"
    />
  </svg>
);

export default WorldMapBackground;
